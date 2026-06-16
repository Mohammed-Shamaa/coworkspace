import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Coworkspace - Membership Management",
  description: "Multi-tenant coworking space membership management platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var e=localStorage.getItem("theme");if(e==="dark"||(!e&&window.matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`
        }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
