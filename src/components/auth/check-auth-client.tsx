'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserData } from '@/lib/definitions'; // Assuming UserData type is defined here

// Define a type for the user data stored in localStorage
interface LocalStorageUser extends UserData {
  status?: string; // Assuming user data in localStorage includes a status field
}

export default function CheckAuthClient() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      try {
        // This code will only run in the browser after hydration
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        const userString = localStorage.getItem('user');
        const user: LocalStorageUser | null = userString ? JSON.parse(userString) : null;

        // Check for valid session
        const isValidSession = isAuthenticated === 'true' && user !== null && user.status === 'activo';

        if (isValidSession) {
          // Redirect to vehicles if authenticated
          router.push('/vehicles');
        } else {
          // Clear any inconsistent data and redirect to login
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          router.push('/login'); // Assuming /login is the correct login route
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        // In case of any error, redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        router.push('/login'); // Assuming /login is the correct login route
      }
      // Note: The finally block was removed as it's not strictly necessary here
      // and the logic is handled within the try/catch branches for redirects.
    };

    // Ensure this runs only in the browser
    if (typeof window !== 'undefined') {
        checkAuthentication();
    } else {
        // For server-side rendering, we can assume no auth check is possible yet
        // and the Client Component will handle it on hydration.
        // Set checkingAuth to false to render nothing on the server.
        // This prevents attempting to access localStorage during prerendering.
        setCheckingAuth(false);
    }

  }, [router]); // Dependency array includes router

  if (checkingAuth) {
    // Display a loading state while checking
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Verificando sesión...</p> {/* You can replace this with a spinner */}
      </div>
    );
  }

  // Optionally return null or a minimal component if not loading anymore
  // and useEffect has already triggered the redirect
  return null;
}