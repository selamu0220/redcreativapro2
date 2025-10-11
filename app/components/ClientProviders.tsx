'use client';

import React from 'react';

interface ClientProvidersProps {
  children: React.ReactNode;
}

const ClientProviders: React.FC<ClientProvidersProps> = ({ children }) => {
  return <>{children}</>;
};

export default ClientProviders;