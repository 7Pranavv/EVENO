import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import eventRoutes from "./routes/eventRoutes";
import registrationRoutes from "./routes/registrationRoutes";
import vendorRoutes from "./routes/vendorRoutes";
import paymentRoutes from "./routes/paymentRoutes"; // ← ADD KARO
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "Emple Events API is running ✅" });
});

app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/payments", paymentRoutes); // ← ADD KARO
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;