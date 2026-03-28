import { z } from 'zod';

// Email regex pattern - validates standard email format
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password regex pattern - at least 6 characters, contains at least one letter and one number
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

// Name regex pattern - allows letters, spaces, hyphens, and apostrophes (2-50 characters)
const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .regex(emailRegex, 'Email must be in a valid format (e.g., user@example.com)'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(nameRegex, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .regex(emailRegex, 'Email must be in a valid format (e.g., user@example.com)'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .regex(
      passwordRegex,
      'Password must be at least 6 characters and contain at least one letter and one number'
    ),
  role: z.enum(['STUDENT', 'VENDOR', 'ADMIN']).default('STUDENT'),
  whatsappNumber: z.string().optional(),
}).refine((data) => {
  if (data.role === 'STUDENT' && !data.whatsappNumber) {
    return false;
  }
  return true;
}, {
  message: "WhatsApp number is required for students",
  path: ["whatsappNumber"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

