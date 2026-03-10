import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { chatWithAI } from "../controllers/aiController";

const router = Router();

// All AI routes require authentication but are role-agnostic
router.use(protect);

router.post("/chat", chatWithAI);

export default router;

