import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getModule, modules } from '../data/modules.js'
import { isModuleDone, toggleModuleDone, recordVisit } from '../lib/storage.js'

function Section({ s }) {
  switch (s.type) {
    case 'h2': return <h2>{s.text}</h2>
    case 'h3': return <h3>{s.text}</h3>
    case 'p': return <p>{s.text}</p>
    case 'list': return <ul>{s.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
    case 'services': return <div style={{ margin: '12px 0' }}>{s.items.map((it, i) => <span key={i} className="svc-pill">{it}</span>)}</div>
    case 'callout': return (
      <div className="callout">
        <div className="lab">{s.label || 'Note'}</div>
        <p style={{ margin: '6px 0 0' }}>{s.text}</p>
      </div>
    )
    default: return null
  }
}

export default function ModulePage() {
  const { id } = useParams()
  const m = getModule(id)
  const [done, setDone] = useState(() => (m ? isModuleDone(m.id) : false))

  useEffect(() => {
    if (m) recordVisit({ type: 'module', id: m.id, title: m.title })
  }, [m])

  if (!m) return <div className="empty">Module not found. <Link to="/modules">Back to modules</Link></div>

  const next = modules.find((x) => x.number === m.number + 1)
  const prev = modules.find((x) => x.number === m.number - 1)

  return (
    <div>
      <div className="breadcrumb"><Link to="/modules">Modules</Link> / Module {m.number}</div>

      <div className="page-head">
        <span className="kicker">Module {m.number} · {m.domain}</span>
        <h1>{m.title}</h1>
        <div className="sub">{m.blurb} · ~{m.minutes} min</div>
      </div>

      <div className="box" style={{ marginBottom: 24 }}>
        <div className="lab" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em' }}>Learning objectives</div>
        <ul className="module-body" style={{ marginTop: 8 }}>
          {m.objectives.map((o, i) => <li key={i}>{o}</li>)}
        </ul>
      </div>

      {m.status === 'ready' ? (
        <div className="module-body box">
          {m.content.map((s, i) => <Section key={i} s={s} />)}
        </div>
      ) : (
        <div className="box">
          <span className="tag">Outline</span>
          <p style={{ marginTop: 12 }}>Full written content for this module is coming next. Here are the key services and concepts it covers — you can already practice them in the mock tests.</p>
          <div style={{ marginTop: 8 }}>
            {(m.keyServices || []).map((k, i) => <span key={i} className="svc-pill">{k}</span>)}
          </div>
          <Link to="/exams" className="btn primary sm" style={{ marginTop: 16 }}>✎ Practice these in a mock test</Link>
        </div>
      )}

      <div className="divider" />
      <div className="row" style={{ justifyContent: 'space-between' }}>
        {prev
          ? <Link className="btn" to={`/modules/${prev.id}`}>← Prev: {prev.title}</Link>
          : <Link className="btn" to="/modules">← All modules</Link>}
        <button
          className={`btn ${done ? 'primary' : ''}`}
          onClick={() => { toggleModuleDone(m.id); setDone((d) => !d) }}
        >
          {done ? '✓ Marked complete' : 'Mark as complete'}
        </button>
        {next
          ? <Link className="btn purple" to={`/modules/${next.id}`}>Next: {next.title} →</Link>
          : <Link className="btn purple" to="/exams">Take a mock test →</Link>}
      </div>
    </div>
  )
}
