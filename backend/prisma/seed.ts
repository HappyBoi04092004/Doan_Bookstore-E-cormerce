import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const coverImages = [
  "/uploads/books/image_2024_10_16t02_04_10_067z_aa3729e6c3a64c2893fc99751fe83be6_master.png",
  "/uploads/books/a-2243-183313.jpg",
  "/uploads/books/1780154467406-861249602-Screenshot_2026-05-30_221910.png",
  "/uploads/books/1780154467402-854304274-Screenshot_2026-05-30_020601.png",
  "/uploads/books/1780154284151-459831378-Screenshot_2026-05-30_020601.png",
];

const categories = [
  "Văn học",
  "Kinh tế",
  "Công nghệ thông tin",
  "Kỹ năng sống",
  "Tâm lý học",
  "Thiếu nhi",
  "Ngoại ngữ",
];

const authors = [
  "Nguyễn Nhật Ánh",
  "Tony Buổi Sáng",
  "Dale Carnegie",
  "James Clear",
  "Robert T. Kiyosaki",
  "Paulo Coelho",
  "Yuval Noah Harari",
  "Nguyễn Phong Việt",
];

const publishers = ["Kim Đồng", "Trẻ", "Lao Động", "Thế Giới", "Tổng Hợp TP.HCM"];

const suppliers = [
  {
    name: "Công ty Sách Việt",
    email: "contact@sachviet.vn",
    phone: "02838223344",
    address: "12 Nguyễn Thị Minh Khai, Quận 1, TP.HCM",
  },
  {
    name: "Nhà phân phối Minh Long",
    email: "kinhdoanh@minhlongbook.vn",
    phone: "02437739988",
    address: "46 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội",
  },
  {
    name: "Công ty Văn hóa Phương Nam",
    email: "cskh@phuongnam.com.vn",
    phone: "02839999999",
    address: "940 đường 3/2, Quận 11, TP.HCM",
  },
  {
    name: "Nhà sách Fahasa",
    email: "ncc@fahasa.com",
    phone: "02838388888",
    address: "60-62 Lê Lợi, Quận 1, TP.HCM",
  },
  {
    name: "Nhà phân phối Alpha Books",
    email: "sales@alphabooks.vn",
    phone: "02437226234",
    address: "176 Thái Hà, Đống Đa, Hà Nội",
  },
];

