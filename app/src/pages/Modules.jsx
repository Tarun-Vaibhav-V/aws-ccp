import { Link } from 'react-router-dom'
import { modules } from '../data/modules.js'
import { getState } from '../lib/storage.js'

export default function Modules() {
  const done = getState().modulesDone

  return (
    <div>
      <div className="page-head">
        <span className="kicker">Learning Path</span>
        <h1>Learning Modules</h1>
        <div className="sub">12 modules following the official AWS Cloud Practitioner Essentials curriculum.</div>
      </div>

      <div className="grid cols-3">
        {modules.map((m) => {
          const isDone = done.includes(m.id)
          const ready = m.status === 'ready'
          return (
            <Link key={m.id} to={`/modules/${m.id}`} className="card">
              <div className="card-top">
                <div className="num-badge">{m.number}</div>
                <div className="row" style={{ gap: 6 }}>
                  {isDone && <span className="tag green">✓ Done</span>}
                  {!ready && <span className="tag">Outline</span>}
                </div>
              </div>
              <h3>{m.title}</h3>
              <div className="card-desc">{m.blurb}</div>
              <div className="card-foot">
                <span className="tag orange">{m.domain}</span>
                <span className="tag ghost">{m.minutes} min</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
