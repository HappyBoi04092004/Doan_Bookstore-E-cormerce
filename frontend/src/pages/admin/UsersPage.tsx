import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminTable, { type Column } from "../../components/admin/AdminTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import UserFormModal from "../../components/admin/UserFormModal";
import { userService } from "../../services/userService";
import type { User } from "../../types";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", search, page],
    queryFn: () => userService.getUsers(search, page, 10),
  });

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
      alert("User created successfully!");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Failed to create user");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userService.updateUser(parseInt(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
      alert("User updated successfully!");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Failed to update user");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(parseInt(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      alert("User deleted successfully!");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Failed to delete user");
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (formData: any) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns: Column<User>[] = [
    {
      key: "avatar",
      header: "Ảnh đại diện",
      render: (u) => (
        <img 
          src={u.avatar || "/default-avatar.png"} 
          alt={u.name} 
          className="h-10 w-10 rounded-full object-cover border border-gray-100" 
          onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
        />
      ),
    },
    { key: "name", header: "Họ tên" },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Vai trò",
      render: (u) => (
        <Badge variant={u.role === "admin" ? "info" : "default"}>
          {u.role}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Ngày tham gia",
      render: (u) => new Date(u.createdAt).toLocaleDateString("vi-VN"),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (u) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(u)}>Sửa</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(u.id)} disabled={deleteMutation.isPending}>Xóa</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.data?.total || 0} người dùng đã đăng ký
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Thêm Người dùng
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Tìm kiếm theo tên hoặc email…"
          className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-10">Đang tải người dùng...</div>
      ) : isError ? (
        <div className="text-center py-10 text-red-500">Không thể tải danh sách người dùng.</div>
      ) : (
        <>
          <AdminTable
            columns={columns}
            data={data?.data?.users || []}
            keyExtractor={(u) => u.id}
            emptyMessage="Không tìm thấy người dùng nào."
          />
          
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <Button 
               variant="ghost" 
               disabled={page === 1}
               onClick={() => setPage(page - 1)}
            >
               Trang trước
            </Button>
            <span className="text-sm">Trang {page}</span>
            <Button 
               variant="ghost" 
               disabled={!data?.data?.users?.length || data.data.users.length < 10}
               onClick={() => setPage(page + 1)}
            >
               Trang sau
            </Button>
          </div>
        </>
      )}

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingUser}
        onSubmit={handleModalSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
