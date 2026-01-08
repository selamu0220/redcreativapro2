'use client'

import { createContext, useContext, ReactNode } from 'react'

const LocalizationContext = createContext({
  country: 'ES',
  currency: 'EUR', 
  language: 'es',
  isLoading: false,
  error: null,
  isLatinAmerica: false,
  formatCurrency: (amount) => `€${amount}`,
  setManualCountry: () => {},
  refreshLocation: () => {}
})

export function LocalizationProvider({ children }: { children: ReactNode }) {
  return (
    <LocalizationContext.Provider value={{
      country: 'ES',
      currency: 'EUR',
      language: 'es', 
      isLoading: false,
      error: null,
      isLatinAmerica: false,
      formatCurrency: (amount) => `€${amount}`,
      setManualCountry: () => {},
      refreshLocation: () => {}
    }}>
      {children}
    </LocalizationContext.Provider>
  )
}

export function useLocalization() {
  return useContext(LocalizationContext)
}

export function useCurrency() {
  return {
    formatCurrency: (amount) => `€${amount}`,
    format: (amount) => `€${amount}`
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
    }
  }
}
