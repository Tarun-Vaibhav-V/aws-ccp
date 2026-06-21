import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Modules from './pages/Modules.jsx'
import ModulePage from './pages/ModulePage.jsx'
import Exams from './pages/Exams.jsx'
import Domain from './pages/Domain.jsx'
import Glossary from './pages/Glossary.jsx'
import Quiz from './pages/Quiz.jsx'
import Login from './pages/Login.jsx'
import { useAuth } from './lib/auth.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', ico: '◧', end: true },
  { to: '/modules', label: 'Learn', ico: '▤' },
  { to: '/exams', label: 'Mock Tests', ico: '✎' },
  { to: '/glossary', label: 'Glossary', ico: '▥' },
]

function AccountChip() {
  const auth = useAuth()
  if (!auth?.isCloudEnabled) return null
  if (auth.user) {
    const name = auth.user.email || 'Signed in'
    return (
      <div className="account-chip">
        <div className="acc-email" title={name}>● {name}</div>
        <button className="theme-toggle" onClick={() => auth.signOut()}>⎋ SIGN OUT</button>
      </div>
    )
  }
  return (
    <Link className="theme-toggle signin-cta" to="/login">⚔ SIGN IN / SYNC</Link>
  )
}

function Sidebar({ open, onClose, theme, setTheme }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <img src={`${import.meta.env.BASE_URL}aws-logo.jpg`} alt="logo" />
        <div>
          <div className="brand-name">AWS CCP</div>
          <div className="brand-sub">AWS STUDENT BUILDER GROUP · VITC</div>
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
        <AccountChip />
        <button className="theme-toggle" style={{ marginTop: 8 }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀ LIGHT MODE' : '☾ DARK MODE'}
        </button>
        <div style={{ marginTop: 12 }}>Built by <strong>AWS Student Builder Group · VITC</strong><br />Free community study platform.</div>
      </div>
    </aside>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ccp-theme') || 'light')
  const [menuOpen, setMenuOpen] = useState(false)
  const [progressVer, setProgressVer] = useState(0)
  const loc = useLocation()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ccp-theme', theme)
  }, [theme])

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [loc.pathname])

  useEffect(() => {
    const h = () => setProgressVer((v) => v + 1)
    window.addEventListener('ccp-progress-updated', h)
    return () => window.removeEventListener('ccp-progress-updated', h)
  }, [])

  // Login is a full-screen experience without the app shell.
  if (loc.pathname === '/login') return <Login />

  return (
    <div className="app">
      <button className="btn dark sm menu-btn" onClick={() => setMenuOpen((o) => !o)}>☰ Menu</button>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} theme={theme} setTheme={setTheme} />
      <main className="main">
        <div key={progressVer}>
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
        </div>
        <footer className="app-footer">
          <span>AWS CCP — a free, community study platform.</span>
          <span className="footer-mark">Built by <strong>AWS Student Builder Group · VITC</strong></span>
        </footer>
      </main>
    </div>
  )
}
