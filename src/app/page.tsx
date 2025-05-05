// This is a Server Component by default

import CheckAuthClient from '@/components/auth/check-auth-client';

export default function RootPage() {
  return (
    // Render the Client Component that handles the authentication check
    <CheckAuthClient />
  );
}
