import type { Metadata } from "next"
import ErrorBoundary from "@/components/error-boundary"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL('https://coworkspace-pied.vercel.app'),
  title: "Deskora - Membership Management",
  description: "Deskora is a coworking space management platform for businesses, startups, freelancers, and remote teams. Manage workspaces, meeting rooms, and memberships.",
  alternates: {
    canonical: 'https://coworkspace-pied.vercel.app',
  },
  icons: {
    icon: [
      { url: '/logo-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/logo-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/logo-48.png', type: 'image/png', sizes: '48x48' },
    ],
    shortcut: '/logo-48.png',
    apple: [{ url: '/logo.webp', type: 'image/webp', sizes: '1024x1024' }],
  },
  openGraph: {
    title: "Deskora - Membership Management",
    description: "Multi-tenant coworking space membership management platform",
    url: "https://coworkspace-pied.vercel.app",
    siteName: "Deskora",
    images: [{ url: '/logo.webp', width: 1024, height: 1024 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deskora - Membership Management",
    description: "Multi-tenant coworking space membership management platform",
    images: ['/logo.webp'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var e=localStorage.getItem("theme");if(e==="dark"||(!e&&window.matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`
        }} />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var e=localStorage.getItem("i18nextLng");if(e==="ar"){document.documentElement.dir="rtl";document.documentElement.lang="ar"}else{document.documentElement.dir="ltr";document.documentElement.lang="en"}}catch(e){}})()`
        }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Deskora",
            "url": "https://coworkspace-pied.vercel.app",
          }),
        }} />
      </head>
      <body><ErrorBoundary><Providers>{children}</Providers></ErrorBoundary></body>
    </html>
  )
}
