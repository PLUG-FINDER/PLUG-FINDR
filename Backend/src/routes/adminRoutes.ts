import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import {
  getPendingVendors,
  getAllVendors,
  getRejectedVendors,
  approveVendor,
  rejectVendor,
  getComplaints,
  resolveComplaint,
  deleteReview,
  toggleVendorVerification,
  toggleVendorFreeze,
  deleteComplaint,
  deleteVendor,
  getAllStudents,
  toggleStudentFreeze,
  deleteStudent,
  getDashboardStats,
  getFeedbacks,
  replyToFeedback,
  updateFeedbackStatus,
  deleteFeedback
} from "../controllers/adminController";

const router = Router();

// All admin routes require ADMIN role
router.use(protect, requireRole("ADMIN"));

router.get("/dashboard/stats", getDashboardStats);
router.get("/vendors/pending", getPendingVendors);
router.get("/vendors/rejected", getRejectedVendors);
router.get("/vendors", getAllVendors);
router.put("/vendors/:id/approve", approveVendor);
router.put("/vendors/:id/reject", rejectVendor);
router.delete("/vendors/:id", deleteVendor);

router.get("/students", getAllStudents);
router.put("/students/:id/freeze", toggleStudentFreeze);
router.delete("/students/:id", deleteStudent);

router.get("/complaints", getComplaints);
router.put("/complaints/:id/resolve", resolveComplaint);
router.delete("/complaints/:id", deleteComplaint);

router.delete("/reviews/:id", deleteReview);
router.put("/vendors/:id/verify", toggleVendorVerification);
router.put("/vendors/:id/freeze", toggleVendorFreeze);

router.get("/feedbacks", getFeedbacks);
router.put("/feedbacks/:id/reply", replyToFeedback);
router.put("/feedbacks/:id/status", updateFeedbackStatus);
router.delete("/feedbacks/:id", deleteFeedback);

export default router;

