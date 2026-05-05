import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: "ok" },
    message: "Backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
