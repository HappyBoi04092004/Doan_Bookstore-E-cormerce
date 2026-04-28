import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with Variants...");

  // ===== ROLE =====
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

  console.log("✅ Roles created");

  // ===== USERS =====
  const hashedPassword = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
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

  console.log("✅ Users created");

  // ===== CATEGORY =====
  const programming = await prisma.category.upsert({
    where: { name: "Programming" },
    update: {},
    create: { name: "Programming", image: "/uploads/categories/default-category.jpg" },
  });

  const business = await prisma.category.upsert({
    where: { name: "Business" },
    update: {},
    create: { name: "Business", image: "/uploads/categories/default-category.jpg" },
  });

  console.log("✅ Categories created");

  // ===== AUTHOR =====
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

  const ries = await prisma.author.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: "Eric Ries" },
  });

  console.log("✅ Authors created");

  // ===== ATTRIBUTE DEFINITIONS =====
  const attrLanguage = await prisma.attribute.upsert({
    where: { name: "Ngôn ngữ" },
    update: {},
    create: { name: "Ngôn ngữ" },
  });

  const attrPublisher = await prisma.attribute.upsert({
    where: { name: "Nhà xuất bản" },
    update: {},
    create: { name: "Nhà xuất bản" },
  });

  const attrPages = await prisma.attribute.upsert({
    where: { name: "Số trang" },
    update: {},
    create: { name: "Số trang", unit: "trang" },
  });

  const attrISBN = await prisma.attribute.upsert({
    where: { name: "ISBN" },
    update: {},
    create: { name: "ISBN" },
  });

  console.log("✅ Attributes defined");

  // ===== BOOKS & VARIANTS =====
  const coverImg = "/uploads/books/image_2024_10_16t02_04_10_067z_aa3729e6c3a64c2893fc99751fe83be6_master.png";
  const sideImg  = "/uploads/books/a-2243-183313.jpg";

  // Book 1: Clean Code
  const cleanCode = await prisma.book.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: "Clean Code",
      authorId: martin.id,
      categoryId: programming.id,
      price: 25000,
      stock: 100,
      description: "A handbook of agile software craftsmanship.",
      images: {
        create: [
          { url: coverImg, isPrimary: true, sortOrder: 0 },
        ],
      },
      attributes: {
        create: [
          { attributeId: attrLanguage.id, value: "English" },
          { attributeId: attrPages.id, value: "464" },
          { attributeId: attrISBN.id, value: "978-0-13-235088-4" },
        ],
      },
      variants: {
        create: [
          { name: "Bản thường (Bìa mềm)", price: 25000, stock: 80, sku: "CC-PB" },
          { name: "Bản đặc biệt (Bìa cứng)", price: 45000, stock: 20, sku: "CC-HC" },
        ]
      }
    },
    include: { variants: true }
  });

  // Book 2: The Pragmatic Programmer
  const pragmatic = await prisma.book.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      title: "The Pragmatic Programmer",
      authorId: hunt.id,
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
        ]
      }
    },
    include: { variants: true }
  });

  console.log("✅ Books & Variants created");

  // Get some variant IDs for relations
  const ccVariant = cleanCode.variants[0];
  const ppVariant = pragmatic.variants[0];

  // ===== CART =====
  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  await prisma.cartItem.create({
    data: { cartId: cart.id, variantId: ccVariant.id, qty: 1 },
  });

  console.log("✅ Cart created");

  // ===== ORDER =====
  const order = await prisma.order.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      userId: user.id,
      status: "PAID",
      total: 25000,
      items: {
        create: [
          { variantId: ccVariant.id, qty: 1, price: 25000 }
        ]
      }
    },
  });

  console.log("✅ Order created");

  // ===== WISHLIST =====
  await prisma.wishlist.create({
    data: { userId: user.id, variantId: ppVariant.id },
  });

  console.log("✅ Wishlist created");
  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });