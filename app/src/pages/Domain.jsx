import { Link, useParams } from 'react-router-dom'
import { getDomain, getDomainPool, getDomainSets } from '../lib/exams.js'
import { bestScore } from '../lib/storage.js'

export default function Domain() {
  const { slug } = useParams()
  const d = getDomain(slug)
  if (!d) return <div className="empty">Domain not found. <Link to="/exams">Back to mock tests</Link></div>

  const total = getDomainPool(slug).length
  const sets = getDomainSets(slug)

  return (
    <div>
      <div className="breadcrumb"><Link to="/exams">Mock Tests</Link> / Practice by domain</div>
      <div className="page-head">
        <span className="kicker">Domain · {d.weight}% of exam</span>
        <h1>{d.name}</h1>
        <div className="sub">{total} questions, split into {sets.length} ordered sets of {d.chunk} (last set holds the remainder). Each set is fixed, so you can work through them in order. Or take a random drill.</div>
      </div>

      {/* Randomize */}
      <div className="grid cols-3" style={{ marginBottom: 28 }}>
        <Link to={`/quiz/domain-${slug}-random`} className="card" style={{ background: 'var(--purple)', color: '#fff' }}>
          <div className="card-top">
            <div className="num-badge" style={{ background: '#fff', color: '#000' }}>⤮</div>
            <span className="tag">{Math.min(d.chunk, total)} Q</span>
          </div>
          <h3>Randomized drill</h3>
          <div className="card-desc" style={{ color: '#fff', opacity: .9 }}>A fresh random {Math.min(d.chunk, total)} pulled from all {total} {d.name} questions every time.</div>
        </Link>
      </div>

      <h2 style={{ fontSize: 22, marginBottom: 14 }}>Ordered sets</h2>
      <div className="grid cols-3">
        {sets.map((s) => {
          const id = `domain-${slug}-set-${s.n}`
          const best = bestScore(id)
          return (
            <Link key={s.n} to={`/quiz/${id}`} className="card">
              <div className="card-top">
                <div className="num-badge">{s.n}</div>
                <div className="row" style={{ gap: 6 }}>
                  {s.count < d.chunk && <span className="tag">remainder</span>}
                  {best != null && <span className={`tag ${best >= 70 ? 'green' : 'red'}`}>{best}%</span>}
                </div>
              </div>
              <h3>Set {s.n}</h3>
              <div className="card-desc">Questions {s.start}–{s.end} · {s.count} questions</div>
              <div className="card-foot"><span className="btn purple sm">Start set →</span></div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
