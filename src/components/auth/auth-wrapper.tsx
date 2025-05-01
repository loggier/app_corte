'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // --- Mock Authentication Check ---
    // In a real app, verify the token/session with your backend
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (!isAuthenticated) {
      router.push('/login'); // Redirect to login if not authenticated
    }
    // --- End Mock Authentication Check ---
  }, [router]);

   // Conditionally render children only if authenticated (or during the check)
   // This prevents flashing the protected content before redirection
   const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated && typeof window !== 'undefined') {
     // Optionally, show a loading spinner while checking auth
     return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
   }


  return <>{children}</>;
}
