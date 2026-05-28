import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminTable, { type Column } from "../../components/admin/AdminTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { contactService, type ContactMessage } from "../../services/contactService";

export default function ContactsPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["contacts"], queryFn: contactService.getAll });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ContactMessage["status"] }) => contactService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contacts"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: contactService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contacts"] }),
  });

  const columns: Column<ContactMessage>[] = [
    { key: "name", header: "Người gửi", render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-gray-500">{row.email}</p></div> },
    { key: "subject", header: "Chủ đề", render: (row) => <span className="font-medium">{row.subject}</span> },
    { key: "message", header: "Nội dung", render: (row) => <p className="max-w-md whitespace-normal text-sm text-gray-600">{row.message}</p> },
    { key: "status", header: "Trạng thái", render: (row) => <Badge variant={row.status === "NEW" ? "warning" : row.status === "RESOLVED" ? "success" : "info"}>{row.status}</Badge> },
    { key: "createdAt", header: "Ngày gửi", render: (row) => new Date(row.createdAt).toLocaleDateString("vi-VN") },
    {
      key: "actions",
      header: "Thao tác",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={() => statusMutation.mutate({ id: row.id, status: "READ" })}>Đã đọc</Button>
          <Button size="sm" variant="ghost" onClick={() => statusMutation.mutate({ id: row.id, status: "RESOLVED" })}>Xong</Button>
          <Button size="sm" variant="danger" onClick={() => window.confirm("Xóa liên hệ này?") && deleteMutation.mutate(row.id)}>Xóa</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Liên hệ góp ý</h1>
        <p className="mt-1 text-sm text-gray-500">{data.length} thông báo góp ý</p>
      </div>
      <AdminTable columns={columns} data={data} isLoading={isLoading} keyExtractor={(row) => String(row.id)} emptyMessage="Chưa có liên hệ." />
    </div>
  );
}