const books = [
  ["Cho Tôi Xin Một Vé Đi Tuổi Thơ", "Nguyễn Nhật Ánh", "Trẻ", "Văn học", "9786041123456", 82000, 48000, 36],
  ["Mắt Biếc", "Nguyễn Nhật Ánh", "Trẻ", "Văn học", "9786041123457", 95000, 56000, 42],
  ["Nhà Giả Kim", "Paulo Coelho", "Tổng Hợp TP.HCM", "Văn học", "9786041123458", 89000, 52000, 28],
  ["Cà Phê Cùng Tony", "Tony Buổi Sáng", "Trẻ", "Kinh tế", "9786041123459", 110000, 68000, 34],
  ["Trên Đường Băng", "Tony Buổi Sáng", "Trẻ", "Kinh tế", "9786041123460", 105000, 64000, 30],
  ["Dạy Con Làm Giàu", "Robert T. Kiyosaki", "Lao Động", "Kinh tế", "9786041123461", 120000, 76000, 26],
  ["Clean Code", "Robert C. Martin", "Thế Giới", "Công nghệ thông tin", "9780132350884", 250000, 165000, 18],
  ["The Pragmatic Programmer", "Andrew Hunt", "Thế Giới", "Công nghệ thông tin", "9780135957059", 300000, 210000, 14],
  ["Lập Trình Python Cơ Bản", "Nguyễn Phong Việt", "Tổng Hợp TP.HCM", "Công nghệ thông tin", "9786041123462", 145000, 90000, 22],
  ["Đắc Nhân Tâm", "Dale Carnegie", "Tổng Hợp TP.HCM", "Kỹ năng sống", "9786041123463", 118000, 70000, 48],
  ["Atomic Habits", "James Clear", "Thế Giới", "Kỹ năng sống", "9786041123464", 189000, 120000, 32],
  ["Tuổi Trẻ Đáng Giá Bao Nhiêu", "Nguyễn Phong Việt", "Nhã Nam", "Kỹ năng sống", "9786041123465", 96000, 58000, 25],
  ["Tư Duy Nhanh Và Chậm", "Daniel Kahneman", "Thế Giới", "Tâm lý học", "9786041123466", 210000, 138000, 16],
  ["Sức Mạnh Của Thói Quen", "Charles Duhigg", "Lao Động", "Tâm lý học", "9786041123467", 155000, 98000, 20],
  ["Tâm Lý Học Đám Đông", "Gustave Le Bon", "Thế Giới", "Tâm lý học", "9786041123468", 99000, 62000, 18],
  ["Dế Mèn Phiêu Lưu Ký", "Tô Hoài", "Kim Đồng", "Thiếu nhi", "9786041123469", 75000, 42000, 50],
  ["Kính Vạn Hoa", "Nguyễn Nhật Ánh", "Kim Đồng", "Thiếu nhi", "9786041123470", 135000, 85000, 24],
  ["Hoàng Tử Bé", "Antoine de Saint-Exupéry", "Kim Đồng", "Thiếu nhi", "9786041123471", 69000, 39000, 38],
  ["English Grammar In Use", "Raymond Murphy", "Thế Giới", "Ngoại ngữ", "9786041123472", 168000, 110000, 30],
  ["Oxford Word Skills Basic", "Ruth Gairns", "Thế Giới", "Ngoại ngữ", "9786041123473", 175000, 115000, 21],
  ["Hackers IELTS Reading", "Hackers Language Research Institute", "Tổng Hợp TP.HCM", "Ngoại ngữ", "9786041123474", 229000, 150000, 19],
  ["Sapiens: Lược Sử Loài Người", "Yuval Noah Harari", "Thế Giới", "Kinh tế", "9786041123475", 269000, 178000, 12],
  ["Đi Qua Hoa Cúc", "Nguyễn Nhật Ánh", "Trẻ", "Văn học", "9786041123476", 78000, 46000, 27],
  ["Không Gia Đình", "Hector Malot", "Kim Đồng", "Thiếu nhi", "9786041123477", 132000, 82000, 17],
  ["IELTS Cambridge 18", "Cambridge University Press", "Thế Giới", "Ngoại ngữ", "9786041123478", 198000, 130000, 15],
] as const;

async function findOrCreateCategory(name: string) {
  return prisma.category.upsert({
    where: { name },
    update: { image: "/uploads/categories/default-category.jpg" },
    create: { name, image: "/uploads/categories/default-category.jpg" },
  });
}

async function findOrCreateAuthor(name: string) {
  const found = await prisma.author.findFirst({ where: { name } });
  return found ?? prisma.author.create({ data: { name } });
}

async function findOrCreatePublisher(name: string) {
  const found = await prisma.publisher.findFirst({ where: { name } });
  return found ?? prisma.publisher.create({ data: { name } });
}

