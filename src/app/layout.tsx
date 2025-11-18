import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ChaoGPT - Your Unhinged AI Bestie',
  description: 'Its giving AI assistant but make it chronically online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}
