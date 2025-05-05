'use client'; // Make this a client component to access localStorage

import { useEffect, useState } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Car, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AuthWrapper from '@/components/auth/auth-wrapper';
import LogoutButton from '@/components/auth/logout-button';
import type { User as UserType } from '@/lib/definitions';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    // Fetch user data from localStorage on the client side
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        setUser(JSON.parse(userDataString));
      } catch (e) {
        console.error("Error parsing user data from localStorage", e);
        // Handle error, e.g., redirect to login or clear storage
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        // Optionally redirect here if needed, though AuthWrapper should handle it
      }
    }
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <AuthWrapper>
       <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
             <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10 border-2 border-primary">
                    {/* Use a placeholder or initials if no image available */}
                    <AvatarFallback><User/></AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-sidebar-foreground">{user?.nombre || 'Usuario'}</span>
                    <span className="text-xs text-muted-foreground">{user?.correo || ''}</span>
                </div>
             </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                 <Link href="/vehicles" passHref legacyBehavior>
                    {/* Determine isActive based on current route if needed */}
                    <SidebarMenuButton tooltip="Vehículos" >
                      <Car />
                      <span>Vehículos</span>
                    </SidebarMenuButton>
                 </Link>
              </SidebarMenuItem>
               {/* Add more menu items here if needed */}
            </SidebarMenu>
          </SidebarContent>
          <SidebarHeader className="border-t border-sidebar-border p-2">
             <LogoutButton />
          </SidebarHeader>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 shadow-sm sm:justify-end">
            {/* Mobile Trigger */}
            <div className="sm:hidden">
                <SidebarTrigger />
            </div>
            {/* Desktop Header Content (if any) */}
            <div className="hidden sm:flex items-center gap-4">
              {/* Add desktop-specific header items if needed */}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthWrapper>
  );
}
