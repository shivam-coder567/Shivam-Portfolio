import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Skills from './components/Skills.jsx';
import Projects from './components/Projects.jsx';
import GithubContributions from './components/GithubContributions.jsx';
import Contact from './components/Contact.jsx';
import { portfolio } from './data/portfolio.js';
import './App.css';

export const GITHUB_URL = portfolio.contact.github;
export const LINKEDIN_URL = portfolio.contact.linkedin;

export default function App() {
  const [activeSection, setActiveSection] = useState('');
  const [theme, setTheme] = useState(() => {
    if (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light') return 'light';
    try { return localStorage.getItem('portfolio-theme') === 'light' ? 'light' : 'dark'; }
    catch { return 'dark'; }
  });
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#070910' : '#f5f7fb');
    try { localStorage.setItem('portfolio-theme', theme); } catch { /* Theme remains active for this visit if storage is unavailable. */ }
  }, [theme]);
  useEffect(() => {
    const sections = ['about', 'projects', 'github-contributions', 'skills', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: '-22% 0px -58% 0px', threshold: [0, 0.15, 0.35, 0.6] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return <><Navbar activeSection={activeSection} theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} /><main><Hero reduceMotion={Boolean(reduceMotion)} githubUrl={GITHUB_URL} linkedinUrl={LINKEDIN_URL} /><About /><Projects reduceMotion={Boolean(reduceMotion)} /><GithubContributions /><Skills /><Contact githubUrl={GITHUB_URL} linkedinUrl={LINKEDIN_URL} email={portfolio.contact.email} /></main><footer className="site-footer section-shell"><a className="footer-brand" href="#home"><span className="brand-mark">SM</span> Shivam Mishra</a><span>Designed &amp; built with curiosity.</span><span>© {new Date().getFullYear()}</span></footer></>;
}
