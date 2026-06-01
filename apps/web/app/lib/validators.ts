import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom est trop long'),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom est trop long'),
  phoneNumber: z
    .string()
    .min(8, 'Numéro de téléphone invalide')
    .regex(/^[0-9+\-\s]+$/, 'Format de numéro invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir un chiffre'),
  role: z.enum(['CLIENT', 'ARTISAN'], {
    required_error: 'Sélectionnez un type de compte',
  }),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir un chiffre'),
  confirmPassword: z.string().min(1, 'La confirmation est requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const createJobSchema = z.object({
  serviceId: z.string().uuid('Service invalide'),
  description: z
    .string()
    .min(10, 'Décrivez votre besoin (min. 10 caractères)')
    .max(2000, 'Description trop longue'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().optional(),
  scheduledFor: z.string().optional(),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']),
  })).optional(),
});

export const createQuoteSchema = z.object({
  jobId: z.string().uuid('Mission invalide'),
  estimatedPrice: z.number().positive('Le prix doit être positif'),
  materialsPrice: z.number().min(0).optional(),
  laborPrice: z.number().positive('Le prix de la main-d\'œuvre est requis'),
  description: z
    .string()
    .min(10, 'Décrivez votre devis (min. 10 caractères)')
    .max(2000, 'Description trop longue'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phoneNumber: z.string().min(8).optional(),
  avatarUrl: z.string().url().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateJobFormData = z.infer<typeof createJobSchema>;
export type CreateQuoteFormData = z.infer<typeof createQuoteSchema>;