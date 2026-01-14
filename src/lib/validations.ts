import { z } from 'zod';

// ============================================
// Registration Validation
// ============================================

export const registerSchema = z.object({
    email: z
        .string()
        .email('Email inválido')
        .min(1, 'El email es requerido'),
    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
        ),
    subdomain: z
        .string()
        .min(3, 'El subdominio debe tener al menos 3 caracteres')
        .max(30, 'El subdominio no puede tener más de 30 caracteres')
        .regex(
            /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
            'El subdominio solo puede contener letras minúsculas, números y guiones'
        ),
    businessName: z
        .string()
        .min(2, 'El nombre del negocio debe tener al menos 2 caracteres')
        .max(100, 'El nombre del negocio no puede tener más de 100 caracteres'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================
// Login Validation
// ============================================

export const loginSchema = z.object({
    email: z
        .string()
        .email('Email inválido')
        .min(1, 'El email es requerido'),
    password: z
        .string()
        .min(1, 'La contraseña es requerida'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================
// Subdomain Check Validation
// ============================================

export const subdomainCheckSchema = z.object({
    subdomain: z
        .string()
        .min(3, 'El subdominio debe tener al menos 3 caracteres')
        .max(30, 'El subdominio no puede tener más de 30 caracteres'),
});

export type SubdomainCheckInput = z.infer<typeof subdomainCheckSchema>;
