import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { InstallPrompt } from '@/components/InstallPrompt'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Data Quality Analyzer',
  description: 'AI-powered data quality analysis and insights',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DQA',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <InstallPrompt />
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  )
}
