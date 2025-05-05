'use client'; // Need client component for redirection

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login'); // Redirect to login page
  }, [router]);

  // Optionally return a loading state or null
  return <div className="flex h-screen w-screen items-center justify-center">Redirecting...</div>;
}
