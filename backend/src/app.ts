import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bookRoutes from "./routes/book.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running ");
});

app.use("/auth", authRoutes);
app.use("/books", bookRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Link vao web: http://localhost:${PORT}`);
});