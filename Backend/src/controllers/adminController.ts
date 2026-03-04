import { Request, Response } from "express";
import { VendorProfile } from "../models/VendorProfile";
import { Complaint } from "../models/Complaint";
import { Review } from "../models/Review";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { StudentProfile } from "../models/StudentProfile";
import { Feedback } from "../models/Feedback";

export const getPendingVendors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const vendors = await VendorProfile.find({ approved: false, rejectedReason: { $exists: false } });
    res.json(vendors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllVendors = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Only return approved vendors
    const vendors = await VendorProfile.find({ approved: true });
    res.json(vendors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRejectedVendors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const vendors = await VendorProfile.find({ 
      approved: false, 
      rejectedReason: { $exists: true, $ne: null } 
    }).sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const approveVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vendor = await VendorProfile.findByIdAndUpdate(
      id,
      { approved: true, rejectedReason: undefined },
      { new: true }
    );

    if (!vendor) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    res.json(vendor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body as { reason?: string };

    const vendor = await VendorProfile.findByIdAndUpdate(
      id,
      { approved: false, rejectedReason: reason || "Rejected by admin" },
      { new: true }
    );

    if (!vendor) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    res.json(vendor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getComplaints = async (_req: Request, res: Response): Promise<void> => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resolveComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { 
        status: "FORWARDED",
        resolved: false // It's not resolved yet, just forwarded
      },
      { new: true }
    );

    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    // In a real application, you would send an email or notification here
    // For now, we'll just log it
    // console.log(`Complaint ${id} forwarded to vendor.`);

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Complaint.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleVendorVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vendor = await VendorProfile.findById(id);

    if (!vendor) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    vendor.isMetaVerified = !vendor.isMetaVerified;
    await vendor.save();

    res.json(vendor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleVendorFreeze = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vendor = await VendorProfile.findById(id);

    if (!vendor) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    vendor.isFrozen = !vendor.isFrozen;
    await vendor.save();

    res.json({ 
      ...vendor.toObject(),
      message: vendor.isFrozen ? "Vendor frozen successfully" : "Vendor unfrozen successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const vendor = await VendorProfile.findById(id);
    if (!vendor) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    // Delete related data
    await Product.deleteMany({ vendor: vendor._id });
    await Review.deleteMany({ vendor: vendor._id });
    await Complaint.deleteMany({ targetVendor: vendor._id });
    await Feedback.deleteMany({ vendorId: vendor._id });

    // Delete the vendor profile
    await VendorProfile.findByIdAndDelete(id);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllStudents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const students = await User.find({ role: 'STUDENT' }).select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleStudentFreeze = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const student = await User.findById(id);

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    if (student.role !== 'STUDENT') {
      res.status(400).json({ message: "User is not a student" });
      return;
    }

    student.isActive = !student.isActive;
    await student.save();

    res.json({ 
      ...student.toObject(),
      password: undefined,
      message: student.isActive ? "Student unfrozen successfully" : "Student frozen successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const student = await User.findById(id);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    if (student.role !== 'STUDENT') {
      res.status(400).json({ message: "User is not a student" });
      return;
    }

    // Delete related data
    await Review.deleteMany({ student: student._id });
    await Complaint.deleteMany({ reporter: student._id });
    await Feedback.deleteMany({ createdBy: student._id });
    await StudentProfile.deleteMany({ user: student._id });

    // Delete the student user
    await User.findByIdAndDelete(id);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [pendingVendors, totalVendors, totalFeedbacks, totalStudents, recentVendors, recentFeedbacks] = await Promise.all([
      VendorProfile.countDocuments({ approved: false, rejectedReason: { $exists: false } }),
      VendorProfile.countDocuments(),
      Feedback.countDocuments({ vendorId: { $exists: false } }), // Only general feedback (no vendorId)
      User.countDocuments({ role: 'STUDENT' }),
      VendorProfile.find().sort({ createdAt: -1 }).limit(5).select('businessName approved rejectedReason createdAt'),
      Feedback.find({ vendorId: { $exists: false } }).sort({ createdAt: -1 }).limit(5).select('category message status createdAt')
    ]);

    res.json({
      pendingVendors,
      totalVendors,
      totalFeedbacks,
      totalStudents,
      recentVendors,
      recentFeedbacks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFeedbacks = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Get only general feedback (no vendorId) - these go to admin
    const feedbacks = await Feedback.find({ vendorId: { $exists: false } })
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const replyToFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reply } = req.body as { reply: string };

    if (!reply || !reply.trim()) {
      res.status(400).json({ message: "Reply is required" });
      return;
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { 
        adminReply: reply.trim(),
        repliedAt: new Date()
      },
      { new: true }
    ).populate('createdBy', 'name email role');

    if (!feedback) {
      res.status(404).json({ message: "Feedback not found" });
      return;
    }

    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateFeedbackStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: "PENDING" | "IN_PROGRESS" | "RESOLVED" };

    if (!status) {
      res.status(400).json({ message: "Status is required" });
      return;
    }

    const validStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('createdBy', 'name email role');

    if (!feedback) {
      res.status(404).json({ message: "Feedback not found" });
      return;
    }

    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      res.status(404).json({ message: "Feedback not found" });
      return;
    }

    await Feedback.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

