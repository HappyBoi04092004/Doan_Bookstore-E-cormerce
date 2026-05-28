import prisma from "../lib/prisma";

export const authorService = {
  getAll() {
    return prisma.author.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { books: true } } },
    });
  },

  async create(name: string) {
    const trimmed = name?.trim();
    if (!trimmed) throw new Error("Tên tác giả là bắt buộc");
    const existing = await prisma.author.findFirst({ where: { name: trimmed } });
    if (existing) throw new Error("Tác giả đã tồn tại");
    return prisma.author.create({ data: { name: trimmed } });
  },

  async update(id: number, name: string) {
    const trimmed = name?.trim();
    if (!trimmed) throw new Error("Tên tác giả là bắt buộc");
    const author = await prisma.author.findUnique({ where: { id } });
    if (!author) throw new Error("Không tìm thấy tác giả");
    const existing = await prisma.author.findFirst({ where: { name: trimmed } });
    if (existing && existing.id !== id) throw new Error("Tác giả đã tồn tại");
    return prisma.author.update({ where: { id }, data: { name: trimmed } });
  },

  async remove(id: number) {
    const author = await prisma.author.findUnique({
      where: { id },
      include: { books: true },
    });
    if (!author) throw new Error("Không tìm thấy tác giả");
    if (author.books.length > 0) {
      throw new Error(`Không thể xóa tác giả đang có ${author.books.length} sách`);
    }
    await prisma.author.delete({ where: { id } });
  },
};
