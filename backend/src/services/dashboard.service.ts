import prisma from "../lib/prisma";

const monthLabels = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

function emptyMonthlySeries() {
  return monthLabels.map((month) => ({ month, value: 0 }));
}

function buildMonthlySeries(rows: Array<{ createdAt: Date; amount: number }>) {
  const series = emptyMonthlySeries();
  rows.forEach((row) => {
    const monthIndex = row.createdAt.getMonth();
    series[monthIndex].value += row.amount;
  });
  return series;
}

export const dashboardService = {
  async getOverview() {
    const year = new Date().getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

    const [
      revenue,
      orderCount,
      customerCount,
      bookCount,
      importCapital,
      paidOrders,
      importReceipts,
      orderStatusGroups,
      recentOrders,
      recentImports,
      recentUsers,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "COMPLETED"] } },
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: { name: { equals: "USER" } } } }),
      prisma.book.count(),
      prisma.importReceipt.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.findMany({
        where: {
          status: { in: ["PAID", "COMPLETED"] },
          createdAt: { gte: yearStart, lte: yearEnd },
        },
        select: { createdAt: true, total: true },
      }),
      prisma.importReceipt.findMany({
        where: { createdAt: { gte: yearStart, lte: yearEnd } },
        select: { createdAt: true, totalAmount: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.importReceipt.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { supplier: true },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, createdAt: true },
      }),
    ]);

    const lowStockVariantGroups = await prisma.bookVariant.groupBy({
      by: ["bookId"],
      _sum: { stock: true },
      having: { stock: { _sum: { lt: 10 } } },
      orderBy: { _sum: { stock: "asc" } },
      take: 8,
    });
    const lowStockBookRecords = await prisma.book.findMany({
      where: { id: { in: lowStockVariantGroups.map((group) => group.bookId) } },
      select: { id: true, title: true },
    });
    const lowStockBooks = lowStockVariantGroups
      .map((group) => {
        const book = lowStockBookRecords.find((item) => item.id === group.bookId);
        return book ? { ...book, stock: group._sum.stock ?? 0 } : null;
      })
      .filter((book): book is { id: number; title: string; stock: number } => Boolean(book));

    const totalRevenue = revenue._sum.total ?? 0;
    const totalImportCapital = importCapital._sum.totalAmount ?? 0;

    return {
      stats: {
        totalRevenue,
        totalOrders: orderCount,
        totalCustomers: customerCount,
        totalBooks: bookCount,
        totalImportCapital,
        estimatedProfit: totalRevenue - totalImportCapital,
      },
      revenueByMonth: buildMonthlySeries(paidOrders.map((order) => ({ createdAt: order.createdAt, amount: order.total }))),
      importsByMonth: buildMonthlySeries(importReceipts.map((receipt) => ({ createdAt: receipt.createdAt, amount: receipt.totalAmount }))),
      ordersByStatus: orderStatusGroups.map((group) => ({
        status: group.status,
        count: group._count._all,
      })),
      lowStockBooks,
      recentActivity: {
        orders: recentOrders,
        importReceipts: recentImports,
        users: recentUsers,
      },
    };
  },
};
