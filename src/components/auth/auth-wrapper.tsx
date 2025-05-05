'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/definitions';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Use null to represent loading state

  useEffect(() => {
    // Check authentication status on the client side
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const userDataString = localStorage.getItem('user');
    let user: User | null = null;

    if (userDataString) {
      try {
        user = JSON.parse(userDataString);
      } catch (e) {
        console.error("Error parsing user data from localStorage", e);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
    }

    // Basic check: is authenticated flag set and is user data present?
    const isValidSession = authStatus && user && user.status === 'activo';

    setIsAuthenticated(isValidSession);

    if (!isValidSession) {
       // Clear potentially inconsistent state
       localStorage.removeItem('user');
       localStorage.removeItem('isAuthenticated');
       router.push('/login'); // Redirect to login if not authenticated or user inactive
    }
  }, [router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
     return <div className="flex h-screen w-screen items-center justify-center">Verificando acceso...</div>;
   }

   // If authenticated, render children
   if (isAuthenticated) {
     return <>{children}</>;
   }

   // If not authenticated (and not loading), redirect handled by useEffect, return null or minimal content
   return null;
}
