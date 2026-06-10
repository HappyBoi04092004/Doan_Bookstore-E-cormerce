import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

export const paymentRepository = {
  findOrderByInvoiceNumber(invoiceNumber: string) {
    return prisma.order.findUnique({
      where: { invoiceNumber },
      include: { payment: true },
    });
  },

  findOrderById(orderId: number) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
  },

  createSePayOrder(input: {
    userId: number;
    invoiceNumber: string;
    amount: number;
    currency: string;
    paymentUrl: string;
    items: { variantId: number; quantity: number }[];
    couponCode?: string;
    address?: {
      name: string;
      phone: string;
      street: string;
      provinceCode: number;
      wardCode: number;
    };
  }) {
    return prisma.$transaction(async (tx) => {
      let total = 0;
      const orderItems: { variantId: number; qty: number; price: number }[] = [];

      for (const item of input.items) {
        const variant = await tx.bookVariant.findUnique({
          where: { id: item.variantId },
          include: { book: true },
        });

        if (!variant) throw new Error("VARIANT_NOT_FOUND");
        if (variant.stock < item.quantity) throw new Error("INSUFFICIENT_STOCK");

        await tx.bookVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: item.quantity } },
        });

        total += Number(variant.price) * item.quantity;
        orderItems.push({
          variantId: variant.id,
          qty: item.quantity,
          price: Number(variant.price),
        });
      }

      // Coupon application
      let couponId: number | null = null;
      let discountAmount = 0;
      let finalAmount = total;

      if (input.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: input.couponCode.trim().toUpperCase() }
        });

        if (!coupon || coupon.isDeleted) {
          throw new Error("COUPON_NOT_FOUND");
        }
        if (coupon.status !== "ACTIVE") {
          throw new Error("COUPON_INACTIVE");
        }
        const now = new Date();
        if (now < coupon.startDate || now > coupon.endDate) {
          throw new Error("COUPON_EXPIRED");
        }
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
          throw new Error("COUPON_LIMIT_REACHED");
        }
        if (coupon.minOrderValue !== null && total < Number(coupon.minOrderValue)) {
          throw new Error("COUPON_MIN_ORDER_NOT_MET");
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

      if (finalAmount !== input.amount) throw new Error("ORDER_AMOUNT_MISMATCH");

      let createdAddressId: number | null = null;
      if (input.address) {
        const newAddress = await tx.address.create({
          data: {
            userId: input.userId,
            name: input.address.name,
            phone: input.address.phone,
            detail: input.address.street,
            provinceCode: input.address.provinceCode,
            wardCode: input.address.wardCode,
          }
        });
        createdAddressId = newAddress.id;
      }

      return tx.order.create({
        data: {
          userId: input.userId,
          total: total,
          status: "PENDING",
          orderStatus: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: "SEPAY",
          invoiceNumber: input.invoiceNumber,
          currency: input.currency,
          idempotencyKey: `sepay:${input.invoiceNumber}`,
          items: { create: orderItems },
          couponId,
          couponCode: input.couponCode ? input.couponCode.trim().toUpperCase() : null,
          discountAmount: new Prisma.Decimal(discountAmount),
          finalAmount: new Prisma.Decimal(finalAmount),
          addressId: createdAddressId,
          payment: {
            create: {
              method: "SEPAY",
              status: "PENDING",
              amount: finalAmount,
              currency: input.currency,
              invoiceNumber: input.invoiceNumber,
              paymentUrl: input.paymentUrl,
            },
          },
        },
        include: {
          payment: true,
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
    });
  },

  updatePaymentUrl(input: {
    orderId: number;
    paymentId?: number;
    amount: number;
    currency: string;
    paymentUrl: string;
  }) {
    return prisma.payment.upsert({
      where: { orderId: input.orderId },
      create: {
        orderId: input.orderId,
        method: "SEPAY",
        status: "PENDING",
        amount: input.amount,
        currency: input.currency,
        paymentUrl: input.paymentUrl,
      },
      update: {
        status: "PENDING",
        amount: input.amount,
        currency: input.currency,
        paymentUrl: input.paymentUrl,
      },
    });
  },

  completeSePayPayment(input: {
    invoiceNumber: string;
    transactionId?: string;
    amount: number;
    currency: string;
    transactionStatus: string;
    notificationType: string;
    rawPayload: Prisma.InputJsonValue;
  }) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { invoiceNumber: input.invoiceNumber },
        include: { payment: true },
      });

      if (!order) return null;

      const payment = await tx.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          method: "SEPAY",
          status: "PAID",
          transactionId: input.transactionId,
          amount: input.amount,
          currency: input.currency,
          invoiceNumber: input.invoiceNumber,
        },
        update: {
          status: "PAID",
          transactionId: input.transactionId,
          amount: input.amount,
          currency: input.currency,
          invoiceNumber: input.invoiceNumber,
        },
      });

      await tx.paymentTransaction.create({
        data: {
          orderId: order.id,
          paymentId: payment.id,
          transactionId: input.transactionId,
          invoiceNumber: input.invoiceNumber,
          amount: input.amount,
          currency: input.currency,
          paymentMethod: "SEPAY",
          transactionStatus: input.transactionStatus,
          notificationType: input.notificationType,
          rawPayload: input.rawPayload,
        },
      });

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          orderStatus: "COMPLETED",
          paymentStatus: "PAID",
        },
        include: { payment: true },
      });
    });
  },
};
