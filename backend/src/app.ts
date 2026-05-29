import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bookRoutes from "./routes/book.routes";
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/order.routes";
import adminRoutes from "./routes/admin.order.routes";
import userRoutes from "./routes/user.routes";
import categoryRoutes from "./routes/category.routers";
import addressRoutes from "./routes/address.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import authorRoutes from "./routes/author.routes";
import publisherRoutes from "./routes/publisher.routes";
import contactRoutes from "./routes/contact.routes";
import reviewRoutes from "./routes/review.routes";
import sepayRoutes from "./routes/sepay.routes";
import paymentRoutes from "./routes/payment.routes";
import geminiRoutes from "./routes/gemini.routes";
import passport from "./lib/passport";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use("/uploads", express.static("uploads"));
app.use(paymentRoutes);

app.get("/", (req, res) => {
  res.send("Backend running ");
});

app.use("/auth", authRoutes);
app.use("/books", bookRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/authors", authorRoutes);
app.use("/publishers", publisherRoutes);
app.use("/contacts", contactRoutes);
app.use("/reviews", reviewRoutes);
app.use("/sepay-webhook", sepayRoutes);
app.use("/api/sepay-webhook", sepayRoutes);
app.use("/api/address", addressRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/gemini", geminiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Link vao web: http://localhost:${PORT}`);
});
