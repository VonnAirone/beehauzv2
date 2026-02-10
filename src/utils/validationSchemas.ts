/**
 * Validation Schemas using Zod
 * Centralized validation for all user inputs to prevent injection attacks
 * and ensure data integrity
 */

import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .trim();

// Password validation schema (for registration)
export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character');

// App rating validation schema
export const appRatingSchema = z.object({
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  feedback: z
    .string()
    .max(500, 'Feedback must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  trigger_type: z
    .string()
    .min(1, 'Trigger type is required')
    .max(50, 'Trigger type must be less than 50 characters'),
  user_email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  user_type: z
    .enum(['tenant', 'owner', 'admin', 'guest'])
    .optional(),
  app_version: z
    .string()
    .max(20, 'App version must be less than 20 characters')
    .optional(),
  platform: z
    .enum(['ios', 'android', 'web', 'mobile'])
    .optional(),
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .trim()
    .optional(),
  phone: z
    .string()
    .regex(/^[\+]\d{1,4}[\d\s\-\(\)]+$/, 'Please enter a valid phone number format')
    .max(35, 'Phone number must be less than 35 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  university: z
    .string()
    .max(255, 'University name must be less than 255 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  yearLevel: z
    .string()
    .max(50, 'Year level must be less than 50 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime());
      },
      { message: 'Please enter a valid date' }
    )
    .refine(
      (date) => {
        const d = new Date(date);
        const today = new Date();
        return d <= today;
      },
      { message: 'Date of birth cannot be in the future' }
    )
    .refine(
      (date) => {
        const d = new Date(date);
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 120);
        return d >= minDate;
      },
      { message: 'Please enter a valid birth date' }
    )
    .optional()
    .or(z.literal('')),
});

// Login credentials validation schema
export const loginCredentialsSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters'),
});

// Registration data validation schema
export const registrationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .trim(),
  email: emailSchema,
  password: passwordSchema,
  userType: z.enum(['tenant', 'owner'], {
    errorMap: () => ({ message: 'User type must be either tenant or owner' }),
  }),
});

// Property search validation schema
export const propertySearchSchema = z.object({
  searchText: z
    .string()
    .max(200, 'Search text must be less than 200 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  minPrice: z
    .number()
    .min(0, 'Minimum price must be at least 0')
    .max(1000000, 'Minimum price must be less than 1,000,000')
    .optional(),
  maxPrice: z
    .number()
    .min(0, 'Maximum price must be at least 0')
    .max(1000000, 'Maximum price must be less than 1,000,000')
    .optional(),
  location: z
    .string()
    .max(255, 'Location must be less than 255 characters')
    .trim()
    .optional()
    .or(z.literal('')),
});

// Export type inference for TypeScript
export type AppRatingInput = z.infer<typeof appRatingSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type LoginCredentialsInput = z.infer<typeof loginCredentialsSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type PropertySearchInput = z.infer<typeof propertySearchSchema>;
