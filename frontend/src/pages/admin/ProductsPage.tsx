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
      alert("Book created successfully!");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Failed to create book");
    }
  });

  const updateMutation = useMutation({
    mutationFn: bookService.updateBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBooks"] });
      setIsModalOpen(false);
      alert("Book updated successfully!");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Failed to update book");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: bookService.deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBooks"] });
      alert("Book deleted successfully!");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Failed to delete book");
    }
  });

  const handleDelete = (id: string | number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cuốn sách này không?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (book: any) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (formData: any) => {
    if (editingBook) {
      updateMutation.mutate({ id: editingBook.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns: Column<any>[] = [
    {
      key: "image",
      header: "Hình ảnh",
      render: (p) => (
        <img 
          src={p.image || "https://placehold.co/100x120?text=Sách"} 
          alt={p.title} 
          className="h-12 w-10 object-cover rounded border border-gray-100 placeholder-img" 
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://placehold.co/100x120?text=Sách";
          }}
        />
      ),
    },
    {
      key: "title",
      header: "Sản phẩm",
      render: (p) => (
        <div>
          <p className="font-medium text-gray-900 line-clamp-1">{p.title}</p>
          <p className="text-xs text-gray-500">{p.author}</p>
        </div>
      ),
    },
    { 
      key: "category", 
      header: "Danh mục", 
      render: (p) => <Badge variant="info">{p.category}</Badge> 
    },
    { 
      key: "price", 
      header: "Giá", 
      render: (p) => formatPrice(p.price) 
    },
    {
      key: "stock",
      header: "Tồn kho",
      render: (p) => (
        <Badge variant={p.stock === 0 ? "danger" : p.stock < 10 ? "warning" : "success"}>
          {p.stock === 0 ? "Hết hàng" : `${p.stock} sản phẩm`}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (p) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>Sửa</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)} disabled={deleteMutation.isPending}>Xóa</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sách</h1>
          <p className="text-sm text-gray-500 mt-1">{data?.data?.total || 0} sản phẩm</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" /> Thêm sách
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Tìm kiếm sách theo tên…"
          className="w-full sm:max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="w-full sm:max-w-[180px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Đang tải danh sách sách...</div>
      ) : isError ? (
         <div className="text-center py-10 text-red-500">Không thể tải danh sách sách.</div>
      ) : (
        <>
          <AdminTable
            columns={columns}
            data={data?.data?.books || []}
            keyExtractor={(p) => p.id}
            emptyMessage="Không tìm thấy sách nào."
          />
          <div className="flex justify-between items-center mt-4">
             <Button variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Trang trước
             </Button>
             <span className="text-sm">Trang {page}</span>
             <Button variant="ghost" disabled={!data?.data?.books?.length || data.data.books.length < 10} onClick={() => setPage(page + 1)}>
                Trang sau
             </Button>
          </div>
        </>
      )}

      <BookFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingBook}
        onSubmit={handleModalSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
