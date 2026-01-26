"use client";

import { useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

export function UserSync() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && user) {
        try {
          const email = user.email;
          const fullName = `${user.given_name || ''} ${user.family_name || ''}`.trim();

          if (email) {
            await fetch('/api/users/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id,
                email,
                fullName,
                preferences: {}
              }),
            });
          }
        } catch (error) {
          console.error('Failed to sync user:', error);
        }
      }
    };

    syncUser();
  }, [isAuthenticated, user]);

  return null;
}
