import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Ali Farm - Smart Livestock Platform',
  description: 'Smart livestock management platform for farm owners and investors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                  },
                  colors: {
                    primary: {
                      50: '#eff6ff',
                      100: '#dbeafe',
                      500: '#3b82f6',
                      600: '#2563eb',
                      700: '#1d4ed8',
                      800: '#1e40af',
                      900: '#1e3a8a',
                    },
                    agri: {
                      50: '#f0fdf4',
                      100: '#dcfce7',
                      500: '#22c55e',
                      600: '#16a34a',
                      700: '#15803d',
                    }
                  },
                  animation: {
                    'fade-in-up': 'fadeInUp 0.8s ease-out',
                    'bounce-slow': 'bounce 3s infinite',
                    'scale-slow': 'scaleSlow 20s linear infinite alternate',
                  },
                  keyframes: {
                    fadeInUp: {
                      '0%': { opacity: '0', transform: 'translateY(20px)' },
                      '100%': { opacity: '1', transform: 'translateY(0)' },
                    },
                    scaleSlow: {
                      '0%': { transform: 'scale(1)' },
                      '100%': { transform: 'scale(1.15)' },
                    }
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
