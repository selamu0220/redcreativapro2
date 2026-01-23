import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const enableThemeTransition = () => {
  if (typeof document === 'undefined') return
  const css = document.createElement('style')
  css.appendChild(document.createTextNode(`* { transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease !important; }`))
  document.head.appendChild(css)
  setTimeout(() => document.head.removeChild(css), 300)
}