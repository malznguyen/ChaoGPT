import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'chaogpt - your unhinged ai bestie',
  description: 'its giving ai assistant but make it chronically online',
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
