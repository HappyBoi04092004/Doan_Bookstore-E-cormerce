import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const BOOK_USED_IN_ORDER_MESSAGE =
  "Không thể xóa sách này vì đã phát sinh trong đơn hàng của khách hàng.";

export const bookInclude: Prisma.BookInclude = {
  category: true,
  author: true,
  publisherRecord: true,
  images: {
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
  },
  variants: {
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
    },
    orderBy: [{ price: "asc" }, { id: "asc" }],
  },
};

type VariantInput = {
  id?: number;
  name: string;
  sku?: string;
  price: number | string;
  stock: number | string;
};

type BookDetailInput = {
  publisher?: string;
  importPrice?: number | string | null;
  isbn?: string;
  publishYear?: number | string | null;
  pageCount?: number | string | null;
  language?: string;
  size?: string;
  format?: string;
};

function isEbookVariantName(name: string) {
  return ["ebook", "e-book"].includes(name.trim().toLowerCase());
}

async function resolveCategory(name: string) {
  let record = await prisma.category.findFirst({ where: { name } });
  if (!record) record = await prisma.category.create({ data: { name } });
  return record;
}

async function resolveAuthor(name: string) {
  let record = await prisma.author.findFirst({ where: { name } });
  if (!record) record = await prisma.author.create({ data: { name } });
  return record;
}

async function resolvePublisher(name: string) {
  let record = await prisma.publisher.findFirst({ where: { name } });
  if (!record) record = await prisma.publisher.create({ data: { name } });
  return record;
}

