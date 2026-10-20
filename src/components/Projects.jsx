import { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import {
  siReact, siTypescript, siVite, siNodedotjs, siExpress, siSupabase,
  siPostgresql, siReactrouter, siLucide, siHtml5, siCss, siJavascript, siFirebase,
} from 'simple-icons';
import projects from '../data/projects.js';
import Reveal from './Reveal.jsx';
const revealEase = [.22, 1, .36, 1];
const projectImages = import.meta.glob('../assets/projects/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
const techIcons = {
  'react.js': siReact,
  typescript: siTypescript,
  vite: siVite,
  'node.js': siNodedotjs,
  'express.js': siExpress,
  supabase: siSupabase,
  postgresql: siPostgresql,
  'react router': siReactrouter,
  'lucide react': siLucide,
  html: siHtml5,
  css: siCss,
  javascript: siJavascript,
  firebase: siFirebase,
};
function TechnologyBadge({ technology }) {
  const icon = techIcons[technology.toLowerCase()];
  const color = icon?.hex === '000000' ? '#cbd5e1' : icon ? `#${icon.hex}` : undefined;
  return <span className="project-tech-badge" key={technology}>
    {icon && <svg viewBox="0 0 24 24" aria-hidden="true" style={{ color }}><path d={icon.path} /></svg>}
    {technology}
  </span>;
}
function ProjectCard({ project, index, reduceMotion }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imagePath = `../assets/projects/${project.image}`;
  const image = projectImages[imagePath];
  const links = [
    { label: 'Live', href: project.demo, Icon: ExternalLink, className: 'project-link-demo' },
    { label: 'GitHub', href: project.code, Icon: Github, className: 'project-link-source' },
  ];
  const title = project.name === 'MindSync'
    ? <>Mind<span className="project-name-accent">Sync</span></>
    : <>Expiry<span className="project-name-accent">Mitra</span></>;
  return <motion.article className={`project-card project-card-${index + 1}`} initial={reduceMotion ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .16 }} whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: .2 } }} transition={{ duration: .52, delay: reduceMotion ? 0 : index * .08, ease: revealEase }}>
    <div className="project-screenshot">{image && !imageFailed && <img src={image} alt={`${project.name} dashboard screenshot`} loading="lazy" onError={() => setImageFailed(true)} />}</div>
    <div className="project-card-body"><div className="project-card-title-row"><h3>{title}</h3><span className="project-status"><i aria-hidden="true" />{project.status}</span></div><p>{project.description}</p><div className="project-tech">{project.tech.map((technology) => <TechnologyBadge technology={technology} key={technology} />)}</div><div className="project-card-divider" aria-hidden="true" /><div className="project-links">{links.map(({ label, href, Icon, className }, index) => <Fragment key={label}><a className={className} href={href} target="_blank" rel="noreferrer"><Icon size={16} aria-hidden="true" />{label}<ArrowUpRight size={13} aria-hidden="true" /></a>{index === 0 && <span className="project-link-divider" aria-hidden="true" />}</Fragment>)}</div></div>
  </motion.article>;
}
export default function Projects({ reduceMotion }) {
  return <section className="projects section-shell content-section" id="projects" aria-labelledby="projects-heading"><Reveal className="projects-heading"><h2 id="projects-heading">Projects</h2><span className="projects-heading-rule" aria-hidden="true" /></Reveal><Reveal className="projects-intro" delay={.04}><p>Some things I&apos;ve built to solve real problems.</p></Reveal><div className="project-grid">{projects.map((project, index) => <ProjectCard project={project} index={index} reduceMotion={reduceMotion} key={project.name} />)}</div></section>;
}
