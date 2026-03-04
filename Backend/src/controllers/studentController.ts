import { Response, Request } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import { VendorProfile } from "../models/VendorProfile";
import { Review } from "../models/Review";
import { SearchLog } from "../models/SearchLog";
import { Complaint } from "../models/Complaint";
import { Product } from "../models/Product";
import { Feedback } from "../models/Feedback";
import { parseQuery, buildSearchFilter, sortByRelevance } from "../utils/searchEngine";

const mapVendorForStudent = async (profile: any) => {
  const vendorId = profile._id;
  
  // Calculate rating and review count from reviews (excluding hidden ones)
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
    viewCount: profile.viewCount || 0,
    status: profile.approved ? "APPROVED" : profile.rejectedReason ? "REJECTED" : "PENDING",
    isMetaVerified: profile.isMetaVerified,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
};

// Public endpoint for landing page - no authentication required
export const getPublicVendors = async (req: Request, res: Response): Promise<void> => {
  try {
    // Exclude frozen vendors and only return approved vendors
    const vendors = await VendorProfile.find({ approved: true, isFrozen: { $ne: true } });
    const mapped = await Promise.all(vendors.map((v) => mapVendorForStudent(v)));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllVendors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Exclude frozen vendors from student view
    const vendors = await VendorProfile.find({ approved: true, isFrozen: { $ne: true } });
    const mapped = await Promise.all(vendors.map((v) => mapVendorForStudent(v)));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const searchVendors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string) || "";
    const category = (req.query.category as string) || "";
    const hostel = (req.query.hostel as string) || "";

    // Allow searching by category/subcategory or hostel even without a query string
    if (!q.trim() && !category.trim() && !hostel.trim()) {
      res.status(400).json({ message: "Search query, category, or hostel is required" });
      return;
    }

    // Log search
    await SearchLog.create({
      user: req.user?.id,
      query: q || category || hostel,
      filters: category ? { category } : hostel ? { hostel } : undefined
    });

    // AI-assisted search: Parse query using keyword matching and rule-based logic
    // If no query but category exists, use category as the query
    const searchQuery = q.trim() || category;
    const parsedQuery = parseQuery(searchQuery);
    
    // Build MongoDB filter based on parsed query
    const filter = buildSearchFilter(parsedQuery, category);
    
    // Add hostel filter if provided - search both hostelName and location fields
    if (hostel.trim()) {
      filter.$or = [
        { hostelName: { $regex: hostel.trim(), $options: "i" } },
        { location: { $regex: hostel.trim(), $options: "i" } }
      ];
    }
    
    // Exclude frozen vendors from search results
    filter.isFrozen = { $ne: true };
    filter.approved = true;

    // Execute search
    const vendors = await VendorProfile.find(filter);

    // Sort by relevance score (AI-assisted ranking)
    const sortedVendors = sortByRelevance(vendors, parsedQuery);

    const mapped = await Promise.all(sortedVendors.map((v) => mapVendorForStudent(v)));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVendorsByHostel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostel = (req.query.hostel as string) || "";
    
    if (!hostel.trim()) {
      res.status(400).json({ message: "Hostel parameter is required" });
      return;
    }

    // Find vendors in the specified hostel - search both hostelName and location fields
    const vendors = await VendorProfile.find({
      approved: true,
      isFrozen: { $ne: true },
      $or: [
        { hostelName: { $regex: hostel.trim(), $options: "i" } },
        { location: { $regex: hostel.trim(), $options: "i" } }
      ]
    }).sort({ createdAt: -1 });

    const mapped = await Promise.all(vendors.map((v) => mapVendorForStudent(v)));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVendorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const vendor = await VendorProfile.findById(id);
    // Check if vendor exists, is approved, and is not frozen
    if (!vendor || !vendor.approved || vendor.isFrozen) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    // Increment view count when student views vendor details
    vendor.viewCount = (vendor.viewCount || 0) + 1;
    await vendor.save();

    const mapped = await mapVendorForStudent(vendor);
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { vendorId, rating, comment } = req.body as {
      vendorId: string;
      rating: number;
      comment: string;
    };

    if (!vendorId || !rating) {
      res.status(400).json({ message: "vendorId and rating are required" });
      return;
    }

    const vendor = await VendorProfile.findById(vendorId);
    // Check if vendor exists, is approved, and is not frozen
    if (!vendor || !vendor.approved || vendor.isFrozen) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    // Students can review multiple times - no duplicate check needed

    // Ensure we're using ObjectId types
    const review = await Review.create({
      vendor: new mongoose.Types.ObjectId(vendor._id),
      student: new mongoose.Types.ObjectId(req.user.id),
      rating,
      comment: comment || ''
    });

    res.status(201).json(review);
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createProductReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { productId, rating, comment } = req.body as {
      productId: string;
      rating: number;
      comment: string;
    };

    if (!productId || !rating) {
      res.status(400).json({ message: "productId and rating are required" });
      return;
    }

    const product = await Product.findById(productId).populate('vendor');
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Check if vendor is approved and not frozen
    const vendor = product.vendor as any;
    if (!vendor || !vendor.approved || vendor.isFrozen) {
      res.status(404).json({ message: "Product vendor not available" });
      return;
    }

    // Students can review multiple times - no duplicate check needed

    // Ensure we're using ObjectId types
    const review = await Review.create({
      product: new mongoose.Types.ObjectId(product._id),
      student: new mongoose.Types.ObjectId(req.user.id),
      rating,
      comment: comment || ''
    });

    res.status(201).json(review);
  } catch (error: any) {
    console.error('Error creating product review:', error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVendorReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId } = req.params as { vendorId: string };

    const reviews = await Review.find({ vendor: vendorId, isHidden: false })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params as { productId: string };

    const reviews = await Review.find({ product: productId, isHidden: false })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const reviews = await Review.find({ student: req.user.id, isHidden: false })
      .populate('vendor', 'businessName')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteMyReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { reviewId } = req.params as { reviewId: string };

    // Find the review and verify it belongs to the student
    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    // Check if the review belongs to the authenticated student
    if (review.student.toString() !== req.user.id) {
      res.status(403).json({ message: "You can only delete your own reviews" });
      return;
    }

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { vendorId, reviewId, reason, contactPhone } = req.body as {
      vendorId?: string;
      reviewId?: string;
      reason: string;
      contactPhone: string;
    };

    if (!reason) {
      res.status(400).json({ message: "Reason is required" });
      return;
    }

    if (!contactPhone) {
        res.status(400).json({ message: "WhatsApp/Contact number is required" });
        return;
    }

    if (!vendorId && !reviewId) {
      res.status(400).json({ message: "Target (vendorId or reviewId) is required" });
      return;
    }

    const complaint = await Complaint.create({
      reporter: req.user.id,
      targetVendor: vendorId,
      targetReview: reviewId,
      reason,
      contactPhone
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createGeneralFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { category, message, contactPhone } = req.body as {
      category: string;
      message: string;
      contactPhone: string;
    };

    if (!category) {
      res.status(400).json({ message: "Category is required" });
      return;
    }

    if (!message || !message.trim()) {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    if (!contactPhone) {
      res.status(400).json({ message: "Contact phone number is required" });
      return;
    }

    // Validate category
    const validCategories = ["Bug Report", "Feature Request", "Improvement", "Complaint", "Praise", "Other"];
    if (!validCategories.includes(category)) {
      res.status(400).json({ message: "Invalid category" });
      return;
    }

    const feedback = await Feedback.create({
      createdBy: req.user.id,
      category: category as "Bug Report" | "Feature Request" | "Improvement" | "Complaint" | "Praise" | "Other",
      message: message.trim(),
      contactPhone,
      status: "PENDING"
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createVendorFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { vendorId, message, contactPhone } = req.body as {
      vendorId: string;
      message: string;
      contactPhone: string;
    };

    if (!vendorId) {
      res.status(400).json({ message: "Vendor ID is required" });
      return;
    }

    if (!message || !message.trim()) {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    if (!contactPhone) {
      res.status(400).json({ message: "Contact phone number is required" });
      return;
    }

    // Verify vendor exists
    const vendor = await VendorProfile.findById(vendorId);
    if (!vendor) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    const feedback = await Feedback.create({
      createdBy: req.user.id,
      vendorId: new mongoose.Types.ObjectId(vendorId),
      category: "Other", // Vendor feedback defaults to "Other" category
      message: message.trim(),
      contactPhone,
      status: "PENDING"
    });

    res.status(201).json(feedback);
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

    // Get general feedback (no vendorId) created by this user
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

export const getVendorProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId } = req.params;
    const products = await Product.find({ vendor: vendorId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRecentSearches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const searches = await SearchLog.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('query filters createdAt');
    
    res.json(searches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const clearRecentSearches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    // Delete all search logs for the user
    await SearchLog.deleteMany({ user: req.user.id });
    
    res.json({ message: "Recent searches cleared successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReviewStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalReviews = await Review.countDocuments({ student: req.user.id, isHidden: false });
    const monthlyReviews = await Review.countDocuments({ 
      student: req.user.id, 
      isHidden: false,
      createdAt: { $gte: startOfMonth }
    });

    res.json({
      totalReviews,
      monthlyReviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTopRatedVendors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get all approved vendors with their ratings
    const vendors = await VendorProfile.find({ approved: true, isFrozen: { $ne: true } });
    
    // Map vendors with ratings
    const vendorsWithRatings = await Promise.all(
      vendors.map(async (vendor) => {
        const stats = await Review.aggregate([
          { 
            $match: { 
              vendor: vendor._id,
              isHidden: { $ne: true }
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
        const rating = stat?.avgRating ? Math.round(stat.avgRating * 10) / 10 : 0;
        const reviewCount = stat?.reviewCount || 0;

        return {
          vendor,
          rating,
          reviewCount
        };
      })
    );

    // Filter vendors with at least 1 review and sort by rating
    const topVendors = vendorsWithRatings
      .filter(v => v.reviewCount > 0)
      .sort((a, b) => {
        // Sort by rating first, then by review count
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, 10) // Get top 10
      .map(v => v.vendor);

    // Map vendors for student view
    const mapped = await Promise.all(topVendors.map((v) => mapVendorForStudent(v)));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDashboardData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const userId = req.user.id;

    // Run all independent queries in parallel
    const [recentSearches, totalReviews, monthlyReviews] = await Promise.all([
      // Get recent searches
      SearchLog.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('query filters createdAt')
        .lean(),
      
      // Get total reviews
      Review.countDocuments({ student: userId, isHidden: false }),
      
      // Get monthly reviews
      (async () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return Review.countDocuments({ 
          student: userId, 
          isHidden: false,
          createdAt: { $gte: startOfMonth }
        });
      })(),
    ]);

    // Check if student has any activity (searches or reviews)
    // Only show top vendors if student has used the site (has searches or reviews)
    const hasActivity = recentSearches.length > 0 || totalReviews > 0;
    
    let mappedTopVendors: any[] = [];
    
    if (hasActivity) {
      // Get top rated vendors using a single aggregation query
      const vendorRatings = await Review.aggregate([
        {
          $match: {
            isHidden: { $ne: true },
            vendor: { $ne: null } // Only include vendor reviews, exclude product reviews
          }
        },
        {
          $group: {
            _id: "$vendor",
            avgRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 }
          }
        },
        {
          $match: {
            _id: { $ne: null }, // Ensure _id is not null
            reviewCount: { $gt: 0 }
          }
        },
        {
          $sort: {
            avgRating: -1,
            reviewCount: -1
          }
        },
        {
          $limit: 10
        }
      ]);

      // Get vendor IDs from ratings (filter out any null values)
      const vendorIds = vendorRatings
        .map(r => r._id)
        .filter(id => id !== null && id !== undefined);

      // Fetch vendor profiles in a single query (exclude frozen vendors)
      const vendors = await VendorProfile.find({ 
        _id: { $in: vendorIds },
        approved: true,
        isFrozen: { $ne: true }
      }).lean();

      // Create a map of vendor ratings (filter out any null _id values)
      const ratingMap = new Map(
        vendorRatings
          .filter(r => r._id !== null && r._id !== undefined)
          .map(r => [
            r._id.toString(),
            {
              rating: Math.round(r.avgRating * 10) / 10,
              reviewCount: r.reviewCount
            }
          ])
      );

      // Sort vendors by rating and map them
      const sortedVendors = vendors
        .sort((a, b) => {
          const aRating = ratingMap.get(a._id.toString());
          const bRating = ratingMap.get(b._id.toString());
          if (!aRating || !bRating) return 0;
          if (bRating.rating !== aRating.rating) {
            return bRating.rating - aRating.rating;
          }
          return bRating.reviewCount - aRating.reviewCount;
        });

      // Map vendors for student view
      mappedTopVendors = await Promise.all(
        sortedVendors.map(async (v) => {
          const rating = ratingMap.get(v._id.toString());
          const mapped = await mapVendorForStudent(v);
          return {
            ...mapped,
            rating: rating?.rating || 0,
            reviewCount: rating?.reviewCount || 0
          };
        })
      );
    }

    res.json({
      recentSearches,
      reviewStats: {
        totalReviews,
        monthlyReviews
      },
      topVendors: mappedTopVendors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
