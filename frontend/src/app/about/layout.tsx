import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - Coworkspace',
  description: 'Building a global coworking platform from Gaza, connecting people, ideas, and opportunities worldwide.',
  openGraph: {
    title: 'About Us - Coworkspace',
    description: 'Building a global coworking platform from Gaza, connecting people, ideas, and opportunities worldwide.',
    url: 'https://coworkspace-pied.vercel.app/about',
    siteName: 'Coworkspace',
    images: [{ url: '/logo.png', width: 1024, height: 1024 }],
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
