import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import gameRoutes from "./routes/game";
// import { logger } from "./utils/logger";

dotenv.config();

const app = express();
const port = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Routes
app.use("/api/game", gameRoutes);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
);

app.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
