'use client'

import React from 'react'
import { useDateFormat } from '@/app/contexts/LocalizationContext'
import { cn } from '@/lib/utils'

interface DateTimeFormatterProps {
    date: Date | string | number
    format?: 'date' | 'time' | 'datetime' | 'relative'
    style?: 'short' | 'medium' | 'long' | 'full'
    className?: string
    as?: any
}

/**
 * Component to display formatted date/time according to user's locale and timezone
 */
export function DateTimeFormatter({
    date,
    format = 'date',
    style = 'medium',
    className = '',
    as: Component = 'span'
}: DateTimeFormatterProps) {
    const { formatDate, formatTime, formatDateTime, formatRelativeTime } = useDateFormat()
    const [formatted, setFormatted] = React.useState<string>('')

    React.useEffect(() => {
        // Format on client side to avoid hydration mismatches due to timezone differences between server/client
        const options: Intl.DateTimeFormatOptions = {
            dateStyle: format === 'date' || format === 'datetime' ? style : undefined,
            timeStyle: format === 'time' || format === 'datetime' ? (style === 'full' ? 'long' : style) : undefined
        }

        let result = ''
        switch (format) {
            case 'date':
                result = formatDate(date, options)
                break
            case 'time':
                result = formatTime(date, options)
                break
            case 'datetime':
                result = formatDateTime(date, options)
                break
            case 'relative':
                result = formatRelativeTime(date)
                break
        }
        setFormatted(result)
    }, [date, format, style, formatDate, formatTime, formatDateTime, formatRelativeTime])

    // Return empty or skeleton or fallback during SSR to avoid mismatch
    // Or just return the formatted string if we are sure (but we used useEffect)
    if (!formatted) {
        return <Component className={cn('animate-pulse bg-gray-200 rounded text-transparent select-none', className)}>Loading...</Component>
    }

    return (
        <Component className={className} title={new Date(date).toLocaleString()}>
            {formatted}
        </Component>
    )
}
