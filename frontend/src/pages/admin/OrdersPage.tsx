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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="font-bold text-gray-900">Đơn #{order.id}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{order.user?.name} — {order.user?.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl">×</button>
        </div>
        <div className="p-5 space-y-3">
          {order.items.map((item: OrderItem) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">{item.qty}×</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.book.title}</p>
                <p className="text-xs text-gray-400">{item.book.author?.name}</p>
              </div>
              <p className="text-sm font-semibold text-indigo-600 shrink-0">{formatPrice(item.price * item.qty)}</p>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold text-gray-700">Tổng</span>
            <span className="font-bold text-indigo-600">{formatPrice(order.total)}</span>
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
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center  ">
                      <button
                        onClick={() => setDetailOrder(order)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
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
