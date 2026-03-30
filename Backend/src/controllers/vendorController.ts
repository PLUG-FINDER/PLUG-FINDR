import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Product } from "../models/Product";
import { VendorProfile } from "../models/VendorProfile";
import { VendorView } from "../models/VendorView";
import { Review } from "../models/Review";
import { Complaint } from "../models/Complaint";
import { Feedback } from "../models/Feedback";
import { User } from "../models/User";
import { uploadToGridFS, deleteFromGridFS } from "../utils/gridfs";

const PHONE_LENGTH = 10;

const isDigitChar = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return code >= 48 && code <= 57;
};

const isValidTenDigitPhone = (value: string): boolean => {
  if (value.length !== PHONE_LENGTH) {
    return false;
  }

  for (let i = 0; i < value.length; i += 1) {
    if (!isDigitChar(value[i])) {
      return false;
    }
  }

  return true;
};

export const addProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { name, price, currency, description } = req.body;
    const files = (req as any).files as Express.Multer.File[] | undefined;

    if (!name) {
      res.status(400).json({ message: "Product name is required" });
      return;
    }

    if (!files || files.length === 0) {
      res.status(400).json({ message: "Product image is required" });
      return;
    }

    const profile = await VendorProfile.findOne({ user: req.user.id });
    if (!profile) {
      res.status(404).json({ message: "Vendor profile not found" });
      return;
    }

    // Upload product image to GridFS
    if (!files[0].buffer) {
      res.status(400).json({ message: "File buffer is missing" });
      return;
    }
    const imageFileId = await uploadToGridFS(
      files[0].buffer,
      files[0].originalname,
      files[0].mimetype
    );
    const imageUrl = `/api/images/${imageFileId}`;

    const product = await Product.create({
      vendor: profile._id,
      name,
      price: price ? Number(price) : undefined,
      currency: currency || "₦",
      description,
      image: imageUrl
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const { name, price, currency, description } = req.body;
    const files = (req as any).files as Express.Multer.File[] | undefined;

    const profile = await VendorProfile.findOne({ user: req.user.id });
    if (!profile) {
      res.status(404).json({ message: "Vendor profile not found" });
      return;
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (price !== undefined) updates.price = price ? Number(price) : undefined;
    if (currency) updates.currency = currency;
    if (description !== undefined) updates.description = description;
    
    if (files && files.length > 0) {
      if (!files[0].buffer) {
        res.status(400).json({ message: "File buffer is missing" });
        return;
      }
      const imageFileId = await uploadToGridFS(
        files[0].buffer,
        files[0].originalname,
        files[0].mimetype
      );
      updates.image = `/api/images/${imageFileId}`;
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, vendor: profile._id },
      { $set: updates },
      { new: true }
    );

    if (!product) {
      res.status(404).json({ message: "Product not found or not yours" });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const profile = await VendorProfile.findOne({ user: req.user.id });
    if (!profile) {
      res.status(404).json({ message: "Vendor profile not found" });
      return;
    }

    const products = await Product.find({ vendor: profile._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const profile = await VendorProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      res.status(404).json({ message: "Vendor profile not found" });
      return;
    }

    const product = await Product.findOneAndDelete({ _id: id, vendor: profile._id });

    if (!product) {
      res.status(404).json({ message: "Product not found or not yours" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const mapVendorProfile = async (profile: any) => {
  const vendorId = profile._id;
  const stats = await Review.aggregate([
    { 
      $match: { 
        vendor: vendorId,
        isHidden: { $ne: true } // Exclude hidden reviews
      } 
    },
    {
      $group: {
        _id: "$vendor",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const stat = stats[0];

  // Calculate unique view count from VendorView records
  const viewCount = await VendorView.countDocuments({ vendor: vendorId });

  const status: "PENDING" | "APPROVED" | "REJECTED" = profile.approved
    ? "APPROVED"
    : profile.rejectedReason
    ? "REJECTED"
    : "PENDING";

  return {
    _id: profile._id,
    userId: profile.user,
    businessName: profile.businessName,
    description: profile.description,
    category: profile.category,
    location: profile.location,
    hostelName: profile.hostelName,
    contactEmail: profile.contactEmail,
    contactPhone: profile.contactPhone,
    whatsapp: profile.whatsapp,
    instagram: profile.instagram,
    snapchat: profile.snapchat,
    tiktok: profile.tiktok,
    facebook: profile.facebook,
    twitter: profile.twitter,
    flyerImages: profile.flyers || [],
    rating: stat?.avgRating ? Math.round(stat.avgRating * 10) / 10 : 0, // Round to 1 decimal place
    reviewCount: stat?.reviewCount || 0,
    viewCount,
    status,
    isMetaVerified: profile.isMetaVerified,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
};

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const profile = await VendorProfile.findOne({ user: req.user.id });
    if (!profile) {
      res.status(404).json({ message: "Vendor profile not found" });
      return;
    }

    const mapped = await mapVendorProfile(profile);
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const existing = await VendorProfile.findOne({ user: req.user.id });
    if (existing) {
      res.status(400).json({ message: "Vendor profile already exists" });
      return;
    }

    const { businessName, description, category, location, hostelName, contactEmail, contactPhone, whatsapp, instagram, snapchat, tiktok, facebook, twitter } = req
      .body as {
      businessName: string;
      description?: string;
      category?: string;
      location?: string;
      hostelName?: string;
      contactEmail?: string;
      contactPhone?: string;
      whatsapp?: string;
      instagram?: string;
      snapchat?: string;
      tiktok?: string;
      facebook?: string;
      twitter?: string;
    };

    if (!businessName) {
      res.status(400).json({ message: "Business name is required" });
      return;
    }

    if (!description || description.trim().length < 100) {
      res.status(400).json({ 
        message: "Description is required and must be at least 100 characters (approximately 2-3 lines). Please provide more details about your business." 
      });
      return;
    }

    const normalizedContactPhone = (contactPhone || '').trim();
    if (!isValidTenDigitPhone(normalizedContactPhone)) {
      res.status(400).json({ message: "Contact phone must be exactly 10 digits." });
      return;
    }

    // Validate that at least one location field (Hall or Custom Hostel) is provided
    const trimmedHostelName = (hostelName || '').trim();
    const trimmedLocation = (location || '').trim();
    if (!trimmedHostelName && !trimmedLocation) {
      res.status(400).json({ message: "Please provide either a Hall or Custom Hostel. At least one location is required." });
      return;
    }

    const profile = await VendorProfile.create({
      user: req.user.id,
      businessName,
      description,
      category,
      location: trimmedLocation || '',
      hostelName: trimmedHostelName || '',
      contactEmail,
      contactPhone: normalizedContactPhone,
      whatsapp,
      instagram,
      snapchat,
      tiktok,
      facebook,
      twitter
    });

    const mapped = await mapVendorProfile(profile);
    res.status(201).json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const updates = req.body as Partial<{
      businessName: string;
      description: string;
      category: string;
      location: string;
      hostelName: string;
      contactEmail: string;
      contactPhone: string;
      whatsapp: string;
      instagram: string;
      snapchat: string;
      tiktok: string;
      facebook: string;
      twitter: string;
    }>;

    // Validate description if it's being updated
    if (updates.description !== undefined) {
      if (!updates.description || updates.description.trim().length < 100) {
        res.status(400).json({ 
          message: "Description must be at least 100 characters (approximately 2-3 lines). Please provide more details about your business." 
        });
        return;
      }
    }

    if (updates.contactPhone !== undefined) {
      const normalizedContactPhone = (updates.contactPhone || '').trim();
      if (!isValidTenDigitPhone(normalizedContactPhone)) {
        res.status(400).json({ message: "Contact phone must be exactly 10 digits." });
        return;
      }
      updates.contactPhone = normalizedContactPhone;
    }

    // Validate that at least one location field (Hall or Custom Hostel) is provided
    // Get current profile to check existing values
    const currentProfile = await VendorProfile.findOne({ user: req.user.id });
    if (currentProfile) {
      const updatedHostelName = updates.hostelName !== undefined ? (updates.hostelName || '').trim() : (currentProfile.hostelName || '').trim();
      const updatedLocation = updates.location !== undefined ? (updates.location || '').trim() : (currentProfile.location || '').trim();
      
      if (!updatedHostelName && !updatedLocation) {
        res.status(400).json({ message: "Please provide either a Hall or Custom Hostel. At least one location is required." });
        return;
      }
    }

    // Trim location fields if provided
    if (updates.hostelName !== undefined) {
      updates.hostelName = (updates.hostelName || '').trim();
    }
    if (updates.location !== undefined) {
      updates.location = (updates.location || '').trim();
    }

    const profile = await VendorProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: "Vendor profile not found" });
      return;
    }

    const mapped = await mapVendorProfile(profile);
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadFlyersHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const files = (req as any).files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      res.status(400).json({ message: "No files uploaded" });
      return;
    }

    // Upload files to GridFS and get file IDs
    console.log(`[Upload] Uploading ${files.length} file(s) to GridFS`);
    const fileIds = await Promise.all(
      files.map(async (file) => {
        if (!file.buffer) {
          throw new Error("File buffer is missing");
        }
        console.log(`[Upload] Uploading file: ${file.originalname}, size: ${file.buffer.length} bytes, type: ${file.mimetype}`);
        const fileId = await uploadToGridFS(
          file.buffer,
          file.originalname,
          file.mimetype
        );
        const imageUrl = `/api/images/${fileId}`;
        console.log(`[Upload] Successfully uploaded to GridFS: ${imageUrl}`);
        // Return as URL format that will be handled by the image serving route
        return imageUrl;
      })
    );

    const profile = await VendorProfile.findOneAndUpdate(
      { user: req.user.id },
      { $addToSet: { flyers: { $each: fileIds } } },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: "Vendor profile not found" });
      return;
    }

    res.json({ flyerImages: profile.flyers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFeedbacks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const profile = await VendorProfile.findOne({ user: req.user.id });
    if (!profile) {
      res.status(404).json({ message: "Vendor profile not found" });
      return;
    }

    // Get feedbacks for this vendor (vendor-specific feedback)
    const feedbacks = await Feedback.find({ vendorId: profile._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyGeneralFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    // Get general feedback (no vendorId) created by this vendor
    const feedbacks = await Feedback.find({ 
      createdBy: req.user.id,
      vendorId: { $exists: false }
    })
      .sort({ createdAt: -1 });
    
    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resolveFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    
    // Ensure the feedback belongs to this vendor
    const profile = await VendorProfile.findOne({ user: req.user.id });
    if (!profile) {
      res.status(404).json({ message: "Vendor profile not found" });
      return;
    }

    const feedback = await Feedback.findOne({ _id: id, vendorId: profile._id });
    if (!feedback) {
        res.status(404).json({ message: "Feedback not found or not yours" });
        return;
    }

    feedback.status = "RESOLVED";
    await feedback.save();

    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteFlyer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { imageUrl } = req.body as { imageUrl: string };
    if (!imageUrl) {
        res.status(400).json({ message: "Image URL is required" });
        return;
    }

    // Extract file ID from GridFS URL (format: /api/images/{fileId})
    // Also handle old format: /uploads/flyers/{filename}
    let fileId: string | null = null;
    if (imageUrl.startsWith("/api/images/")) {
      fileId = imageUrl.replace("/api/images/", "");
    }

    const profile = await VendorProfile.findOneAndUpdate(
        { user: req.user.id },
        { $pull: { flyers: imageUrl } },
        { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: "Vendor profile not found" });
      return;
    }

    // Delete from GridFS if it's a GridFS file
    if (fileId) {
      try {
        await deleteFromGridFS(fileId);
      } catch (error) {
        // Log but don't fail if file doesn't exist in GridFS
        console.warn("Could not delete file from GridFS:", error);
      }
    }

    res.json({ flyerImages: profile.flyers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetVendorViewsByEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Find the vendor profile associated with the user
    const vendorProfile = await VendorProfile.findOne({ user: user._id });
    if (!vendorProfile) {
      res.status(404).json({ message: "Vendor profile not found" });
      return;
    }

    // Reset the view count and delete all VendorView records for this vendor
    vendorProfile.viewCount = 0;
    await vendorProfile.save();
    
    // Delete all view records for this vendor
    await VendorView.deleteMany({ vendor: vendorProfile._id });

    res.status(200).json({ message: "Vendor views reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
