import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

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
  couponCode?: string;
}

export interface SePayWebhookPayload {
  id?: number | string;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  code?: string;
  content?: string;
  transferType?: string;
  transferAmount?: number;
  referenceCode?: string;
}

function extractOrderIdFromPaymentText(text: string) {
  const match = text.match(/\bDH(\d+)\b/i);
  return match ? Number(match[1]) : null;
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
      const enrichedItems: { variantId: number; qty: number; price: number }[] = [];

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
        
        total += Number(variant.price) * item.quantity;
        enrichedItems.push({
          variantId: variant.id,
          qty: item.quantity,
          price: Number(variant.price),
        });
      }

      // 3. Coupon application
      let couponId: number | null = null;
      let discountAmount = 0;
      let finalAmount = total;

      if (payload.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: payload.couponCode.trim().toUpperCase() }
        });

        if (!coupon || coupon.isDeleted) {
          throw new Error("Mã giảm giá không tồn tại");
        }
        if (coupon.status !== "ACTIVE") {
          throw new Error("Mã giảm giá đã bị vô hiệu hóa");
        }
        const now = new Date();
        if (now < coupon.startDate) {
          throw new Error("Mã giảm giá chưa có hiệu lực");
        }
        if (now > coupon.endDate) {
          throw new Error("Mã giảm giá đã hết hạn sử dụng");
        }
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
          throw new Error("Mã giảm giá đã đạt giới hạn sử dụng");
        }
        if (coupon.minOrderValue !== null && total < Number(coupon.minOrderValue)) {
          throw new Error(`Đơn hàng tối thiểu để áp dụng mã này là ${Number(coupon.minOrderValue).toLocaleString("vi-VN")} VNĐ`);
        }

        couponId = coupon.id;
        if (coupon.discountType === "PERCENT") {
          discountAmount = (total * Number(coupon.discountValue)) / 100;
          if (coupon.maxDiscount !== null && discountAmount > Number(coupon.maxDiscount)) {
            discountAmount = Number(coupon.maxDiscount);
          }
        } else if (coupon.discountType === "FIXED") {
          discountAmount = Number(coupon.discountValue);
        }

        if (discountAmount > total) {
          discountAmount = total;
        }
        finalAmount = total - discountAmount;

        // Increment usedCount
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      let createdAddressId: number | null = null;
      // 5. Save the address if provided
      if (address) {
        const newAddress = await tx.address.create({
          data: {
            userId,
            name: address.name,
            phone: address.phone,
            detail: address.street,
            provinceCode: address.provinceCode,
            wardCode: address.wardCode,
          }
        });
        createdAddressId = newAddress.id;
      }

      // 4. Create the order
      const order = await tx.order.create({
        data: {
          userId,
          total,
          status: "PENDING",
          paymentMethod: paymentMethod === "cod" ? "COD" : paymentMethod === "banking" ? "SEPAY" : undefined,
          idempotencyKey,
          items: { create: enrichedItems },
          couponId,
          couponCode: payload.couponCode ? payload.couponCode.trim().toUpperCase() : null,
          discountAmount: new Prisma.Decimal(discountAmount),
          finalAmount: new Prisma.Decimal(finalAmount),
          addressId: createdAddressId
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
          address: {
            include: {
              province: true,
              ward: true,
            }
          }
        }
      });

      return order;
    });
  },

  async getMyOrders(userId: number) {
    return prisma.order.findMany({
      where: { userId },
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
        address: {
          include: {
            province: true,
            ward: true,
          }
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
        address: {
          include: {
            province: true,
            ward: true,
          }
        },
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
        address: {
          include: {
            province: true,
            ward: true,
          }
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

  async markMockPaymentPaid(orderId: number, userId: number) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) throw new Error("Khong tim thay don hang");
    if (order.userId !== userId) throw new Error("Bi tu choi: Khong du quyen han");
    if (order.paymentMethod !== "SEPAY") throw new Error("Don hang khong dung phuong thuc SePay");
    if (order.status !== "PENDING") return order;

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paymentStatus: "SUCCESS",
      },
    });
  },

  async handleSePayWebhook(payload: SePayWebhookPayload) {
    const transferAmount = Number(payload.transferAmount);
    const transferType = String(payload.transferType ?? "").toLowerCase();
    const paymentText = [payload.code, payload.content].filter(Boolean).join(" ");
    const orderId = extractOrderIdFromPaymentText(paymentText);

    if (transferType && transferType !== "in") {
      return { matched: false, reason: "not_incoming_transfer" };
    }

    if (!orderId) {
      return { matched: false, reason: "order_code_not_found" };
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return { matched: false, reason: "order_not_found", orderId };
    }

    if (order.total !== transferAmount) {
      return {
        matched: false,
        reason: "amount_mismatch",
        orderId,
        expectedAmount: order.total,
        receivedAmount: transferAmount,
      };
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paymentStatus: "SUCCESS",
        payment: {
          upsert: {
            create: {
              method: "SEPAY",
              status: "SUCCESS",
              transactionId: String(payload.referenceCode ?? payload.id ?? ""),
              amount: transferAmount,
            },
            update: {
              method: "SEPAY",
              status: "SUCCESS",
              transactionId: String(payload.referenceCode ?? payload.id ?? ""),
              amount: transferAmount,
            },
          },
        },
      },
    });

    return { matched: true, orderId, order: updatedOrder };
  },

};

