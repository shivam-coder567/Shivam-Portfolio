import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Coffee, Network } from 'lucide-react';
import {
  siC, siCss, siGit, siGithub, siHtml5, siJavascript, siMysql, siPostgresql, siReact, siSpringboot, siTypescript,
} from 'simple-icons';
import Reveal from './Reveal.jsx';

const skills = [
  { name: 'Java', icon: Coffee, color: '#f89820', description: 'Used to build the Number System Converter desktop application and for programming practice.' },
  { name: 'C', simpleIcon: siC, color: '#659ad2', description: 'A core language in my computer science studies and programming practice.' },
  { name: 'JavaScript', simpleIcon: siJavascript, color: '#f7df1e', description: 'Used to build interactive web interfaces and application features.' },
  { name: 'TypeScript', simpleIcon: siTypescript, color: '#3178c6', description: 'Used in the MindSync project stack for typed application code.' },
  { name: 'HTML', simpleIcon: siHtml5, color: '#e34f26', description: 'Used to structure web pages and application interfaces.' },
  { name: 'CSS', simpleIcon: siCss, color: '#1572b6', description: 'Used to style responsive interfaces and shape the visual details of my projects.' },
  { name: 'React', simpleIcon: siReact, color: '#61dafb', description: 'Used to build the MindSync interface and reusable portfolio UI.' },
  { name: 'Spring Boot', simpleIcon: siSpringboot, color: '#6db33f', description: 'Part of my current backend learning and Java development.' },
  { name: 'MySQL', simpleIcon: siMysql, color: '#4479a1', description: 'Used while learning relational data storage and backend application development.' },
  { name: 'PostgreSQL', simpleIcon: siPostgresql, color: '#4169e1', description: 'Used in the MindSync project stack for relational data storage.' },
  { name: 'REST APIs', icon: Network, color: '#72d9d1', description: 'Used to connect application interfaces with backend services.' },
  { name: 'AI APIs', icon: BrainCircuit, color: '#b69cff', description: 'Exploring how AI services can add useful capabilities to applications.' },
  { name: 'Git', simpleIcon: siGit, color: '#f05032', description: 'Used to track project changes and manage source code.' },
  { name: 'GitHub', simpleIcon: siGithub, color: '#dce5f5', description: 'Used to host projects and share my development work.' },
];

function SkillCard({ skill, index, reduceMotion }) {
  const [open, setOpen] = useState(false);
  const Icon = skill.icon;
  return <motion.button
    type="button"
    className={`skill-icon-card${open ? ' is-open' : ''}`}
    style={{ '--skill-accent': skill.color }}
    aria-label={`${skill.name}: ${skill.description}`}
    aria-expanded={open}
    onClick={() => setOpen((value) => !value)}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    initial={reduceMotion ? false : { opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: false, amount: .2 }}
    transition={{ duration: .38, delay: reduceMotion ? 0 : index * .025, ease: [.22, 1, .36, 1] }}
  >
    <span className="skill-icon-mark" aria-hidden="true">
      {skill.simpleIcon ? <svg viewBox="0 0 24 24"><path d={skill.simpleIcon.path} /></svg> : <Icon size={28} strokeWidth={1.8} />}
    </span>
    <span className="skill-detail" aria-hidden="true"><strong>{skill.name}</strong><span>{skill.description}</span></span>
  </motion.button>;
}

export default function Skills({ reduceMotion }) {
  return <section className="skills section-shell content-section" id="skills" aria-labelledby="skills-heading">
    <Reveal className="section-kicker"><span>04</span><span className="kicker-rule" /> SKILLS</Reveal>
    <Reveal className="projects-heading skills-heading" delay={.06}><h2 id="skills-heading">Skills</h2><p>What I use while learning and building.</p></Reveal>
    <Reveal as="p" className="skills-instruction" delay={.08}>Hover or focus an icon for the full story →</Reveal>
    <div className="skills-icons" aria-label="Technologies and tools">
      {skills.map((skill, index) => <SkillCard key={skill.name} skill={skill} index={index} reduceMotion={reduceMotion} />)}
    </div>
  </section>;
}
