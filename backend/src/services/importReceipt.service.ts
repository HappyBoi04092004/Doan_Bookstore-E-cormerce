import prisma from "../lib/prisma";

type ImportReceiptItemInput = {
  variantId: number | string;
  quantity: number | string;
  importPrice: number | string;
};

type CreateImportReceiptInput = {
  supplierId: number | string;
  note?: string;
  details?: ImportReceiptItemInput[];
};

function normalizePositiveInt(value: unknown, field: string) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue)) throw new Error(`${field} phải là số nguyên`);
  if (numberValue <= 0) throw new Error(`${field} phải lớn hơn 0`);
  return numberValue;
}

async function generateReceiptCode(tx: any) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const prefix = `PNK${yyyy}${mm}${dd}`;
  const count = await tx.importReceipt.count({
    where: { code: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}

const receiptInclude = {
  supplier: true,
  creator: { select: { id: true, name: true, email: true } },
  details: {
    include: {
      product: { include: { author: true, images: true } },
      variant: true,
    },
  },
};

export const importReceiptService = {
  async getAll(filters: { search?: string; supplierId?: string; fromDate?: string; toDate?: string }) {
    const where: any = {};
    const search = String(filters.search ?? "").trim();

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { supplier: { name: { contains: search } } },
        { details: { some: { product: { title: { contains: search } } } } },
        { details: { some: { variant: { name: { contains: search } } } } },
      ];
    }
    if (filters.supplierId) where.supplierId = Number(filters.supplierId);
    if (filters.fromDate || filters.toDate) {
      where.createdAt = {
        ...(filters.fromDate ? { gte: new Date(filters.fromDate) } : {}),
        ...(filters.toDate ? { lte: new Date(`${filters.toDate}T23:59:59.999Z`) } : {}),
      };
    }

    return prisma.importReceipt.findMany({
      where,
      include: receiptInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: number) {
    const receipt = await prisma.importReceipt.findUnique({
      where: { id },
      include: receiptInclude,
    });
    if (!receipt) throw new Error("Không tìm thấy phiếu nhập");
    return receipt;
  },

  async create(data: CreateImportReceiptInput, createdBy?: number) {
    const supplierId = normalizePositiveInt(data.supplierId, "Nhà cung cấp");
    const details = Array.isArray(data.details) ? data.details : [];
    if (details.length === 0) throw new Error("Phiếu nhập cần ít nhất một biến thể sách");

    const normalizedDetails = details.map((item) => {
      const variantId = normalizePositiveInt(item.variantId, "Biến thể");
      const quantity = normalizePositiveInt(item.quantity, "Số lượng");
      const importPrice = normalizePositiveInt(item.importPrice, "Giá nhập");
      return {
        variantId,
        quantity,
        importPrice,
        subtotal: quantity * importPrice,
      };
    });

    return prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findUnique({ where: { id: supplierId } });
      if (!supplier) throw new Error("Không tìm thấy nhà cung cấp");

      const detailsWithProduct = [];
      for (const item of normalizedDetails) {
        const variant = await tx.bookVariant.findUnique({
          where: { id: item.variantId },
          include: { book: true },
        });
        if (!variant) throw new Error(`Không tìm thấy biến thể với id ${item.variantId}`);
        detailsWithProduct.push({
          ...item,
          productId: variant.bookId,
        });
      }

      const code = await generateReceiptCode(tx);
      const totalAmount = detailsWithProduct.reduce((sum, item) => sum + item.subtotal, 0);
      const receipt = await tx.importReceipt.create({
        data: {
          code,
          supplierId,
          totalAmount,
          note: data.note?.trim() || null,
          createdBy: createdBy || null,
          details: { create: detailsWithProduct },
        },
      });

      for (const item of detailsWithProduct) {
        await tx.book.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            importPrice: item.importPrice,
          },
        });
        await tx.bookVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.importReceipt.findUnique({
        where: { id: receipt.id },
        include: receiptInclude,
      });
    });
  },
};