async function main() {
  console.log("Seeding Vietnamese bookstore data...");

  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    update: { name: "ADMIN" },
    create: { id: 1, name: "ADMIN" },
  });
  const userRole = await prisma.role.upsert({
    where: { id: 2 },
    update: { name: "USER" },
    create: { id: 2, name: "USER" },
  });

  const hashedPassword = await bcrypt.hash("123456", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      email: "admin@gmail.com",
      password: hashedPassword,
      name: "Admin",
      roleId: adminRole.id,
      avatar: "/uploads/avatar/a-2243-183313.jpg",
    },
  });
  await prisma.user.upsert({
    where: { email: "user@gmail.com" },
    update: {},
    create: {
      email: "user@gmail.com",
      password: hashedPassword,
      name: "Nguyen Van A",
      avatar: "/uploads/avatar/image_2024_10_16t02_04_10_067z_aa3729e6c3a64c2893fc99751fe83be6_master.png",
      roleId: userRole.id,
    },
  });

  await prisma.paymentTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  const categoryRecords = Object.fromEntries(
    await Promise.all(categories.map(async (name) => [name, await findOrCreateCategory(name)]))
  );
  const authorRecords = Object.fromEntries(
    await Promise.all([...new Set([...authors, ...books.map((book) => book[1])])].map(async (name) => [name, await findOrCreateAuthor(name)]))
  );
  const publisherRecords = Object.fromEntries(
    await Promise.all([...new Set([...publishers, ...books.map((book) => book[2])])].map(async (name) => [name, await findOrCreatePublisher(name)]))
  );

  for (const supplier of suppliers) {
    const found = await prisma.supplier.findFirst({ where: { name: supplier.name } });
    if (found) {
      await prisma.supplier.update({ where: { id: found.id }, data: { ...supplier, status: "ACTIVE" } });
    } else {
      await prisma.supplier.create({ data: { ...supplier, status: "ACTIVE" } });
    }
  }

  const seededBooks: Array<{ id: number; variantId: number; stock: number; importPrice: number }> = [];

  for (const [index, [title, authorName, publisherName, categoryName, isbn, price, importPrice, stock]] of books.entries()) {
    const existing = await prisma.book.findFirst({ where: { isbn } });
    const data = {
      title,
      authorId: authorRecords[authorName].id,
      publisherId: publisherRecords[publisherName].id,
      publisher: publisherName,
      isbn,
      publishYear: 2020 + (index % 5),
      pageCount: 180 + index * 12,
      language: categoryName === "Ngoại ngữ" ? "English" : "Tiếng Việt",
      size: "14.5 x 20.5 cm",
      format: "Bìa mềm",
      categoryId: categoryRecords[categoryName].id,
      price,
      importPrice,
      stock,
      description: `${title} là đầu sách được chọn lọc cho danh mục ${categoryName}, phù hợp để kinh doanh trong nhà sách trực tuyến.`,
    };

    const book = existing
      ? await prisma.book.update({ where: { id: existing.id }, data })
      : await prisma.book.create({
          data: {
            ...data,
            images: {
              create: [{ url: coverImages[index % coverImages.length], isPrimary: true, sortOrder: 0 }],
            },
          },
        });

    const variantCount = await prisma.bookVariant.count({ where: { bookId: book.id } });
    if (variantCount === 0) {
      await prisma.bookVariant.createMany({
        data: [
          { bookId: book.id, name: "Bản tiêu chuẩn", price, stock, sku: `BOOK-${book.id}-STD` },
          { bookId: book.id, name: "E-book", price: Math.max(Math.round(price * 0.6), 1), stock: 999, sku: `BOOK-${book.id}-EB` },
        ],
      });
    }

    const stockVariant = await prisma.bookVariant.findFirst({
      where: {
        bookId: book.id,
        NOT: [
          { name: { contains: "ebook" } },
          { name: { contains: "E-book" } },
        ],
      },
      orderBy: { id: "asc" },
    }) ?? await prisma.bookVariant.findFirst({
      where: { bookId: book.id },
      orderBy: { id: "asc" },
    });

    if (stockVariant) {
      seededBooks.push({ id: book.id, variantId: stockVariant.id, stock, importPrice });
    }
  }

  const initialReceiptCode = "PNK-SEED-0001";
  const initialReceipt = await prisma.importReceipt.findUnique({ where: { code: initialReceiptCode } });
  if (!initialReceipt) {
    const firstSupplier = await prisma.supplier.findFirst({ orderBy: { id: "asc" } });
    if (firstSupplier) {
      await prisma.importReceipt.create({
        data: {
          code: initialReceiptCode,
          supplierId: firstSupplier.id,
          createdBy: adminUser.id,
          note: "Phiếu nhập khởi tạo dữ liệu seed",
          totalAmount: seededBooks.reduce((sum, book) => sum + book.stock * book.importPrice, 0),
          details: {
            create: seededBooks.map((book) => ({
              productId: book.id,
              variantId: book.variantId,
              quantity: book.stock,
              importPrice: book.importPrice,
              subtotal: book.stock * book.importPrice,
            })),
          },
        },
      });
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
