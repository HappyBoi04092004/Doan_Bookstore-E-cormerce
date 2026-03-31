import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { BookOpen } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import type { LoginCredentials } from "../types";

export default function LoginPage() {
  const { login, isLoggingIn, loginError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = (data: LoginCredentials) => login(data);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
            <p className="text-sm text-gray-500">Chào mừng quay lại BookStore</p>
          </div>

          {/* Error */}
          {loginError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              Email hoặc mật khẩu không đúng. Vui lòng thử lại.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
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

            <Button type="submit" isLoading={isLoggingIn} className="w-full" size="lg">
              Đăng nhập
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Hiện tại bạn chưa có tài khoản?{" "}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
