import { useState } from "react";
import { Plus } from "lucide-react";
import AdminTable, { type Column } from "../../components/admin/AdminTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { formatPrice } from "../../utils";

interface Product {
  id: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  category: string;
}

const mockProducts: Product[] = [
  { id: "1", title: "Clean Code", author: "Robert C. Martin", price: 150000, stock: 42, category: "Technology" },
  { id: "2", title: "The Alchemist", author: "Paulo Coelho", price: 95000, stock: 0, category: "Fiction" },
  { id: "3", title: "Atomic Habits", author: "James Clear", price: 120000, stock: 17, category: "Self-help" },
];

const columns: Column<Product>[] = [
  {
    key: "title",
    header: "Book",
    render: (p) => (
      <div>
        <p className="font-medium text-gray-900">{p.title}</p>
        <p className="text-xs text-gray-500">{p.author}</p>
      </div>
    ),
  },
  { key: "category", header: "Category", render: (p) => <Badge variant="info">{p.category}</Badge> },
  { key: "price", header: "Price", render: (p) => formatPrice(p.price) },
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
    render: () => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">Edit</Button>
        <Button variant="danger" size="sm">Delete</Button>
      </div>
    ),
  },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockProducts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{mockProducts.length} books total</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" /> Add Book
        </Button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search books…"
        className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />

      <AdminTable
        columns={columns}
        data={filtered}
        keyExtractor={(p) => p.id}
        emptyMessage="No products found."
      />
    </div>
  );
}
