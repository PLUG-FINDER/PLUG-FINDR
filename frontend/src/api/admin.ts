import apiClient from './axios';
import { VendorProfile } from './vendor';
import { UserInfo } from './auth';

export interface Feedback {
  _id: string;
  category: 'Bug Report' | 'Feature Request' | 'Improvement' | 'Complaint' | 'Praise' | 'Other';
  message: string;
  contactPhone: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface DashboardStats {
  pendingVendors: number;
  totalVendors: number;
  totalFeedbacks: number;
  totalStudents: number;
  recentVendors: Array<{
    _id: string;
    businessName: string;
    approved: boolean;
    rejectedReason?: string;
    createdAt: string;
  }>;
  recentFeedbacks: Array<{
    _id: string;
    category: string;
    message: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
    createdAt: string;
  }>;
}

export const adminAPI = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/admin/dashboard/stats');
    return response.data;
  },

  getPendingVendors: async (): Promise<VendorProfile[]> => {
    const response = await apiClient.get('/api/admin/vendors/pending');
    return response.data;
  },

  approveVendor: async (vendorId: string): Promise<VendorProfile> => {
    const response = await apiClient.put(`/api/admin/vendors/${vendorId}/approve`);
    return response.data;
  },

  rejectVendor: async (vendorId: string): Promise<VendorProfile> => {
    const response = await apiClient.put(`/api/admin/vendors/${vendorId}/reject`);
    return response.data;
  },

  getAllVendors: async (): Promise<VendorProfile[]> => {
    const response = await apiClient.get('/api/admin/vendors');
    return response.data;
  },

  getRejectedVendors: async (): Promise<VendorProfile[]> => {
    const response = await apiClient.get('/api/admin/vendors/rejected');
    return response.data;
  },

  getFeedbacks: async (): Promise<Feedback[]> => {
    const response = await apiClient.get('/api/admin/feedbacks');
    return response.data;
  },

  replyToFeedback: async (feedbackId: string, reply: string): Promise<Feedback> => {
    const response = await apiClient.put(`/api/admin/feedbacks/${feedbackId}/reply`, { reply });
    return response.data;
  },

  updateFeedbackStatus: async (feedbackId: string, status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'): Promise<Feedback> => {
    const response = await apiClient.put(`/api/admin/feedbacks/${feedbackId}/status`, { status });
    return response.data;
  },

  deleteFeedback: async (feedbackId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/feedbacks/${feedbackId}`);
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/reviews/${reviewId}`);
  },

  toggleVendorVerification: async (vendorId: string): Promise<VendorProfile> => {
    const response = await apiClient.put(`/api/admin/vendors/${vendorId}/verify`);
    return response.data;
  },

  toggleVendorFreeze: async (vendorId: string): Promise<VendorProfile> => {
    const response = await apiClient.put(`/api/admin/vendors/${vendorId}/freeze`);
    return response.data;
  },

  deleteVendor: async (vendorId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/vendors/${vendorId}`);
  },

  getAllStudents: async (): Promise<UserInfo[]> => {
    const response = await apiClient.get('/api/admin/students');
    return response.data;
  },

  toggleStudentFreeze: async (studentId: string): Promise<UserInfo> => {
    const response = await apiClient.put(`/api/admin/students/${studentId}/freeze`);
    return response.data;
  },

  deleteStudent: async (studentId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/students/${studentId}`);
  },
};


