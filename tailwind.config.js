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
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)'
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)'
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)'
				},
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)'
				},
				chart: {
					'1': 'var(--chart-1)',
					'2': 'var(--chart-2)',
					'3': 'var(--chart-3)',
					'4': 'var(--chart-4)',
					'5': 'var(--chart-5)'
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
						color: 'hsl(var(--foreground))',
						lineHeight: '1.8',
						'[class~="lead"]': {
							color: 'hsl(var(--muted-foreground))',
						},
						a: {
							color: 'hsl(var(--primary))',
							textDecoration: 'none',
							fontWeight: '500',
							borderBottom: '1px solid transparent',
							transition: 'all 0.2s ease',
							'&:hover': {
								color: 'hsl(var(--primary))',
								borderBottomColor: 'hsl(var(--primary))',
							},
						},
						strong: {
							color: 'hsl(var(--foreground))',
							fontWeight: '700',
						},
						'ol[type="1"]': {
							'--list-counter-style': 'decimal',
						},
						'ol > li': {
							position: 'relative',
							paddingLeft: '0.5rem',
						},
						'ol > li::marker': {
							fontWeight: '600',
							color: 'hsl(var(--primary))',
						},
						'ul > li': {
							position: 'relative',
							paddingLeft: '0.5rem',
						},
						'ul > li::marker': {
							color: 'hsl(var(--primary))',
						},
						hr: {
							borderColor: 'hsl(var(--border))',
							borderTopWidth: 1,
							marginTop: '3em',
							marginBottom: '3em',
						},
						blockquote: {
							fontWeight: '500',
							fontStyle: 'italic',
							color: 'hsl(var(--foreground))',
							borderLeftWidth: '0.25rem',
							borderLeftColor: 'hsl(var(--primary))',
							quotes: '"\\201C""\\201D""\\2018""\\2019"',
							marginTop: '2em',
							marginBottom: '2em',
							paddingLeft: '1.5em',
							backgroundColor: 'hsl(var(--muted) / 0.3)',
							paddingTop: '1rem',
							paddingBottom: '1rem',
							borderRadius: '0 0.5rem 0.5rem 0',
						},
						h1: {
							color: 'hsl(var(--foreground))',
							fontWeight: '800',
							fontSize: '2.5em',
							marginTop: '0',
							marginBottom: '0.8em',
							lineHeight: '1.1',
							letterSpacing: '-0.025em',
						},
						h2: {
							color: 'hsl(var(--foreground))',
							fontWeight: '700',
							fontSize: '1.8em',
							marginTop: '2em',
							marginBottom: '1em',
							lineHeight: '1.3',
							letterSpacing: '-0.025em',
							borderBottom: '1px solid hsl(var(--border))',
							paddingBottom: '0.3em',
						},
						h3: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600',
							fontSize: '1.5em',
							marginTop: '1.6em',
							marginBottom: '0.6em',
							lineHeight: '1.4',
						},
						h4: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600',
							marginTop: '1.5em',
							marginBottom: '0.5em',
						},
						img: {
							marginTop: '2em',
							marginBottom: '2em',
							borderRadius: '0.75rem',
							boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
							border: '1px solid hsl(var(--border))',
						},
						video: {
							marginTop: '2em',
							marginBottom: '2em',
							borderRadius: '0.75rem',
							boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
						},
						'figure figcaption': {
							color: 'hsl(var(--muted-foreground))',
							textAlign: 'center',
							fontSize: '0.875em',
							marginTop: '0.875em',
						},
						code: {
							color: 'hsl(var(--primary))',
							fontWeight: '600',
							backgroundColor: 'hsl(var(--muted))',
							padding: '0.2em 0.4em',
							borderRadius: '0.25rem',
							fontSize: '0.875em',
						},
						'code::before': {
							content: '""',
						},
						'code::after': {
							content: '""',
						},
						'a code': {
							color: 'inherit',
						},
						pre: {
							color: 'hsl(var(--foreground))',
							backgroundColor: 'hsl(var(--muted))',
							borderRadius: '0.5rem',
							border: '1px solid hsl(var(--border))',
							padding: '1.25rem',
							overflowX: 'auto',
						},
						'pre code': {
							backgroundColor: 'transparent',
							borderWidth: '0',
							borderRadius: '0',
							padding: '0',
							fontWeight: '400',
							color: 'inherit',
							fontSize: 'inherit',
							fontFamily: 'inherit',
							lineHeight: 'inherit',
						},
						thead: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600',
							borderBottomWidth: '2px',
							borderBottomColor: 'hsl(var(--primary))',
						},
						'tbody tr': {
							borderBottomWidth: '1px',
							borderBottomColor: 'hsl(var(--border))',
						},
						'tbody td': {
							verticalAlign: 'baseline',
						},
					},
				},
			},
		}
	},
	darkMode: 'class',
	plugins: [tailwindcssAnimate, typography],
}