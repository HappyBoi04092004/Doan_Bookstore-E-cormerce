import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const bookInclude: Prisma.BookInclude = {
  category: true,
  author: true,
  publisher: true,
  images: {
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
  },
  attributes: {
    include: { attribute: true },
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

type AttributeInput = { attributeId?: number; name?: string; unit?: string; value: string };
type VariantInput = {
  id?: number;
  name: string;
  sku?: string;
  price: number | string;
  stock: number | string;
  discountPercent?: number | string | null;
};

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

async function resolveAttribute(name: string, unit?: string) {
  let record = await prisma.attribute.findFirst({ where: { name } });
  if (!record) {
    record = await prisma.attribute.create({ data: { name, unit: unit || null } });
  } else if (unit !== undefined && unit !== record.unit) {
    record = await prisma.attribute.update({ where: { id: record.id }, data: { unit: unit || null } });
  }
  return record;
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
      discountPercent:
        variant.discountPercent === undefined ||
        variant.discountPercent === null ||
        variant.discountPercent === ""
          ? null
          : Number(variant.discountPercent),
    }))
    .filter((variant) => variant.name.length > 0);
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
      name: "E-book",
      sku: undefined,
      price: Math.max(Math.round(safePrice * 0.6), 1),
      stock: 999,
      discountPercent: null,
    },
    {
      name: "Bản tiêu chuẩn",
      sku: undefined,
      price: safePrice,
      stock: safeStock,
      discountPercent: null,
    },
    {
      name: "Bản đặc biệt",
      sku: undefined,
      price: Math.max(Math.round(safePrice * 1.35), 1),
      stock: Math.max(Math.round(safeStock * 0.4), 0),
      discountPercent: null,
    },
  ];
}

function summarizePrice(book: any) {
  if (Array.isArray(book.variants) && book.variants.length > 0) {
    return Number(book.variants[0]?.price ?? 0);
  }
  return Number(book.price ?? 0);
}

function summarizeStock(book: any) {
  if (Array.isArray(book.variants) && book.variants.length > 0) {
    return book.variants.reduce((sum: number, variant: any) => sum + (Number(variant.stock) || 0), 0);
  }
  return Number(book.stock ?? 0);
}

export function formatBook(book: any) {
  const variants =
    book.variants?.map((variant: any) => ({
      ...variant,
      primaryImage:
        variant.images?.find((image: any) => image.isPrimary)?.url ??
        variant.images?.[0]?.url ??
        null,
    })) ?? [];

  return {
    ...book,
    primaryImage:
      book.images?.find((image: any) => image.isPrimary)?.url ??
      book.images?.[0]?.url ??
      variants[0]?.primaryImage ??
      null,
    attributes:
      book.attributes?.map((attributeRow: any) => ({
        id: attributeRow.id,
        attributeId: attributeRow.attributeId,
        name: attributeRow.attribute?.name ?? "",
        unit: attributeRow.attribute?.unit ?? null,
        value: attributeRow.value,
      })) ?? [],
    variants,
    price: summarizePrice({ ...book, variants }),
    stock: summarizeStock({ ...book, variants }),
  };
}

function normalizeAttributes(raw: unknown): AttributeInput[] {
  if (!Array.isArray(raw)) return [];

  const normalized = raw
    .filter((attribute) => attribute && typeof attribute === "object")
    .map((attribute: any) => ({
      attributeId: Number(attribute.attributeId),
      name: String(attribute.name ?? "").trim(),
      unit: attribute.unit === undefined ? undefined : String(attribute.unit ?? "").trim(),
      value: String(attribute.value ?? "").trim(),
    }))
    .filter(
      (attribute) =>
        ((Number.isInteger(attribute.attributeId) && attribute.attributeId > 0) || attribute.name) &&
        attribute.value
    );

  const deduped = new Map<string, AttributeInput>();
  for (const attribute of normalized) {
    deduped.set(attribute.attributeId > 0 ? `id:${attribute.attributeId}` : `name:${attribute.name.toLowerCase()}`, attribute);
  }

  return Array.from(deduped.values());
}

