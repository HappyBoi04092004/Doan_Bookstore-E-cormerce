import { useForm } from "react-hook-form";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    console.log("Contact form:", data);
    reset();
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Liên hệ</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Bạn có câu hỏi hoặc góp ý? Hãy gửi cho chúng tôi!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_380px]">
        {/* Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {isSubmitSuccessful ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Send className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Đã gửi tin nhắn!</h2>
              <p className="text-gray-500 text-sm">
                Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24h.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  label="Họ tên"
                  {...register("name", { required: "Bắt buộc" })}
                  error={errors.name?.message}
                />
                <Input
                  label="Email"
                  type="email"
                  {...register("email", { required: "Bắt buộc" })}
                  error={errors.email?.message}
                />
              </div>
              <Input
                label="Chủ đề"
                {...register("subject", { required: "Bắt buộc" })}
                error={errors.subject?.message}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Nội dung</label>
                <textarea
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  {...register("message", { required: "Bắt buộc" })}
                />
                {errors.message && (
                  <p className="text-xs text-red-600">{errors.message.message}</p>
                )}
              </div>
              <Button type="submit" isLoading={isSubmitting} size="lg" className="w-full">
                <Send className="h-4 w-4 mr-1" />
                Gửi tin nhắn
              </Button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-6">
          {[
            { icon: Mail, label: "Email", value: "support@hpstore.vn" },
            { icon: Phone, label: "Điện thoại", value: "+84941579339" },
            { icon: MapPin, label: "Địa chỉ", value: "Số nhà 31/134 Nguyên Xá, Minh Khai, Bắc Từ Liêm, Hà Nội" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                <Icon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
