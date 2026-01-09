'use client'

import { createContext, useContext, ReactNode } from 'react'

const LocalizationContext = createContext({
  country: 'ES',
  currency: 'EUR',
  language: 'es',
  locale: 'es-ES',
  timezone: 'UTC',
  isLoading: false,
  error: null,
  isLatinAmerica: false,
  confidence: 0,
  source: 'manual',
  formatCurrency: (amount: any) => `€${amount}`,
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => new Date(date).toLocaleDateString(),
  formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => new Date(date).toLocaleTimeString(),
  formatDateTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => new Date(date).toLocaleString(),
  setManualCountry: (country: string) => { },
  refreshLocation: () => { }
})

export function LocalizationProvider({ children }: { children: ReactNode }) {
  return (
    <LocalizationContext.Provider value={{
      country: 'ES',
      currency: 'EUR',
      language: 'es',
      locale: 'es-ES',
      timezone: 'UTC',
      isLoading: false,
      error: null,
      isLatinAmerica: false,
      confidence: 0,
      source: 'manual',
      formatCurrency: (amount: any) => `€${amount}`,
      formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => new Date(date).toLocaleDateString(undefined, options),
      formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => new Date(date).toLocaleTimeString(undefined, options),
      formatDateTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => new Date(date).toLocaleString(undefined, options),
      setManualCountry: (country: string) => { },
      refreshLocation: () => { }
    }}>
      {children}
    </LocalizationContext.Provider>
  )
}

export function useLocalization() {
  return useContext(LocalizationContext)
}

export function useDateFormat() {
  return {
    formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => new Date(date).toLocaleDateString(undefined, options),
    formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => new Date(date).toLocaleTimeString(undefined, options),
    formatDateTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => new Date(date).toLocaleString(undefined, options),
    formatRelativeTime: (date: Date | string | number) => {
      const d = new Date(date);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
      return `${diffDays} días`;
    }
  }
}

export function useCurrency() {
  return {
    formatCurrency: (amount: any) => `€${amount}`,
    format: (amount: any) => `€${amount}`
  }
}

export function usePaymentMethods() {
  return {
    paymentMethods: [],
    hasOxxo: false,
    hasPix: false,
    hasMercadoPago: false,
    hasPse: false
  }
}

export function useLegalCompliance() {
  return {
    requirements: {
      gdprRequired: false,
      ccpaRequired: false,
      lgpdRequired: false
    },
    needsLgpd: false,
    needsPdpa: false,
    needsLfpdppp: false,
    needsLaw1581: false
  }
}
