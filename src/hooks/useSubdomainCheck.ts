'use client';

import { useEffect, useState } from 'react';

interface SubdomainCheckResult {
    available: boolean;
    subdomain?: string;
    error?: string;
}

export function useSubdomainCheck(subdomain: string, delay: number = 500) {
    const [result, setResult] = useState<SubdomainCheckResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        if (!subdomain || subdomain.length < 3) {
            setResult(null);
            return;
        }

        setIsChecking(true);
        const timeoutId = setTimeout(async () => {
            try {
                const response = await fetch('/api/auth/check-subdomain', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ subdomain }),
                });

                const data = await response.json();
                setResult(data);
            } catch {
                setResult({ available: false, error: 'Error verificando disponibilidad' });
            } finally {
                setIsChecking(false);
            }
        }, delay);

        return () => clearTimeout(timeoutId);
    }, [subdomain, delay]);

    return { result, isChecking };
}
