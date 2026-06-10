import { Request, Response } from "express";
import { z } from "zod";
import { couponService } from "../services/coupon.service";

const createCouponSchema = z.object({
  code: z.string().min(1, "Mã giảm giá không được để trống").max(50, "Mã giảm giá quá dài"),
  name: z.string().min(1, "Tên hiển thị không được để trống"),
  description: z.string().optional().nullable(),
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z.number().positive("Giá trị giảm giá phải lớn hơn 0"),
  maxDiscount: z.number().nonnegative("Giá trị giảm tối đa phải >= 0").optional().nullable(),
  minOrderValue: z.number().nonnegative("Giá trị đơn hàng tối thiểu phải >= 0").optional().nullable(),
  usageLimit: z.number().int().nonnegative("Giới hạn sử dụng phải là số nguyên >= 0").optional().nullable(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Ngày bắt đầu không hợp lệ" }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Ngày kết thúc không hợp lệ" }),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"],
});

const updateCouponSchema = z.object({
  code: z.string().min(1, "Mã giảm giá không được để trống").max(50, "Mã giảm giá quá dài").optional(),
  name: z.string().min(1, "Tên hiển thị không được để trống").optional(),
  description: z.string().optional().nullable(),
  discountType: z.enum(["PERCENT", "FIXED"]).optional(),
  discountValue: z.number().positive("Giá trị giảm giá phải lớn hơn 0").optional(),
  maxDiscount: z.number().nonnegative("Giá trị giảm tối đa phải >= 0").optional().nullable(),
  minOrderValue: z.number().nonnegative("Giá trị đơn hàng tối thiểu phải >= 0").optional().nullable(),
  usageLimit: z.number().int().nonnegative("Giới hạn sử dụng phải là số nguyên >= 0").optional().nullable(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Ngày bắt đầu không hợp lệ" }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Ngày kết thúc không hợp lệ" }).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"],
});

const validateCouponSchema = z.object({
  code: z.string().min(1, "Mã giảm giá là bắt buộc"),
  orderTotal: z.number().nonnegative("Tổng tiền đơn hàng không hợp lệ"),
});

export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = String(req.query.search || "");
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const status = req.query.status ? String(req.query.status) : undefined;
    const sortBy = String(req.query.sortBy || "createdAt");
    const sortOrder = String(req.query.sortOrder || "desc") === "asc" ? "asc" : "desc";

    const result = await couponService.getCoupons(search, page, limit, status, sortBy, sortOrder);
    res.json({ message: "OK", data: result });
  } catch (error: any) {
    console.error("[getCoupons]", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const getCouponById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: "ID mã giảm giá không hợp lệ" });
      return;
    }

    const coupon = await couponService.getCouponById(id);
    res.json({ message: "OK", data: coupon });
  } catch (error: any) {
    if (error.message === "Không tìm thấy mã giảm giá") {
      res.status(404).json({ message: error.message });
      return;
    }
    console.error("[getCouponById]", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedBody = createCouponSchema.parse(req.body);
    const coupon = await couponService.createCoupon(validatedBody);
    res.status(201).json({ message: "Tạo mã giảm giá thành công", data: coupon });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Lỗi xác thực dữ liệu", errors: error.issues });
      return;
    }
    if (error.message === "Mã giảm giá đã tồn tại") {
      res.status(409).json({ message: error.message });
      return;
    }
    console.error("[createCoupon]", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: "ID mã giảm giá không hợp lệ" });
      return;
    }

    const validatedBody = updateCouponSchema.parse(req.body);
    const coupon = await couponService.updateCoupon(id, validatedBody);
    res.json({ message: "Cập nhật mã giảm giá thành công", data: coupon });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Lỗi xác thực dữ liệu", errors: error.issues });
      return;
    }
    if (error.message === "Không tìm thấy mã giảm giá") {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error.message === "Mã giảm giá đã tồn tại") {
      res.status(409).json({ message: error.message });
      return;
    }
    console.error("[updateCoupon]", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: "ID mã giảm giá không hợp lệ" });
      return;
    }

    await couponService.deleteCoupon(id);
    res.json({ message: "Xóa mã giảm giá thành công" });
  } catch (error: any) {
    if (error.message === "Không tìm thấy mã giảm giá") {
      res.status(404).json({ message: error.message });
      return;
    }
    console.error("[deleteCoupon]", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderTotal } = validateCouponSchema.parse(req.body);
    const result = await couponService.validateCoupon(code, orderTotal);

    res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Lỗi xác thực dữ liệu", errors: error.issues });
      return;
    }
    res.status(400).json({ message: error.message || "Áp dụng mã giảm giá thất bại" });
  }
};
