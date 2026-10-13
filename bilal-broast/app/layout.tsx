import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Anton, Poppins } from 'next/font/google'
import './globals.css'

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-display' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'Bilal Broast | Freshly made, properly crispy',
  description: 'Big, bold Pakistani flavor made fresh to order. Order Bilal Broast online in Karachi.',
  generator: 'v0.app',
  icons: {
    icon: '/bilal-broast-icon.png',
    apple: '/bilal-broast-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#922f27',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${anton.variable} ${poppins.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
