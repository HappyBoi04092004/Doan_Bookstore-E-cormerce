import type { SyntheticEvent } from "react";
import type { Book, BookImage, BookVariant } from "../types";

const FALLBACK_BOOK_IMAGE = "https://placehold.co/100x150?text=S%C3%A1ch";

function normalizeAssetUrl(url?: string | null) {
  if (!url) return "";
  return url.startsWith("/") ? `${import.meta.env.VITE_API_URL || ""}${url}` : url;
}

function getPrimaryImage(images?: BookImage[]) {
  return images?.find((image) => image.isPrimary)?.url ?? images?.[0]?.url ?? "";
}

export function getProductImage(
  variant?: (BookVariant & { book?: Book }) | null,
  book?: Book | null
) {
  return (
    normalizeAssetUrl(variant?.primaryImage) ||
    normalizeAssetUrl(getPrimaryImage(variant?.images)) ||
    normalizeAssetUrl(book?.primaryImage) ||
    normalizeAssetUrl(getPrimaryImage(book?.images)) ||
    FALLBACK_BOOK_IMAGE
  );
}

export function useFallbackBookImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_BOOK_IMAGE;
}
