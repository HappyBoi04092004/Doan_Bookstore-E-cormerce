import prisma from "../lib/prisma";

type SupplierInput = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
};

function validateSupplier(data: SupplierInput) {
  if (!String(data.name ?? "").trim()) throw new Error("Tên nhà cung cấp là bắt buộc");
  if (data.status && !["ACTIVE", "INACTIVE"].includes(data.status)) {
    throw new Error("Trạng thái nhà cung cấp không hợp lệ");
  }
}

export const supplierService = {
  async getAll(search = "") {
    return prisma.supplier.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: number) {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new Error("Không tìm thấy nhà cung cấp");
    return supplier;
  },

  async create(data: SupplierInput) {
    validateSupplier(data);
    return prisma.supplier.create({
      data: {
        name: data.name!.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        status: data.status || "ACTIVE",
      },
    });
  },

  async update(id: number, data: SupplierInput) {
    await this.getById(id);
    const next = { ...data };
    if (next.name !== undefined) validateSupplier(next);
    if (next.status && !["ACTIVE", "INACTIVE"].includes(next.status)) {
      throw new Error("Trạng thái nhà cung cấp không hợp lệ");
    }

    return prisma.supplier.update({
      where: { id },
      data: {
        ...(next.name !== undefined ? { name: next.name.trim() } : {}),
        ...(next.email !== undefined ? { email: next.email.trim() || null } : {}),
        ...(next.phone !== undefined ? { phone: next.phone.trim() || null } : {}),
        ...(next.address !== undefined ? { address: next.address.trim() || null } : {}),
        ...(next.status !== undefined ? { status: next.status } : {}),
      },
    });
  },

  async delete(id: number) {
    await this.getById(id);
    const receiptCount = await prisma.importReceipt.count({ where: { supplierId: id } });
    if (receiptCount > 0) {
      throw new Error("Không thể xóa nhà cung cấp đã có phiếu nhập");
    }
    await prisma.supplier.delete({ where: { id } });
    return true;
  },
};
