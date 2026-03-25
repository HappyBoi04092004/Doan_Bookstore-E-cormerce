import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { BookOpen } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import type { RegisterPayload } from "../types";

export default function RegisterPage() {
  const { register: registerUser, isRegistering, registerError } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterPayload & { confirmPassword: string }>();

  const onSubmit = ({ confirmPassword: _, ...data }: RegisterPayload & { confirmPassword: string }) => {
    registerUser(data);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h1>
            <p className="text-sm text-gray-500">Tham gia BookStore ngay hôm nay</p>
          </div>

          {registerError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              Đăng ký thất bại. Email này đã được sử dụng.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Họ tên"
              placeholder="Nguyễn Văn A"
              {...register("name", { required: "Vui lòng nhập họ tên" })}
              error={errors.name?.message}
            />
            <Input
              label="Email"
              type="email"
              placeholder="ban@email.com"
              {...register("email", {
                required: "Vui lòng nhập email",
                pattern: { value: /\S+@\S+\.\S+/, message: "Email không hợp lệ" },
              })}
              error={errors.email?.message}
            />
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Vui lòng nhập mật khẩu",
                minLength: { value: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
              })}
              error={errors.password?.message}
            />
            <Input
              label="Nhập lại mật khẩu"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword", {
                required: "Vui lòng nhập lại mật khẩu",
                validate: (val) =>
                  val === watch("password") || "Mật khẩu không khớp",
              })}
              error={errors.confirmPassword?.message}
            />
            <Button type="submit" isLoading={isRegistering} className="w-full" size="lg">
              Đăng ký
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
