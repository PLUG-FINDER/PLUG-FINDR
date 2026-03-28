import apiClient from './axios';

export interface VendorProfile {
  _id: string;
  userId: string;
  businessName: string;
  description: string;
  category: string;
  location: string;
  hostelName: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp?: string;
  instagram?: string;
  snapchat?: string;
  tiktok?: string;
  facebook?: string;
  twitter?: string;
  flyerImages: string[];
  rating: number;
  reviewCount: number;
  viewCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isMetaVerified?: boolean;
  isFrozen?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorProfileUpdate {
  businessName?: string;
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
}

export interface Product {
  _id: string;
  name: string;
  price?: number;
  currency?: string;
  description?: string;
  image: string;
  createdAt: string;
}

export const vendorAPI = {
  getProfile: async (): Promise<VendorProfile> => {
    const response = await apiClient.get('/api/vendor/profile');
    return response.data;
  },

  createProfile: async (data: VendorProfileUpdate): Promise<VendorProfile> => {
    const response = await apiClient.post('/api/vendor/profile', data);
    return response.data;
  },

  updateProfile: async (data: VendorProfileUpdate): Promise<VendorProfile> => {
    const response = await apiClient.put('/api/vendor/profile', data);
    return response.data;
  },

  uploadFlyers: async (files: File[]): Promise<{ flyerImages: string[] }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('flyers', file);
    });
    const response = await apiClient.post('/api/vendor/upload-flyers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  searchVendors: async (query: string, category?: string, hostel?: string): Promise<VendorProfile[]> => {
    const params = new URLSearchParams({ q: query });
    if (category) params.append('category', category);
    if (hostel) params.append('hostel', hostel);
    const response = await apiClient.get(`/api/student/search?${params.toString()}`);
    return response.data;
  },

  getVendorsByHostel: async (hostel: string): Promise<VendorProfile[]> => {
    const response = await apiClient.get(`/api/student/vendors/hostel?hostel=${encodeURIComponent(hostel)}`);
    return response.data;
  },

  getVendorById: async (id: string): Promise<VendorProfile> => {
    const response = await apiClient.get(`/api/student/vendor/${id}`);
    return response.data;
  },

  getAllVendors: async (): Promise<VendorProfile[]> => {
    const response = await apiClient.get('/api/student/vendors');
    return response.data;
  },

  getFeedbacks: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/vendor/feedbacks');
    return response.data;
  },

  resolveFeedback: async (feedbackId: string): Promise<any> => {
    const response = await apiClient.put(`/api/vendor/feedbacks/${feedbackId}/resolve`);
    return response.data;
  },

  createGeneralFeedback: async (data: { category: string; message: string; contactPhone: string }): Promise<any> => {
    const response = await apiClient.post('/api/vendor/general-feedback', data);
    return response.data;
  },

  getMyGeneralFeedback: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/vendor/general-feedback');
    return response.data;
  },

  deleteFlyer: async (imageUrl: string): Promise<{ flyerImages: string[] }> => {
    const response = await apiClient.delete('/api/vendor/flyers', {
        data: { imageUrl }
    });
    return response.data;
  },

  // Market
  addProduct: async (data: FormData): Promise<Product> => {
    const response = await apiClient.post('/api/vendor/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getMyProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/api/vendor/products');
    return response.data;
  },

  updateProduct: async (id: string, data: FormData): Promise<Product> => {
    const response = await apiClient.put(`/api/vendor/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/vendor/products/${id}`);
  },
};


