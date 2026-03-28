import apiClient from './axios';
import { Product } from './vendor';

export interface Review {
  _id: string;
  vendor?: string | {
    _id: string;
    businessName: string;
  };
  product?: string | {
    _id: string;
    name: string;
  };
  vendorId?: string;
  productId?: string;
  student?: {
    _id: string;
    name: string;
    email: string;
  };
  studentId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ReviewCreate {
  vendorId: string;
  rating: number;
  comment: string;
}

export interface ProductReviewCreate {
  productId: string;
  rating: number;
  comment: string;
}

export interface DashboardData {
  recentSearches: Array<{
    _id: string;
    query: string;
    filters?: Record<string, unknown>;
    createdAt: string;
  }>;
  reviewStats: {
    totalReviews: number;
    monthlyReviews: number;
  };
  topVendors: Array<{
    _id: string;
    businessName: string;
    rating: number;
    reviewCount: number;
    area?: string;
    hostelName?: string;
    flyerImages: string[];
    isMetaVerified?: boolean;
    [key: string]: any;
  }>;
}

export const studentAPI = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await apiClient.get('/api/student/dashboard');
    return response.data;
  },

  createReview: async (data: ReviewCreate): Promise<Review> => {
    const response = await apiClient.post('/api/student/reviews', data);
    return response.data;
  },

  createProductReview: async (data: ProductReviewCreate): Promise<Review> => {
    const response = await apiClient.post('/api/student/reviews/product', data);
    return response.data;
  },

  createVendorFeedback: async (data: { vendorId: string; message: string; contactPhone: string }): Promise<any> => {
    const response = await apiClient.post('/api/student/vendor-feedback', data);
    return response.data;
  },

  createGeneralFeedback: async (data: { category: string; message: string; contactPhone: string }): Promise<any> => {
    const response = await apiClient.post('/api/student/general-feedback', data);
    return response.data;
  },

  getMyGeneralFeedback: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/student/general-feedback');
    return response.data;
  },

  getReviews: async (vendorId: string): Promise<Review[]> => {
    const response = await apiClient.get(`/api/student/reviews/${vendorId}`);
    return response.data;
  },

  getProductReviews: async (productId: string): Promise<Review[]> => {
    const response = await apiClient.get(`/api/student/reviews/product/${productId}`);
    return response.data;
  },

  getMyReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get('/api/student/my-reviews');
    return response.data;
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await apiClient.delete(`/api/student/reviews/${reviewId}`);
  },

  getVendorProducts: async (vendorId: string): Promise<Product[]> => {
    const response = await apiClient.get(`/api/student/vendor/${vendorId}/products`);
    return response.data;
  },

  clearRecentSearches: async (): Promise<void> => {
    await apiClient.delete('/api/student/dashboard/recent-searches');
  },
};


