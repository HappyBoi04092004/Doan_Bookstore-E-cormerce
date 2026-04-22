import { useEffect } from "react";
import { useWishlistStore } from "../stores/wishlistStore";
import { wishlistService } from "../services/wishlistService";
import { useAuthStore } from "../stores/authStore";
import type { Book } from "../types";

export function useWishlist() {
  const store = useWishlistStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Fetch wishlist on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      store.clearWishlist();
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      store.setLoading(true);
      const items = await wishlistService.getWishlist();
      store.setWishlist(items);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      store.setLoading(false);
    }
  };

  const toggleWishlist = async (book: Book) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để sử dụng tính năng này");
      return;
    }

    try {
      // Optimistic update
      const isCurrentlyWishlisted = store.isWishlisted(book.id);
      
      if (isCurrentlyWishlisted) {
        store.removeWishlistItem(book.id);
      } else {
        // We use a temporary ID for optimistic update
        const tempUserId = useAuthStore.getState().user?.id ? Number(useAuthStore.getState().user?.id) : 0;
        store.addWishlistItem({
          id: Date.now(), // Thêm ID tạm thời
          bookId: book.id,
          userId: tempUserId,
          book
        });
      }

      // API call
      const res = await wishlistService.toggleWishlist(book.id);
      
      // If the backend response contradicts our optimistic update, we should refetch
      // But usually it's fine. We can just alert success if needed or silently success.
      if (res.wishlisted !== !isCurrentlyWishlisted) {
         fetchWishlist();
      }
      
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      // Revert optimistic update by refetching
      fetchWishlist();
      alert("Có lỗi xảy ra khi cập nhật danh sách yêu thích");
    }
  };

  return {
    items: store.items,
    isLoading: store.isLoading,
    wishlistCount: store.items.length,
    isWishlisted: store.isWishlisted,
    toggleWishlist,
    fetchWishlist,
    clearWishlist: store.clearWishlist
  };
}
