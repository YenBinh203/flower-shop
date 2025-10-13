import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import pool from "./src/config/dbConfig.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";

const app = express();

// Test database connection
pool.query('SELECT 1')
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection failed:", err.message));

// ✨ CẬP NHẬT TẠI ĐÂY: Chỉ cho phép URL của Frontend của bạn.
app.use(cors({
    // Thay thế URL này bằng URL thực tế của Frontend Render của bạn (đã cung cấp)
    origin: "https://flower-frontend-1y1e.onrender.com", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Flower Shop API is running" });
});

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
