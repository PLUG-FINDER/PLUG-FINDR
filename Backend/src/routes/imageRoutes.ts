import { Router } from "express";
import { getImage } from "../controllers/imageController";

const router = Router();

// Serve images from GridFS
router.get("/:fileId", getImage);

export default router;




