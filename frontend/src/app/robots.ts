import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/members', '/api'],
    },
    sitemap: 'https://coworkspace-pied.vercel.app/sitemap.xml',
  }
}
