'use client';

import { UserProfile } from '@clerk/nextjs';
import { MainNavigation } from '../../components/MainNavigation';

export default function SubscriptionManagePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MainNavigation />
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <UserProfile routing="hash" />
      </div>
    </div>
  );
}
