import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import DynamicMeta from '@/components/DynamicMeta'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sabores de Zissou - Confeitaria e Panificadora Artesanal',
  description: 'Delícias artesanais preparadas com carinho todos os dias, usando os melhores ingredientes para encantar seu paladar',
  keywords: 'confeitaria, panificadora, bolos artesanais, doces, pães, encomendas especiais',
  authors: [{ name: 'Sabores de Zissou' }],
  creator: 'Sabores de Zissou',
  publisher: 'Sabores de Zissou',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sabores de Zissou',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#722F37',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="application-name" content="Sabores de Zissou" />
        <meta name="apple-mobile-web-app-title" content="Sabores de Zissou" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#722F37" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#722F37" />
      </head>
      <body className={`${inter.className} min-h-screen bg-cream`}>
        <DynamicMeta />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#722F37',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '500',
            },
          }}
        />
      </body>
    </html>
  )
}