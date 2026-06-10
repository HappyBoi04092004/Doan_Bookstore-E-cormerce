import prisma from "../lib/prisma";
import { Prisma, DiscountType, CouponStatus } from "@prisma/client";

export const couponService = {
  async getCoupons(
    search: string = "",
    page: number = 1,
    limit: number = 10,
    status?: string,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.CouponWhereInput = {
      isDeleted: false,
      AND: [
        search
          ? {
              OR: [
                { code: { contains: search } },
                { name: { contains: search } },
              ],
            }
          : {},
        status ? { status: status as CouponStatus } : {},
      ],
    };

    // Safe sort columns
    const allowedSortFields = ["createdAt", "updatedAt", "code", "name", "discountValue", "usedCount", "usageLimit"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
      }),
      prisma.coupon.count({ where: whereClause }),
    ]);

    return {
      items: coupons,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getCouponById(id: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });
    if (!coupon || coupon.isDeleted) {
      throw new Error("Không tìm thấy mã giảm giá");
    }
    return coupon;
  },

  async createCoupon(data: any) {
    const codeUpper = data.code.trim().toUpperCase();
    const existing = await prisma.coupon.findFirst({
      where: { code: codeUpper, isDeleted: false },
    });
    if (existing) {
      throw new Error("Mã giảm giá đã tồn tại");
    }

    return await prisma.coupon.create({
      data: {
        code: codeUpper,
        name: data.name.trim(),
        description: data.description ? data.description.trim() : null,
        discountType: data.discountType as DiscountType,
        discountValue: new Prisma.Decimal(data.discountValue),
        maxDiscount:
          data.maxDiscount !== undefined && data.maxDiscount !== null
            ? new Prisma.Decimal(data.maxDiscount)
            : null,
        minOrderValue:
          data.minOrderValue !== undefined && data.minOrderValue !== null
            ? new Prisma.Decimal(data.minOrderValue)
            : null,
        usageLimit:
          data.usageLimit !== undefined && data.usageLimit !== null
            ? Number(data.usageLimit)
            : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: (data.status as CouponStatus) || "ACTIVE",
      },
    });
  },

  async updateCoupon(id: number, data: any) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon || coupon.isDeleted) {
      throw new Error("Không tìm thấy mã giảm giá");
    }

    if (data.code) {
      const codeUpper = data.code.trim().toUpperCase();
      if (codeUpper !== coupon.code) {
        const existing = await prisma.coupon.findFirst({
          where: { code: codeUpper, isDeleted: false },
        });
        if (existing && existing.id !== id) {
          throw new Error("Mã giảm giá đã tồn tại");
        }
      }
    }

    return await prisma.coupon.update({
      where: { id },
      data: {
        ...(data.code ? { code: data.code.trim().toUpperCase() } : {}),
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description ? data.description.trim() : null } : {}),
        ...(data.discountType ? { discountType: data.discountType as DiscountType } : {}),
        ...(data.discountValue !== undefined ? { discountValue: new Prisma.Decimal(data.discountValue) } : {}),
        ...(data.maxDiscount !== undefined
          ? { maxDiscount: data.maxDiscount !== null ? new Prisma.Decimal(data.maxDiscount) : null }
          : {}),
        ...(data.minOrderValue !== undefined
          ? { minOrderValue: data.minOrderValue !== null ? new Prisma.Decimal(data.minOrderValue) : null }
          : {}),
        ...(data.usageLimit !== undefined
          ? { usageLimit: data.usageLimit !== null ? Number(data.usageLimit) : null }
          : {}),
        ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
        ...(data.endDate ? { endDate: new Date(data.endDate) } : {}),
        ...(data.status ? { status: data.status as CouponStatus } : {}),
      },
    });
  },

  async deleteCoupon(id: number) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon || coupon.isDeleted) {
      throw new Error("Không tìm thấy mã giảm giá");
    }

    await prisma.coupon.update({
      where: { id },
      data: { isDeleted: true },
    });
    return true;
  },

  async validateCoupon(code: string, orderTotal: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
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

    if (coupon.minOrderValue !== null && orderTotal < Number(coupon.minOrderValue)) {
      throw new Error(
        `Đơn hàng tối thiểu để áp dụng mã này là ${Number(coupon.minOrderValue).toLocaleString("vi-VN")} VNĐ`
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENT") {
      discountAmount = (orderTotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount !== null && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else if (coupon.discountType === "FIXED") {
      discountAmount = Number(coupon.discountValue);
    }

    // Ensure discount amount doesn't exceed order total
    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }

    const finalAmount = orderTotal - discountAmount;

    return {
      valid: true,
      coupon,
      discountAmount,
      finalAmount,
      message: "Áp dụng mã giảm giá thành công",
    };
  },
};
