'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

interface User {
  id: string;
  email: string;
  created_at: string;
  stripe_customer_id?: string;
  trial_start?: string;
  trial_end?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: authUser, isAuthenticated } = useAuth();

  const refreshUser = async () => {
    if (!authUser?.id) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Get user data from Supabase
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': authUser.id,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 404) {
        // If user doesn't exist in our database, create them
        try {
          const createController = new AbortController();
          const createTimeoutId = setTimeout(() => createController.abort(), 10000);
          
          const createResponse = await fetch('/api/user/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: authUser.id,
              email: authUser.email,
            }),
            signal: createController.signal,
          });

          clearTimeout(createTimeoutId);

          if (createResponse.ok) {
            const newUser = await createResponse.json();
            setUser(newUser);
          } else {
            console.warn(`Failed to create user profile: ${createResponse.status} ${createResponse.statusText}`);
            setUser(null);
          }
        } catch (createError) {
          console.warn('Error creating user profile:', createError);
          setUser(null);
        }
      } else {
        // Other HTTP errors (not 404)
        console.warn(`User profile API returned ${response.status}: ${response.statusText}`);
        setUser(null);
      }
    } catch (error) {
      // Handle different types of errors gracefully
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('User profile request timed out');
        } else if (error.message.includes('fetch')) {
          console.warn('Network error fetching user data:', error.message);
        } else {
          console.warn('Error fetching user data:', error.message);
        }
      } else {
        console.warn('Unknown error fetching user data:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && authUser) {
      refreshUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [authUser, isAuthenticated]);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
