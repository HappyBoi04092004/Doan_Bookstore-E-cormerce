import prisma from "../lib/prisma";

export interface OrderItemInput {
  bookId: number;
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
    districtCode: number;
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
        include: { items: { include: { book: { include: { author: true, category: true } } } } }
      });
      if (existingOrder) {
        return existingOrder;
      }
      
      let total = 0;
      const enrichedItems = [];
      
      for (const item of items) {
        const book = await tx.book.findUnique({ where: { id: item.bookId } });
        if (!book) {
          throw new Error(`Book with id ${item.bookId} not found`);
        }
        if (book.stock < item.quantity) {
          throw new Error(`Not enough stock for book '${book.title}'. Available: ${book.stock}, requested: ${item.quantity}`);
        }
        
        // Decrement stock
        await tx.book.update({
          where: { id: book.id },
          data: { stock: { decrement: item.quantity } }
        });
        
        total += book.price * item.quantity;
        enrichedItems.push({
          bookId: book.id,
          qty: item.quantity,
          price: book.price
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
          items: { include: { book: { include: { author: true, category: true } } } },
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
            districtCode: address.districtCode,
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
        items: { include: { book: { include: { author: true } } } },
      },
    });
  },

  async getOrderById(orderId: number, userId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { book: { include: { author: true, category: true } } } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) return null;
    if (order.userId !== userId) throw new Error("Forbidden");
    return order;
  },

  // ── ADMIN ─────────────────────────────────────────────────────────────────

  async getAllOrders() {
    return prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { book: true } },
      },
    });
  },

  async updateOrderStatus(orderId: number, status: string) {
    const allowed = ["PENDING", "PAID", "CANCELLED", "FAILED"];
    if (!allowed.includes(status)) throw new Error("Invalid status");

    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  },

};

