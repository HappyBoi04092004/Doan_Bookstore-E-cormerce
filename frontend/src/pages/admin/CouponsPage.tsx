import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Copy, Check, Ticket } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import CouponFormModal from "../../components/admin/CouponFormModal";
import { couponService } from "../../services/couponService";
import type { Coupon } from "../../types";

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Fetch coupons
  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminCoupons", search, page, statusFilter],
    queryFn: () =>
      couponService.getAllAdmin({
        search,
        page,
        limit: 10,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      }),
  });

  const coupons = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: couponService.createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Không thể tạo mã giảm giá");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      couponService.updateAdmin(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Không thể cập nhật mã giảm giá");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: couponService.removeAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Không thể xóa mã giảm giá");
    },
  });

  const handleAdd = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleDelete = (coupon: Coupon) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa mã giảm giá "${coupon.code}"?`
      )
    ) {
      deleteMutation.mutate(coupon.id);
    }
  };

  const handleSubmit = (formData: any) => {
    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDiscount = (coupon: Coupon) => {
    const val = Number(coupon.discountValue);
    if (coupon.discountType === "PERCENT") {
      return `${val}% (Tối đa ${
        coupon.maxDiscount ? Number(coupon.maxDiscount).toLocaleString("vi-VN") + "đ" : "Không giới hạn"
      })`;
    }
    return `${val.toLocaleString("vi-VN")} VNĐ`;
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý mã giảm giá</h1>
          <p className="text-sm text-gray-500 mt-1">
            Thiết lập và quản lý các chương trình ưu đãi của cửa hàng
          </p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Tạo mã mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo mã, tên chương trình..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="INACTIVE">Tạm khóa</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-red-500">
          Không thể tải danh sách mã giảm giá. Vui lòng thử lại.
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-white border border-gray-200 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
            <Ticket className="w-8 h-8" />
          </div>
          <p className="text-gray-500 font-medium">Không tìm thấy mã giảm giá nào</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Mã / Chương trình
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Giá trị giảm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Lượt sử dụng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thời gian áp dụng
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon, idx) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {(page - 1) * 10 + idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 text-xs">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="text-gray-400 hover:text-indigo-600 transition-colors"
                          title="Sao chép mã"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="font-medium text-gray-800 text-sm mt-1">{coupon.name}</p>
                      {coupon.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                          {coupon.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatDiscount(coupon)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-col gap-0.5">
                        <span>
                          {coupon.usedCount} /{" "}
                          {coupon.usageLimit !== null ? coupon.usageLimit : "∞"}
                        </span>
                        {coupon.usageLimit !== null && (
                          <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (coupon.usedCount / coupon.usageLimit) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                      <div>TĐ: {new Date(coupon.startDate).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
                      <div className="mt-0.5">HH: {new Date(coupon.endDate).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        variant={coupon.status === "ACTIVE" ? "success" : "danger"}
                      >
                        {coupon.status === "ACTIVE" ? "Hoạt động" : "Tạm khóa"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(coupon)}
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(coupon)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
              <span className="text-sm text-gray-500">
                Trang {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Trước
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <CouponFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingCoupon}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
