import { Request, Response } from "express";
import crypto from "crypto";
import admin from "../config/firebaseAdmin";
import { User } from "../models/User";
import { StudentProfile } from "../models/StudentProfile";
import { signToken } from "../utils/jwt";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, whatsappNumber, adminPin, firebaseUID } = req.body as {
      name?: string;
      email: string;
      password: string;
      role: "STUDENT" | "VENDOR" | "ADMIN";
      whatsappNumber?: string;
      adminPin?: string;
      firebaseUID?: string;
    };

    if (!email || !password || !role) {
      res.status(400).json({ message: "Name, email, password and role are required" });
      return;
    }

    // Verify Admin PIN if role is ADMIN
    if (role === "ADMIN") {
      const ADMIN_SECRET = process.env.ADMIN_SECRET;
      
      if (!ADMIN_SECRET) {
        console.error("ADMIN_SECRET environment variable is not set");
        res.status(500).json({ message: "Server configuration error" });
        return;
      }

      if (!adminPin) {
        res.status(403).json({ message: "Admin Secret PIN is required for admin registration" });
        return;
      }

      if (adminPin !== ADMIN_SECRET) {
        res.status(403).json({ message: "Invalid Admin Secret PIN. Access denied." });
        return;
      }
    }

    if (role === "STUDENT" && !whatsappNumber) {
        res.status(400).json({ message: "WhatsApp number is required for students" });
        return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    // Use Firebase UID from frontend if provided, otherwise try to create in Firebase
    let finalFirebaseUID: string | undefined = firebaseUID;
    
    if (!finalFirebaseUID && admin.apps.length > 0) {
      try {
        const firebaseUser = await admin.auth().createUser({
          email,
          password,
          emailVerified: false, // Email verification required
          disabled: false,
        });
        finalFirebaseUID = firebaseUser.uid;
      } catch (firebaseError: any) {
        console.warn("Firebase user creation failed, continuing with MongoDB only:", firebaseError.message);
      }
    }

    const user = await User.create({
      name: name || email.split("@")[0],
      email,
      password,
      role,
      whatsappNumber,
      emailVerified: false, // Email verification required
      firebaseUID: finalFirebaseUID
    });

    // Optionally create related profile for students
    if (role === "STUDENT") {
      await StudentProfile.create({ user: user._id });
    }

    // DO NOT issue JWT token until email is verified
    res.status(201).json({
      message: "Registration successful. Please verify your email before logging in.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      },
      // Include verification link in development
      ...(process.env.NODE_ENV !== "production" && finalFirebaseUID && {
        verificationLink: `Check console for verification link`
      })
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Origin:', req.headers.origin || 'no origin');
    console.log('IP:', req.ip || req.socket.remoteAddress);
    console.log('Email:', req.body?.email);
    console.log('Has password:', !!req.body?.password);
    
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      console.log('❌ Missing email or password');
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (!user.password) {
      console.log('❌ User has no password set:', email);
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    
    console.log('✅ Password match for:', email);

    // Check email verification status
    let emailVerified = user.emailVerified;

    // If Firebase is configured, check Firebase email verification status
    if (user.firebaseUID && admin.apps.length > 0) {
      try {
        const firebaseUser = await admin.auth().getUser(user.firebaseUID);
        emailVerified = firebaseUser.emailVerified;
        
        // Sync Firebase verification status to MongoDB
        if (firebaseUser.emailVerified && !user.emailVerified) {
          user.emailVerified = true;
          await user.save();
        }
      } catch (firebaseError) {
        console.error("Error checking Firebase verification:", firebaseError);
        // Continue with MongoDB verification status
      }
    }

    // Require email verification for ALL roles (ADMIN, VENDOR, STUDENT)
    if (!emailVerified) {
      console.log('❌ Email not verified for:', email);
      res.status(403).json({ 
        message: "Email not verified. Please verify your email before logging in.",
        emailVerified: false
      });
      return;
    }

    const token = signToken({ id: user._id.toString(), role: user.role });
    console.log('✅ Login successful for:', email, 'Role:', user.role);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: true
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // `protect` middleware already ensured user exists, so we just re-fetch to return safe fields
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { name } = req.body as { name?: string };

    if (!name || name.trim().length === 0) {
      res.status(400).json({ message: "Name is required" });
      return;
    }

    if (name.trim().length < 2) {
      res.status(400).json({ message: "Name must be at least 2 characters" });
      return;
    }

    if (name.trim().length > 50) {
      res.status(400).json({ message: "Name must not exceed 50 characters" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email: string };

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    
    // For security, don't reveal if email exists or not
    if (!user) {
      res.status(200).json({ 
        message: "If that email exists, a password reset link has been sent." 
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save({ validateBeforeSave: false });

    // In a real app, you would send an email here
    // For now, we'll return the reset token in development
    // In production, you should send an email with the reset link
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;
    
    console.log("Password reset URL:", resetUrl);
    // TODO: Send email with resetUrl to user.email

    res.status(200).json({ 
      message: "If that email exists, a password reset link has been sent.",
      // Only include in development
      ...(process.env.NODE_ENV !== "production" && { resetToken, resetUrl })
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body as { token: string; password: string };

    if (!token || !password) {
      res.status(400).json({ message: "Token and password are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired reset token" });
      return;
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ 
      message: "Password has been reset successfully" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const syncEmailVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email: string };

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // If user has Firebase UID, check Firebase verification status and sync
    if (user.firebaseUID && admin.apps.length > 0) {
      try {
        const firebaseUser = await admin.auth().getUser(user.firebaseUID);
        
        // Sync Firebase verification status to MongoDB
        if (firebaseUser.emailVerified && !user.emailVerified) {
          user.emailVerified = true;
          await user.save();
          res.status(200).json({ 
            message: "Email verification status synced successfully",
            emailVerified: true
          });
          return;
        } else if (firebaseUser.emailVerified && user.emailVerified) {
          res.status(200).json({ 
            message: "Email is already verified",
            emailVerified: true
          });
          return;
        } else {
          res.status(200).json({ 
            message: "Email is not verified in Firebase",
            emailVerified: false
          });
          return;
        }
      } catch (firebaseError: any) {
        console.error("Error checking Firebase verification:", firebaseError);
        res.status(500).json({ message: "Failed to check Firebase verification status" });
        return;
      }
    } else {
      // No Firebase UID or Firebase not configured
      res.status(200).json({ 
        message: "User does not have Firebase account or Firebase is not configured",
        emailVerified: user.emailVerified
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email: string };

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if email exists
      res.status(200).json({ 
        message: "If that email exists and is not verified, a verification email has been sent." 
      });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ message: "Email is already verified" });
      return;
    }

    if (admin.apps.length === 0) {
      res.status(500).json({ message: "Firebase Admin SDK not configured" });
      return;
    }

    try {
      if (user.firebaseUID) {
        const actionCodeSettings = {
          url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email`,
          handleCodeInApp: false,
        };
        const link = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
        // In production, send this link via email service
        console.log("Email verification link:", link);
        
        res.status(200).json({ 
          message: "If that email exists and is not verified, a verification email has been sent.",
          // Include link in development
          ...(process.env.NODE_ENV !== "production" && { verificationLink: link })
        });
      } else {
        res.status(400).json({ message: "User not found in Firebase. Please register again." });
      }
    } catch (error: any) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkEmailVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    let emailVerified = user.emailVerified;

    // Check Firebase verification status if available
    if (user.firebaseUID && admin.apps.length > 0) {
      try {
        const firebaseUser = await admin.auth().getUser(user.firebaseUID);
        emailVerified = firebaseUser.emailVerified;
        
        // Sync status to MongoDB
        if (firebaseUser.emailVerified !== user.emailVerified) {
          user.emailVerified = firebaseUser.emailVerified;
          await user.save();
        }
      } catch (error) {
        console.error("Error checking Firebase verification:", error);
      }
    }

    res.json({ emailVerified });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



