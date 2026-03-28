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
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  getPendingVendors: async (): Promise<VendorProfile[]> => {
    const response = await apiClient.get('/admin/vendors/pending');
    return response.data;
  },

  approveVendor: async (vendorId: string): Promise<VendorProfile> => {
    const response = await apiClient.put(`/admin/vendors/${vendorId}/approve`);
    return response.data;
  },

  rejectVendor: async (vendorId: string): Promise<VendorProfile> => {
    const response = await apiClient.put(`/admin/vendors/${vendorId}/reject`);
    return response.data;
  },

  getAllVendors: async (): Promise<VendorProfile[]> => {
    const response = await apiClient.get('/admin/vendors');
    return response.data;
  },

  getRejectedVendors: async (): Promise<VendorProfile[]> => {
    const response = await apiClient.get('/admin/vendors/rejected');
    return response.data;
  },

  getFeedbacks: async (): Promise<Feedback[]> => {
    const response = await apiClient.get('/admin/feedbacks');
    return response.data;
  },

  replyToFeedback: async (feedbackId: string, reply: string): Promise<Feedback> => {
    const response = await apiClient.put(`/admin/feedbacks/${feedbackId}/reply`, { reply });
    return response.data;
  },

  updateFeedbackStatus: async (feedbackId: string, status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'): Promise<Feedback> => {
    const response = await apiClient.put(`/admin/feedbacks/${feedbackId}/status`, { status });
    return response.data;
  },

  deleteFeedback: async (feedbackId: string): Promise<void> => {
    await apiClient.delete(`/admin/feedbacks/${feedbackId}`);
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await apiClient.delete(`/admin/reviews/${reviewId}`);
  },

  toggleVendorVerification: async (vendorId: string): Promise<VendorProfile> => {
    const response = await apiClient.put(`/admin/vendors/${vendorId}/verify`);
    return response.data;
  },

  toggleVendorFreeze: async (vendorId: string): Promise<VendorProfile> => {
    const response = await apiClient.put(`/admin/vendors/${vendorId}/freeze`);
    return response.data;
  },

  deleteVendor: async (vendorId: string): Promise<void> => {
    await apiClient.delete(`/admin/vendors/${vendorId}`);
  },

  getAllStudents: async (): Promise<UserInfo[]> => {
    const response = await apiClient.get('/admin/students');
    return response.data;
  },

  toggleStudentFreeze: async (studentId: string): Promise<UserInfo> => {
    const response = await apiClient.put(`/admin/students/${studentId}/freeze`);
    return response.data;
  },

  deleteStudent: async (studentId: string): Promise<void> => {
    await apiClient.delete(`/admin/students/${studentId}`);
  },
};


