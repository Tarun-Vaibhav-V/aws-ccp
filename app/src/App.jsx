import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Modules from './pages/Modules.jsx'
import ModulePage from './pages/ModulePage.jsx'
import Exams from './pages/Exams.jsx'
import Domain from './pages/Domain.jsx'
import Glossary from './pages/Glossary.jsx'
import Quiz from './pages/Quiz.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', ico: '◧', end: true },
  { to: '/modules', label: 'Learn', ico: '▤' },
  { to: '/exams', label: 'Mock Tests', ico: '✎' },
  { to: '/glossary', label: 'Glossary', ico: '▥' },
]

function Sidebar({ open, onClose, theme, setTheme }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <img src={`${import.meta.env.BASE_URL}aws-logo.jpg`} alt="logo" />
        <div>
          <div className="brand-name">AWS CCP</div>
          <div className="brand-sub">BUILT BY AWS CLOUD CLUB · VITC</div>
        </div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="ico">{n.ico}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-foot">
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀ LIGHT MODE' : '☾ DARK MODE'}
        </button>
        <div style={{ marginTop: 12 }}>Community study platform.<br />Built for learners, free forever.</div>
      </div>
    </aside>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ccp-theme') || 'light')
  const [menuOpen, setMenuOpen] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ccp-theme', theme)
  }, [theme])

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [loc.pathname])

  return (
    <div className="app">
      <button className="btn dark sm menu-btn" onClick={() => setMenuOpen((o) => !o)}>☰ Menu</button>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} theme={theme} setTheme={setTheme} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/modules/:id" element={<ModulePage />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/domain/:slug" element={<Domain />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}
