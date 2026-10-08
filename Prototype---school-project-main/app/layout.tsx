import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { SchoolDataProvider } from '@/context/school-data-context'
import ScrollReveal from '@/components/scroll-reveal'

export const metadata: Metadata = {
  title: 'EduPro Admin - School Management',
  description: 'EduPro Admin Portal - Shaping Future Leaders',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white">
<AuthProvider>
          <SchoolDataProvider>
            <ScrollReveal />
            {children}
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </SchoolDataProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
