import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import type { Coupon } from "../../types";

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Coupon | null;
  isLoading?: boolean;
}

function formatDateForInput(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function CouponFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: CouponFormModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCode(initialData.code);
        setName(initialData.name);
        setDescription(initialData.description ?? "");
        setDiscountType(initialData.discountType);
        setDiscountValue(String(initialData.discountValue));
        setMaxDiscount(initialData.maxDiscount ? String(initialData.maxDiscount) : "");
        setMinOrderValue(initialData.minOrderValue ? String(initialData.minOrderValue) : "");
        setUsageLimit(initialData.usageLimit ? String(initialData.usageLimit) : "");
        setStartDate(formatDateForInput(initialData.startDate));
        setEndDate(formatDateForInput(initialData.endDate));
        setStatus(initialData.status);
      } else {
        setCode("");
        setName("");
        setDescription("");
        setDiscountType("PERCENT");
        setDiscountValue("");
        setMaxDiscount("");
        setMinOrderValue("");
        setUsageLimit("");
        
        // Defaults: start date is now, end date is 1 month from now
        const now = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(now.getMonth() + 1);
        
        setStartDate(formatDateForInput(now.toISOString()));
        setEndDate(formatDateForInput(oneMonthLater.toISOString()));
        setStatus("ACTIVE");
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) {
      newErrors.code = "Mã giảm giá là bắt buộc";
    } else if (!/^[A-Za-z0-9-_]+$/.test(code)) {
      newErrors.code = "Mã chỉ chứa chữ, số, gạch ngang và gạch dưới";
    }

    if (!name.trim()) newErrors.name = "Tên hiển thị là bắt buộc";

    const val = Number(discountValue);
    if (!discountValue) {
      newErrors.discountValue = "Giá trị giảm là bắt buộc";
    } else if (isNaN(val) || val <= 0) {
      newErrors.discountValue = "Giá trị giảm phải lớn hơn 0";
    } else if (discountType === "PERCENT" && val > 100) {
      newErrors.discountValue = "Giảm giá phần trăm không được vượt quá 100%";
    }

    if (maxDiscount) {
      const maxD = Number(maxDiscount);
      if (isNaN(maxD) || maxD < 0) {
        newErrors.maxDiscount = "Giảm tối đa phải là số không âm";
      }
    }

    if (minOrderValue) {
      const minO = Number(minOrderValue);
      if (isNaN(minO) || minO < 0) {
        newErrors.minOrderValue = "Giá trị tối thiểu phải là số không âm";
      }
    }

    if (usageLimit) {
      const limit = Number(usageLimit);
      if (isNaN(limit) || !Number.isInteger(limit) || limit < 0) {
        newErrors.usageLimit = "Giới hạn sử dụng phải là số nguyên không âm";
      }
    }

    if (!startDate) newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    if (!endDate) newErrors.endDate = "Ngày kết thúc là bắt buộc";

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || null,
      discountType,
      discountValue: Number(discountValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      minOrderValue: minOrderValue ? Number(minOrderValue) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status,
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          {initialData ? `Chỉnh sửa mã: ${initialData.code}` : "Tạo mã giảm giá mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code */}
            <Input
              label="Mã giảm giá (viết liền không dấu)*"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: HPSTORE20, NOEL2026"
              error={errors.code}
              disabled={!!initialData}
            />

            {/* Name */}
            <Input
              label="Tên chương trình / Tên hiển thị*"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Giảm 20k cho đơn hàng từ 200k"
              error={errors.name}
            />

            {/* Type */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Loại giảm giá*</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "PERCENT" | "FIXED")}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="PERCENT">Giảm theo phần trăm (%)</option>
                <option value="FIXED">Giảm số tiền cố định (VNĐ)</option>
              </select>
            </div>

            {/* Value */}
            <Input
              label={`Giá trị giảm (${discountType === "PERCENT" ? "%" : "VNĐ"})*`}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "PERCENT" ? "VD: 10, 20" : "VD: 20000, 50000"}
              error={errors.discountValue}
              type="number"
            />

            {/* Max Discount */}
            <Input
              label="Số tiền giảm tối đa (VNĐ) - Chỉ cho loại %"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              placeholder="VD: 50000 (Để trống nếu không giới hạn)"
              error={errors.maxDiscount}
              disabled={discountType === "FIXED"}
              type="number"
            />

            {/* Min Order Value */}
            <Input
              label="Giá trị đơn hàng tối thiểu (VNĐ)"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
              placeholder="VD: 150000 (Để trống nếu không giới hạn)"
              error={errors.minOrderValue}
              type="number"
            />

            {/* Limit Usage */}
            <Input
              label="Tổng lượt sử dụng tối đa"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="VD: 100 (Để trống nếu không giới hạn)"
              error={errors.usageLimit}
              type="number"
            />

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Trạng thái hoạt động</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                <option value="INACTIVE">Tạm khóa (INACTIVE)</option>
              </select>
            </div>

            {/* Start Date */}
            <Input
              label="Ngày có hiệu lực*"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              type="datetime-local"
              error={errors.startDate}
            />

            {/* End Date */}
            <Input
              label="Ngày hết hạn*"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              type="datetime-local"
              error={errors.endDate}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Mô tả ngắn</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả chi tiết chương trình khuyến mãi..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              Lưu cấu hình
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
