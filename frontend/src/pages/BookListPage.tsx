import React from "react";
import {Link} from "react-router-dom";
import { useBooks } from "../hooks/useBooks";
import { useCart } from "../hooks/useCart";
import Spinner from "../components/ui/Spinner";
import Badge from "../components/ui/Badge";
import { Book as BookIcon, User, Tag, ShoppingCart } from "lucide-react";

const BookListPage: React.FC = () => {
  const { data: books, isLoading, isError, refetch } = useBooks();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Spinner size="lg" />
        <p className="text-gray-500 animate-pulse font-medium">Đang tải thư viện sách...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-red-50 rounded-2xl border border-red-100 mx-4">
        <div className="bg-red-100 p-3 rounded-full mb-4">
          <BookIcon className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Không thể tải sách</h2>
        <p className="text-red-600/80 mb-6 max-w-md">
          Đã xảy ra lỗi khi tải danh sách sách. Vui lòng kiểm tra kết nối hoặc thử lại.
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-md active:scale-95"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 mx-4">
        <div className="bg-gray-100 p-3 rounded-full mb-4">
          <BookIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có sách</h2>
        <p className="text-gray-500 mb-0">Hiện chưa có sách nào. Vui lòng quay lại sau!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Khám phá kho sách
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Tìm kiếm cuốn sách yêu thích tiếp theo trong bộ sưu tập chọn lọc của chúng tôi.
          </p>
        </div>
        <div className="text-sm font-semibold text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
          Đã tìm thấy {books.length} sách
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {books.map((book) => (
          <Link to={`/books/${book.id}`} key={book.id} className="group">
          <div
            key={book.id}
            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Image Placeholder / Visual element */}
            <div className="h-48 bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
                <BookIcon className="w-16 h-16 text-indigo-200 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/2 duration-300" />
                <div className="absolute top-3 right-3">
                  <Badge variant={book.stock > 0 ? "success" : "danger"} className="shadow-sm">
                    {book.stock > 0 ? `${book.stock} còn hàng` : "Hết hàng"}
                  </Badge>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  <Tag className="w-3 h-3" />
                  {book.category.name}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                {book.title}
              </h3>

              <div className="flex items-center gap-2 text-gray-600 mb-4 text-sm font-medium">
                <div className="bg-gray-100 p-1.5 rounded-full">
                   <User className="w-3.5 h-3.5" />
                </div>
                <span>{book.author.name}</span>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Giá</span>
                  <span className="text-2xl font-black text-gray-900">
                    {book.price.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
                  </span>
                </div>
                <button 
                  disabled={book.stock === 0}
                  className="p-3 bg-gray-900 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-30 disabled:hover:bg-gray-900 transition-all shadow-lg shadow-gray-200 hover:shadow-indigo-200"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="sr-only">Thêm vào giỏ</span>
                </button>
              </div>
            </div>
          </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BookListPage;
