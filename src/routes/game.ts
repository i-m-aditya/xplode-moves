import { Router } from "express";
import { BlockchainService } from "../services/blockchain";
// import { logger } from "../utils/logger";

const router = Router();
const blockchainService = new BlockchainService();

router.post("/initialize", async (req, res) => {
  try {
    const tx = await blockchainService.initializeGame(req.body);
    res.json({ success: true, transaction: tx });
  } catch (error: any) {
    console.error("Error in initialize endpoint:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/move", async (req, res) => {
  try {
    const tx = await blockchainService.recordMove(req.body);
    res.json({ success: true, transaction: tx });
  } catch (error: any) {
    console.error("Error in move endpoint:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/commit", async (req, res) => {
  console.log("Commit request:", req.body);
  try {
    const { gameId } = req.body;
    const tx = await blockchainService.commitAndUndelegate(gameId);
    res.json({ success: true, transaction: tx });
  } catch (error: any) {
    console.error("Error in commit endpoint:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
