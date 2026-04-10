import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {

  console.log(" Seeding database...");

  // ===== ROLE =====
  const adminRole = await prisma.role.create({
    data: { name: "ADMIN" }
  });

  const userRole = await prisma.role.create({
    data: { name: "USER" }
  });

  console.log("Roles created");


  // ===== USERS =====
  const hassPassword = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      password: hassPassword,
      name: "Admin",
      roleId: adminRole.id,
      avatar: "/uploads/avatar/a-2243-183313.jpg"
    }
  });

  const user = await prisma.user.create({
    data: {
      email: "user@gmail.com",
      password: hassPassword,
      name: "Nguyen Van A",
      avatar: "/uploads/avatar/image_2024_10_16t02_04_10_067z_aa3729e6c3a64c2893fc99751fe83be6_master.png",
      roleId: userRole.id
    }
  });

  console.log("Users created");


  // ===== CATEGORY =====
  const programming = await prisma.category.create({
    data: {
      name: "Programming",
      image: "/uploads/categories/default-category.jpg"
    }
  });

  const business = await prisma.category.create({
    data: {
      name: "Business",
      image: "/uploads/categories/default-category.jpg"
    }
  });

  const novel = await prisma.category.create({
    data: {
      name: "Novel",
      image: "/uploads/categories/default-category.jpg"
    }
  });

  console.log("Categories created");


  // ===== AUTHOR =====
  const martin = await prisma.author.create({
    data: { name: "Robert C. Martin" }
  });

  const hunt = await prisma.author.create({
    data: { name: "Andrew Hunt" }
  });

  const ries = await prisma.author.create({
    data: { name: "Eric Ries" }
  });

  console.log("Authors created");


  // ===== BOOK =====
  const cleanCode = await prisma.book.create({
    data: {
      id: 1, 
      title: "Clean Code",
      price: 25000,
      stock: 100,
      authorId: martin.id,
      categoryId: programming.id,
      image: "/uploads/books/image_2024_10_16t02_04_10_067z_aa3729e6c3a64c2893fc99751fe83be6_master.png"
    }
  });

  const pragmatic = await prisma.book.create({
    data: {
      id: 2,
      title: "The Pragmatic Programmer",
      price: 30000,
      stock: 80,
      authorId: hunt.id,
      categoryId: programming.id,
      image: "/uploads/books/a-2243-183313.jpg"
    }
  });

  const leanStartup = await prisma.book.create({
    data: {
      id: 3,
      title: "The Lean Startup",
      price: 28000,
      stock: 60,
      authorId: ries.id,
      categoryId: business.id,
      image: "/uploads/books/OIP.jfif"
    }
  });

  console.log("Books created");
  // ===== BOOK (ADD MORE) =====

const deepWork = await prisma.book.create({
  data: {
    id: 4, 
    title: "Deep Work",
    price: 22000,
    stock: 70,
    authorId: ries.id, 
    categoryId: business.id,
    image: "/uploads/books/default-book.jpg"
  }
});

const refactoring = await prisma.book.create({
  data: {
    id:5,
    title: "Refactoring",
    price: 35000,
    stock: 50,
    authorId: martin.id,
    categoryId: programming.id,
    image: "/uploads/books/default-book.jpg"
  }
});

const atomicHabits = await prisma.book.create({
  data: {
    id: 6,
    title: "Atomic Habits",
    price: 27000,
    stock: 90,
    authorId: hunt.id, 
    categoryId: business.id,
    image: "/uploads/books/default-book.jpg"
  }
});

console.log("More books added");


  // ===== CART =====
  const cart = await prisma.cart.create({
    data: {
      userId: user.id
    }
  });

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      bookId: cleanCode.id,
      qty: 2
    }
  });

  console.log("Cart created");


  // ===== ORDER =====
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "PAID",
      total: 50000
    }
  });

  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      bookId: cleanCode.id,
      qty: 2,
      price: 25000
    }
  });

  console.log("Order created");


  // ===== PAYMENT =====
  await prisma.payment.create({
    data: {
      orderId: order.id,
      method: "VNPAY",
      status: "SUCCESS"
    }
  });

  console.log("Payment created");


  // ===== REVIEW =====
  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Very good book!",
      userId: user.id,
      bookId: cleanCode.id
    }
  });

  console.log("Review created");


  // ===== ADDRESS =====
  // NOTE: Requires seedAddress.ts to have run first so Province/District/Ward rows exist.
  // Using: Phường Tràng Tiền (55), Quận Hoàn Kiếm (2), Hà Nội (1)
  await prisma.address.create({
    data: {
      userId:       user.id,
      name:         "Nguyen Van A",
      phone:        "0912345678",
      provinceCode: 1,   // Thành phố Hà Nội
      districtCode: 2,   // Quận Hoàn Kiếm
      wardCode:     55,  // Phường Tràng Tiền
      detail:       "Số 1 Tràng Tiền",
    }
  });

  console.log("Address created");


  // ===== COUPON =====
  await prisma.coupon.create({
    data: {
      code: "SALE10",
      discount: 10
    }
  });

  console.log("Coupon created");


  // ===== WISHLIST =====
  await prisma.wishlist.create({
    data: {
      userId: user.id,
      bookId: pragmatic.id
    }
  });

  console.log("Wishlist created");

  console.log(" Seeding completed!");

}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });