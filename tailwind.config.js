import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
    		typography: {
    			DEFAULT: {
    				css: {
    					maxWidth: 'none',
    					color: 'inherit',
    					'[class~="lead"]': {
    						color: 'inherit',
    					},
    					a: {
    						color: 'hsl(var(--primary))',
    						textDecoration: 'underline',
    						fontWeight: '500',
    					},
    					strong: {
    						color: 'inherit',
    						fontWeight: '700',
    					},
    					'ol[type="1"]': {
    						'--list-counter-style': 'decimal',
    					},
    					'ol > li': {
    						position: 'relative',
    					},
    					'ol > li::marker': {
    						fontWeight: '400',
    						color: 'inherit',
    					},
    					'ul > li': {
    						position: 'relative',
    					},
    					'ul > li::marker': {
    						color: 'inherit',
    					},
    					hr: {
    						borderColor: 'hsl(var(--border))',
    						borderTopWidth: 1,
    					},
    					blockquote: {
    						fontWeight: '500',
    						fontStyle: 'italic',
    						color: 'inherit',
    						borderLeftWidth: '0.25rem',
    						borderLeftColor: 'hsl(var(--primary))',
    						quotes: '"\\201C""\\201D""\\2018""\\2019"',
    					},
    					h1: {
    						color: 'inherit',
    						fontWeight: '800',
    					},
    					h2: {
    						color: 'inherit',
    						fontWeight: '700',
    					},
    					h3: {
    						color: 'inherit',
    						fontWeight: '600',
    					},
    					h4: {
    						color: 'inherit',
    						fontWeight: '600',
    					},
    					'figure figcaption': {
    						color: 'hsl(var(--muted-foreground))',
    					},
    					code: {
    						color: 'inherit',
    						fontWeight: '600',
    					},
    					'a code': {
    						color: 'inherit',
    					},
    					pre: {
    						color: 'hsl(var(--foreground))',
    						backgroundColor: 'hsl(var(--muted))',
    					},
    					thead: {
    						color: 'inherit',
    						fontWeight: '600',
    						borderBottomWidth: '1px',
    						borderBottomColor: 'hsl(var(--border))',
    					},
    					'tbody tr': {
    						borderBottomWidth: '1px',
    						borderBottomColor: 'hsl(var(--border))',
    					},
    				},
    			},
    		}
  	}
  },
  darkMode: 'class',
  plugins: [tailwindcssAnimate, typography],
}