import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with books and variants...");

  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "ADMIN" },
  });

  const userRole = await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: "USER" },
  });

  const hashedPassword = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
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

  const user = await prisma.user.upsert({
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

  const programming = await prisma.category.upsert({
    where: { name: "Programming" },
    update: {},
    create: { name: "Programming", image: "/uploads/categories/default-category.jpg" },
  });

  await prisma.category.upsert({
    where: { name: "Business" },
    update: {},
    create: { name: "Business", image: "/uploads/categories/default-category.jpg" },
  });

  const martin = await prisma.author.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Robert C. Martin" },
  });

  const hunt = await prisma.author.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: "Andrew Hunt" },
  });

  await prisma.author.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: "Eric Ries" },
  });

  const pearson = await prisma.publisher.upsert({
    where: { id: 1 },
    update: { name: "Pearson" },
    create: { id: 1, name: "Pearson" },
  });

  const addisonWesley = await prisma.publisher.upsert({
    where: { id: 2 },
    update: { name: "Addison-Wesley" },
    create: { id: 2, name: "Addison-Wesley" },
  });

  const coverImg = "/uploads/books/image_2024_10_16t02_04_10_067z_aa3729e6c3a64c2893fc99751fe83be6_master.png";
  const sideImg = "/uploads/books/a-2243-183313.jpg";

  const cleanCode = await prisma.book.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: "Clean Code",
      authorId: martin.id,
      publisherId: pearson.id,
      publisher: pearson.name,
      isbn: "978-0-13-235088-4",
      publishYear: 2008,
      pageCount: 464,
      language: "English",
      size: "17.8 x 23.5 cm",
      format: "Paperback",
      categoryId: programming.id,
      price: 25000,
      stock: 100,
      description: "A handbook of agile software craftsmanship.",
      images: {
        create: [{ url: coverImg, isPrimary: true, sortOrder: 0 }],
      },
      variants: {
        create: [
          { name: "Bản thường (Bìa mềm)", price: 25000, stock: 80, sku: "CC-PB" },
          { name: "Bản đặc biệt (Bìa cứng)", price: 45000, stock: 20, sku: "CC-HC" },
        ],
      },
    },
    include: { variants: true },
  });

  const pragmatic = await prisma.book.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      title: "The Pragmatic Programmer",
      authorId: hunt.id,
      publisherId: addisonWesley.id,
      publisher: addisonWesley.name,
      isbn: "978-0-13-595705-9",
      publishYear: 2019,
      pageCount: 352,
      language: "English",
      size: "17.8 x 23.5 cm",
      format: "Paperback",
      categoryId: programming.id,
      price: 30000,
      stock: 80,
      description: "Your journey to mastery.",
      images: {
        create: [{ url: sideImg, isPrimary: true, sortOrder: 0 }],
      },
      variants: {
        create: [
          { name: "Tiêu chuẩn", price: 30000, stock: 80, sku: "PP-STD" },
          { name: "E-book", price: 15000, stock: 999, sku: "PP-EB" },
        ],
      },
    },
    include: { variants: true },
  });

  const ccVariant = cleanCode.variants[0];
  const ppVariant = pragmatic.variants[0];

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: ccVariant.id } },
    update: { qty: 1 },
    create: { cartId: cart.id, variantId: ccVariant.id, qty: 1 },
  });

  await prisma.order.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      userId: user.id,
      status: "PAID",
      total: 25000,
      items: {
        create: [{ variantId: ccVariant.id, qty: 1, price: 25000 }],
      },
    },
  });

  await prisma.wishlist.upsert({
    where: { userId_variantId: { userId: user.id, variantId: ppVariant.id } },
    update: {},
    create: { userId: user.id, variantId: ppVariant.id },
  });

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
