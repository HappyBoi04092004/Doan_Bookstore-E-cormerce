import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../../components/ui/Button";
import { formatPrice } from "../../utils";
import { importReceiptService } from "../../services/importReceiptService";
import { supplierService } from "../../services/supplierService";
import { bookService } from "../../services/bookService";
import type { ImportReceipt } from "../../types";

type ReceiptLine = {
  variantId: string;
  importPrice: string;
  quantity: string;
};

const emptyLine: ReceiptLine = { variantId: "", importPrice: "", quantity: "1" };

export default function ImportReceiptsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ImportReceipt | null>(null);
  const [form, setForm] = useState({ supplierId: "", note: "", details: [{ ...emptyLine }] });

  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: () => supplierService.getAll() });
  const { data: booksData } = useQuery({
    queryKey: ["adminBooks", "receipt-select"],
    queryFn: () => bookService.getAdminBooks("", 1, 200),
  });
  const books = booksData?.data?.books ?? [];

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ["importReceipts", search, supplierId, fromDate, toDate],
    queryFn: () => importReceiptService.getAll({ search, supplierId, fromDate, toDate }),
  });

  const totalAmount = useMemo(
    () => form.details.reduce((sum, line) => sum + Number(line.importPrice || 0) * Number(line.quantity || 0), 0),
    [form.details]
  );

  const createMutation = useMutation({
    mutationFn: () =>
      importReceiptService.create({
        supplierId: Number(form.supplierId),
        note: form.note,
        details: form.details.map((line) => ({
          variantId: Number(line.variantId),
          importPrice: Number(line.importPrice),
          quantity: Number(line.quantity),
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["importReceipts"] });
      queryClient.invalidateQueries({ queryKey: ["adminBooks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setShowCreate(false);
      setForm({ supplierId: "", note: "", details: [{ ...emptyLine }] });
    },
    onError: (error: any) => alert(error.response?.data?.message || "Không thể tạo phiếu nhập"),
  });

  const updateLine = (index: number, patch: Partial<ReceiptLine>) => {
    setForm((prev) => ({
      ...prev,
      details: prev.details.map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line),
    }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.supplierId) {
      alert("Vui lòng chọn nhà cung cấp");
      return;
    }
    if (form.details.some((line) => !line.variantId || Number(line.quantity) <= 0 || Number(line.importPrice) <= 0)) {
      alert("Mỗi dòng sản phẩm cần có biến thể, số lượng và giá nhập lớn hơn 0");
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phiếu nhập kho</h1>
          <p className="mt-1 text-sm text-gray-500">{receipts.length} phiếu nhập</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" /> Tạo phiếu nhập
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã phiếu, nhà cung cấp..." className="rounded-lg border px-3 py-2 text-sm" />
        <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Tất cả nhà cung cấp</option>
          {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
        </select>
        <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
        <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {["Mã phiếu", "Nhà cung cấp", "Tổng tiền nhập", "Người tạo", "Ngày tạo", "Thao tác"].map((header) => (
                <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">Đang tải...</td></tr>
            ) : receipts.map((receipt) => (
              <tr key={receipt.id}>
                <td className="px-4 py-3 text-sm font-semibold text-indigo-600">{receipt.code}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{receipt.supplier?.name}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(receipt.totalAmount)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{receipt.creator?.name || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(receipt.createdAt).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-3"><Button size="sm" variant="ghost" onClick={() => setSelectedReceipt(receipt)}>Chi tiết</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={submit} className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tạo phiếu nhập</h2>
                <p className="text-sm text-gray-500">Mã phiếu sẽ tự sinh sau khi lưu</p>
              </div>
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Đóng</Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <select value={form.supplierId} onChange={(event) => setForm({ ...form, supplierId: event.target.value })} className="rounded-md border px-3 py-2 text-sm">
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </select>
              <input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Ghi chú" className="rounded-md border px-3 py-2 text-sm" />
            </div>

            <div className="mt-5 overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {["Biến thể sách", "Giá nhập", "Số lượng", "Thành tiền", ""].map((header) => (
                      <th key={header} className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {form.details.map((line, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2">
                        <select value={line.variantId} onChange={(event) => updateLine(index, { variantId: event.target.value })} className="w-full min-w-80 rounded-md border px-3 py-2 text-sm">
                          <option value="">Chọn biến thể sách</option>
                          {books.flatMap((book: any) =>
                            (book.variants ?? []).map((variant: any) => (
                              <option key={variant.id} value={variant.id}>
                                {book.title} - {variant.name} (tồn: {variant.stock})
                              </option>
                            ))
                          )}
                        </select>
                      </td>
                      <td className="px-3 py-2"><input type="number" min="1" value={line.importPrice} onChange={(event) => updateLine(index, { importPrice: event.target.value })} className="w-36 rounded-md border px-3 py-2 text-sm" /></td>
                      <td className="px-3 py-2"><input type="number" min="1" value={line.quantity} onChange={(event) => updateLine(index, { quantity: event.target.value })} className="w-28 rounded-md border px-3 py-2 text-sm" /></td>
                      <td className="px-3 py-2 text-sm font-semibold">{formatPrice(Number(line.importPrice || 0) * Number(line.quantity || 0))}</td>
                      <td className="px-3 py-2">
                        <button type="button" className="rounded-md p-2 text-red-500 hover:bg-red-50" onClick={() => setForm((prev) => ({ ...prev, details: prev.details.length === 1 ? prev.details : prev.details.filter((_, lineIndex) => lineIndex !== index) }))}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button type="button" variant="outline" onClick={() => setForm((prev) => ({ ...prev, details: [...prev.details, { ...emptyLine }] }))}>Thêm sản phẩm</Button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Tổng tiền phiếu nhập</p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(totalAmount)}</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Hủy</Button>
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Đang lưu..." : "Lưu phiếu nhập"}</Button>
            </div>
          </form>
        </div>
      )}

      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Chi tiết phiếu nhập {selectedReceipt.code}</h2>
                <p className="mt-1 text-sm text-gray-500">Ngày tạo: {new Date(selectedReceipt.createdAt).toLocaleString("vi-VN")}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedReceipt(null)}>Đóng</Button>
            </div>
            <div className="mb-5 grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-4 text-sm md:grid-cols-3">
              <div><p className="text-gray-500">Nhà cung cấp</p><p className="font-medium">{selectedReceipt.supplier?.name}</p></div>
              <div><p className="text-gray-500">Người tạo</p><p className="font-medium">{selectedReceipt.creator?.name || "—"}</p></div>
              <div><p className="text-gray-500">Tổng tiền</p><p className="font-medium">{formatPrice(selectedReceipt.totalAmount)}</p></div>
            </div>
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>{["Tên sách", "Biến thể", "Giá nhập", "Số lượng", "Thành tiền"].map((header) => <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{header}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedReceipt.details.map((detail) => (
                  <tr key={detail.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{detail.product?.title}</td>
                    <td className="px-4 py-3 text-sm">{detail.variant?.name || "—"}</td>
                    <td className="px-4 py-3 text-sm">{formatPrice(detail.importPrice)}</td>
                    <td className="px-4 py-3 text-sm">{detail.quantity}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatPrice(detail.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
