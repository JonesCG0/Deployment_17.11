import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shop Dashboard',
  description: 'IS 455 Deployment Assignment',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex gap-6 text-sm font-medium">
          <a href="/" className="hover:text-blue-600">Customers</a>
          <a href="/warehouse" className="hover:text-blue-600">Warehouse</a>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
