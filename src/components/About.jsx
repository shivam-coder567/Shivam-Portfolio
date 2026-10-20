import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Reveal from './Reveal.jsx';
const Terminal = lazy(() => import('./Terminal.jsx'));
export default function About() {
  const terminalSlot = useRef(null);
  const [showTerminal, setShowTerminal] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setShowTerminal(true); observer.disconnect(); } }, { rootMargin: '160px' });
    observer.observe(terminalSlot.current);
    return () => observer.disconnect();
  }, []);
  return <section className="about section-shell content-section" id="about" aria-labelledby="about-heading"><Reveal className="section-kicker"><span>01</span><span className="kicker-rule" /> ABOUT ME</Reveal><Reveal className="about-grid" delay={.06}><h2 id="about-heading">Learning by<br /><span>building.</span></h2><div className="about-detail"><p>I&apos;m Shivam Mishra, a computer science student interested in web development, backend systems and building useful software. I&apos;m currently focused on Java, Spring Boot, React and MySQL, and I&apos;m open to internship opportunities.</p></div></Reveal><Reveal as="div" ref={terminalSlot} className="terminal-slot" delay={.12}>{showTerminal && <Suspense fallback={<div className="terminal-shell terminal-loading">Loading terminal…</div>}><Terminal /></Suspense>}</Reveal></section>;
}