function optionalString(value: unknown) {
  const trimmed = String(value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeVariants(raw: unknown): VariantInput[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((variant) => variant && typeof variant === "object")
    .map((variant: any) => ({
      id:
        Number.isInteger(Number(variant.id)) && Number(variant.id) > 0
          ? Number(variant.id)
          : undefined,
      name: String(variant.name ?? "").trim(),
      sku: variant.sku ? String(variant.sku).trim() : undefined,
      price: Number(variant.price ?? 0),
      stock: Number(variant.stock ?? 0),
    }))
    .filter((variant) => variant.name.length > 0 && !isEbookVariantName(variant.name));
}

function ensureUniqueVariants(variants: VariantInput[]) {
  const normalizedNames = variants.map((variant) => variant.name.trim().toLowerCase());
  if (new Set(normalizedNames).size !== normalizedNames.length) {
    throw new Error("Tên biến thể bị trùng. Mỗi biến thể cần có tên khác nhau");
  }

  const skus = variants
    .map((variant) => variant.sku?.trim())
    .filter((sku): sku is string => Boolean(sku));
  const normalizedSkus = skus.map((sku) => sku.toLowerCase());
  if (new Set(normalizedSkus).size !== normalizedSkus.length) {
    throw new Error("SKU biến thể bị trùng. Vui lòng nhập SKU khác nhau hoặc để trống");
  }
}

function buildDefaultVariants(price: number, stock: number): VariantInput[] {
  const safePrice = Math.max(Number(price || 0), 1);
  const safeStock = Math.max(Number(stock || 0), 0);

  return [
    {
      name: "Bản tiêu chuẩn",
      sku: undefined,
      price: safePrice,
      stock: safeStock,
    },
    {
      name: "Bản đặc biệt",
      sku: undefined,
      price: Math.max(Math.round(safePrice * 1.35), 1),
      stock: Math.max(Math.round(safeStock * 0.4), 0),
    },
  ];
}

function summarizePrice(book: any) {
  if (Array.isArray(book.variants) && book.variants.length > 0) {
    return Number(book.variants[0]?.price ?? 0);
  }
  return 0;
}

function summarizeStock(book: any) {
  if (Array.isArray(book.variants)) {
    return book.variants.reduce((sum: number, variant: any) => sum + Number(variant.stock ?? 0), 0);
  }
  return 0;
}

async function attachAdminStockMetrics(books: any[]) {
  const bookIds = books.map((book) => book.id);
  if (bookIds.length === 0) return books;

  const soldItems = await prisma.orderItem.findMany({
    where: {
      variant: { bookId: { in: bookIds } },
      order: { status: { in: ["PAID", "COMPLETED"] } },
    },
    select: {
      qty: true,
      variant: { select: { bookId: true } },
    },
  });

  const soldByBookId = new Map<number, number>();
  soldItems.forEach((item) => {
    soldByBookId.set(item.variant.bookId, (soldByBookId.get(item.variant.bookId) ?? 0) + item.qty);
  });

  return books.map((book) => ({
    ...book,
    soldQuantity: soldByBookId.get(book.id) ?? 0,
    stockStatus: book.stock === 0 ? "Hết hàng" : book.stock < 10 ? "Sắp hết hàng" : "Còn hàng",
  }));
}

function buildBookDetailData(data: BookDetailInput) {
  return {
    publisher: String(data.publisher ?? "").trim(),
    isbn: optionalString(data.isbn),
    publishYear: optionalNumber(data.publishYear),
    pageCount: optionalNumber(data.pageCount),
    language: optionalString(data.language),
    size: optionalString(data.size),
    format: optionalString(data.format),
  };
}

function validateRequired(data: { title?: string; author?: string; publisher?: string }) {
  if (!String(data.title ?? "").trim()) throw new Error("Tên sách là bắt buộc");
  if (!String(data.author ?? "").trim()) throw new Error("Tác giả là bắt buộc");
  if (!String(data.publisher ?? "").trim()) throw new Error("Nhà xuất bản là bắt buộc");
}

export function formatBook(book: any) {
  const { publisherRecord, ...bookData } = book;
  const variants =
    book.variants?.map((variant: any) => ({
      ...variant,
      primaryImage:
        variant.images?.find((image: any) => image.isPrimary)?.url ??
        variant.images?.[0]?.url ??
        null,
    })) ?? [];

  return {
    ...bookData,
    publisher: book.publisher || publisherRecord?.name || "",
    primaryImage:
      book.images?.find((image: any) => image.isPrimary)?.url ??
      book.images?.[0]?.url ??
      variants[0]?.primaryImage ??
      null,
    variants,
    price: summarizePrice({ ...book, variants }),
    stock: summarizeStock({ ...book, variants }),
  };
}

export const bookService = {
  async getAdminBooks(search: string = "", page: number = 1, limit: number = 10, category?: string) {
    const skip = (page - 1) * limit;
    const whereClause: Prisma.BookWhereInput = {
      title: { contains: search },
      ...(category ? { category: { name: { contains: category } } } : {}),
    };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: bookInclude,
        orderBy: { createdAt: "desc" },
      }),
      prisma.book.count({ where: whereClause }),
    ]);

    const formattedBooks = books.map(formatBook);
    return { books: await attachAdminStockMetrics(formattedBooks), total, page, limit };
  },

  async getBooks() {
    const books = await prisma.book.findMany({
      include: bookInclude,
      orderBy: { createdAt: "desc" },
    });

    return books.map(formatBook);
  },

  async getBookById(id: number) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: bookInclude,
    });

    if (!book) throw new Error("Không tìm thấy sách");
    return formatBook(book);
  },

  async createBook(data: {
    title: string;
    author: string;
    publisher: string;
    isbn?: string;
    publishYear?: number | string | null;
    pageCount?: number | string | null;
    language?: string;
    size?: string;
    format?: string;
    category: string;
    price: number | string;
    stock: number | string;
    importPrice?: number | string;
    description?: string;
    imagePaths?: string[];
    variants?: VariantInput[];
  }) {
    const { title, author, category, price, stock, description, imagePaths = [], variants = [] } = data;
    validateRequired(data);
    if (!category) throw new Error("Danh mục là bắt buộc");
    if (Number(price) <= 0) throw new Error("Giá bán phải lớn hơn 0");
    if (Number(stock) < 0) throw new Error("Số lượng tồn kho không được âm");

    const normalizedVariants = normalizeVariants(variants);
    const variantsToCreate =
      normalizedVariants.length > 0
        ? normalizedVariants
        : buildDefaultVariants(Number(price ?? 0), Number(stock ?? 0));

    if (variantsToCreate.some((variant) => Number(variant.price) <= 0)) {
      throw new Error("Giá biến thể phải lớn hơn 0");
    }
    if (variantsToCreate.some((variant) => Number(variant.stock) < 0)) {
      throw new Error("Tồn kho biến thể không được âm");
    }
    ensureUniqueVariants(variantsToCreate);

    // ── Kiểm tra sách trùng (cùng tên + cùng tác giả) ──────────────────────
    const authorRecord = await resolveAuthor(author);
    const duplicateBook = await prisma.book.findFirst({
      where: {
        title: { equals: title.trim() },
        authorId: authorRecord.id,
      },
    });
    if (duplicateBook) {
      throw new Error(
        `Sách "${title.trim()}" của tác giả "${author.trim()}" đã tồn tại trong hệ thống. Vui lòng kiểm tra lại hoặc chỉnh sửa sách hiện có.`
      );
    }

    // ── Kiểm tra ISBN trùng (nếu có nhập) ──────────────────────────────────
    const trimmedIsbn = optionalString(data.isbn);
    if (trimmedIsbn) {
      const duplicateIsbn = await prisma.book.findFirst({
        where: { isbn: trimmedIsbn },
      });
      if (duplicateIsbn) {
        throw new Error(
          `ISBN "${trimmedIsbn}" đã được sử dụng cho sách "${duplicateIsbn.title}". Mỗi sách cần có ISBN khác nhau.`
        );
      }
    }

    const [catRecord, publisherRecord] = await Promise.all([
      resolveCategory(category),
      resolvePublisher(data.publisher.trim()),
    ]);
    const detailData = buildBookDetailData(data);

    const book = await prisma.book.create({
      data: {
        title: title.trim(),
        authorId: authorRecord.id,
        publisherId: publisherRecord.id,
        publisher: detailData.publisher,
        isbn: detailData.isbn,
        publishYear: detailData.publishYear,
        pageCount: detailData.pageCount,
        language: detailData.language,
        size: detailData.size,
        format: detailData.format,
        categoryId: catRecord.id,
        description,
        importPrice: Number(data.importPrice ?? 0),
        images: {
          create: imagePaths.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            sortOrder: idx,
          })),
        },
        variants: {
          create: variantsToCreate.map((variant) => ({
            name: variant.name,
            sku: variant.sku || null,
            price: Number(variant.price),
            stock: Number(variant.stock),
          })),
        },
      },
      include: bookInclude,
    });

    return formatBook(book);
  },

  async updateBook(
    id: number,
    data: {
      title?: string;
      author?: string;
      publisher?: string;
      isbn?: string;
      publishYear?: number | string | null;
      pageCount?: number | string | null;
      language?: string;
      size?: string;
      format?: string;
      category?: string;
      price?: number | string;
      stock?: number | string;
      importPrice?: number | string;
      description?: string;
      imagePaths?: string[];
      variants?: VariantInput[];
    }
  ) {
    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook) throw new Error("Không tìm thấy sách");

    const requiredCandidate = {
      title: data.title ?? existingBook.title,
      author: data.author ?? "",
      publisher: data.publisher ?? existingBook.publisher,
      price: data.price,
    };
    if (data.author === undefined) {
      const existingAuthor = await prisma.author.findUnique({ where: { id: existingBook.authorId } });
      requiredCandidate.author = existingAuthor?.name ?? "";
    }
    validateRequired(requiredCandidate);

    let categoryId = existingBook.categoryId;
    if (data.category) {
      const categoryRecord = await resolveCategory(data.category);
      categoryId = categoryRecord.id;
    }

    let authorId = existingBook.authorId;
    if (data.author !== undefined) {
      const authorRecord = await resolveAuthor(data.author);
      authorId = authorRecord.id;
    }

    const updateData: Prisma.BookUpdateInput = {
      category: { connect: { id: categoryId } },
      author: { connect: { id: authorId } },
    };

    if (data.publisher !== undefined) {
      const publisherName = data.publisher.trim();
      const publisherRecord = await resolvePublisher(publisherName);
      updateData.publisher = publisherName;
      updateData.publisherRecord = { connect: { id: publisherRecord.id } };
    }

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isbn !== undefined) updateData.isbn = optionalString(data.isbn);
    if (data.publishYear !== undefined) updateData.publishYear = optionalNumber(data.publishYear);
    if (data.pageCount !== undefined) updateData.pageCount = optionalNumber(data.pageCount);
    if (data.language !== undefined) updateData.language = optionalString(data.language);
    if (data.size !== undefined) updateData.size = optionalString(data.size);
    if (data.format !== undefined) updateData.format = optionalString(data.format);

    const normalizedVariants = normalizeVariants(data.variants);
    if (normalizedVariants.length > 0) {
      if (normalizedVariants.some((variant) => Number(variant.price) <= 0)) {
        throw new Error("Giá biến thể phải lớn hơn 0");
      }
      ensureUniqueVariants(normalizedVariants);

      const existingVariantIds = new Set(
        (
          await prisma.bookVariant.findMany({
            where: { bookId: id },
            select: { id: true },
          })
        ).map((variant) => variant.id)
      );

      for (const variant of normalizedVariants) {
        const variantPayload = {
          name: variant.name,
          sku: variant.sku || null,
          price: Number(variant.price),
        };

        if (variant.id && existingVariantIds.has(variant.id)) {
          await prisma.bookVariant.update({
            where: { id: variant.id },
            data: variantPayload,
          });
        } else {
          await prisma.bookVariant.create({
            data: {
              ...variantPayload,
              stock: Number(variant.stock ?? 0),
              bookId: id,
            },
          });
        }
      }

    } else {
      if (data.price !== undefined) {
        if (Number(data.price) <= 0) throw new Error("Giá phải lớn hơn 0");
      }
    }

    if (data.importPrice !== undefined) {
      if (Number(data.importPrice) < 0) throw new Error("Giá nhập không được âm");
      updateData.importPrice = Number(data.importPrice);
    }

    if (data.imagePaths && data.imagePaths.length > 0) {
      await prisma.bookImage.deleteMany({ where: { bookId: id, variantId: null } });
      updateData.images = {
        create: data.imagePaths.map((url, idx) => ({
          url,
          isPrimary: idx === 0,
          sortOrder: idx,
        })),
      };
    }

    const book = await prisma.book.update({
      where: { id },
      data: updateData,
      include: bookInclude,
    });

    return formatBook(book);
  },

  async deleteBook(id: number) {
    const book = await prisma.book.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!book) throw new Error("Không tìm thấy sách");

    const hasOrder = await prisma.orderItem.findFirst({
      where: {
        variant: { bookId: id },
      },
      select: { id: true },
    });

    if (hasOrder) {
      const error = new Error(BOOK_USED_IN_ORDER_MESSAGE) as Error & { statusCode?: number };
      error.statusCode = 409;
      throw error;
    }

    await prisma.$transaction(async (tx) => {
      const variants = await tx.bookVariant.findMany({
        where: { bookId: id },
        select: { id: true },
      });
      const variantIds = variants.map((variant) => variant.id);

      if (variantIds.length > 0) {
        await tx.cartItem.deleteMany({ where: { variantId: { in: variantIds } } });
        await tx.wishlist.deleteMany({ where: { variantId: { in: variantIds } } });
        await tx.importReceiptDetail.deleteMany({
          where: {
            OR: [{ productId: id }, { variantId: { in: variantIds } }],
          },
        });
      } else {
        await tx.importReceiptDetail.deleteMany({ where: { productId: id } });
      }

      await tx.review.deleteMany({ where: { bookId: id } });
      await tx.bookImage.deleteMany({ where: { bookId: id } });
      await tx.bookVariant.deleteMany({ where: { bookId: id } });
      await tx.book.delete({ where: { id } });
    });

    return true;
  },
};
