import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, Github, Linkedin } from 'lucide-react';
const EarthScene = lazy(() => import('./EarthScene.jsx'));
export default function Hero({ reduceMotion, githubUrl, linkedinUrl }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const globeY = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const fullHeadline = 'I build full-stack apps that solve real problems.';
  const [typedHeadline, setTypedHeadline] = useState(reduceMotion ? fullHeadline : '');
  const [typing, setTyping] = useState(!reduceMotion);
  const reduceMotionRef = useRef(reduceMotion);
  reduceMotionRef.current = reduceMotion;
  useEffect(() => {
    if (reduceMotionRef.current) { setTypedHeadline(fullHeadline); setTyping(false); return undefined; }
    let index = 0;
    const timer = window.setInterval(() => {
      if (reduceMotionRef.current) { window.clearInterval(timer); setTypedHeadline(fullHeadline); setTyping(false); return; }
      index += 1;
      setTypedHeadline(fullHeadline.slice(0, index));
      if (index >= fullHeadline.length) { window.clearInterval(timer); setTyping(false); }
    }, 32);
    return () => window.clearInterval(timer);
  }, []);
  return <section ref={heroRef} className="hero section-shell" id="home" aria-labelledby="hero-title"><div className="hero-copy">
    <motion.div className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}><span className="eyebrow-dot" /> Full-stack developer <i /> Open to internships</motion.div>
    <motion.h1 id="hero-title" aria-label={fullHeadline} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .08 }}>{typedHeadline.slice(0, 35)}{typedHeadline.length > 35 && <span>{typedHeadline.slice(35)}</span>}{typing && <i className="typing-caret" aria-hidden="true" />}</motion.h1>
    <motion.p className="hero-description" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .16 }}>I&apos;m Shivam Mishra, a 2nd-year CSE student at UCER, Prayagraj. I work with Java, Spring Boot, React and MySQL, and use AI where it actually helps. My latest project, MindSync, is a mental health support platform for students.</motion.p>
    <motion.div className="hero-actions" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .24 }}><a className="button button-primary" href="#projects">View projects <ArrowRight size={17} /></a><a className="button button-quiet" href="/resume.pdf" download>Download resume <ArrowDown size={15} /></a></motion.div>
    <div className="hero-socials"><a href={githubUrl} target="_blank" rel="noreferrer"><Github size={16} /> GitHub <ArrowUpRight size={13} /></a><a href={linkedinUrl} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn <ArrowUpRight size={13} /></a></div>
    <motion.div className="hero-location" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5 }}><span className="location-pulse" /> Prayagraj, India</motion.div>
  </div><motion.div className="globe-wrap" style={reduceMotion ? undefined : { y: globeY }}><div className="globe-glow" /><Suspense fallback={<div className="earth-loading" aria-hidden="true" />}><EarthScene reduceMotion={reduceMotion} /></Suspense></motion.div></section>;
}
