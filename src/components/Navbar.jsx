import { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
const links = [['about', 'About'], ['projects', 'Projects'], ['github-contributions', 'GitHub'], ['skills', 'Skills'], ['contact', 'Contact']];
export default function Navbar({ activeSection, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileImageFailed, setProfileImageFailed] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return <header className="site-header"><div className="header-inner section-shell"><a className="brand" href="#home" onClick={closeMenu} aria-label="Shivam Mishra home"><span className={`brand-mark brand-avatar${profileImageFailed ? ' image-failed' : ''}`}>{profileImageFailed ? 'SM' : <img src="/images/realimage.png" alt="" onError={() => setProfileImageFailed(true)} />}</span><span>Shivam Mishra</span></a>
    <button className="menu-toggle" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
    <nav id="main-navigation" className={menuOpen ? 'nav-links nav-open' : 'nav-links'} aria-label="Main navigation">{links.map(([id, label]) => <a key={id} className={activeSection === id ? 'active' : ''} href={`#${id}`} aria-current={activeSection === id ? 'location' : undefined} onClick={closeMenu}>{label}</a>)}</nav>
    <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'light'} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}</button>
  </div></header>;
}
