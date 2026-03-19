/**
 * Database Query Utilities for AI Assistant
 * Provides verified data retrieval methods for AI responses
 */

import { User } from "../models/User";
import { VendorProfile } from "../models/VendorProfile";
import { Product } from "../models/Product";
import { Review } from "../models/Review";
import { Feedback } from "../models/Feedback";
import { Complaint } from "../models/Complaint";

/**
 * Get total count of users in the system
 */
export const getTotalUserCount = async (): Promise<number> => {
  try {
    const count = await User.countDocuments();
    return count;
  } catch (error) {
    console.error("Error fetching user count:", error);
    throw new Error("Unable to retrieve user count");
  }
};

/**
 * Get total count of active (approved) vendors in the system
 */
export const getTotalVendorCount = async (): Promise<number> => {
  try {
    // Only count approved vendors
    const count = await VendorProfile.countDocuments({ approved: true, isFrozen: false });
    return count;
  } catch (error) {
    console.error("Error fetching vendor count:", error);
    throw new Error("Unable to retrieve vendor count");
  }
};

/**
 * Get count of all vendors (including unapproved)
 */
export const getTotalVendorCountAll = async (): Promise<number> => {
  try {
    const count = await VendorProfile.countDocuments();
    return count;
  } catch (error) {
    console.error("Error fetching total vendor count:", error);
    throw new Error("Unable to retrieve total vendor count");
  }
};

/**
 * Get breakdown of vendors by status
 */
export const getVendorCountByStatus = async (): Promise<{
  approved: number;
  pending: number;
  frozen: number;
  total: number;
}> => {
  try {
    const approved = await VendorProfile.countDocuments({ approved: true, isFrozen: false });
    const pending = await VendorProfile.countDocuments({ approved: false });
    const frozen = await VendorProfile.countDocuments({ isFrozen: true });
    const total = await VendorProfile.countDocuments();

    return {
      approved,
      pending,
      frozen,
      total,
    };
  } catch (error) {
    console.error("Error fetching vendor count breakdown:", error);
    throw new Error("Unable to retrieve vendor count breakdown");
  }
};

/**
 * Get total count of products in the system
 */
export const getTotalProductCount = async (): Promise<number> => {
  try {
    const count = await Product.countDocuments();
    return count;
  } catch (error) {
    console.error("Error fetching product count:", error);
    throw new Error("Unable to retrieve product count");
  }
};

/**
 * Get total count of reviews in the system
 */
export const getTotalReviewCount = async (): Promise<number> => {
  try {
    const count = await Review.countDocuments();
    return count;
  } catch (error) {
    console.error("Error fetching review count:", error);
    throw new Error("Unable to retrieve review count");
  }
};

/**
 * Get total count of feedback in the system
 */
export const getTotalFeedbackCount = async (): Promise<number> => {
  try {
    const count = await Feedback.countDocuments();
    return count;
  } catch (error) {
    console.error("Error fetching feedback count:", error);
    throw new Error("Unable to retrieve feedback count");
  }
};

/**
 * Get total count of complaints in the system
 */
export const getTotalComplaintCount = async (): Promise<number> => {
  try {
    const count = await Complaint.countDocuments();
    return count;
  } catch (error) {
    console.error("Error fetching complaint count:", error);
    throw new Error("Unable to retrieve complaint count");
  }
};

/**
 * Get average product rating
 */
export const getAverageProductRating = async (): Promise<number> => {
  try {
    const result = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    if (result.length === 0) return 0;
    return Math.round(result[0].averageRating * 100) / 100;
  } catch (error) {
    console.error("Error fetching average rating:", error);
    throw new Error("Unable to retrieve average rating");
  }
};

/**
 * Get count of active vendors (vendors with products)
 */
export const getActiveVendorCount = async (): Promise<number> => {
  try {
    // Get vendors that have products AND are approved/not frozen
    const vendorsWithProducts = await Product.aggregate([
      {
        $lookup: {
          from: "vendorprofiles",
          localField: "vendor",
          foreignField: "_id",
          as: "vendorData",
        },
      },
      {
        $match: {
          "vendorData.approved": true,
          "vendorData.isFrozen": false,
        },
      },
      {
        $group: {
          _id: "$vendor",
        },
      },
    ]);

    return vendorsWithProducts.length;
  } catch (error) {
    console.error("Error fetching active vendor count:", error);
    throw new Error("Unable to retrieve active vendor count");
  }
};

/**
 * Get system statistics summary
 * Note: Vendor count returns only approved, active vendors
 */
export const getSystemStatistics = async (): Promise<{
  totalUsers: number;
  totalVendors: number;
  activeVendors: number;
  totalProducts: number;
  totalReviews: number;
  totalFeedback: number;
  totalComplaints: number;
  averageProductRating: number;
}> => {
  try {
    const [
      totalUsers,
      totalVendors,
      activeVendors,
      totalProducts,
      totalReviews,
      totalFeedback,
      totalComplaints,
      averageProductRating,
    ] = await Promise.all([
      getTotalUserCount(),
      getTotalVendorCount(),
      getActiveVendorCount(),
      getTotalProductCount(),
      getTotalReviewCount(),
      getTotalFeedbackCount(),
      getTotalComplaintCount(),
      getAverageProductRating(),
    ]);

    return {
      totalUsers,
      totalVendors,
      activeVendors,
      totalProducts,
      totalReviews,
      totalFeedback,
      totalComplaints,
      averageProductRating,
    };
  } catch (error) {
    console.error("Error fetching system statistics:", error);
    throw new Error("Unable to retrieve system statistics");
  }
};

/**
 * Get top rated products
 */
export const getTopRatedProducts = async (limit: number = 5): Promise<any[]> => {
  try {
    const topProducts = await Review.aggregate([
      {
        $match: { product: { $ne: null } }
      },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
      { $sort: { averageRating: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
    ]);

    return topProducts;
  } catch (error) {
    console.error("Error fetching top rated products:", error);
    throw new Error("Unable to retrieve top rated products");
  }
};
