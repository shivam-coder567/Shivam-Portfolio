import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const SESSION_KEY = 'shivam-portfolio-view-counted-v1';
let visitRequest;
let visitStartedInPage = false;

async function requestCount(functionName) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });
  if (!response.ok) throw new Error(`View counter request failed: ${response.status}`);
  const count = await response.json();
  if (!Number.isSafeInteger(count) || count < 0) throw new Error('View counter returned an invalid total.');
  return count;
}

export default function PortfolioViews() {
  const [count, setCount] = useState(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setUnavailable(true);
      return () => { mounted = false; };
    }

    let countedThisSession = false;
    try { countedThisSession = window.sessionStorage.getItem(SESSION_KEY) === '1'; }
    catch { countedThisSession = visitStartedInPage; }

    if (!countedThisSession) {
      visitStartedInPage = true;
      try { window.sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* Keep the in-page guard when session storage is unavailable. */ }
      visitRequest = requestCount('increment_portfolio_views');
    }

    const totalRequest = countedThisSession
      ? (visitRequest || requestCount('get_portfolio_views'))
      : visitRequest;

    totalRequest.then((total) => {
      if (mounted) setCount(total);
    }).catch(() => {
      if (mounted) setUnavailable(true);
    });

    return () => { mounted = false; };
  }, []);

  return <span className="portfolio-views" aria-live="polite" aria-label={unavailable ? 'Portfolio view count unavailable' : count === null ? 'Loading portfolio view count' : `${count.toLocaleString()} portfolio views`}>
    <Eye size={13} aria-hidden="true" />
    {unavailable ? <span>views unavailable</span> : count === null ? <span>loading views</span> : <><strong>{count.toLocaleString()}</strong><span>views</span></>}
  </span>;
}
