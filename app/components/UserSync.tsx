"use client";

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

export function UserSync() {
  const auth = useAuth();
  const { user } = useUser();
  const { userId, isSignedIn } = auth || {};

  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && userId && user) {
        try {
          const email = user.primaryEmailAddress?.emailAddress;
          const fullName = user.fullName;
          
          if (email) {
            await fetch('/api/users/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                email,
                fullName,
                preferences: {}
              }),
            });
          }
        } catch (error) {
          console.error('Failed to sync user to Supabase:', error);
        }
      }
    };

    syncUser();
  }, [isSignedIn, userId, user]);

  return null;
}
