/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://v0-prompt-generator.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
  },
  transform: async (config, path) => {
    // Custom priority for different pages
    const customPriority = {
      '/': 1.0,
      '/examples': 0.8,
    };

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: customPriority[path] || config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
