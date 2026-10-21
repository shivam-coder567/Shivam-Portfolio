import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, Github, Linkedin } from 'lucide-react';
let globeModulePromise;
const loadGlobe = () => globeModulePromise ??= import('./EarthScene.jsx');
const EarthScene = lazy(loadGlobe);
export default function Hero({ reduceMotion, githubUrl, linkedinUrl }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const globeY = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const fullHeadline = 'I build full-stack apps that solve real problems.';
  const [typedHeadline, setTypedHeadline] = useState(reduceMotion ? fullHeadline : '');
  const [typing, setTyping] = useState(!reduceMotion);
  const reduceMotionRef = useRef(reduceMotion);
  reduceMotionRef.current = reduceMotion;
  useEffect(() => { loadGlobe(); }, []);
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
    <motion.p className="hero-description" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .16 }}>I&apos;m a second-year CSE student at UCER, Prayagraj, building full-stack applications with Java, Spring Boot, React, and MySQL. I enjoy turning real-world problems into useful software and exploring where AI can make it better.</motion.p>
    <motion.div className="hero-actions" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .24 }}><a className="button button-primary" href="#projects">View Projects <ArrowRight size={17} aria-hidden="true" /></a><a className="button button-quiet" href="/resume/Shivam-Mishra-Resume.pdf" target="_blank" rel="noopener noreferrer">Download Resume <ArrowDown size={15} aria-hidden="true" /></a></motion.div>
    <div className="hero-socials"><a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile"><Github size={16} aria-hidden="true" /> GitHub <ArrowUpRight size={13} aria-hidden="true" /></a><a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile"><Linkedin size={16} aria-hidden="true" /> LinkedIn <ArrowUpRight size={13} aria-hidden="true" /></a></div>
    <motion.div className="hero-location" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5 }}><span className="location-pulse" /> Prayagraj, India</motion.div>
  </div><motion.div className="globe-wrap" style={reduceMotion ? undefined : { y: globeY }}><div className="globe-glow" /><Suspense fallback={<div className="globe-placeholder" aria-hidden="true" />}><EarthScene reduceMotion={reduceMotion} /></Suspense></motion.div></section>;
}
