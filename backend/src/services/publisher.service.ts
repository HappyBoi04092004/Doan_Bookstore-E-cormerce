import prisma from "../lib/prisma";

export const publisherService = {
  getAll() {
    return prisma.publisher.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { books: true } } },
    });
  },

  async create(name: string) {
    const trimmed = name?.trim();
    if (!trimmed) throw new Error("Tên nhà xuất bản là bắt buộc");
    const existing = await prisma.publisher.findFirst({ where: { name: trimmed } });
    if (existing) throw new Error("Nhà xuất bản đã tồn tại");
    return prisma.publisher.create({ data: { name: trimmed } });
  },

  async update(id: number, name: string) {
    const trimmed = name?.trim();
    if (!trimmed) throw new Error("Tên nhà xuất bản là bắt buộc");
    const publisher = await prisma.publisher.findUnique({ where: { id } });
    if (!publisher) throw new Error("Không tìm thấy nhà xuất bản");
    const existing = await prisma.publisher.findFirst({ where: { name: trimmed } });
    if (existing && existing.id !== id) throw new Error("Nhà xuất bản đã tồn tại");
    return prisma.publisher.update({ where: { id }, data: { name: trimmed } });
  },

  async remove(id: number) {
    const publisher = await prisma.publisher.findUnique({
      where: { id },
      include: { books: true },
    });
    if (!publisher) throw new Error("Không tìm thấy nhà xuất bản");
    if (publisher.books.length > 0) {
      throw new Error(`Không thể xóa nhà xuất bản đang có ${publisher.books.length} sách`);
    }
    await prisma.publisher.delete({ where: { id } });
  },
};
