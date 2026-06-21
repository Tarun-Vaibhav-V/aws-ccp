import { annotate } from '../lib/glossary.js'
import { buildReportMailto, REPORT_LINKEDIN } from '../lib/report.js'

/**
 * Explanation block: the correct answer + a grounded "why it's correct"
 * reason, plus the AWS reference and a report link.
 */

/** Build the "why it's correct" reason from source text and/or the glossary. */
function whyCorrect(q) {
  // 1) Prefer an authored/source explanation — use it on its own.
  if (q.explanation && q.explanation.replace(/[^a-z]/gi, '').length > 12) {
    return q.explanation
  }

  // 2) Otherwise build a reason from the correct option's concept(s).
  const parts = (q.correct || [])
    .map((k) => {
      const o = q.options.find((opt) => opt.key === k)
      const note = annotate(o?.text)
      return note ? `${note.term} — ${note.def}` : null
    })
    .filter(Boolean)

  // 3) Guaranteed fallback so every question still gets a truthful reason.
  if (parts.length === 0) {
    const texts = (q.correct || [])
      .map((k) => q.options.find((o) => o.key === k)?.text)
      .filter(Boolean)
      .map((t) => `“${t.replace(/\.$/, '')}”`)
    if (texts.length) {
      parts.push(`${texts.join(' and ')} ${texts.length > 1 ? 'are' : 'is'} the choice that best satisfies what the question asks.`)
    }
  }
  return parts.join('  ')
}

export default function Explanation({ q, sel = [], examTitle = '' }) {
  const correct = q.correct || []
  const sameSet =
    sel.length === correct.length && [...sel].sort().join() === [...correct].sort().join()
  const why = whyCorrect(q)

  return (
    <div className="explain">
      <div className="lab">
        {sel.length === 0
          ? `Answer: ${correct.join(', ')}`
          : sameSet
          ? '✓ Correct'
          : `✗ Not quite — correct answer: ${correct.join(', ')}`}
      </div>

      <p style={{ margin: '8px 0 2px', fontWeight: 600 }}>
        {correct.length > 1 ? 'Correct answers: ' : 'Correct answer: '}
        {correct.map((k, i) => (
          <span key={k}>
            {k}. {q.options.find((o) => o.key === k)?.text}
            {i < correct.length - 1 ? '  ·  ' : ''}
          </span>
        ))}
      </p>

      {why && (
        <p style={{ margin: '6px 0 2px' }}>
          <strong>Why it’s correct:</strong> {why}
        </p>
      )}

      {q.docLink && (
        <a href={q.docLink} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 8 }}>
          AWS reference
        </a>
      )}

      <div className="report-line">
        Spot a mistake in this question?{' '}
        <a href={buildReportMailto(q, examTitle)}>Report by email</a>{' '}or{' '}
        <a href={REPORT_LINKEDIN} target="_blank" rel="noreferrer">message on LinkedIn</a>
        {' '}— please attach a screenshot.
      </div>
    </div>
  )
}
