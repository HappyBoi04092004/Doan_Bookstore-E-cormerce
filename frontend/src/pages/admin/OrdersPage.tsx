import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../../services/orderService";
import type { Order, OrderStatus, OrderItem } from "../../types";
import Spinner from "../../components/ui/Spinner";

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  PAID: "bg-green-100 text-green-800 border-green-300",
  FAILED: "bg-red-100 text-red-800 border-red-300",
};

const statusLabel: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
};

function formatPrice(n: number) {
  return n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}


// ── Detail Panel ──────────────────────────────────────────────────────────────
function OrderDetailPanel({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Chi tiết đơn hàng #{order.id}</h2>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className={`text-xs font-semibold rounded-full border px-2.5 py-0.5 ${statusColor[order.status]}`}>
                {statusLabel[order.status] || order.status}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">
                Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl mb-auto">×</button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
            <div>
              <p className="text-gray-500 mb-1">Khách hàng</p>
              <p className="font-medium text-gray-900">{order.user?.name ?? "—"}</p>
              <p className="text-gray-600">{order.user?.email}</p>
            </div>
            {order.address && (
              <div>
                <p className="text-gray-500 mb-1">Địa chỉ giao hàng</p>
                <p className="font-medium text-gray-900">{order.address.name} - {order.address.phone}</p>
                <p className="text-gray-600">
                  {order.address.detail}, {order.address.wardCode}, {order.address.districtCode}, {order.address.provinceCode}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-500 mb-1">Phương thức thanh toán</p>
              <p className="font-medium text-gray-900">
                {order.paymentMethod === 'cod' ? "Thanh toán khi nhận hàng (COD)" : 
                 order.paymentMethod === 'banking' ? "Chuyển khoản ngân hàng" : 
                 order.paymentMethod}
              </p>
            </div>
          </div>

          {/* Products Table */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Sản phẩm ({order.items.length})</h3>
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Đơn giá</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">SL</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {order.items.map((item: OrderItem) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.book.image || "/default-book.png"} 
                            alt={item.book.title} 
                            className="w-10 h-14 object-cover rounded bg-gray-100" 
                            onError={(e) => (e.currentTarget.src = "/default-book.png")}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.book.title}</p>
                            <p className="text-xs text-gray-500">{typeof item.book.author === 'object' ? item.book.author?.name : item.book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">{formatPrice(item.price)}</td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">{item.qty}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-indigo-600">{formatPrice(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <div className="w-1/2 min-w-[200px] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tạm tính</span>
                <span className="font-medium text-gray-900">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phí giao hàng</span>
                <span className="font-medium text-gray-900">{formatPrice(0)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-bold text-gray-900">Tổng cộng</span>
                <span className="font-bold text-lg text-indigo-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);


  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: orderService.adminGetAllOrders,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      orderService.adminUpdateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminOrders"] }),
  });



  const filtered = (orders ?? []).filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      String(o.id).includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-sm text-gray-500 mt-1">{orders?.length ?? 0} đơn hàng</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo ID, tên, email..."
          className="flex-1 max-w-sm rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "ALL")}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="FAILED">Thất bại</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : isError ? (
        <div className="text-center py-16 text-red-500">Không thể tải dữ liệu. Vui lòng thử lại.</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Không tìm thấy đơn hàng</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["ID", "Khách hàng", "Sản phẩm", "Tổng tiền", "Trạng thái", "Ngày tạo", "Hành động"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-bold text-indigo-600">#{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{order.user?.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.items.length} sách</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateMutation.mutate({ id: order.id, status: e.target.value as OrderStatus })
                      }
                      className={`text-xs font-semibold rounded-full border px-2.5 py-1 cursor-pointer focus:outline-none ${statusColor[order.status]}`}
                    >
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="PAID">Đã thanh toán</option>
                      <option value="FAILED">Thất bại</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-left">
                    <div className="flex items-center justify-start">
                      <button
                        onClick={() => setDetailOrder(order)}
                        className="text-sm font-semibold px-3 py-1.5 bg-indigo-50 rounded-md text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 transition-colors"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {detailOrder && <OrderDetailPanel order={detailOrder} onClose={() => setDetailOrder(null)} />}

    </div>
  );
}
