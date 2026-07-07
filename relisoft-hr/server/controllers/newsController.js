import { globalNews, localNews } from '../utils/newsFallbackData.js';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE = 'https://newsapi.org/v2';

const categoryMap = {
  politics: 'general',
  weather: 'science',
  economy: 'business',
  sports: 'sports',
};

function fetchFromNewsAPI(endpoint, params) {
  const query = new URLSearchParams({ ...params, apiKey: NEWS_API_KEY });
  return fetch(`${NEWS_API_BASE}${endpoint}?${query}`).then((r) => r.json());
}

function newsAPIToArticle(item, category) {
  return {
    id: `newsapi-${item.publishedAt}-${Math.random().toString(36).slice(2, 6)}`,
    title: item.title,
    summary: item.description || 'No description available.',
    source: item.source?.name || 'NewsAPI',
    date: item.publishedAt ? item.publishedAt.split('T')[0] : new Date().toISOString().split('T')[0],
    image: item.urlToImage || getCategoryEmoji(category),
    category,
    url: item.url,
    author: item.author,
  };
}

function getCategoryEmoji(cat) {
  const map = { politics: '🏛️', weather: '🌤️', economy: '📈', sports: '🏆' };
  return map[cat] || '📰';
}

export async function getNews(req, res) {
  try {
    const { scope = 'local', country = 'India', category = 'all', state, city, search } = req.query;

    // Try NewsAPI if key is configured
    if (NEWS_API_KEY && NEWS_API_KEY.length > 5) {
      try {
        let results = [];

        if (scope === 'global') {
          const cat = categoryMap[category] || 'general';
          const params = { language: 'en', pageSize: 12, category: cat };
          if (search) params.q = search;
          const data = await fetchFromNewsAPI('/top-headlines', params);
          if (data.status === 'ok' && data.articles) {
            results = data.articles.map((a) => newsAPIToArticle(a, category || 'general'));
          }
        } else {
          const cat = category !== 'all' ? `(${category})` : '';
          const queryParts = [country];
          if (state) queryParts.push(state);
          if (city) queryParts.push(city);
          const q = `${queryParts.join(' ')} ${cat}`.trim();

          const params = { language: 'en', pageSize: 12, sortBy: 'publishedAt', q };
          const data = await fetchFromNewsAPI('/everything', params);
          if (data.status === 'ok' && data.articles) {
            results = data.articles.map((a) => newsAPIToArticle(a, category));
          }
        }

        if (results.length > 0) {
          return res.json({ success: true, articles: results, source: 'newsapi' });
        }
      } catch (apiErr) {
        console.error('NewsAPI error, falling back to demo data:', apiErr.message);
      }
    }

    // Fallback to demo data
    let articles = [];
    if (scope === 'global') {
      const catArticles = globalNews[category];
      articles = category !== 'all' ? (catArticles || []) : Object.values(globalNews).flat();
    } else {
      articles = getFallbackLocal(country, state, city, category);
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      articles = articles.filter(
        (a) => a.title?.toLowerCase().includes(q) || a.summary?.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      articles,
      source: NEWS_API_KEY && NEWS_API_KEY.length > 5 ? 'newsapi-fallback' : 'demo',
    });
  } catch (err) {
    console.error('News controller error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch news' });
  }
}

function getFallbackLocal(country, state, city, category) {
  const data = localNews[country];
  if (!data) return [];

  const stateKey = state || '_default';
  const cityKey = city || '_default';
  const sources = [
    data[stateKey]?.[cityKey],
    data[stateKey]?.['_default'],
    data['_default'],
  ];

  let articles = [];
  for (const src of sources) {
    if (src) {
      if (category !== 'all') {
        articles = src[category] || [];
      } else {
        articles = Object.values(src).flat();
      }
      if (articles.length > 0) break;
    }
  }
  return articles;
}
