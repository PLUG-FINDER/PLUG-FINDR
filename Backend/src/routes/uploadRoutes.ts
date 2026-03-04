import { Router } from "express";
import { uploadFlyers } from "../middleware/uploadMiddleware";
import { uploadImages } from "../controllers/uploadController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Generic image upload endpoint (any authenticated user)
router.post("/flyers", protect, uploadFlyers.array("files"), uploadImages);

export default router;



