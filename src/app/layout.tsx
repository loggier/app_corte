import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/toaster" // Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Vehicle Manager', // Updated title
  description: 'Manage your vehicle inventory easily.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<html lang="en" className="dark">
        <head>
          {/* PWA Meta Tags */}
          <meta name="application-name" content="Vehicle Manager" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="Vehicle Manager" />
          <meta
            name="description"
            content="Manage your vehicle inventory easily."
          />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-config" content="/icons/browserconfig.xml" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="theme-color" content="#ffffff" />
          {/* PWA Links */}
          <link
            rel="apple-touch-icon"
            href="/icons/icon-192x192.png"
          />
          <link rel="icon" href="/icons/icon-32x32.png" sizes="32x32" type="image/png"/>
          <link rel="manifest" href="/manifest.json" />
          <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
          <link rel="shortcut icon" href="/favicon.ico" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <AuthProvider>
          {children}
          <Toaster />
          </AuthProvider>
        </body>
      </html>
  );
}
