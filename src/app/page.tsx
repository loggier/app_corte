'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { UserData } from '@/lib/definitions';

interface LocalStorageUser extends UserData {
  status?: string; 
}

export default function RootPage() {
    const router = useRouter();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const checkAuthentication = () => {
            try {
                const isAuthenticated = localStorage.getItem('isAuthenticated');
                const userString = localStorage.getItem('user');
                const user: LocalStorageUser | null = userString ? JSON.parse(userString) : null;

                const isValidSession = isAuthenticated === 'true' && user !== null && user.status === 'activo';

                if (isValidSession) {
                    router.push('/vehicles');
                } else {
                    localStorage.removeItem('user');
                    localStorage.removeItem('isAuthenticated');
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error checking authentication status:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('isAuthenticated');
                router.push('/login');
            } finally {
                setCheckingAuth(false);
            }
        };

        checkAuthentication();

    }, [router]); 

    if (checkingAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Verificando sesión...</p>
            </div>
        );
    }

    return null;
}
