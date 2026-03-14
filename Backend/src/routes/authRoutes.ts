import { Router } from "express";
import { register, login, getMe, updateProfile, forgotPassword, resetPassword, syncEmailVerification, resendVerificationEmail, checkEmailVerification, googleAuth, googleRegister } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/google-register", googleRegister);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/sync-verification", syncEmailVerification);
router.post("/resend-verification", resendVerificationEmail);
router.get("/check-verification", protect, checkEmailVerification);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

export default router;



