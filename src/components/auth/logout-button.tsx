'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // --- Mock Logout Logic ---
    localStorage.removeItem('isAuthenticated');
    // In a real app, you might also need to invalidate the token on the backend
    // --- End Mock Logout Logic ---
    router.push('/login');
  };

  return (
    <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      <span>Sign Out</span>
    </Button>
  );
}
