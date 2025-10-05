import { Inter, Roboto_Mono, Poppins } from "next/font/google";

// Primary font - Inter for body text
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
  adjustFontFallback: true,
});

// Monospace font for code
export const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
  preload: false, // Only load when needed
  fallback: ["Consolas", "Monaco", "Courier New", "monospace"],
  adjustFontFallback: true,
});

// Heading font - Poppins for headings and emphasis
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
  adjustFontFallback: true,
});

// Font class utilities
export const fontClasses = {
  body: inter.className,
  heading: poppins.className,
  mono: robotoMono.className,
};

// CSS variables for Tailwind configuration
export const fontVariables = `${inter.variable} ${poppins.variable} ${robotoMono.variable}`;

// Font configuration object
export const fontConfig = {
  fonts: { inter, robotoMono, poppins },
  critical: [inter, poppins],
  classes: fontClasses,
  nonCritical: [robotoMono],
  variables: fontVariables,
  display: "swap" as const,
  preload: true,
  optimizeFonts: true,
};

const fontExports = {
  inter,
  robotoMono,
  poppins,
  fontClasses,
  fontVariables,
  fontConfig,
};

export default fontExports;