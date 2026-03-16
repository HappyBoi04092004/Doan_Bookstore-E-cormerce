import { useState } from "react";
import AdminTable, { type Column } from "../../components/admin/AdminTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import type { User } from "../../types";

const mockUsers: User[] = [
  { id: "1", name: "Nguyen Van A", email: "a@example.com", role: "user", createdAt: "2025-01-10" },
  { id: "2", name: "Admin Boss", email: "admin@example.com", role: "admin", createdAt: "2024-12-01" },
  { id: "3", name: "Tran Thi B", email: "b@example.com", role: "user", createdAt: "2025-02-20" },
];

const columns: Column<User>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  {
    key: "role",
    header: "Role",
    render: (u) => (
      <Badge variant={u.role === "admin" ? "info" : "default"}>
        {u.role}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    header: "Joined",
    render: (u) => new Date(u.createdAt).toLocaleDateString("vi-VN"),
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

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{mockUsers.length} registered users</p>
        </div>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users…"
        className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />

      <AdminTable
        columns={columns}
        data={filtered}
        keyExtractor={(u) => u.id}
        emptyMessage="No users found."
      />
    </div>
  );
}
