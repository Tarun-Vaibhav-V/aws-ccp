import { useState } from 'react'
import { Link } from 'react-router-dom'
import { modules, getModule } from '../data/modules.js'
import { getExamSummaries, getTotalQuestions, getDomainStats } from '../lib/exams.js'
import { getState, getAttempts, streakDays, clearAllWrong, getRecents } from '../lib/storage.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function Dashboard() {
  const [, force] = useState(0)
  const [confirmReset, setConfirmReset] = useState(false)
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
          <Link className="btn dark" to="/modules">Start Learning</Link>
          <Link className="btn purple" to="/exams">Take a Mock Test</Link>
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
            <span className="tag green">{streak}-day streak</span>
          </div>
          <div className="grid cols-4" style={{ marginTop: 16 }}>
            <Stat cls="" num={attempts.length} lbl="Attempts" />
            <Stat cls="" num={`${avg}%`} lbl="Average score" />
            <Stat cls="" num={state.modulesDone.length} lbl="Modules done" />
            <Stat cls="" num={state.wrong.length} lbl="Saved mistakes" />
          </div>
          {state.wrong.length > 0 && (
            <div className="row" style={{ marginTop: 16 }}>
              <Link className="btn primary sm" to="/quiz/retry">Retry my {state.wrong.length} mistakes</Link>
              <button className="btn sm" onClick={() => setConfirmReset(true)}>Reset mistakes</button>
            </div>
          )}
        </div>
      )}

      {(() => {
        const recents = getRecents(3)
        const hasRecents = recents.length > 0
        return (
          <>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 26 }}>{hasRecents ? 'Jump back in' : 'Start here'}</h2>
              <Link to={hasRecents ? '/exams' : '/modules'} className="tag ghost">{hasRecents ? 'View all →' : 'All modules →'}</Link>
            </div>
            <div className="grid cols-3" style={{ marginBottom: 30 }}>
              {hasRecents
                ? recents.map((r) => {
                    if (r.type === 'module') {
                      const m = getModule(r.id)
                      return (
                        <Link key={`m-${r.id}`} to={`/modules/${r.id}`} className="card">
                          <div className="card-top">
                            <div className="num-badge">{m ? m.number : 'L'}</div>
                            <span className="tag">Lesson</span>
                          </div>
                          <h3>{m ? m.title : r.title}</h3>
                          <div className="card-desc">{m ? m.blurb : 'Continue this module.'}</div>
                          <div className="card-foot"><span className="tag orange">Resume →</span></div>
                        </Link>
                      )
                    }
                    return (
                      <Link key={`e-${r.id}`} to={`/quiz/${r.id}`} className="card">
                        <div className="card-top">
                          <div className="num-badge">Q</div>
                          <span className="tag purple">Mock test</span>
                        </div>
                        <h3>{r.title}</h3>
                        <div className="card-desc">Pick up this practice test where you left off.</div>
                        <div className="card-foot"><span className="tag orange">Resume →</span></div>
                      </Link>
                    )
                  })
                : readyModules.slice(0, 3).map((m) => (
                    <Link key={m.id} to={`/modules/${m.id}`} className="card">
                      <div className="card-top">
                        <div className="num-badge">{m.number}</div>
                        <span className="tag">{m.minutes} min</span>
                      </div>
                      <h3>{m.title}</h3>
                      <div className="card-desc">{m.blurb}</div>
                      <div className="card-foot"><span className="tag orange">{m.domain}</span></div>
                    </Link>
                  ))}
            </div>
          </>
        )
      })()}

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

      <ConfirmDialog
        open={confirmReset}
        danger
        title="Reset saved mistakes?"
        message={`This will permanently remove all ${state.wrong.length} saved mistakes. This can’t be undone.`}
        confirmLabel="Reset"
        onConfirm={() => { clearAllWrong(); force((n) => n + 1); setConfirmReset(false) }}
        onCancel={() => setConfirmReset(false)}
      />
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
