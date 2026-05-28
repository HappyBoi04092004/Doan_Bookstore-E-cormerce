import { Star } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminTable, { type Column } from "../../components/admin/AdminTable";
import Button from "../../components/ui/Button";
import { reviewService, type Review } from "../../services/reviewService";

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["reviews"], queryFn: reviewService.getAll });
  const deleteMutation = useMutation({
    mutationFn: reviewService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
    onError: (err: any) => alert(err?.response?.data?.message || "Không thể xóa đánh giá"),
  });

  const columns: Column<Review>[] = [
    { key: "book", header: "Sách", render: (row) => <span className="font-medium">{row.book.title}</span> },
    { key: "user", header: "Người đánh giá", render: (row) => <div><p>{row.user.name}</p><p className="text-xs text-gray-500">{row.user.email}</p></div> },
    { key: "rating", header: "Rating", render: (row) => <span className="inline-flex items-center gap-1 font-medium text-amber-600"><Star className="h-4 w-4 fill-current" />{row.rating}/5</span> },
    { key: "comment", header: "Nội dung", render: (row) => <p className="max-w-md whitespace-normal text-sm text-gray-600">{row.comment}</p> },
    { key: "createdAt", header: "Ngày gửi", render: (row) => new Date(row.createdAt).toLocaleDateString("vi-VN") },
    { key: "actions", header: "Thao tác", render: (row) => <Button size="sm" variant="danger" onClick={() => window.confirm("Xóa đánh giá này?") && deleteMutation.mutate(row.id)}>Xóa</Button> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Đánh giá</h1>
        <p className="mt-1 text-sm text-gray-500">{data.length} đánh giá của khách hàng</p>
      </div>
      <AdminTable columns={columns} data={data} isLoading={isLoading} keyExtractor={(row) => String(row.id)} emptyMessage="Chưa có đánh giá." />
    </div>
  );
}
