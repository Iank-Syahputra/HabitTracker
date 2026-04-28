'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, initialize } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      await initialize();
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/');
    } else {
      router.push('/auth');
    }
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}