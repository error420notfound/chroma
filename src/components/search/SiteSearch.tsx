import { useEffect, useMemo, useState } from 'react';
import { catalogueItems, engineeredHues, hueScales } from '../../lib/catalogue';

type SearchResult = { type: string; title: string; detail: string; href: string };

export default function SiteSearch({ base }: { base: string }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalized = query.trim().toLowerCase();
  const results = useMemo<SearchResult[]>(() => {
    if (!normalized) return [];
    const matches = (value: string) => value.toLowerCase().includes(normalized);
    const scales = hueScales
      .filter((item) => matches(`${item.name} ${item.description} ${item.tags.join(' ')}`))
      .map((item) => ({
        type: 'Scale',
        title: item.name,
        detail: item.family,
        href: `${base}/scales/${item.slug}`,
      }));
    const engineered = engineeredHues
      .filter((item) => matches(`${item.name} ${item.description} ${item.tags.join(' ')}`))
      .map((item) => ({
        type: 'Engineered hue',
        title: item.name,
        detail: item.hex,
        href: `${base}/engineered/${item.slug}`,
      }));
    const colours = catalogueItems
      .filter((item) =>
        matches(`${item.name} ${item.description} ${item.tags.join(' ')} ${item.hex}`),
      )
      .slice(0, 12)
      .map((item) => ({
        type: 'Colour',
        title: `${item.name} ${item.step ?? ''}`.trim(),
        detail: item.hex,
        href: `${base}/${item.type === 'scale' ? `scales/${item.slug}` : `engineered/${item.slug}`}`,
      }));
    return [...scales, ...engineered, ...colours].slice(0, 20);
  }, [base, normalized]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        document.getElementById('site-search')?.focus();
      }
      if (event.key === 'Escape') setQuery('');
      if (document.activeElement?.id === 'site-search' && results.length) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setActiveIndex((index) => Math.min(results.length - 1, index + 1));
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setActiveIndex((index) => Math.max(0, index - 1));
        }
        if (event.key === 'Enter' && activeIndex >= 0) {
          event.preventDefault();
          window.location.href = results[activeIndex].href;
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="site-search">
      <label className="visually-hidden" htmlFor="site-search">
        Search Chroma
      </label>
      <input
        id="site-search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(-1);
        }}
        placeholder="Search /"
        aria-expanded={Boolean(normalized)}
        aria-controls="site-search-results"
        aria-autocomplete="list"
        role="combobox"
        aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
      />
      {normalized && (
        <div className="search-results" id="site-search-results" aria-label="Search results">
          {results.length ? (
            results.map((result, index) => (
              <a
                id={`search-result-${index}`}
                href={result.href}
                className="search-result"
                key={`${result.type}-${result.href}`}
                aria-current={activeIndex === index ? 'true' : undefined}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span>
                  <strong>{result.title}</strong>
                  <small>{result.type}</small>
                </span>
                <span className="hex">{result.detail}</span>
              </a>
            ))
          ) : (
            <p className="search-empty">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}
