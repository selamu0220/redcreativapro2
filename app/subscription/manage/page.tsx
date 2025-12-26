'use client';

import { UserProfile } from '@clerk/nextjs';
import { SimpleMainNavigation } from '../../components/SimpleMainNavigation';

export default function SubscriptionManagePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <UserProfile routing="hash" />
      </div>
    </div>
  );
}
