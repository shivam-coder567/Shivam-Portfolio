import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal.jsx';

const USERNAME = 'shivam-coder567';
const API_URL = `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`;
const monthName = (date) => new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(date);

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
  useEffect(() => {
    const controller = new AbortController();
    fetch(API_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Contribution request failed: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data.contributions) || !Number.isFinite(data.total?.lastYear)) throw new Error('Contribution data is unavailable.');
        setCalendar(data);
      })
      .catch((error) => { if (error.name !== 'AbortError') setLoadError(true); });
    return () => controller.abort();
  }, []);

  const { weeks, months } = useMemo(() => buildWeeks(calendar?.contributions), [calendar]);

  return <section className="github-contributions section-shell content-section" id="github-contributions" aria-labelledby="contributions-heading">
    <Reveal className="section-kicker"><span>03</span><span className="kicker-rule" /> GITHUB CONTRIBUTIONS</Reveal>
    <Reveal className="contributions-heading" delay={.06}>
      <h2 id="contributions-heading">GitHub</h2>
      <a href={`https://github.com/${USERNAME}`} target="_blank" rel="noreferrer" aria-label={`View ${USERNAME} on GitHub`}>@{USERNAME}<ArrowUpRight size={14} aria-hidden="true" /></a>
    </Reveal>
    <Reveal className="contributions-panel" delay={.1}>
      {calendar ? <>
        <div className="contribution-months" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
          {months.map(([week, label]) => <span key={`${week}-${label}`} style={{ gridColumn: week + 1 }}>{label}</span>)}
        </div>
        <div className="contribution-scroll" tabIndex="0" aria-label="Contribution activity calendar; scroll horizontally to view all weeks">
          <div className="contribution-grid" role="grid" aria-label={`Contribution calendar for ${USERNAME} over the last year`} style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(8px, 1fr))` }}>
            {weeks.flatMap((week, weekIndex) => week.map((day, dayIndex) => day
              ? <span key={day.date} className={`contribution-day level-${day.level}`} role="gridcell" aria-label={`${day.count} contributions on ${day.date}`} title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`} style={{ gridColumn: weekIndex + 1, gridRow: dayIndex + 1 }} />
              : <span key={`empty-${weekIndex}-${dayIndex}`} className="contribution-day is-empty" aria-hidden="true" style={{ gridColumn: weekIndex + 1, gridRow: dayIndex + 1 }} />))}
          </div>
        </div>
        <div className="contributions-footer"><p><strong>{calendar.total.lastYear.toLocaleString()}</strong> contributions in the last year on <a href={`https://github.com/${USERNAME}`} target="_blank" rel="noreferrer">GitHub</a>.</p><div className="contribution-legend" aria-label="Contribution intensity legend"><span>Less</span><i className="level-0" /><i className="level-1" /><i className="level-2" /><i className="level-3" /><i className="level-4" /><span>More</span></div></div>
      </> : <div className="contributions-state" role="status">{loadError ? <>Contribution data is unavailable right now. <a href={`https://github.com/${USERNAME}`} target="_blank" rel="noreferrer">View GitHub profile <ArrowUpRight size={13} /></a></> : 'Loading contribution activity…'}</div>}
    </Reveal>
  </section>;
}
