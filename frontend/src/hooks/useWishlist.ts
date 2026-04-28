import { useEffect } from "react";
import { useWishlistStore } from "../stores/wishlistStore";
import { wishlistService } from "../services/wishlistService";
import { useAuthStore } from "../stores/authStore";

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

  const toggleWishlist = async (variantId: number) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để sử dụng tính năng này");
      return;
    }

    try {
      // Optimistic update
      const isCurrentlyWishlisted = store.isWishlisted(variantId);
      
      if (isCurrentlyWishlisted) {
        store.removeWishlistItem(variantId);
      }

      // API call
      await wishlistService.toggleWishlist(variantId);
      
      fetchWishlist();
      
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
