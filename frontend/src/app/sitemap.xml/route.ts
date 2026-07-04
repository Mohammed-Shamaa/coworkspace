import { NextResponse } from 'next/server'

const BASE_URL = 'https://coworkspace-pied.vercel.app'

export async function GET() {
  const lastMod = new Date().toISOString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>${BASE_URL}/</loc>
<lastmod>${lastMod}</lastmod>
<changefreq>monthly</changefreq>
<priority>1</priority>
</url>
<url>
<loc>${BASE_URL}/auth/login</loc>
<lastmod>${lastMod}</lastmod>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>
<url>
<loc>${BASE_URL}/auth/register</loc>
<lastmod>${lastMod}</lastmod>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>
<url>
<loc>${BASE_URL}/about</loc>
<lastmod>${lastMod}</lastmod>
<changefreq>monthly</changefreq>
<priority>0.7</priority>
</url>
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  })
}
