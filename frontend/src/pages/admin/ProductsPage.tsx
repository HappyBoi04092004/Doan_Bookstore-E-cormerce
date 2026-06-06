import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminTable, { type Column } from "../../components/admin/AdminTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import BookFormModal from "../../components/admin/BookFormModal";
import { formatPrice } from "../../utils";
import { bookService } from "../../services/bookService";
import { categoryService } from "../../services/categoryService";
import type { Book } from "../../types";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminBooks", search, page, category],
    queryFn: () => bookService.getAdminBooks(search, page, 10, category),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: bookService.createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBooks"] });
      setIsModalOpen(false);
      alert("Tạo sách thành công!");
    },
    onError: (err: any) => alert(err?.response?.data?.message || "Không thể tạo sách"),
  });

  const updateMutation = useMutation({
    mutationFn: bookService.updateBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBooks"] });
      setIsModalOpen(false);
      alert("Cập nhật sách thành công!");
    },
    onError: (err: any) => alert(err?.response?.data?.message || "Không thể cập nhật sách"),
  });

  const deleteMutation = useMutation({
    mutationFn: bookService.deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBooks"] });
      alert("Xóa sách thành công.");
    },
    onError: (err: any) => alert(err?.response?.data?.message || "Không thể xóa sách này vì đã có trong đơn hàng."),
  });

  const columns: Column<any>[] = [
    {
      key: "image",
      header: "Hình ảnh",
      render: (book) => (
        <img
          src={book.primaryImage || book.variants?.[0]?.primaryImage || "https://placehold.co/100x120?text=Sách"}
          alt={book.title}
          className="h-12 w-10 rounded border border-gray-100 object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "https://placehold.co/100x120?text=Sách";
          }}
        />
      ),
    },
    {
      key: "title",
      header: "Sách",
      render: (book) => (
        <div>
          <p className="line-clamp-1 font-medium text-gray-900">{book.title}</p>
          <p className="text-xs text-gray-500">{typeof book.author === "object" ? book.author?.name : book.author}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Danh mục",
      render: (book) => <Badge variant="info">{typeof book.category === "object" ? book.category?.name : book.category}</Badge>,
    },
    { key: "price", header: "Giá bán", render: (book) => formatPrice(book.price) },
    {
      key: "stock",
      header: "Kho",
      render: (book) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">Tồn kho: {book.stock}</p>
          <p className="text-xs text-gray-500">Đã bán: {book.soldQuantity ?? 0}</p>
          <Badge variant={book.stock === 0 ? "danger" : book.stock < 10 ? "warning" : "success"}>
            {book.stockStatus || (book.stock === 0 ? "Hết hàng" : book.stock < 10 ? "Sắp hết hàng" : "Còn hàng")}
          </Badge>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (book) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setEditingBook(book); setIsModalOpen(true); }}>Sửa</Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => window.confirm("Bạn có chắc chắn muốn xóa cuốn sách này không?") && deleteMutation.mutate(book.id)}
            disabled={deleteMutation.isPending}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sách</h1>
          <p className="mt-1 text-sm text-gray-500">{data?.data?.total || 0} sách</p>
        </div>
        <Button variant="primary" onClick={() => { setEditingBook(null); setIsModalOpen(true); }}>
          <Plus className="mr-1 h-4 w-4" /> Thêm sách
        </Button>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(1); }}
          placeholder="Tìm kiếm sách theo tên..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none sm:max-w-xs"
        />
        <select
          value={category}
          onChange={(event) => { setCategory(event.target.value); setPage(1); }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none sm:max-w-[180px]"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((item: any) => <option key={item.id} value={item.name}>{item.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="py-10 text-center">Đang tải danh sách sách...</div>
      ) : isError ? (
        <div className="py-10 text-center text-red-500">Không thể tải danh sách sách.</div>
      ) : (
        <>
          <AdminTable
            columns={columns}
            data={data?.data?.books || []}
            keyExtractor={(book) => String(book.id)}
            emptyMessage="Không tìm thấy sách nào."
          />
          <div className="mt-4 flex items-center justify-between">
            <Button variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Trang trước</Button>
            <span className="text-sm">Trang {page}</span>
            <Button variant="ghost" disabled={!data?.data?.books?.length || data.data.books.length < 10} onClick={() => setPage(page + 1)}>Trang sau</Button>
          </div>
        </>
      )}

      <BookFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingBook}
        onSubmit={(formData) => editingBook ? updateMutation.mutate({ id: editingBook.id, data: formData }) : createMutation.mutate(formData)}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
