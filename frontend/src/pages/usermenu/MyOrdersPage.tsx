import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "../../services/orderService";
import type { Order, OrderItem } from "../../types";
import Spinner from "../../components/ui/Spinner";
import { ArrowLeft } from "lucide-react";

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

function OrderDetailPanel({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
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
          {order.address && (
            <div className="bg-gray-50 p-4 rounded-xl text-sm">
              <p className="text-gray-500 mb-1">Địa chỉ giao hàng</p>
              <p className="font-medium text-gray-900">{order.address.name} - {order.address.phone}</p>
              <p className="text-gray-600">
                {order.address.detail}, {order.address.wardCode}, {order.address.districtCode}, {order.address.provinceCode}
              </p>
            </div>
          )}

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

export default function MyOrdersPage() {
  const location = useLocation();
  const orderSuccess = (location.state as { orderSuccess?: boolean })?.orderSuccess;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["myOrders"],
    queryFn: orderService.getMyOrders,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 font-medium">Không thể tải đơn hàng. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại 
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Đơn hàng của tôi</h1>
      <p className="text-sm text-gray-500 mb-6">{orders?.length ?? 0} đơn hàng</p>

      {orderSuccess && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <svg className="h-5 w-5 shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span><b>Đặt hàng thành công!</b> Đơn hàng của bạn đang được xử lý.</span>
        </div>
      )}

      {orders?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-700">Chưa có đơn hàng nào</p>
          <p className="text-sm text-gray-400">Hãy mua sách và quay lại đây nhé!</p>
          <a href="/books" className="mt-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            Khám phá sách
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex flex-col sm:flex-row gap-4 justify-between"
            >
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-bold text-gray-900">#{order.id}</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusColor[order.status]}`}
                  >
                    {statusLabel[order.status] ?? order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2 mt-2 bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
                  <span className="font-semibold text-indigo-600">{order.items.length}</span> sản phẩm
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 sm:border-l border-gray-100 sm:pl-6">
                <div className="text-sm text-gray-500 mb-1">Thành tiền</div>
                <p className="text-xl font-extrabold text-indigo-600">{formatPrice(order.total)}</p>
                
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="mt-4 w-full sm:w-auto px-5 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors focus:ring-4 focus:ring-indigo-100"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
