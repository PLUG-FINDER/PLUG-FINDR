import apiClient from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: 'STUDENT' | 'VENDOR' | 'ADMIN';
  name?: string;
  whatsappNumber?: string;
  adminPin?: string;
  firebaseUID?: string;
}

export interface GoogleAuthData {
  idToken: string;
  role?: 'STUDENT' | 'VENDOR' | 'ADMIN';
  whatsappNumber?: string;
}

export interface GoogleRegisterData {
  firebaseUID: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'VENDOR' | 'ADMIN';
  whatsappNumber?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    role: 'STUDENT' | 'VENDOR' | 'ADMIN';
    name?: string;
    whatsappNumber?: string;
  };
}

export interface UserInfo {
  _id: string;
  email: string;
  role: 'STUDENT' | 'VENDOR' | 'ADMIN';
  name?: string;
  whatsappNumber?: string;
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<{ message: string; user: UserInfo }> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  googleAuth: async (data: GoogleAuthData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/google', data);
    return response.data;
  },

  googleRegister: async (data: GoogleRegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/google-register', data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    return response.data;
  },

  resendVerificationEmail: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  },

  syncEmailVerification: async (email: string): Promise<{ message: string; emailVerified: boolean }> => {
    const response = await apiClient.post('/auth/sync-verification', { email });
    return response.data;
  },

  checkEmailVerification: async (): Promise<{ emailVerified: boolean }> => {
    const response = await apiClient.get('/auth/check-verification');
    return response.data;
  },

  getMe: async (): Promise<UserInfo> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (name: string): Promise<UserInfo> => {
    const response = await apiClient.put('/auth/profile', { name });
    return response.data;
  },
};


