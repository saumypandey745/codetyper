/**
 * Centralized SEO & Domain Configuration for CodeTyper
 * Supports VITE_PUBLIC_SITE_URL environment variable, falls back to window.location.origin
 * or default https://codetyper-beta.vercel.app
 */

export const getSiteUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PUBLIC_SITE_URL) {
    return import.meta.env.VITE_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    // For local dev, return the local origin
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin;
    }
    return origin.replace(/\/+$/, '');
  }
  return 'https://codetyper-beta.vercel.app';
};

export const SITE_URL = getSiteUrl();

export const updateDocumentHead = ({
  title,
  description,
  path = '',
  image = '/og-image.jpg',
  type = 'website'
}) => {
  if (typeof document === 'undefined') return;

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}${path.startsWith('/') ? path : '/' + path}`;

  if (title) {
    document.title = title;
  }

  // Helper to set or create meta tag
  const setMeta = (attr, key, content) => {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  if (description) {
    setMeta('name', 'description', description);
    setMeta('property', 'og:description', description);
    setMeta('name', 'twitter:description', description);
  }

  if (title) {
    setMeta('property', 'og:title', title);
    setMeta('name', 'twitter:title', title);
  }

  setMeta('property', 'og:type', type);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('name', 'twitter:url', canonicalUrl);

  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image.startsWith('/') ? image : '/' + image}`;
  setMeta('property', 'og:image', fullImageUrl);
  setMeta('name', 'twitter:image', fullImageUrl);

  // Update canonical link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);
};
