import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getExamSummaries, getTotalQuestions, getDomainStats, DOMAINS } from '../lib/exams.js'
import { getState, bestScore, getAttempts, clearAllWrong } from '../lib/storage.js'

export default function Exams() {
  const exams = getExamSummaries()
  const totalQ = getTotalQuestions()
  const [, force] = useState(0)
  const state = getState()
  const domainCounts = getDomainStats()

  function resetMistakes() {
    if (window.confirm(`Reset all ${state.wrong.length} saved mistakes? This can’t be undone.`)) {
      clearAllWrong()
      force((n) => n + 1)
    }
  }

  return (
    <div>
      <div className="page-head">
        <span className="kicker">Mock Tests</span>
        <h1>Practice Exams</h1>
        <div className="sub">{exams.length} exams · {totalQ.toLocaleString()} questions. Practice mode gives instant feedback; Exam mode is timed and scored.</div>
      </div>

      {/* Special modes */}
      <div className="grid cols-3" style={{ marginBottom: 28 }}>
        <Link to="/quiz/mixed" className="card" style={{ background: 'var(--purple)', color: '#fff' }}>
          <div className="card-top"><div className="num-badge" style={{ background: '#fff', color: '#000' }}>★</div><span className="tag">50 Q</span></div>
          <h3>Mixed Mock Exam</h3>
          <div className="card-desc" style={{ color: '#fff', opacity: .9 }}>50 random questions pulled from the entire bank. The closest thing to the real exam.</div>
        </Link>
        <div className="card" style={{ background: state.wrong.length ? 'var(--yellow)' : 'var(--paper)', color: state.wrong.length ? '#000' : 'var(--ink)' }}>
          <div className="card-top"><div className="num-badge">↻</div><span className="tag red">{state.wrong.length}</span></div>
          <h3>Retry My Mistakes</h3>
          <div className="card-desc">Re-attempt every question you’ve gotten wrong. Spaced repetition for weak spots.</div>
          <div className="card-foot">
            {state.wrong.length
              ? <>
                  <Link to="/quiz/retry" className="btn dark sm">Start retry</Link>
                  <button onClick={resetMistakes} className="btn sm">Reset</button>
                </>
              : <span className="tag ghost">Take an exam to populate this</span>}
          </div>
        </div>
        <div className="card" style={{ background: 'var(--orange)', color: '#000' }}>
          <div className="card-top"><div className="num-badge" style={{ background: '#000', color: '#fff' }}>i</div></div>
          <h3>Exam facts</h3>
          <div className="card-desc" style={{ color: '#000', opacity: .75 }}>65 questions · 90 min · pass ≈ 700/1000 (~70%). Multiple choice + multiple response.</div>
        </div>
      </div>

      <h2 style={{ fontSize: 22, marginBottom: 6 }}>Practice by domain</h2>
      <div className="qmeta" style={{ marginBottom: 14 }}>Drill one exam domain at a time — split into ordered sets, plus a randomized option. Instant feedback, untimed.</div>
      <div className="grid cols-4" style={{ marginBottom: 30 }}>
        {DOMAINS.map((d) => {
          const count = domainCounts[d.name] || 0
          const setCount = Math.ceil(count / d.chunk)
          return (
            <Link key={d.slug} to={`/domain/${d.slug}`} className="card">
              <div className="card-top">
                <span className="tag orange">{d.weight}% of exam</span>
                <span className="tag ghost">{count} Q</span>
              </div>
              <h3 style={{ fontSize: 17 }}>{d.name}</h3>
              <div className="card-desc">{setCount} sets of {d.chunk} + randomize</div>
              <div className="card-foot"><span className="btn purple sm">View sets →</span></div>
            </Link>
          )
        })}
      </div>

      <h2 style={{ fontSize: 22, marginBottom: 14 }}>All exams</h2>
      <div className="grid cols-3">
        {exams.map((e) => {
          const best = bestScore(e.id)
          const tries = getAttempts(e.id).length
          return (
            <div key={e.id} className="card">
              <div className="card-top">
                <div className="num-badge">{e.number}</div>
                <div className="row" style={{ gap: 6 }}>
                  {e.hasExplanations && <span className="tag green">Explained</span>}
                  {best != null && <span className={`tag ${best >= 70 ? 'green' : 'red'}`}>{best}%</span>}
                </div>
              </div>
              <h3>{e.title}</h3>
              <div className="card-desc">{e.total} questions{tries ? ` · ${tries} attempt${tries > 1 ? 's' : ''}` : ''}</div>
              <div className="card-foot">
                <Link to={`/quiz/${e.id}?mode=practice`} className="btn sm">Practice</Link>
                <Link to={`/quiz/${e.id}?mode=exam`} className="btn dark sm">Exam mode</Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
