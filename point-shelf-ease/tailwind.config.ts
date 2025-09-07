import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				heading: ['Space Grotesk', 'Inter', 'sans-serif'],
				inter: ['Inter', 'sans-serif'],
				'space-grotesk': ['Space Grotesk', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					50: 'hsl(var(--primary-50))',
					100: 'hsl(var(--primary-100))',
					500: 'hsl(var(--primary-500))',
					600: 'hsl(var(--primary-600))',
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Zepto-like palette
				"zepto-purple": {
					DEFAULT: '#7C3AED',
					50: '#F5F3FF',
					100: '#EDE9FE',
					200: '#DDD6FE',
					300: '#C4B5FD',
					400: '#A78BFA',
					500: '#8B5CF6',
					600: '#7C3AED',
					700: '#6D28D9',
					800: '#5B21B6',
					900: '#4C1D95'
				},
				"zepto-blue": {
					DEFAULT: '#0EA5E9',
					50: '#F0F9FF',
					100: '#E0F2FE',
					200: '#BAE6FD',
					300: '#7DD3FC',
					400: '#38BDF8',
					500: '#0EA5E9',
					600: '#0284C7',
					700: '#0369A1',
					800: '#075985',
					900: '#0C4A6E'
				},
				"zepto-green": {
					DEFAULT: '#22C55E',
					50: '#F0FDF4',
					100: '#DCFCE7',
					200: '#BBF7D0',
					300: '#86EFAC',
					400: '#4ADE80',
					500: '#22C55E',
					600: '#16A34A',
					700: '#15803D',
					800: '#166534',
					900: '#14532D'
				},
				"zepto-red": {
					DEFAULT: '#EF4444',
					50: '#FEF2F2',
					100: '#FEE2E2',
					200: '#FECACA',
					300: '#FCA5A5',
					400: '#F87171',
					500: '#EF4444',
					600: '#DC2626',
					700: '#B91C1C',
					800: '#991B1B',
					900: '#7F1D1D'
				},
				// Vibrant color palette for more colorful design
				"vibrant-purple": {
					DEFAULT: '#9C27B0',
					50: '#F3E5F5',
					100: '#E1BEE7',
					200: '#CE93D8',
					300: '#BA68C8',
					400: '#AB47BC',
					500: '#9C27B0',
					600: '#8E24AA',
					700: '#7B1FA2',
					800: '#6A1B9A',
					900: '#4A148C'
				},
				"vibrant-blue": {
					DEFAULT: '#2196F3',
					50: '#E3F2FD',
					100: '#BBDEFB',
					200: '#90CAF9',
					300: '#64B5F6',
					400: '#42A5F5',
					500: '#2196F3',
					600: '#1E88E5',
					700: '#1976D2',
					800: '#1565C0',
					900: '#0D47A1'
				},
				"vibrant-green": {
					DEFAULT: '#4CAF50',
					50: '#E8F5E9',
					100: '#C8E6C9',
					200: '#A5D6A7',
					300: '#81C784',
					400: '#66BB6A',
					500: '#4CAF50',
					600: '#43A047',
					700: '#388E3C',
					800: '#2E7D32',
					900: '#1B5E20'
				},
				"vibrant-yellow": {
					DEFAULT: '#FFEB3B',
					50: '#FFFDE7',
					100: '#FFF9C4',
					200: '#FFF59D',
					300: '#FFF176',
					400: '#FFEE58',
					500: '#FFEB3B',
					600: '#FDD835',
					700: '#FBC02D',
					800: '#F9A825',
					900: '#F57F17'
				},
				"vibrant-orange": {
					DEFAULT: '#FF9800',
					50: '#FFF3E0',
					100: '#FFE0B2',
					200: '#FFCC80',
					300: '#FFB74D',
					400: '#FFA726',
					500: '#FF9800',
					600: '#FB8C00',
					700: '#F57C00',
					800: '#EF6C00',
					900: '#E65100'
				},
				"vibrant-red": {
					DEFAULT: '#F44336',
					50: '#FFEBEE',
					100: '#FFCDD2',
					200: '#EF9A9A',
					300: '#E57373',
					400: '#EF5350',
					500: '#F44336',
					600: '#E53935',
					700: '#D32F2F',
					800: '#C62828',
					900: '#B71C1C'
				},
				"vibrant-pink": {
					DEFAULT: '#E91E63',
					50: '#FCE4EC',
					100: '#F8BBD0',
					200: '#F48FB1',
					300: '#F06292',
					400: '#EC407A',
					500: '#E91E63',
					600: '#D81B60',
					700: '#C2185B',
					800: '#AD1457',
					900: '#880E4F'
				},
				"vibrant-teal": {
					DEFAULT: '#009688',
					50: '#E0F2F1',
					100: '#B2DFDB',
					200: '#80CBC4',
					300: '#4DB6AC',
					400: '#26A69A',
					500: '#009688',
					600: '#00897B',
					700: '#00796B',
					800: '#00695C',
					900: '#004D40'
				},
				// Professional status colors
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				info: 'hsl(var(--info))',
				// Zepto-like palette
				"zepto-purple": {
					DEFAULT: '#7C3AED',
					50: '#F5F3FF',
					100: '#EDE9FE',
					200: '#DDD6FE',
					300: '#C4B5FD',
					400: '#A78BFA',
					500: '#8B5CF6',
					600: '#7C3AED',
					700: '#6D28D9',
					800: '#5B21B6',
					900: '#4C1D95'
				},
				"zepto-blue": {
					DEFAULT: '#0EA5E9',
					50: '#F0F9FF',
					100: '#E0F2FE',
					200: '#BAE6FD',
					300: '#7DD3FC',
					400: '#38BDF8',
					500: '#0EA5E9',
					600: '#0284C7',
					700: '#0369A1',
					800: '#075985',
					900: '#0C4A6E'
				},
				"zepto-green": {
					DEFAULT: '#22C55E',
					50: '#F0FDF4',
					100: '#DCFCE7',
					200: '#BBF7D0',
					300: '#86EFAC',
					400: '#4ADE80',
					500: '#22C55E',
					600: '#16A34A',
					700: '#15803D',
					800: '#166534',
					900: '#14532D'
				},
				"zepto-red": {
					DEFAULT: '#EF4444',
					50: '#FEF2F2',
					100: '#FEE2E2',
					200: '#FECACA',
					300: '#FCA5A5',
					400: '#F87171',
					500: '#EF4444',
					600: '#DC2626',
					700: '#B91C1C',
					800: '#991B1B',
					900: '#7F1D1D'
				},
				// New color palette
				ultra_violet: {
					DEFAULT: '#6c698d',
					100: '#15151c',
					200: '#2b2a38',
					300: '#403e54',
					400: '#565371',
					500: '#6c698d',
					600: '#8885a5',
					700: '#a5a4bb',
					800: '#c3c2d2',
					900: '#e1e1e8'
				},
				timberwolf: {
					DEFAULT: '#d4d2d5',
					100: '#2b292c',
					200: '#565257',
					300: '#807b83',
					400: '#aaa7ac',
					500: '#d4d2d5',
					600: '#dddbdd',
					700: '#e5e4e6',
					800: '#eeedee',
					900: '#f6f6f7'
				},
				silver: {
					DEFAULT: '#bfafa6',
					100: '#29221e',
					200: '#53443c',
					300: '#7c675a',
					400: '#a18a7d',
					500: '#bfafa6',
					600: '#ccbfb8',
					700: '#d8cfca',
					800: '#e5dfdc',
					900: '#f2efed'
				},
				beaver: {
					DEFAULT: '#aa968a',
					100: '#231d1a',
					200: '#473b33',
					300: '#6a584d',
					400: '#8e7667',
					500: '#aa968a',
					600: '#baaaa0',
					700: '#ccc0b8',
					800: '#ddd5d0',
					900: '#eeeae7'
				},
				dim_gray: {
					DEFAULT: '#6e6a6f',
					100: '#161516',
					200: '#2c2b2d',
					300: '#434043',
					400: '#595659',
					500: '#6e6a6f',
					600: '#8c888d',
					700: '#a9a6aa',
					800: '#c6c4c6',
					900: '#e2e1e3'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-subtle': 'var(--gradient-subtle)',
				'zepto-gradient-subtle': 'linear-gradient(180deg, rgba(124,58,237,0.06), rgba(236,72,153,0.06))',
			},
			boxShadow: {
				'card': 'var(--shadow-card)',
				'professional': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
				'elegant': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'slide-in': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'pulse-subtle': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.8'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;