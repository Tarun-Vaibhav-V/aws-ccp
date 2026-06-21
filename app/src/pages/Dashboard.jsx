import { useState } from 'react'
import { Link } from 'react-router-dom'
import { modules } from '../data/modules.js'
import { getExamSummaries, getTotalQuestions, getDomainStats } from '../lib/exams.js'
import { getState, getAttempts, streakDays, clearAllWrong } from '../lib/storage.js'

export default function Dashboard() {
  const [, force] = useState(0)
  const exams = getExamSummaries()
  const totalQ = getTotalQuestions()
  const state = getState()
  const attempts = getAttempts()
  const streak = streakDays()
  const domains = getDomainStats()
  const readyModules = modules.filter((m) => m.status === 'ready')

  const avg = attempts.length
    ? Math.round(attempts.reduce((n, a) => n + a.percent, 0) / attempts.length)
    : null
  const best = attempts.length ? Math.max(...attempts.map((a) => a.percent)) : null

  return (
    <div>
      <div className="hero">
        <div className="blob" />
        <div className="blob two" />
        <span className="tag purple">AWS STUDENT BUILDER GROUP · VITC · CLF-C02</span>
        <h1>Pass the AWS Cloud Practitioner exam.</h1>
        <p>{modules.length} learning modules and {totalQ.toLocaleString()} real practice questions across {exams.length} mock exams — with instant explanations and progress tracking. No login. No paywall.</p>
        <div className="hero-actions">
          <Link className="btn dark" to="/modules">▤ Start Learning</Link>
          <Link className="btn purple" to="/exams">✎ Take a Mock Test</Link>
        </div>
      </div>

      <div className="grid cols-4" style={{ marginBottom: 26 }}>
        <Stat cls="orange" num={totalQ.toLocaleString()} lbl="Practice questions" />
        <Stat cls="purple" num={exams.length} lbl="Mock exams" />
        <Stat cls="yellow" num={modules.length} lbl="Modules" />
        <Stat num={best != null ? `${best}%` : '—'} lbl="Your best score" />
      </div>

      {attempts.length > 0 && (
        <div className="box" style={{ marginBottom: 26 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 22 }}>Your progress</h2>
            <span className="tag green">🔥 {streak}-day streak</span>
          </div>
          <div className="grid cols-4" style={{ marginTop: 16 }}>
            <Stat cls="" num={attempts.length} lbl="Attempts" />
            <Stat cls="" num={`${avg}%`} lbl="Average score" />
            <Stat cls="" num={state.modulesDone.length} lbl="Modules done" />
            <Stat cls="" num={state.wrong.length} lbl="Saved mistakes" />
          </div>
          {state.wrong.length > 0 && (
            <div className="row" style={{ marginTop: 16 }}>
              <Link className="btn primary sm" to="/quiz/retry">↻ Retry my {state.wrong.length} mistakes</Link>
              <button
                className="btn sm"
                onClick={() => {
                  if (window.confirm(`Reset all ${state.wrong.length} saved mistakes? This can’t be undone.`)) {
                    clearAllWrong(); force((n) => n + 1)
                  }
                }}
              >Reset mistakes</button>
            </div>
          )}
        </div>
      )}

      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 26 }}>Jump back in</h2>
        <Link to="/modules" className="tag ghost">All modules →</Link>
      </div>
      <div className="grid cols-3" style={{ marginBottom: 30 }}>
        {readyModules.map((m) => (
          <Link key={m.id} to={`/modules/${m.id}`} className="card">
            <div className="card-top">
              <div className="num-badge">{m.number}</div>
              <span className="tag">{m.minutes} min</span>
            </div>
            <h3>{m.title}</h3>
            <div className="card-desc">{m.blurb}</div>
            <div className="card-foot">
              <span className="tag orange">{m.domain}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="box">
        <h2 style={{ fontSize: 22, marginBottom: 6 }}>Question bank by domain</h2>
        <div className="qmeta" style={{ marginBottom: 16 }}>Auto-tagged across all {totalQ.toLocaleString()} questions (CLF-C02 domains)</div>
        {Object.entries(domains).sort((a, b) => b[1] - a[1]).map(([d, c]) => {
          const pct = Math.round((c / totalQ) * 100)
          return (
            <div key={d} style={{ marginBottom: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                <strong>{d}</strong><span>{c} · {pct}%</span>
              </div>
              <div className="progress-bar" style={{ marginTop: 4 }}>
                <span style={{ width: `${pct}%`, background: 'var(--orange)' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ num, lbl, cls = '' }) {
  return (
    <div className={`box stat ${cls}`}>
      <div className="num">{num}</div>
      <div className="lbl">{lbl}</div>
    </div>
  )
}
