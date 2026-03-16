import { useState } from "react";
import AdminTable, { type Column } from "../../components/admin/AdminTable";
import Badge from "../../components/ui/Badge";
import { formatPrice } from "../../utils";
import type { OrderStatus } from "../../types";

interface OrderRow {
  id: string;
  customer: string;
  total: number;
  items: number;
  status: OrderStatus;
  date: string;
}

const mockOrders: OrderRow[] = [
  { id: "ORD-001", customer: "Nguyen Van A", total: 320000, items: 2, status: "delivered", date: "2025-03-01" },
  { id: "ORD-002", customer: "Tran Thi B", total: 150000, items: 1, status: "shipping", date: "2025-03-05" },
  { id: "ORD-003", customer: "Le Van C", total: 560000, items: 4, status: "pending", date: "2025-03-09" },
  { id: "ORD-004", customer: "Pham Thi D", total: 210000, items: 2, status: "confirmed", date: "2025-03-08" },
];

const statusBadge: Record<OrderStatus, "default" | "info" | "warning" | "success" | "danger"> = {
  pending: "warning",
  confirmed: "info",
  shipping: "info",
  delivered: "success",
  cancelled: "danger",
};

const columns: Column<OrderRow>[] = [
  { key: "id", header: "Order ID", render: (o) => <span className="font-medium text-indigo-600">{o.id}</span> },
  { key: "customer", header: "Customer" },
  { key: "items", header: "Items", render: (o) => `${o.items} item(s)` },
  { key: "total", header: "Total", render: (o) => formatPrice(o.total) },
  {
    key: "status",
    header: "Status",
    render: (o) => (
      <Badge variant={statusBadge[o.status]}>
        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
      </Badge>
    ),
  },
  {
    key: "date",
    header: "Date",
    render: (o) => new Date(o.date).toLocaleDateString("vi-VN"),
  },
];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const filtered = mockOrders.filter((o) => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{mockOrders.length} orders total</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID or customer…"
          className="flex-1 max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipping">Shipping</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        keyExtractor={(o) => o.id}
        emptyMessage="No orders found."
      />
    </div>
  );
}
