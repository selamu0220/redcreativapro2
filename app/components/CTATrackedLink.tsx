"use client"

import Link from 'next/link'
import { useAnalytics } from '@/app/hooks/useAnalytics'

export default function CTATrackedLink({
  href,
  children,
  buttonText,
  buttonLocation,
  conversionProps
}: {
  href: string
  children?: React.ReactNode
  buttonText: string
  buttonLocation: string
  conversionProps?: Record<string, any>
}) {
  const { trackButtonClick, trackConversionEvent } = useAnalytics()
  return (
    <Link
      href={href}
      onClick={() => {
        trackButtonClick(buttonText, buttonLocation)
        trackConversionEvent('conversion', { properties: conversionProps || {} })
      }}
      className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
    >
      {children ?? buttonText}
    </Link>
  )
}

