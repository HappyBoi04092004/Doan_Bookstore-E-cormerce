import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bookRoutes from "./routes/book.routes";
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/order.routes";
import adminRoutes from "./routes/admin.order.routes";
import userRoutes from "./routes/user.routes";
import categoryRoutes from "./routes/category.routers";
import addressRoutes from "./routes/address.routes";
import wishlistRoutes from "./routes/wishlist.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Backend running ");
});

app.use("/auth", authRoutes);
app.use("/books", bookRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/api/address", addressRoutes);
app.use("/wishlist", wishlistRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Link vao web: http://localhost:${PORT}`);
});