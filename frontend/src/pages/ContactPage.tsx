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
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Have a question or feedback? We&apos;d love to hear from you.
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
              <h2 className="text-xl font-bold text-gray-900">Message Sent!</h2>
              <p className="text-gray-500 text-sm">
                Thanks for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  label="Name"
                  {...register("name", { required: "Required" })}
                  error={errors.name?.message}
                />
                <Input
                  label="Email"
                  type="email"
                  {...register("email", { required: "Required" })}
                  error={errors.email?.message}
                />
              </div>
              <Input
                label="Subject"
                {...register("subject", { required: "Required" })}
                error={errors.subject?.message}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <textarea
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  {...register("message", { required: "Required" })}
                />
                {errors.message && (
                  <p className="text-xs text-red-600">{errors.message.message}</p>
                )}
              </div>
              <Button type="submit" isLoading={isSubmitting} size="lg" className="w-full">
                <Send className="h-4 w-4 mr-1" />
                Send Message
              </Button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-6">
          {[
            { icon: Mail, label: "Email", value: "support@bookstore.vn" },
            { icon: Phone, label: "Phone", value: "+84 90 123 4567" },
            { icon: MapPin, label: "Address", value: "123 Nguyen Hue, District 1, Ho Chi Minh City" },
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
