import { RawRssItem } from './types';

// Cross-browser & resilient RSS fetcher with CORS proxy fallbacks
export async function fetchRssFeed(feedUrl: string): Promise<RawRssItem[]> {
  const proxyEndpoints = [
    // 1. AllOrigins JSON endpoint
    `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`,
    // 2. rss2json converter (free tier without API key)
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`,
    // 3. Direct fetch (works in some web environments / servers)
    feedUrl
  ];

  for (const endpoint of proxyEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, application/xml, text/xml, */*'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const contentType = response.headers.get('content-type') || '';

      // Check if it's rss2json JSON output
      if (endpoint.includes('rss2json.com')) {
        const json = await response.json();
        if (json.status === 'ok' && Array.isArray(json.items) && json.items.length > 0) {
          return json.items.map((item: any) => ({
            title: item.title,
            description: item.description,
            link: item.link,
            pubDate: item.pubDate,
            imageUrl: item.thumbnail || item.enclosure?.link,
            category: Array.isArray(item.categories) ? item.categories[0] : item.categories,
            guid: item.guid,
            author: item.author
          }));
        }
      }

      // Check if it's allorigins wrapper
      if (endpoint.includes('allorigins.win')) {
        const json = await response.json();
        if (json.contents) {
          const parsed = parseXmlToItems(json.contents);
          if (parsed.length > 0) return parsed;
        }
      }

      // Direct XML string
      const text = await response.text();
      const parsed = parseXmlToItems(text);
      if (parsed.length > 0) return parsed;
    } catch {
      // Try next endpoint
      continue;
    }
  }

  throw new Error(`Gagal mengambil RSS dari ${feedUrl} melalui seluruh endpoint proxy.`);
}

// Client-side DOMParser XML Parser
function parseXmlToItems(xmlText: string): RawRssItem[] {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parse errors
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      return [];
    }

    const items: RawRssItem[] = [];
    const itemNodes = xmlDoc.querySelectorAll('item, entry');

    itemNodes.forEach((node) => {
      const title = node.querySelector('title')?.textContent || '';
      const link = node.querySelector('link')?.textContent || node.querySelector('link')?.getAttribute('href') || '';
      const description = node.querySelector('description, summary, content')?.textContent || '';
      const pubDate = node.querySelector('pubDate, published, updated')?.textContent || '';
      const guid = node.querySelector('guid, id')?.textContent || '';
      const author = node.querySelector('author, dc\\:creator, creator')?.textContent || '';
      
      // Extract image enclosure or media:thumbnail/content
      let imageUrl = '';
      const enclosure = node.querySelector('enclosure[type^="image"]');
      if (enclosure) {
        imageUrl = enclosure.getAttribute('url') || '';
      }
      if (!imageUrl) {
        const mediaThumbnail = node.querySelector('media\\:thumbnail, thumbnail');
        if (mediaThumbnail) {
          imageUrl = mediaThumbnail.getAttribute('url') || '';
        }
      }
      if (!imageUrl) {
        const mediaContent = node.querySelector('media\\:content[type^="image"], media\\:content');
        if (mediaContent) {
          imageUrl = mediaContent.getAttribute('url') || '';
        }
      }

      if (title && (link || description)) {
        items.push({
          title,
          description,
          link,
          pubDate,
          imageUrl,
          guid,
          author
        });
      }
    });

    return items;
  } catch (err) {
    console.warn('Failed to parse XML string', err);
    return [];
  }
}
