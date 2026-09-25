import { useEffect, useMemo, useState } from 'react';
import { catalogueItems, engineeredHues, hueScales } from '../../lib/catalogue';

type SearchResult = { type: string; title: string; detail: string; href: string };

export default function SiteSearch({ base }: { base: string }) {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  const results = useMemo<SearchResult[]>(() => {
    if (!normalized) return [];
    const matches = (value: string) => value.toLowerCase().includes(normalized);
    const scales = hueScales
      .filter((item) => matches(`${item.name} ${item.description} ${item.tags.join(' ')}`))
      .map((item) => ({ type: 'Scale', title: item.name, detail: item.family, href: `${base}/scales/${item.slug}` }));
    const engineered = engineeredHues
      .filter((item) => matches(`${item.name} ${item.description} ${item.tags.join(' ')}`))
      .map((item) => ({ type: 'Engineered hue', title: item.name, detail: item.hex, href: `${base}/engineered/${item.slug}` }));
    const colours = catalogueItems
      .filter((item) => matches(`${item.name} ${item.description} ${item.tags.join(' ')} ${item.hex}`))
      .slice(0, 12)
      .map((item) => ({ type: 'Colour', title: `${item.name} ${item.step ?? ''}`.trim(), detail: item.hex, href: `${base}/${item.type === 'scale' ? `scales/${item.slug}` : `engineered/${item.slug}`}` }));
    return [...scales, ...engineered, ...colours].slice(0, 20);
  }, [base, normalized]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        document.getElementById('site-search')?.focus();
      }
      if (event.key === 'Escape') setQuery('');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="site-search">
      <label className="visually-hidden" htmlFor="site-search">Search Chroma</label>
      <input id="site-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search /" aria-expanded={Boolean(normalized)} />
      {normalized && (
        <div className="search-results" role="listbox" aria-label="Search results">
          {results.length ? results.map((result) => (
            <a href={result.href} className="search-result" key={`${result.type}-${result.href}`} role="option">
              <span><strong>{result.title}</strong><small>{result.type}</small></span>
              <span className="hex">{result.detail}</span>
            </a>
          )) : <p className="search-empty">No results found.</p>}
        </div>
      )}
    </div>
  );
}
