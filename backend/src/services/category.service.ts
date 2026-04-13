import prisma from "../lib/prisma";

export const categoryService = {
  async getAllCategories() {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  },

  async getCategoryById(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { books: true },
    });
    if (!category) throw new Error("Không tìm thấy danh mục");
    return category;
  },

  async createCategory(name: string, image?: string) {
    if (!name || !name.trim()) throw new Error("Tên là bắt buộc");
    const existing = await prisma.category.findFirst({ where: { name: name.trim() } });
    if (existing) throw new Error("Danh mục đã tồn tại");
    return await prisma.category.create({
      data: { name: name.trim(), image: image || null },
    });
  },

  async updateCategory(id: number, name?: string, image?: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new Error("Không tìm thấy danh mục");

    // Deletion REMAINS in folder - REMOVED AS PER USER REQUEST

    if (name && name.trim() !== category.name) {
      const existing = await prisma.category.findFirst({ where: { name: name.trim() } });
      if (existing && existing.id !== id) throw new Error("Tên danh mục đã tồn tại");
    }

    return await prisma.category.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(image !== undefined ? { image: image || null } : {}),
      },
    });
  },

  async deleteCategory(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { books: true },
    });
    if (!category) throw new Error("Không tìm thấy danh mục");
    // Deletion REMAINS in folder - REMOVED AS PER USER REQUEST
    if (category.books.length > 0) {
      throw new Error(
        `Không thể xóa: danh mục này chưá ${category.books.length} cuốn sách. Vui lòng chuyển sách sang danh mục khác trước.`
      );
    }
    await prisma.category.delete({ where: { id } });
  },
};