import { SitemapStream, streamToPromise } from 'sitemap';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import xmlFormatter from 'xml-formatter';

const now = new Date().toISOString();
const lastmodFormatted = now.slice(0, 19) + '+00:00';

const routes = [
  { url: '/', changefreq: 'daily', priority: 1.0, lastmod: lastmodFormatted },
  {
    url: '/form',
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: lastmodFormatted,
  },
  {
    url: '/thank-you',
    changefreq: 'monthly',
    priority: 0.3,
    lastmod: lastmodFormatted,
  },
];

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: 'https://hikers.su' });
  routes.forEach((route) => sitemap.write(route));
  sitemap.end();

  const data = await streamToPromise(sitemap);

  // Форматируем XML с отступами
  const formattedXml = xmlFormatter(data.toString(), { indentation: '  ' });

  const filePath = resolve('public/sitemap.xml');

  writeFileSync(filePath, formattedXml);
  console.log('Sitemap generated');
}

generateSitemap();
