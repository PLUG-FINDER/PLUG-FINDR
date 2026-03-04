import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import {
  getMyProfile,
  createProfile,
  updateProfile,
  uploadFlyersHandler,
  getFeedbacks,
  resolveFeedback,
  getMyGeneralFeedback,
  deleteFlyer,
  addProduct,
  getMyProducts,
  deleteProduct,
  updateProduct
} from "../controllers/vendorController";
import { createGeneralFeedback } from "../controllers/studentController";
import { uploadFlyers } from "../middleware/uploadMiddleware";

const router = Router();

// All vendor routes require authenticated VENDOR role
router.use(protect, requireRole("VENDOR"));

router.get("/profile", getMyProfile);
router.post("/profile", createProfile);
router.put("/profile", updateProfile);

router.post("/upload-flyers", uploadFlyers.array("flyers"), uploadFlyersHandler);
router.delete("/flyers", deleteFlyer);

// Market Routes
router.post("/products", uploadFlyers.array("image"), addProduct); // Reusing upload middleware
router.get("/products", getMyProducts);
router.put("/products/:id", uploadFlyers.array("image"), updateProduct);
router.delete("/products/:id", deleteProduct);

router.get("/feedbacks", getFeedbacks);
router.put("/feedbacks/:id/resolve", resolveFeedback);
router.post("/general-feedback", createGeneralFeedback);
router.get("/general-feedback", getMyGeneralFeedback);

export default router;

