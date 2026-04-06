import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminTable, { type Column } from "../../components/admin/AdminTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import BookFormModal from "../../components/admin/BookFormModal";
import { formatPrice } from "../../utils";
import { bookService } from "../../services/bookService";
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
    if (window.confirm("Are you sure you want to delete this book?")) {
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
      key: "title",
      header: "Book",
      render: (p) => (
        <div>
          <p className="font-medium text-gray-900 line-clamp-1">{p.title}</p>
          <p className="text-xs text-gray-500">{p.author}</p>
        </div>
      ),
    },
    { 
      key: "category", 
      header: "Category", 
      render: (p) => <Badge variant="info">{p.category}</Badge> 
    },
    { 
      key: "price", 
      header: "Price", 
      render: (p) => formatPrice(p.price) 
    },
    {
      key: "stock",
      header: "Stock",
      render: (p) => (
        <Badge variant={p.stock === 0 ? "danger" : p.stock < 10 ? "warning" : "success"}>
          {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)} disabled={deleteMutation.isPending}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products (Books)</h1>
          <p className="text-sm text-gray-500 mt-1">{data?.data?.total || 0} books total</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" /> Add Book
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
          placeholder="Search books by title…"
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
          <option value="">All Categories</option>
          <option value="Programming">Programming</option>
          <option value="Science">Science</option>
          <option value="History">History</option>
          <option value="Business">Business</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading books...</div>
      ) : isError ? (
         <div className="text-center py-10 text-red-500">Failed to load books.</div>
      ) : (
        <>
          <AdminTable
            columns={columns}
            data={data?.data?.books || []}
            keyExtractor={(p) => p.id}
            emptyMessage="No products found."
          />
          <div className="flex justify-between items-center mt-4">
             <Button variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
             </Button>
             <span className="text-sm">Page {page}</span>
             <Button variant="ghost" disabled={!data?.data?.books?.length || data.data.books.length < 10} onClick={() => setPage(page + 1)}>
                Next
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
