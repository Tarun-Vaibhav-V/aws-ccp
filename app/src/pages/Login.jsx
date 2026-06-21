import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import worldRaw from '../assets/world.svg?raw'

const LAND = worldRaw
  .replace(/<\?xml[\s\S]*?\?>/, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')

// AWS regions placed in the map's 2000x857 coordinate space.
const NODES = [
  [378, 300], [560, 300], [730, 690], [965, 175], [1050, 200],
  [1095, 690], [1430, 430], [1600, 520], [1722, 290], [1800, 690],
]
const ROUTE_PAIRS = [
  [1, 3], [3, 4], [4, 6], [6, 7], [7, 8], [1, 2], [7, 9], [0, 8], [0, 1], [4, 5], [2, 5],
]
function arc([ax, ay], [bx, by]) {
  const mx = (ax + bx) / 2
  const my = (ay + by) / 2
  const dist = Math.hypot(bx - ax, by - ay)
  const lift = dist * 0.16
  return `M${ax} ${ay} Q${mx} ${my - lift} ${bx} ${by}`
}
const ROUTES = ROUTE_PAIRS.map(([a, b]) => arc(NODES[a], NODES[b]))

function WorldMap() {
  return (
    <svg className="worldmap" viewBox="0 0 2000 857" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g className="wm-land" dangerouslySetInnerHTML={{ __html: LAND }} />

      {ROUTES.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#ff9900" strokeWidth="2.4" strokeOpacity="0.7" strokeDasharray="3 11" strokeLinecap="round">
          <animate attributeName="stroke-dashoffset" from="0" to="-28" dur={`${0.9 + (i % 4) * 0.25}s`} repeatCount="indefinite" />
        </path>
      ))}

      {ROUTES.map((d, i) => (
        <g key={`p${i}`}>
          <path id={`rt${i}`} d={d} fill="none" stroke="none" />
          <circle r="6" fill="#ffc46b">
            <animateMotion dur={`${2.6 + (i % 5) * 0.5}s`} repeatCount="indefinite" rotate="auto">
              <mpath href={`#rt${i}`} />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" dur={`${2.6 + (i % 5) * 0.5}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {NODES.map(([x, y], i) => (
        <g key={`n${i}`}>
          <rect x={x - 7} y={y - 7} width="14" height="14" fill="#ff9900" stroke="#0c0c0c" strokeWidth="2" />
          <circle cx={x} cy={y} r="9" fill="none" stroke="#ff9900" strokeWidth="2.5">
            <animate attributeName="r" values="9;26;9" dur="2.4s" begin={`${i * 0.22}s`} repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.9;0;0.9" dur="2.4s" begin={`${i * 0.22}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  )
}

export default function Login() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [status, setStatus] = useState('idle')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (auth?.user && status === 'idle') navigate('/', { replace: true })
  }, [auth?.user, status, navigate])

  function win() { setStatus('success'); setMsg(''); setTimeout(() => navigate('/', { replace: true }), 1200) }
  function fail(e) { setStatus('error'); setMsg(e?.message || 'Something went wrong. Try again.') }

  async function onPassword(e) {
    e.preventDefault()
    if (!auth?.isCloudEnabled) return fail({ message: 'Cloud login is not configured.' })
    if (mode === 'signup' && !name.trim()) return fail({ message: 'Please enter your name.' })
    setStatus('working'); setMsg('')
    const { data, error } = mode === 'signup'
      ? await auth.signUp(email.trim(), password, name.trim())
      : await auth.signInWithPassword(email.trim(), password)
    if (error) return fail(error)
    if (mode === 'signup' && !data?.session) { setStatus('sent'); setMsg('Check your email to confirm your account, then sign in.'); return }
    win()
  }
  async function onGoogle() {
    if (!auth?.isCloudEnabled) return fail({ message: 'Cloud login is not configured.' })
    setStatus('working')
    const { error } = await auth.signInWithGoogle()
    if (error) fail(error)
  }
  async function onMagic() {
    if (!auth?.isCloudEnabled) return fail({ message: 'Cloud login is not configured.' })
    if (!email.trim()) return fail({ message: 'Enter your email first.' })
    setStatus('working')
    const { error } = await auth.signInWithMagicLink(email.trim())
    if (error) return fail(error)
    setStatus('sent'); setMsg('Magic link sent! Check your email to continue.')
  }

  const working = status === 'working'
  const statusLine = working ? 'AUTHENTICATING' : status === 'success' ? 'ACCESS GRANTED' : status === 'error' ? 'ACCESS DENIED' : 'ONLINE'
  const dojoClass = `dojo${working ? ' dojo--working' : ''}${status === 'success' ? ' dojo--success' : ''}${status === 'error' ? ' dojo--error' : ''}`

  return (
    <div className={dojoClass}>
      <div className="dojo-art">
        <div className="term">
          <div className="term-bar">
            <span className="td td-r" /><span className="td td-y" /><span className="td td-g" />
            <span className="term-title">AWS GLOBAL INFRASTRUCTURE</span>
          </div>
          <div className="term-body">
            <WorldMap />
            <div className="dojo-flash" />
            <div className="term-overlay">
              <div className="to-eyebrow">AWS Student Builder Group · VITC</div>
              <div className="to-title">Certified Cloud Practitioner<br />Prep Platform</div>
              <div className="to-sub">Mock exams · Learning modules · Study guide</div>
            </div>
            <div className="term-status">
              STATUS : <b className={status === 'error' ? 'st-err' : status === 'success' ? 'st-ok' : ''}>{statusLine}</b><br />
              REGION : <b>GLOBAL</b>
            </div>
          </div>
        </div>
      </div>

      <div className="dojo-form">
        <span className="kicker">AWS Certified Cloud Practitioner · CLF-C02</span>
        <h1>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
        <p className="dojo-tagline">A free exam-prep platform with full-length mock tests, learning modules, and a study guide to help you pass the CCP certification. Sign in to save your progress across devices — or continue as a guest.</p>

        <button className="btn google-btn" onClick={onGoogle} disabled={working}>
          <svg className="g-logo" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continue with Google
        </button>

        <div className="dojo-or"><span /> or <span /></div>

        <form onSubmit={onPassword}>
          {mode === 'signup' && (
            <input className="dojo-input" type="text" placeholder="your full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          )}
          <input className="dojo-input" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <div className="dojo-input pw">
            <input type={showPw ? 'text' : 'password'} placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={6} />
            <button type="button" onClick={() => setShowPw((s) => !s)} aria-label="toggle password">{showPw ? '🙈' : '👁'}</button>
          </div>
          <div className="dojo-actions">
            <button className="btn primary" type="submit" disabled={working}>
              {working ? 'Connecting…' : mode === 'signup' ? 'Create account →' : 'Log in →'}
            </button>
            <button className="btn purple" type="button" onClick={onMagic} disabled={working}>Magic link</button>
          </div>
        </form>

        {msg && <div className={`dojo-msg ${status === 'error' ? 'err' : 'ok'}`}>{msg}</div>}

        <div className="dojo-foot">
          {mode === 'signin'
            ? <>No account? <button className="linklike" onClick={() => { setMode('signup'); setMsg('') }}>Sign up</button></>
            : <>Already have an account? <button className="linklike" onClick={() => { setMode('signin'); setMsg('') }}>Log in</button></>}
          <span className="sep">·</span>
          <Link to="/" className="linklike">Continue as guest →</Link>
        </div>

        {!auth?.isCloudEnabled && <div className="dojo-msg err" style={{ marginTop: 12 }}>Cloud login isn’t configured on this build — guest mode only.</div>}
      </div>
    </div>
  )
}
