import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminTable, { type Column } from "../../components/admin/AdminTable";
import Button from "../../components/ui/Button";
import { authorService, type Author } from "../../services/authorService";

export default function AuthorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Author | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ["authors"], queryFn: authorService.getAll });
  const saveMutation = useMutation({
    mutationFn: () => editing ? authorService.update(editing.id, { name }) : authorService.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
      setName("");
      setEditing(null);
    },
    onError: (err: any) => alert(err?.response?.data?.message || "Không thể lưu tác giả"),
  });
  const deleteMutation = useMutation({
    mutationFn: authorService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authors"] }),
    onError: (err: any) => alert(err?.response?.data?.message || "Không thể xóa tác giả"),
  });

  const filtered = data.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  const columns: Column<Author>[] = [
    { key: "name", header: "Tên tác giả", render: (row) => <span className="font-medium">{row.name}</span> },
    { key: "books", header: "Số sách", render: (row) => row._count?.books ?? 0 },
    {
      key: "actions",
      header: "Thao tác",
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setEditing(row); setName(row.name); }}>Sửa</Button>
          <Button variant="danger" size="sm" onClick={() => window.confirm(`Xóa tác giả "${row.name}"?`) && deleteMutation.mutate(row.id)}>Xóa</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tác giả</h1>
        <p className="mt-1 text-sm text-gray-500">{data.length} tác giả</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên tác giả" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
        <Button type="submit" variant="primary" disabled={saveMutation.isPending}>
          <Plus className="mr-1 h-4 w-4" /> {editing ? "Cập nhật" : "Thêm"}
        </Button>
        {editing && <Button type="button" variant="ghost" onClick={() => { setEditing(null); setName(""); }}>Hủy</Button>}
      </form>
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tác giả..." className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none" />
      </div>
      <AdminTable columns={columns} data={filtered} isLoading={isLoading} keyExtractor={(row) => String(row.id)} emptyMessage="Chưa có tác giả." />
    </div>
  );
}
