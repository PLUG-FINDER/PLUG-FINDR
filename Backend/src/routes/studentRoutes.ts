import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import {
  getAllVendors,
  searchVendors,
  getVendorById,
  createReview,
  createProductReview,
  getVendorReviews,
  getProductReviews,
  getMyReviews,
  deleteMyReview,
  createComplaint,
  createGeneralFeedback,
  createVendorFeedback,
  getMyGeneralFeedback,
  getVendorProducts,
  getDashboardData,
  getVendorsByHostel,
  clearRecentSearches
} from "../controllers/studentController";

const router = Router();

// Student-only routes
router.use(protect, requireRole("STUDENT"));

router.get("/dashboard", getDashboardData);
router.delete("/dashboard/recent-searches", clearRecentSearches);
router.get("/vendors", getAllVendors);
router.get("/vendors/hostel", getVendorsByHostel);
router.get("/search", searchVendors);
router.get("/vendor/:id", getVendorById);
router.get("/vendor/:vendorId/products", getVendorProducts);
router.post("/reviews", createReview);
router.post("/reviews/product", createProductReview);
router.get("/reviews/vendor/:vendorId", getVendorReviews);
router.get("/reviews/product/:productId", getProductReviews);
// Keep old route for backward compatibility
router.get("/reviews/:vendorId", getVendorReviews);
router.get("/my-reviews", getMyReviews);
router.delete("/reviews/:reviewId", deleteMyReview);
router.post("/complaints", createComplaint);
router.post("/general-feedback", createGeneralFeedback);
router.get("/general-feedback", getMyGeneralFeedback);
router.post("/vendor-feedback", createVendorFeedback);

export default router;
