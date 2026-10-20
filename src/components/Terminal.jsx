import { useEffect, useMemo, useRef, useState } from 'react';
import projects from '../data/projects.js';
import { portfolio } from '../data/portfolio.js';

const commands = ['help', 'about', 'skills', 'projects', 'contact', 'resume', 'github', 'clear'];
function commandOutput(command) {
  switch (command) {
    case 'help': return [`Available commands: ${commands.join(' · ')}`];
    case 'about': return [`${portfolio.name} · ${portfolio.education}`, `Interested in ${portfolio.interests.join(', ')}.`];
    case 'skills': return Object.entries(portfolio.skills).map(([group, skills]) => `${group}: ${skills.join(', ')}`);
    case 'projects': return projects.map((project) => `${project.name} — ${project.description}`);
    case 'contact': return [`Email: ${portfolio.contact.email}`, `GitHub: ${portfolio.contact.github}`, `LinkedIn: ${portfolio.contact.linkedin}`];
    case 'resume': {
      const link = document.createElement('a'); link.href = '/resume.pdf'; link.download = 'Shivam-Mishra-Resume.pdf'; link.click();
      return ['Starting resume download…'];
    }
    case 'github': window.open(portfolio.contact.github, '_blank', 'noopener,noreferrer'); return ['Opening GitHub…'];
    case 'clear': return [];
    default: return [`Command not found: ${command}. Type "help" to see available commands.`];
  }
}

export default function Terminal() {
  const input = useRef(null);
  const end = useRef(null);
  const history = useRef([]);
  const historyIndex = useRef(0);
  const [value, setValue] = useState('');
  const [output, setOutput] = useState([['', ['Type "help" to explore this portfolio.']]]);
  const matches = useMemo(() => commands.filter((command) => command.startsWith(value.trim().toLowerCase())), [value]);

  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [output]);

  const submit = (event) => {
    event.preventDefault();
    const command = value.trim().toLowerCase();
    if (!command) return;
    history.current.push(command); historyIndex.current = history.current.length;
    const result = commandOutput(command);
    setOutput((current) => command === 'clear' ? [] : [...current, [command, result]]);
    setValue('');
  };
  const onKeyDown = (event) => {
    if (event.key === 'ArrowUp' && historyIndex.current > 0) { event.preventDefault(); historyIndex.current -= 1; setValue(history.current[historyIndex.current]); }
    if (event.key === 'ArrowDown') { event.preventDefault(); historyIndex.current = Math.min(historyIndex.current + 1, history.current.length); setValue(history.current[historyIndex.current] || ''); }
    if (event.key === 'Tab') {
      event.preventDefault();
      if (matches.length === 1) setValue(`${matches[0]} `);
      else if (matches.length > 1) setOutput((current) => [...current, ['', `Suggestions: ${matches.join(', ')}`]]);
    }
  };

  return <div className="terminal-shell" aria-label="Portfolio command terminal" onClick={() => input.current?.focus()}>
    <div className="terminal-titlebar"><div className="terminal-dots" aria-hidden="true"><i /><i /><i /></div><span>shivam@portfolio: ~</span><span className="terminal-status">interactive</span></div>
    <div className="terminal-content" aria-live="polite">
      <>
        {output.map(([command, lines], index) => <div className="terminal-entry" key={`${index}-${command}`}>
          {command && <p className="terminal-command"><span>›</span> {command}</p>}
          {lines.map((line, lineIndex) => <p className="terminal-output" key={`${index}-${lineIndex}`}>{line}</p>)}
        </div>)}
        <form className="terminal-input-row" onSubmit={submit}><label htmlFor="terminal-command"><span aria-hidden="true">›</span><span className="sr-only">Enter a terminal command</span></label><input id="terminal-command" ref={input} value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={onKeyDown} autoComplete="off" spellCheck="false" aria-label="Terminal command" placeholder="type a command…" /></form>
        <div ref={end} />
      </>
    </div>
  </div>;
}
