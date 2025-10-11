import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
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
  					color: '#e5e7eb',
  					'[class~="lead"]': {
  						color: '#d1d5db',
  					},
  					a: {
  						color: '#3b82f6',
  						textDecoration: 'underline',
  						fontWeight: '500',
  					},
  					strong: {
  						color: '#f9fafb',
  						fontWeight: '600',
  					},
  					'ol[type="A"]': {
  						'--list-counter-style': 'upper-alpha',
  					},
  					'ol[type="a"]': {
  						'--list-counter-style': 'lower-alpha',
  					},
  					'ol[type="A" s]': {
  						'--list-counter-style': 'upper-alpha',
  					},
  					'ol[type="a" s]': {
  						'--list-counter-style': 'lower-alpha',
  					},
  					'ol[type="I"]': {
  						'--list-counter-style': 'upper-roman',
  					},
  					'ol[type="i"]': {
  						'--list-counter-style': 'lower-roman',
  					},
  					'ol[type="I" s]': {
  						'--list-counter-style': 'upper-roman',
  					},
  					'ol[type="i" s]': {
  						'--list-counter-style': 'lower-roman',
  					},
  					'ol[type="1"]': {
  						'--list-counter-style': 'decimal',
  					},
  					'ol > li': {
  						position: 'relative',
  					},
  					'ol > li::marker': {
  						fontWeight: '400',
  						color: '#9ca3af',
  					},
  					'ul > li': {
  						position: 'relative',
  					},
  					'ul > li::marker': {
  						color: '#6b7280',
  					},
  					hr: {
  						borderColor: '#374151',
  						borderTopWidth: 1,
  					},
  					blockquote: {
  						fontWeight: '500',
  						fontStyle: 'italic',
  						color: '#f9fafb',
  						borderLeftWidth: '0.25rem',
  						borderLeftColor: '#374151',
  						quotes: '"\\201C""\\201D""\\2018""\\2019"',
  					},
  					h1: {
  						color: '#f9fafb',
  						fontWeight: '800',
  					},
  					h2: {
  						color: '#f9fafb',
  						fontWeight: '700',
  					},
  					h3: {
  						color: '#f9fafb',
  						fontWeight: '600',
  					},
  					h4: {
  						color: '#f9fafb',
  						fontWeight: '600',
  					},
  					'figure figcaption': {
  						color: '#9ca3af',
  					},
  					code: {
  						color: '#f9fafb',
  						fontWeight: '600',
  					},
  					'a code': {
  						color: '#f9fafb',
  					},
  					pre: {
  						color: '#e5e7eb',
  						backgroundColor: '#1f2937',
  					},
  					'pre code': {
  						backgroundColor: 'transparent',
  						borderWidth: '0',
  						borderRadius: '0',
  						padding: '0',
  						fontWeight: 'inherit',
  						color: 'inherit',
  						fontSize: 'inherit',
  						fontFamily: 'inherit',
  						lineHeight: 'inherit',
  					},
  					table: {
  						width: '100%',
  						tableLayout: 'auto',
  						textAlign: 'left',
  						marginTop: '2em',
  						marginBottom: '2em',
  						fontSize: '0.875em',
  						lineHeight: '1.7142857',
  					},
  					thead: {
  						color: '#f9fafb',
  						fontWeight: '600',
  						borderBottomWidth: '1px',
  						borderBottomColor: '#374151',
  					},
  					'thead th': {
  						verticalAlign: 'bottom',
  						paddingRight: '0.5714286em',
  						paddingBottom: '0.5714286em',
  						paddingLeft: '0.5714286em',
  					},
  					'tbody tr': {
  						borderBottomWidth: '1px',
  						borderBottomColor: '#374151',
  					},
  					'tbody tr:last-child': {
  						borderBottomWidth: '0',
  					},
  					'tbody td': {
  						verticalAlign: 'baseline',
  					},
  					tfoot: {
  						borderTopWidth: '1px',
  						borderTopColor: '#374151',
  					},
  					'tfoot td': {
  						verticalAlign: 'top',
  					},
  				},
  			},
  		}
  	}
  },
  darkMode: ['class', 'class'],
  plugins: [tailwindcssAnimate, typography],
}