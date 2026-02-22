import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Privacy Policy Generator | Alchemyst AI',
  description: 'Generate professional, GDPR & CCPA compliant privacy policies for your SaaS application using AI',
  keywords: ['privacy policy', 'GDPR', 'CCPA', 'legal compliance', 'AI generator', 'SaaS'],
  authors: [{ name: 'Alchemyst AI Community' }],
  openGraph: {
    title: 'Privacy Policy Generator | Alchemyst AI',
    description: 'Generate professional, GDPR & CCPA compliant privacy policies for your SaaS application using AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy Generator | Alchemyst AI',
    description: 'Generate professional, GDPR & CCPA compliant privacy policies for your SaaS application using AI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}