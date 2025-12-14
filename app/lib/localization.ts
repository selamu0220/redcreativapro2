import { LanguageCode } from './language/config';

// Locale mapping for Intl API
const LOCALE_MAP: Record<LanguageCode, string> = {
  es: 'es-ES',
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
  zh: 'zh-CN',
  pt: 'pt-BR'
};

// Currency mapping by language/region
const CURRENCY_MAP: Record<LanguageCode, string> = {
  es: 'EUR',
  en: 'USD',
  fr: 'EUR',
  de: 'EUR',
  zh: 'CNY',
  pt: 'BRL'
};

/**
 * Format a date according to the user's locale
 */
export function formatDate(date: Date, language: LanguageCode, options?: Intl.DateTimeFormatOptions): string {
  const locale = LOCALE_MAP[language];
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
}

/**
 * Format a number according to the user's locale
 */
export function formatNumber(number: number, language: LanguageCode, options?: Intl.NumberFormatOptions): string {
  const locale = LOCALE_MAP[language];
  return new Intl.NumberFormat(locale, options).format(number);
}

/**
 * Format a currency amount according to the user's locale
 */
export function formatCurrency(
  amount: number, 
  language: LanguageCode, 
  currency?: string,
  options?: Intl.NumberFormatOptions
): string {
  const locale = LOCALE_MAP[language];
  const currencyCode = currency || CURRENCY_MAP[language];
  
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode
  };
  
  return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(amount);
}

/**
 * Format a percentage according to the user's locale
 */
export function formatPercentage(value: number, language: LanguageCode, options?: Intl.NumberFormatOptions): string {
  const locale = LOCALE_MAP[language];
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  };
  
  return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(value / 100);
}

/**
 * Format a duration in minutes to a localized string
 */
export function formatDuration(minutes: number, language: LanguageCode): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} ${getDurationUnit('minutes', language)}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) {
    return `${hours}${getDurationUnit('hours', language)}`;
  }
  
  return `${hours}${getDurationUnit('hours', language)} ${remainingMinutes}${getDurationUnit('minutes', language)}`;
}

/**
 * Get localized duration units
 */
function getDurationUnit(unit: 'minutes' | 'hours', language: LanguageCode): string {
  const units = {
    es: { minutes: ' min', hours: 'h' },
    en: { minutes: ' min', hours: 'h' },
    fr: { minutes: ' min', hours: 'h' },
    de: { minutes: ' Min', hours: 'h' },
    zh: { minutes: ' 分钟', hours: '小时' },
    pt: { minutes: ' min', hours: 'h' }
  };
  
  return units[language][unit];
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date: Date, language: LanguageCode): string {
  const locale = LOCALE_MAP[language];
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  
  const intervals = [
    { unit: 'year' as Intl.RelativeTimeFormatUnit, seconds: 31536000 },
    { unit: 'month' as Intl.RelativeTimeFormatUnit, seconds: 2592000 },
    { unit: 'day' as Intl.RelativeTimeFormatUnit, seconds: 86400 },
    { unit: 'hour' as Intl.RelativeTimeFormatUnit, seconds: 3600 },
    { unit: 'minute' as Intl.RelativeTimeFormatUnit, seconds: 60 },
    { unit: 'second' as Intl.RelativeTimeFormatUnit, seconds: 1 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
    if (count >= 1) {
      return rtf.format(diffInSeconds < 0 ? -count : count, interval.unit);
    }
  }
  
  return rtf.format(0, 'second');
}

/**
 * Get localized day names
 */
export function getDayNames(language: LanguageCode): string[] {
  const locale = LOCALE_MAP[language];
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'long' });
  
  // Generate dates for each day of the week (starting from Sunday)
  const days = [];
  const baseDate = new Date(2024, 0, 7); // January 7, 2024 is a Sunday
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    days.push(formatter.format(date));
  }
  
  return days;
}

/**
 * Get localized month names
 */
export function getMonthNames(language: LanguageCode): string[] {
  const locale = LOCALE_MAP[language];
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
  
  const months = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(2024, i, 1);
    months.push(formatter.format(date));
  }
  
  return months;
}

/**
 * Format a compact number (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(number: number, language: LanguageCode): string {
  const locale = LOCALE_MAP[language];
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(number);
}