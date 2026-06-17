import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.grodd-smm.online';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/abdo/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
