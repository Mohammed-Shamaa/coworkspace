import type { Metadata } from "next"
import ErrorBoundary from "@/components/error-boundary"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL('https://coworkspace-pied.vercel.app'),
  title: "Coworkspace - Membership Management",
  description: "Multi-tenant coworking space membership management platform",
  icons: {
    icon: [
      { url: '/logo-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/logo-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/logo-48.png', type: 'image/png', sizes: '48x48' },
    ],
    shortcut: '/logo-48.png',
    apple: [{ url: '/logo.png', type: 'image/png', sizes: '1024x1024' }],
  },
  openGraph: {
    title: "Coworkspace - Membership Management",
    description: "Multi-tenant coworking space membership management platform",
    url: "https://coworkspace-pied.vercel.app",
    siteName: "Coworkspace",
    images: [{ url: '/logo.png', width: 1024, height: 1024 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coworkspace - Membership Management",
    description: "Multi-tenant coworking space membership management platform",
    images: ['/logo.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var e=localStorage.getItem("theme");if(e==="dark"||(!e&&window.matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`
        }} />
      </head>
      <body><ErrorBoundary><Providers>{children}</Providers></ErrorBoundary></body>
    </html>
  )
}
