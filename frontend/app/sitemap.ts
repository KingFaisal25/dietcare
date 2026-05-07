import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nutripro.id';

  // Static routes
  const staticRoutes = [
    '',
    '/program/body-goals',
    '/program/body-for-baby',
    '/program/clinicare',
    '/harga',
    '/ahli-gizi',
    '/tentang-kami',
    '/cek-kondisi',
    '/blog',
    '/syarat-ketentuan',
    '/kebijakan-privasi',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // In real app, fetch dynamic routes from API
  // const blogPosts = await getBlogPosts();
  // const nutritionists = await getActiveNutritionists();

  // Mock dynamic routes
  const dynamicRoutes = [
    { url: `${baseUrl}/blog/cara-diet-sehat`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${baseUrl}/ahli-gizi/-sgz`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
