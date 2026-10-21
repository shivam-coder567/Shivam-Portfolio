import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal.jsx';

const USERNAME = 'shivam-coder567';
// Both endpoints return the same v4 response shape. Prefer the GraphQL-backed
// service and keep the existing endpoint as a fallback for availability.
const API_URLS = [
  `https://github-contributions-api.ncd.ai/v4/${USERNAME}?y=last`,
  `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`,
];
const monthName = (date) => new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(date);

async function fetchCalendar(url, parentSignal) {
  const controller = new AbortController();
  const abortRequest = () => controller.abort();
  parentSignal.addEventListener('abort', abortRequest, { once: true });
  const timeout = window.setTimeout(abortRequest, 9000);

  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`Contribution request failed: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.contributions) || !data.contributions.length || !Number.isFinite(data.total?.lastYear)) {
      throw new Error('Contribution data is unavailable.');
    }
    return data;
  } finally {
    window.clearTimeout(timeout);
    parentSignal.removeEventListener('abort', abortRequest);
  }
}

function buildWeeks(contributions) {
  if (!contributions?.length) return { weeks: [], months: [] };
  const firstDate = new Date(`${contributions[0].date}T00:00:00Z`);
  const startOffset = firstDate.getUTCDay();
  const allDays = [...Array(startOffset).fill(null), ...contributions];
  while (allDays.length % 7) allDays.push(null);
  const weeks = [];
  const months = new Map();
  for (let i = 0; i < allDays.length; i += 7) {
    const week = allDays.slice(i, i + 7);
    const weekIndex = weeks.length;
    weeks.push(week);
    for (const day of week) {
      if (!day) continue;
      const date = new Date(`${day.date}T00:00:00Z`);
      if (weekIndex === 0 || date.getUTCDate() === 1) months.set(weekIndex, monthName(date));
    }
  }
  return { weeks, months: [...months.entries()] };
}

export default function GithubContributions() {
  const [calendar, setCalendar] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const panelRef = useRef(null);
  const tooltipRef = useRef(null);
  const activeSquareRef = useRef(null);
  const touchPointerRef = useRef(false);
  const lastTouchTapDateRef = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    const loadCalendar = async () => {
      for (const url of API_URLS) {
        if (controller.signal.aborted) return;
        try {
          const data = await fetchCalendar(url, controller.signal);
          setCalendar(data);
          return;
        } catch (error) {
          if (controller.signal.aborted) return;
        }
      }
      if (!controller.signal.aborted) setLoadError(true);
    };
    loadCalendar();
    return () => controller.abort();
  }, []);

  const { weeks, months } = useMemo(() => buildWeeks(calendar?.contributions), [calendar]);

  useLayoutEffect(() => {
    if (!activeDay || !panelRef.current || !tooltipRef.current || !activeSquareRef.current) return undefined;
    const placeTooltip = () => {
      const panel = panelRef.current.getBoundingClientRect();
      const square = activeSquareRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const gap = 7;
      const left = Math.max(8, Math.min(square.left - panel.left + square.width / 2 - tooltip.width / 2, panel.width - tooltip.width - 8));
      const above = square.top - panel.top - tooltip.height - gap;
      const top = above >= 8 ? above : Math.min(square.bottom - panel.top + gap, panel.height - tooltip.height - 8);
      setTooltipPosition({ left, top, placement: above >= 8 ? 'above' : 'below' });
    };
    placeTooltip();
    window.addEventListener('resize', placeTooltip);
    const scroll = panelRef.current.querySelector('.contribution-scroll');
    scroll?.addEventListener('scroll', placeTooltip, { passive: true });
    return () => {
      window.removeEventListener('resize', placeTooltip);
      scroll?.removeEventListener('scroll', placeTooltip);
    };
  }, [activeDay]);

  const showDay = (day, element) => {
    activeSquareRef.current = element;
    setActiveDay(day);
  };
  const dateLabel = (date) => new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));

  return <section className="github-contributions section-shell content-section" id="github-contributions" aria-labelledby="contributions-heading">
    <Reveal className="section-kicker"><span>03</span><span className="kicker-rule" /> GITHUB CONTRIBUTIONS</Reveal>
    <Reveal className="contributions-heading" delay={.06}>
      <h2 id="contributions-heading">GitHub</h2>
      <a href={`https://github.com/${USERNAME}`} target="_blank" rel="noreferrer" aria-label={`View ${USERNAME} on GitHub`}>@{USERNAME}<ArrowUpRight size={14} aria-hidden="true" /></a>
    </Reveal>
    <Reveal className={`contributions-panel${activeDay ? ' has-active-tooltip' : ''}`} delay={.1} ref={panelRef}>
      {calendar ? <>
        <div className="contribution-months" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
          {months.map(([week, label]) => <span key={`${week}-${label}`} style={{ gridColumn: week + 1 }}>{label}</span>)}
        </div>
        <div className="contribution-scroll" tabIndex="0" aria-label="Contribution activity calendar; scroll horizontally to view all weeks">
          <div className="contribution-grid" role="grid" aria-label={`Contribution calendar for ${USERNAME} over the last year`} style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(8px, 1fr))` }}>
            {weeks.flatMap((week, weekIndex) => week.map((day, dayIndex) => day
              ? <span key={day.date} className={`contribution-day level-${day.level}`} role="gridcell" tabIndex="0" aria-label={`${day.count ? `${day.count} contribution${day.count === 1 ? '' : 's'}` : 'No contributions'} on ${dateLabel(day.date)}`} onPointerDown={(event) => { touchPointerRef.current = event.pointerType === 'touch'; }} onMouseEnter={(event) => showDay(day, event.currentTarget)} onMouseLeave={(event) => { const nextIsSquare = event.relatedTarget instanceof Element && event.relatedTarget.matches('.contribution-day:not(.is-empty)'); if (!nextIsSquare && document.activeElement !== event.currentTarget) setActiveDay(null); }} onFocus={(event) => showDay(day, event.currentTarget)} onBlur={() => setActiveDay(null)} onClick={(event) => { if (touchPointerRef.current && lastTouchTapDateRef.current === day.date) { setActiveDay(null); lastTouchTapDateRef.current = null; } else { showDay(day, event.currentTarget); if (touchPointerRef.current) lastTouchTapDateRef.current = day.date; } touchPointerRef.current = false; }} style={{ gridColumn: weekIndex + 1, gridRow: dayIndex + 1 }} />
              : <span key={`empty-${weekIndex}-${dayIndex}`} className="contribution-day is-empty" aria-hidden="true" style={{ gridColumn: weekIndex + 1, gridRow: dayIndex + 1 }} />))}
          </div>
        </div>
        {activeDay && <div ref={tooltipRef} className="contribution-tooltip" role="tooltip" data-placement={tooltipPosition?.placement || 'above'} style={tooltipPosition ? { left: tooltipPosition.left, top: tooltipPosition.top } : { left: -9999, top: -9999 }}>
          <strong>{activeDay.count ? `${activeDay.count.toLocaleString()} contribution${activeDay.count === 1 ? '' : 's'}` : 'No contributions'}</strong>
          <span>{dateLabel(activeDay.date)}</span>
        </div>}
        <div className="contributions-footer"><p><strong>{calendar.total.lastYear.toLocaleString()}</strong> contributions in the last year on <a href={`https://github.com/${USERNAME}`} target="_blank" rel="noreferrer">GitHub</a>.</p><div className="contribution-legend" aria-label="Contribution intensity legend"><span>Less</span><i className="level-0" /><i className="level-1" /><i className="level-2" /><i className="level-3" /><i className="level-4" /><span>More</span></div></div>
      </> : <div className="contributions-state" role="status">{loadError ? <>Contribution data is unavailable right now. <a href={`https://github.com/${USERNAME}`} target="_blank" rel="noreferrer">View GitHub profile <ArrowUpRight size={13} /></a></> : 'Loading contribution activity…'}</div>}
    </Reveal>
  </section>;
}
