import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - Coworkspace',
  description: 'Building a global coworking platform from Gaza, connecting people, ideas, and opportunities worldwide.',
  openGraph: {
    title: 'About Us - Coworkspace',
    description: 'Building a global coworking platform from Gaza, connecting people, ideas, and opportunities worldwide.',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
