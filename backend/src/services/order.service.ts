import prisma from "../lib/prisma";

export interface OrderItemInput {
  variantId: number;
  quantity: number;
}

export interface CreateOrderPayload {
  idempotencyKey: string;
  items: OrderItemInput[];
  paymentMethod?: "cod" | "banking";
  address?: {
    name: string;
    phone: string;
    street: string;
    provinceCode: number;
    wardCode: number;
  };
}

export const orderService = {
  // ── USER ──────────────────────────────────────────────────────────────────

  async createOrder(userId: number, payload: CreateOrderPayload) {
    const { items, idempotencyKey, paymentMethod, address } = payload;
    
    // Check constraints and concurrency inside interactive transaction
    return prisma.$transaction(async (tx) => {
      // 1. Check idempotency
      const existingOrder = await tx.order.findUnique({
        where: { idempotencyKey },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  book: {
                    include: { author: true, category: true, images: true },
                  },
                  images: true,
                },
              },
            },
          },
        },
      });
      if (existingOrder) {
        return existingOrder;
      }
      
      let total = 0;
      const enrichedItems = [];
      
      for (const item of items) {
        const variant = await tx.bookVariant.findUnique({
          where: { id: item.variantId },
          include: {
            book: true,
            images: {
              orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            },
          },
        });

        if (!variant) {
          throw new Error(`Không tìm thấy biến thể với id ${item.variantId}`);
        }
        if (variant.stock < item.quantity) {
          throw new Error(
            `Không đủ số lượng cho phiên bản '${variant.book.title} - ${variant.name}'. Có sẵn: ${variant.stock}, Yêu cầu: ${item.quantity}`
          );
        }
        
        // Decrement stock
        await tx.bookVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: item.quantity } }
        });
        
        total += variant.price * item.quantity;
        enrichedItems.push({
          variantId: variant.id,
          qty: item.quantity,
          price: variant.price
        });
      }

      // 3. Create the order
      const order = await tx.order.create({
        data: {
          userId,
          total,
          status: "PENDING",
          paymentMethod: paymentMethod === "cod" ? "COD" : paymentMethod === "banking" ? "MOMO" : undefined,
          idempotencyKey,
          items: { create: enrichedItems },
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  book: { include: { author: true, category: true, images: true } },
                  images: true,
                },
              },
            },
          },
        },
      });

      // 4. Save the address if provided
      if (address) {
        await tx.address.create({
          data: {
            userId,
            name: address.name,
            phone: address.phone,
            detail: address.street,
            provinceCode: address.provinceCode,
            wardCode: address.wardCode,
          }
        });
      }

      return order;
    });
  },

  async getMyOrders(userId: number) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                book: { include: { author: true, category: true, images: true } },
                images: true,
              },
            },
          },
        },
      },
    });
  },

  async getOrderById(orderId: number, userId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                book: { include: { author: true, category: true, images: true } },
                images: true,
              },
            },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) return null;
    if (order.userId !== userId) throw new Error("Bị từ chối: Không đủ quyền hạn");
    return order;
  },

  // ── ADMIN ─────────────────────────────────────────────────────────────────

  async getAllOrders() {
    return prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            variant: {
              include: {
                book: { include: { author: true, category: true, images: true } },
                images: true,
              },
            },
          },
        },
      },
    });
  },

  async updateOrderStatus(orderId: number, status: string) {
    const allowed = ["PENDING", "PAID", "CANCELLED", "FAILED"];
    if (!allowed.includes(status)) throw new Error("Trạng thái không hợp lệ");

    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  },

};

