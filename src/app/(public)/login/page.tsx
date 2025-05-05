"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Loader2 } from 'lucide-react';
import { db } from '@/firebase/config'; // Import your Firebase config
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/definitions';
import type { UserData } from '@/lib/definitions';


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);// Initialize to false


  useEffect(() => {
    const checkAuthentication = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const userString = localStorage.getItem('user');
      const user: UserData | null = userString ? JSON.parse(userString) : null;

      const isValidSession = isAuthenticated === 'true' && user !== null && user.status === 'activo';

      if (isValidSession) {
        router.push('/vehicles');
      }
    };

    checkAuthentication();
  }, [router]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleBeforeInstallPrompt = (e: Event) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        setDeferredPrompt(e);
        // Update UI to notify the user they can add to home screen
        setShowInstallButton(true);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      // Hide the install button
      setShowInstallButton(false);
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult: any) => {
        setDeferredPrompt(null);
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('correo', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Usuario no encontrado.');
        setIsLoading(false);
        return;
      }

      // Assuming email is unique, there should only be one doc
      const userDoc = querySnapshot.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() } as User;

      if (userData.status !== 'activo') {
        setError('La cuenta de usuario está inactiva.');
        setIsLoading(false);
        return;
      }

      // Check if password field exists
      if (!userData.password) {
        setError('Error de configuración de usuario: falta contraseña.');
        setIsLoading(false);
        return;
      }

      // Compare the entered password with the stored hash
      const passwordMatch = bcrypt.compareSync(password, userData.password);

      if (passwordMatch) {
        // Store essential user info (but NOT the password hash)
        const { password: _, ...userToStore } = userData;
        localStorage.setItem('user', JSON.stringify(userToStore));
        localStorage.setItem('isAuthenticated', 'true');

        toast({ title: 'Ingreso Correcto', description: `Bienvenido, ${userData.nombre}` });
        router.push('/vehicles'); // Redirect to the vehicle list page
      } else {
        setError('Contraseña incorrecta.');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('Ocurrió un error durante el inicio de sesión.');
      toast({
        title: "Error de inicio de sesion",
        description: "Ocurrio un error al intentar ingresar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
        <Image
            src="/icons/icon-192x192.png"
            alt="Logo"
            width={76}
            height={76}
            className="mx-auto w-auto"/>
          </div>
          <CardDescription>Por favor ingrese sus datos para continuar</CardDescription>
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
                disabled={isLoading}
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-input"
              />
            </div>
             {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
               Ingresar
            </Button>
            {showInstallButton && (
              <Button onClick={handleInstallClick} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Instalar Aplicación
              </Button>
            )}
          </form>
        </CardContent>
         {/* <CardFooter className="text-center text-xs text-muted-foreground">
            <p>Demo: user@example.com / password</p>
          </CardFooter> */}
      </Card>
    </div>
  );
}
