"use client";

import { useEffect } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

export function UserSync() {
  const { user, isAuthenticated } = useKindeBrowserClient();

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
