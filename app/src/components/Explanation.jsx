import { annotate } from '../lib/glossary.js'

/**
 * Rich explanation block. Rather than fabricating per-question reasoning, it
 * grounds every statement in the factual glossary: it leads with WHY the
 * correct answer is right (from the correct option's concept + any source
 * explanation), then walks every option so the learner sees why the others
 * don't fit.
 */

/** Build the "why it's correct" reason from source text and/or the glossary. */
function whyCorrect(q) {
  const parts = []
  if (q.explanation && q.explanation.replace(/[^a-z]/gi, '').length > 12) {
    parts.push(q.explanation)
  }
  const defs = (q.correct || [])
    .map((k) => {
      const o = q.options.find((opt) => opt.key === k)
      const note = annotate(o?.text)
      return note ? `${note.term} — ${note.def}` : null
    })
    .filter(Boolean)
  for (const d of defs) if (!parts.some((p) => p.includes(d))) parts.push(d)

  // Guaranteed fallback: every question gets a truthful reason. When no concept
  // is matched, the correct option's own statement is the reason — and we point
  // the learner to the per-option comparison to see why the others don't fit.
  if (parts.length === 0) {
    const texts = (q.correct || [])
      .map((k) => q.options.find((o) => o.key === k)?.text)
      .filter(Boolean)
      .map((t) => `“${t.replace(/\.$/, '')}”`)
    if (texts.length) {
      parts.push(
        `${texts.join(' and ')} ${texts.length > 1 ? 'are' : 'is'} the choice that satisfies what the question asks. Compare each option below to see why the alternatives don’t fit this scenario.`
      )
    }
  }
  return parts.join('  ')
}

export default function Explanation({ q, sel = [] }) {
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

      {/* Per-option breakdown */}
      <div className="ob-lab">Every option:</div>
      <ul className="opt-breakdown">
        {q.options.map((o) => {
          const isCorrect = correct.includes(o.key)
          const wasPicked = sel.includes(o.key)
          const note = annotate(o.text)
          return (
            <li key={o.key} className={isCorrect ? 'ob-correct' : wasPicked ? 'ob-wrong' : ''}>
              <span className="ob-key">{isCorrect ? '✓' : '✗'} {o.key}</span>
              <span>
                {note && <><strong>{note.term}</strong> — {note.def} </>}
                <em>
                  {isCorrect
                    ? 'This directly answers the question.'
                    : note
                    ? 'Correct on its own, but it doesn’t address this scenario.'
                    : 'Not the best fit for this question.'}
                </em>
              </span>
            </li>
          )
        })}
      </ul>

      {q.docLink && (
        <a href={q.docLink} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 8 }}>
          AWS reference ↗
        </a>
      )}
    </div>
  )
}
