import { useState } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { supplierService } from "../../services/supplierService";
import type { Supplier } from "../../types";

const emptyForm = { name: "", email: "", phone: "", address: "", status: "ACTIVE" };

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers", search],
    queryFn: () => supplierService.getAll(search),
  });

  const saveMutation = useMutation({
    mutationFn: () => editing ? supplierService.update({ id: editing.id, data: form as any }) : supplierService.create(form as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (error: any) => alert(error.response?.data?.message || "Không thể lưu nhà cung cấp"),
  });

  const deleteMutation = useMutation({
    mutationFn: supplierService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
    onError: (error: any) => alert(error.response?.data?.message || "Không thể xóa nhà cung cấp"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      status: supplier.status,
    });
    setShowForm(true);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      alert("Tên nhà cung cấp là bắt buộc");
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhà cung cấp</h1>
          <p className="mt-1 text-sm text-gray-500">{suppliers.length} nhà cung cấp</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" /> Thêm nhà cung cấp
        </Button>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Tìm theo tên, email, số điện thoại..."
        className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />

      {showForm && (
        <form onSubmit={submit} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-2">
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Tên nhà cung cấp" className="rounded-md border px-3 py-2 text-sm" />
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" className="rounded-md border px-3 py-2 text-sm" />
          <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Số điện thoại" className="rounded-md border px-3 py-2 text-sm" />
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="rounded-md border px-3 py-2 text-sm">
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Tạm ngừng</option>
          </select>
          <textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Địa chỉ" className="md:col-span-2 rounded-md border px-3 py-2 text-sm" />
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Đang lưu..." : "Lưu"}</Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {["Tên nhà cung cấp", "Email", "Số điện thoại", "Địa chỉ", "Trạng thái", "Thao tác"].map((header) => (
                <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">Đang tải...</td></tr>
            ) : suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{supplier.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{supplier.email || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{supplier.phone || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{supplier.address || "—"}</td>
                <td className="px-4 py-3"><Badge variant={supplier.status === "ACTIVE" ? "success" : "warning"}>{supplier.status === "ACTIVE" ? "Đang hoạt động" : "Tạm ngừng"}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(supplier)}>Sửa</Button>
                    <Button size="sm" variant="danger" onClick={() => window.confirm("Xóa nhà cung cấp này?") && deleteMutation.mutate(supplier.id)}>Xóa</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
