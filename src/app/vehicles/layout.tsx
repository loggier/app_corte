import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Home, Car, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AuthWrapper from '@/components/auth/auth-wrapper';
import LogoutButton from '@/components/auth/logout-button';


export default function VehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthWrapper>
       <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
             <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarImage src="https://picsum.photos/100/100?random=avatar" alt="User Avatar" data-ai-hint="user avatar"/>
                    <AvatarFallback><User/></AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-sidebar-foreground">Demo User</span>
                    <span className="text-xs text-muted-foreground">user@example.com</span>
                </div>
             </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                 <Link href="/vehicles" passHref legacyBehavior>
                    <SidebarMenuButton tooltip="Dashboard" isActive={true}>
                      <Car />
                      <span>Vehicles</span>
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
