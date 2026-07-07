import { useState, useEffect, useCallback } from 'react'
import { Globe, Search, Newspaper, Loader2, MapPin, Radio, ExternalLink, RefreshCw } from 'lucide-react'
import { newsAPI } from '../../services/api'
import { categories, countries, countryFlags, stateOptions, cityOptions } from '../../data/newsData'

const countryFlagsMap = {
  India: '🇮🇳', USA: '🇺🇸', UAE: '🇦🇪', Singapore: '🇸🇬', UK: '🇬🇧',
}

export default function NewsFeed() {
  const [scope, setScope] = useState('local')
  const [country, setCountry] = useState('India')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('')

  const fetchNews = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        scope,
        country,
        category: activeCategory !== 'all' ? activeCategory : undefined,
        state: state || undefined,
        city: city || undefined,
        search: searchQuery || undefined,
      }
      const { data } = await newsAPI.get(params)
      if (data.success) {
        setArticles(data.articles || [])
        setSource(data.source || '')
      } else {
        setArticles([])
      }
    } catch (err) {
      console.error('Failed to fetch news:', err)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [scope, country, state, city, activeCategory, searchQuery])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const states = (stateOptions[country] || ['']).filter(Boolean)
  const cities = state && cityOptions[`${country}/${state}`] ? (cityOptions[`${country}/${state}`] || ['']).filter(Boolean) : []

  const locationLabel = scope === 'global' ? 'Global' : [country, state, city].filter(Boolean).join(' / ')

  const sourceBadge = source === 'newsapi'
    ? { label: 'Live via NewsAPI', color: 'bg-green-100 text-green-700' }
    : source === 'newsapi-fallback'
      ? { label: 'NewsAPI (limited) + Demo', color: 'bg-amber-100 text-amber-700' }
      : { label: 'Demo Data (no API key)', color: 'bg-gray-100 text-gray-500' }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Newspaper className="h-8 w-8" style={{ color: 'var(--moss)' }} />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">News Feed</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sourceBadge.color}`}>
                  {sourceBadge.label}
                </span>
              </div>
              <p className="text-sm text-gray-400">{locationLabel} &middot; {articles.length} articles</p>
            </div>
            <button onClick={fetchNews} disabled={loading}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setScope('local')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${scope === 'local' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <MapPin className="h-4 w-4 inline mr-1" />Local
              </button>
              <button onClick={() => setScope('global')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${scope === 'global' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Globe className="h-4 w-4 inline mr-1" />Global
              </button>
            </div>

            {scope === 'local' && (
              <>
                <select value={country} onChange={(e) => { setCountry(e.target.value); setState(''); setCity('') }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none">
                  {countries.map((c) => <option key={c} value={c}>{countryFlagsMap[c] || '🌍'} {c}</option>)}
                </select>

                {states.length > 0 && (
                  <select value={state} onChange={(e) => { setState(e.target.value); setCity('') }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none">
                    <option value="">All {country}</option>
                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}

                {cities.length > 0 && state && (
                  <select value={city} onChange={(e) => setCity(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none">
                    <option value="">All {state}</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </>
            )}

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..." autoFocus
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {categories.map((cat) => {
            const count = cat.id === 'all' ? articles.length : articles.filter((a) => a.category === cat.id).length
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border transition-colors ${activeCategory === cat.id ? 'text-white border-transparent' : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'}`}
                style={activeCategory === cat.id ? { background: 'var(--moss)' } : {}}>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-xs ml-1 ${activeCategory === cat.id ? 'opacity-80' : 'text-gray-400'}`}>({count})</span>
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--moss)' }} />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <Newspaper className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg">No news articles found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or search query</p>
            <button onClick={fetchNews} className="mt-4 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              <RefreshCw className="h-3.5 w-3.5 inline mr-1" /> Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => {
              const catInfo = categories.find((c) => c.id === article.category)
              return (
                <div key={article.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl flex-shrink-0">{article.image || '📰'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${activeCategory === article.category ? 'text-white' : 'text-gray-500 bg-gray-100'}`}
                          style={activeCategory === article.category ? { background: 'var(--moss)' } : {}}>
                          {catInfo?.icon} {article.category}
                        </span>
                        <span className="text-[10px] text-gray-400">{article.date}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{article.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-3">{article.summary}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                      <Radio className="h-3 w-3" />
                      <span>{article.source}</span>
                    </div>
                    {article.url && (
                      <a href={article.url} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] font-medium text-gray-400 hover:text-relisoft-600 transition-colors flex items-center gap-0.5">
                        Read more <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          <Radio className="h-3 w-3 inline mr-1" />
          {articles.length} article{articles.length !== 1 ? 's' : ''}
          {source === 'newsapi' ? ' fetched live from NewsAPI' : ' from demo data'}
          &middot; Set <code className="bg-gray-100 px-1 rounded">NEWS_API_KEY</code> in server .env for live news
        </div>
      </div>
    </div>
  )
}
