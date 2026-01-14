// Reserved subdomains that cannot be used by photographers
const RESERVED_SUBDOMAINS = [
    'www',
    'api',
    'admin',
    'dashboard',
    'app',
    'mail',
    'email',
    'ftp',
    'blog',
    'help',
    'support',
    'status',
    'docs',
    'dev',
    'staging',
    'test',
    'demo',
    'static',
    'cdn',
    'assets',
    'images',
    'img',
    'files',
    'media',
    'download',
    'downloads',
    'login',
    'register',
    'signup',
    'signin',
    'auth',
    'oauth',
    'sso',
    'account',
    'accounts',
    'user',
    'users',
    'profile',
    'settings',
    'billing',
    'payment',
    'payments',
    'checkout',
    'subscribe',
    'subscription',
];

// Subdomain format rules
const SUBDOMAIN_MIN_LENGTH = 3;
const SUBDOMAIN_MAX_LENGTH = 30;
const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export interface SubdomainValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validates subdomain format
 */
export function validateSubdomainFormat(subdomain: string): SubdomainValidationResult {
    const normalized = subdomain.toLowerCase().trim();

    if (normalized.length < SUBDOMAIN_MIN_LENGTH) {
        return {
            isValid: false,
            error: `El subdominio debe tener al menos ${SUBDOMAIN_MIN_LENGTH} caracteres`,
        };
    }

    if (normalized.length > SUBDOMAIN_MAX_LENGTH) {
        return {
            isValid: false,
            error: `El subdominio no puede tener más de ${SUBDOMAIN_MAX_LENGTH} caracteres`,
        };
    }

    if (!SUBDOMAIN_REGEX.test(normalized)) {
        return {
            isValid: false,
            error: 'El subdominio solo puede contener letras minúsculas, números y guiones (no al inicio ni al final)',
        };
    }

    if (RESERVED_SUBDOMAINS.includes(normalized)) {
        return {
            isValid: false,
            error: 'Este subdominio está reservado, por favor elige otro',
        };
    }

    return { isValid: true };
}

/**
 * Normalizes subdomain (lowercase, trim)
 */
export function normalizeSubdomain(subdomain: string): string {
    return subdomain.toLowerCase().trim();
}

/**
 * Extracts subdomain from hostname
 * Example: carlos.myapp.com -> carlos
 */
export function extractSubdomain(hostname: string, appDomain: string): string | null {
    // Remove port if present
    const host = hostname.split(':')[0];

    // Check if it's the main domain or localhost
    if (host === appDomain || host === 'localhost' || host === '127.0.0.1') {
        return null;
    }

    // Check if hostname ends with app domain
    if (!host.endsWith(`.${appDomain}`)) {
        return null;
    }

    // Extract subdomain
    const subdomain = host.replace(`.${appDomain}`, '');

    // Validate it's a single subdomain (no nested)
    if (subdomain.includes('.')) {
        return null;
    }

    // Skip reserved subdomains
    if (RESERVED_SUBDOMAINS.includes(subdomain)) {
        return null;
    }

    return subdomain;
}

/**
 * Generates full subdomain URL
 */
export function getSubdomainUrl(subdomain: string, appDomain: string, protocol: string = 'https'): string {
    return `${protocol}://${subdomain}.${appDomain}`;
}
