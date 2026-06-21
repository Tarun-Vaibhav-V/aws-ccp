import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getExam, buildMixedExam, DOMAINS, buildDomainSet, buildDomainRandom } from '../lib/exams.js'
import { getState, saveAttempt, recordWrong, clearWrong, recordVisit } from '../lib/storage.js'
import Explanation from '../components/Explanation.jsx'
import { buildReportMailto } from '../lib/report.js'

const EXAM_SECONDS = 90 * 60
const PASS = 70

function resolveExam(id) {
  if (id === 'mixed') return buildMixedExam(50)
  if (id?.startsWith('domain-')) {
    const rest = id.slice('domain-'.length)
    for (const d of DOMAINS) {
      if (rest === `${d.slug}-random`) return buildDomainRandom(d.slug)
      const m = rest.match(new RegExp(`^${d.slug}-set-(\\d+)$`))
      if (m) return buildDomainSet(d.slug, parseInt(m[1], 10))
    }
    return null
  }
  if (id === 'retry') {
    const wrong = getState().wrong
    return wrong.length
      ? { id: 'retry', number: 0, title: 'Retry My Mistakes', total: wrong.length, hasExplanations: true, questions: wrong }
      : null
  }
  return getExam(id) || null
}

const sameSet = (a = [], b = []) => a.length === b.length && [...a].sort().join() === [...b].sort().join()
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export default function Quiz() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const mode = params.get('mode') === 'exam' ? 'exam' : id === 'mixed' || id === 'retry' ? 'exam' : 'practice'

  const exam = useMemo(() => resolveExam(id), [id])
  const [phase, setPhase] = useState('intro')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState({})       // qid -> [keys]
  const [flags, setFlags] = useState({})           // qid -> bool
  const [checked, setChecked] = useState({})       // qid -> bool (practice reveal)
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS)
  const [result, setResult] = useState(null)
  const timerRef = useRef(null)

  // record this test in "Jump back in" history
  useEffect(() => {
    if (exam) recordVisit({ type: 'exam', id, title: exam.title })
  }, [exam, id])

  // timer for exam mode
  useEffect(() => {
    if (phase !== 'active' || mode !== 'exam') return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); submit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode])

  if (!exam) {
    return <div className="empty">No questions here yet. <Link to="/exams">Back to mock tests</Link></div>
  }

  const q = exam.questions[idx]
  const picked = answers[q?.id] || []

  function toggle(key) {
    if (mode === 'practice' && checked[q.id]) return
    setAnswers((prev) => {
      const cur = prev[q.id] || []
      if (q.isMulti) {
        if (cur.includes(key)) return { ...prev, [q.id]: cur.filter((k) => k !== key) }
        // Cap selections at the number of correct answers (e.g., "Choose TWO").
        if (cur.length >= q.correct.length) return prev
        return { ...prev, [q.id]: [...cur, key] }
      }
      return { ...prev, [q.id]: [key] }
    })
  }

  function checkAnswer() { setChecked((c) => ({ ...c, [q.id]: true })) }
  function go(n) { setIdx((i) => Math.min(Math.max(i + n, 0), exam.questions.length - 1)) }

  function submit() {
    clearInterval(timerRef.current)
    let correctCount = 0
    const wrongQs = []
    const review = exam.questions.map((qq) => {
      const sel = answers[qq.id] || []
      const ok = sameSet(sel, qq.correct)
      if (ok) correctCount++
      else wrongQs.push(qq)
      return { q: qq, sel, ok }
    })
    const percent = Math.round((correctCount / exam.questions.length) * 100)
    const res = { correctCount, total: exam.questions.length, percent, review, passed: percent >= PASS }
    setResult(res)
    setPhase('result')
    // persist
    saveAttempt({ examId: exam.id, title: exam.title, percent, correct: correctCount, total: exam.questions.length, mode })
    if (wrongQs.length) recordWrong(wrongQs)
    if (id === 'retry') {
      const fixed = review.filter((r) => r.ok).map((r) => r.q.id)
      if (fixed.length) clearWrong(fixed)
    }
    window.scrollTo(0, 0)
  }

  // ---------- INTRO ----------
  if (phase === 'intro') {
    return (
      <div className="quiz-wrap">
        <div className="breadcrumb"><Link to="/exams">Mock Tests</Link> / {exam.title}</div>
        <div className="box" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <span className={`tag ${mode === 'exam' ? 'purple' : 'orange'}`}>{mode === 'exam' ? 'EXAM MODE' : 'PRACTICE MODE'}</span>
          <h1 style={{ fontSize: 34, margin: '12px 0' }}>{exam.title}</h1>
          <ul className="module-body">
            <li>{exam.total} questions</li>
            {mode === 'exam'
              ? <><li>Timed: 90 minutes</li><li>Score revealed at the end · pass ≈ {PASS}%</li><li>No feedback until you submit — just like the real exam</li></>
              : <><li>Untimed</li><li>Instant feedback + explanation after each question</li></>}
            <li>Flag questions to revisit before submitting</li>
          </ul>
          <button className="btn primary" style={{ marginTop: 16 }} onClick={() => setPhase('active')}>
            {mode === 'exam' ? '▶ Start timed exam' : '▶ Start practicing'}
          </button>
        </div>
      </div>
    )
  }

  // ---------- RESULT ----------
  if (phase === 'result' && result) {
    return (
      <div className="quiz-wrap">
        <div className="box" style={{ boxShadow: 'var(--shadow-lg)', marginBottom: 24, background: result.passed ? 'var(--green)' : 'var(--paper)' }}>
          <div className="score-ring">
            <div>
              <div className="result-score">{result.percent}%</div>
              <span className={`tag ${result.passed ? 'purple' : 'red'}`}>{result.passed ? '✓ PASS' : '✗ KEEP STUDYING'}</span>
            </div>
            <div className="module-body" style={{ margin: 0 }}>
              <p style={{ margin: 0, fontSize: 18 }}><strong>{result.correctCount}</strong> / {result.total} correct</p>
              <p style={{ margin: '6px 0 0', opacity: .8 }}>Pass mark ≈ {PASS}%. {result.passed ? 'Nice work — you’re exam ready.' : 'Review your misses below.'}</p>
            </div>
          </div>
          <div className="row" style={{ marginTop: 18 }}>
            <Link className="btn" to="/exams">← All tests</Link>
            <button className="btn dark" onClick={() => { setPhase('intro'); setIdx(0); setAnswers({}); setChecked({}); setFlags({}); setTimeLeft(EXAM_SECONDS); setResult(null) }}>Retake</button>
          </div>
        </div>

        <h2 style={{ fontSize: 24, marginBottom: 14 }}>Review</h2>
        {result.review.map((r, i) => (
          <div key={r.q.id} className="question-card" style={{ marginBottom: 16, borderLeft: `10px solid ${r.ok ? 'var(--green)' : 'var(--red)'}` }}>
            <div className="qno">Q{i + 1} {r.ok ? '· correct' : '· incorrect'}</div>
            <div className="qtext" style={{ fontSize: 18 }}>{r.q.question}</div>
            <div className="options">
              {r.q.options.map((o) => {
                const isCorrect = r.q.correct.includes(o.key)
                const isPicked = r.sel.includes(o.key)
                let cls = 'option disabled'
                if (isCorrect) cls += ' correct'
                else if (isPicked) cls += ' wrong'
                return (
                  <div key={o.key} className={cls}>
                    <span className="key">{o.key}</span><span>{o.text}</span>
                  </div>
                )
              })}
            </div>
            <Explanation q={r.q} sel={r.sel} examTitle={exam.title} />
          </div>
        ))}
      </div>
    )
  }

  // ---------- ACTIVE ----------
  const isChecked = mode === 'practice' && checked[q.id]
  const answeredCount = Object.values(answers).filter((a) => a.length).length

  return (
    <div className="quiz-wrap">
      <div className="quiz-top">
        <div>
          <div className="qmeta">{exam.title} · {mode === 'exam' ? 'Exam mode' : 'Practice mode'}</div>
          <strong style={{ fontFamily: 'var(--font-display)' }}>Question {idx + 1} / {exam.questions.length}</strong>
        </div>
        <div className="row">
          {mode === 'exam' && <span className={`quiz-timer ${timeLeft < 300 ? 'warn' : ''}`}>⏱ {fmt(timeLeft)}</span>}
          <button className="btn dark sm" onClick={submit}>Submit ({answeredCount}/{exam.questions.length})</button>
        </div>
      </div>

      <div className="question-card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="qno">Q{idx + 1}{q.isMulti ? ` · select ${q.correct.length}` : ''}</span>
          <span className="row" style={{ gap: 6 }}>
            <a className="tag" href={buildReportMailto(q, exam.title)} title="Report an issue with this question" style={{ textDecoration: 'none' }}>Report</a>
            <button className="tag" style={{ cursor: 'pointer', background: flags[q.id] ? 'var(--yellow)' : 'transparent', color: flags[q.id] ? '#000' : 'var(--ink)' }} onClick={() => setFlags((f) => ({ ...f, [q.id]: !f[q.id] }))}>
              {flags[q.id] ? 'Flagged' : 'Flag'}
            </button>
          </span>
        </div>
        <div className="qtext">{q.question}</div>

        <div className="options">
          {q.options.map((o) => {
            const isPicked = picked.includes(o.key)
            const isCorrect = q.correct.includes(o.key)
            let cls = 'option'
            if (isChecked) {
              cls += ' disabled'
              if (isCorrect) cls += ' correct'
              else if (isPicked) cls += ' wrong'
            } else if (isPicked) cls += ' selected'
            return (
              <button key={o.key} className={cls} onClick={() => toggle(o.key)}>
                <span className="key">{o.key}</span><span>{o.text}</span>
              </button>
            )
          })}
        </div>

        {isChecked && <Explanation q={q} sel={picked} examTitle={exam.title} />}
      </div>

      <div className="quiz-nav">
        <button className="btn" onClick={() => go(-1)} disabled={idx === 0}>← Prev</button>
        <div className="row">
          {mode === 'practice' && !isChecked && <button className="btn purple" onClick={checkAnswer} disabled={!picked.length}>Check answer</button>}
          {idx < exam.questions.length - 1
            ? <button className="btn primary" onClick={() => go(1)}>Next →</button>
            : <button className="btn dark" onClick={submit}>Finish →</button>}
        </div>
      </div>

      {/* question palette */}
      <div className="box flat" style={{ marginTop: 22, border: 'var(--border)' }}>
        <div className="palette-legend">
          <span>Jump to question</span>
          <span className="lg"><span className="sw sw-ans" /> answered</span>
          <span className="lg"><span className="sw sw-flag" /> flagged</span>
          <span className="lg"><span className="sw sw-cur" /> current</span>
        </div>
        <div className="qpalette">
          {exam.questions.map((qq, i) => {
            const a = (answers[qq.id] || []).length > 0
            const f = flags[qq.id]
            return (
              <button
                key={qq.id}
                className={`${a ? 'answered' : ''} ${f ? 'flagged' : ''} ${i === idx ? 'current' : ''}`}
                onClick={() => setIdx(i)}
              >{i + 1}</button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
