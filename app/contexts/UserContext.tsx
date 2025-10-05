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
      
      // Get user data from Supabase
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': authUser.id,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // If user doesn't exist in our database, create them
        const createResponse = await fetch('/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: authUser.id,
            email: authUser.email,
          }),
        });

        if (createResponse.ok) {
          const newUser = await createResponse.json();
          setUser(newUser);
        } else {
          let errorText = '';
          let errorData = { error: 'Unknown error' };
          
          try {
            errorText = await createResponse.text();
            if (errorText) {
              try {
                errorData = JSON.parse(errorText);
              } catch {
                errorData = { error: errorText };
              }
            }
          } catch (textError) {
            console.error('Failed to read error response:', textError);
            errorData = { error: `HTTP ${createResponse.status}: ${createResponse.statusText}` };
          }
          
          console.error('Failed to create user profile:', {
            status: createResponse.status,
            statusText: createResponse.statusText,
            error: errorData,
            userId: authUser.id,
            userEmail: authUser.email
          });
          
          // Show user-friendly error message
          if (typeof window !== 'undefined') {
            const errorMessage = errorData.error || 'Error creating user profile. Please try again.';
            // You can replace this with your toast notification system
            alert(`Error: ${errorMessage}`);
          }
          
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
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