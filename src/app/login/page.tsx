"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // --- Mock Login Logic ---
    // Replace this with your actual authentication logic
    if (email === 'user@example.com' && password === 'password') {
      // Simulate successful login by setting a flag or token in localStorage/sessionStorage
      // In a real app, you'd get a token from your backend
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/vehicles'); // Redirect to the vehicle list page
    } else {
      setError('Invalid email or password.');
    }
    // --- End Mock Login Logic ---
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Vehicle Manager</CardTitle>
          <CardDescription>Please sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input"
              />
            </div>
             {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Button>
          </form>
        </CardContent>
         <CardFooter className="text-center text-xs text-muted-foreground">
            <p>Demo: user@example.com / password</p>
          </CardFooter>
      </Card>
    </div>
  );
}