async function buildAttributeCreates(attributes: AttributeInput[]) {
  const rows = [];
  for (const attribute of normalizeAttributes(attributes)) {
    const attributeId =
      attribute.attributeId && attribute.attributeId > 0
        ? attribute.attributeId
        : (await resolveAttribute(attribute.name!, attribute.unit)).id;
    rows.push({ attributeId, value: attribute.value });
  }
  return rows;
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

    return { books: books.map(formatBook), total, page, limit };
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
    publisher?: string;
    category: string;
    price: number | string;
    stock: number | string;
    description?: string;
    imagePaths?: string[];
    attributes?: AttributeInput[];
    variants?: VariantInput[];
  }) {
    const { title, author, publisher, category, price, stock, description, imagePaths = [], attributes = [], variants = [] } = data;

    if (!title || !author) throw new Error("Tiêu đề và tác giả là bắt buộc");
    if (!category) throw new Error("Danh mục là bắt buộc");

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

    const [catRecord, authorRecord] = await Promise.all([
      resolveCategory(category),
      resolveAuthor(author),
    ]);
    const [publisherRecord, attributeCreates] = await Promise.all([
      publisher?.trim() ? resolvePublisher(publisher.trim()) : Promise.resolve(null),
      buildAttributeCreates(attributes),
    ]);

    const book = await prisma.book.create({
      data: {
        title,
        authorId: authorRecord.id,
        publisherId: publisherRecord?.id ?? null,
        categoryId: catRecord.id,
        description,
        price: Number(variantsToCreate[0].price),
        stock: variantsToCreate.reduce((sum, variant) => sum + Number(variant.stock || 0), 0),
        images: {
          create: imagePaths.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            sortOrder: idx,
          })),
        },
        attributes: {
          create: attributeCreates,
        },
        variants: {
          create: variantsToCreate.map((variant) => ({
            name: variant.name,
            sku: variant.sku || null,
            price: Number(variant.price),
            stock: Number(variant.stock),
            discountPercent:
              variant.discountPercent === null || variant.discountPercent === undefined
                ? null
                : Number(variant.discountPercent),
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
      category?: string;
      price?: number | string;
      stock?: number | string;
      description?: string;
      imagePaths?: string[];
      attributes?: AttributeInput[];
      variants?: VariantInput[];
    }
  ) {
    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook) throw new Error("Không tìm thấy sách");

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
      updateData.publisher = publisherName
        ? { connect: { id: (await resolvePublisher(publisherName)).id } }
        : { disconnect: true };
    }

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;

    const normalizedVariants = normalizeVariants(data.variants);
    if (normalizedVariants.length > 0) {
      if (normalizedVariants.some((variant) => Number(variant.price) <= 0)) {
        throw new Error("Giá biến thể phải lớn hơn 0");
      }
      if (normalizedVariants.some((variant) => Number(variant.stock) < 0)) {
        throw new Error("Tồn kho biến thể không được âm");
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
          stock: Number(variant.stock),
          discountPercent:
            variant.discountPercent === null || variant.discountPercent === undefined
              ? null
              : Number(variant.discountPercent),
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
              bookId: id,
            },
          });
        }
      }

      updateData.price = Number(normalizedVariants[0].price);
      updateData.stock = normalizedVariants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
    } else {
      if (data.price !== undefined) {
        if (Number(data.price) <= 0) throw new Error("Giá phải lớn hơn 0");
        updateData.price = Number(data.price);
      }
      if (data.stock !== undefined) {
        if (Number(data.stock) < 0) throw new Error("Số lượng không được âm");
        updateData.stock = Number(data.stock);
      }
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

    if (data.attributes) {
      const attributeCreates = await buildAttributeCreates(data.attributes);
      await prisma.bookAttribute.deleteMany({ where: { bookId: id } });
      updateData.attributes = {
        create: attributeCreates,
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
    await prisma.book.findUniqueOrThrow({ where: { id } });
    await prisma.book.delete({ where: { id } });
    return true;
  },

  async getAttributes() {
    return prisma.attribute.findMany({ orderBy: { name: "asc" } });
  },

  async createAttribute(name: string, unit?: string) {
    return prisma.attribute.upsert({
      where: { name },
      update: { unit: unit ?? null },
      create: { name, unit: unit ?? null },
    });
  },
};
