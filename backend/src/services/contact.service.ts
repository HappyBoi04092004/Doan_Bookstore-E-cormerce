import prisma from "../lib/prisma";

export const contactService = {
  create(data: { name: string; email: string; subject: string; message: string; userId?: number }) {
    const name = data.name?.trim();
    const email = data.email?.trim();
    const subject = data.subject?.trim();
    const message = data.message?.trim();
    if (!name || !email || !subject || !message) {
      throw new Error("Vui lòng nhập đầy đủ thông tin liên hệ");
    }
    return prisma.contactMessage.create({
      data: { name, email, subject, message, userId: data.userId },
    });
  },

  getAll() {
    return prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },

  async updateStatus(id: number, status: string) {
    const allowed = ["NEW", "READ", "RESOLVED"];
    if (!allowed.includes(status)) throw new Error("Trạng thái không hợp lệ");
    return prisma.contactMessage.update({ where: { id }, data: { status } });
  },

  async remove(id: number) {
    await prisma.contactMessage.delete({ where: { id } });
  },
};
