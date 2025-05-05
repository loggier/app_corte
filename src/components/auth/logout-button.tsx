'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear authentication state
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    // In a real app, you might also need to invalidate the token/session on the backend
    router.push('/login');
    // Optionally force a full reload to clear any component state
    // window.location.href = '/login';
  };

  return (
    <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      <span>Salir</span>
    </Button>
  );
}
