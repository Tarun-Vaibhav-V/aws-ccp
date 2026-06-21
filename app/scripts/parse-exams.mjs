/**
 * Exam parser — the "add exams easily" engine.
 *
 * Reads every markdown file in ../quiz/practice-exam (relative to repo root),
 * normalizes BOTH known formats into a single JSON shape, and writes one
 * JSON file per exam into src/data/exams/.
 *
 * To add a new exam later: drop a .md file into quiz/practice-exam/ that
 * follows either format below, then run `npm run build:exams`.
 *
 * Format A (exams 1-12):
 *   1. Question text
 *       - A. option
 *       <details ...>Answer</summary>
 *         Correct answer: D
 *       </details>
 *
 * Format B (exams 13-23): same, but answers read "Correct Answer: A",
 *   may include "Explanation: <url>" and use repeated "1." numbering.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const SRC_DIR = join(REPO_ROOT, 'quiz', 'practice-exam')
const OUT_DIR = join(__dirname, '..', 'src', 'data', 'exams')
// Human-written explanation overrides, keyed by question number, per exam.
const OVERRIDE_DIR = join(__dirname, '..', 'explanations')

// --- lightweight CLF-C02 domain classifier (keyword heuristic) ------------
const DOMAIN_RULES = [
  { domain: 'Security & Compliance', kw: ['iam', 'shared responsibility', 'encrypt', 'kms', 'mfa', 'security group', 'compliance', 'artifact', 'shield', 'waf', 'inspector', 'guardduty', 'least privilege', 'root user', 'cloudtrail', 'macie', 'firewall', 'penetration', 'acm', 'secrets'] },
  { domain: 'Billing & Pricing', kw: ['pricing', 'cost', 'billing', 'budget', 'reserved instance', 'savings plan', 'spot', 'on-demand', 'free tier', 'consolidated', 'tco', 'calculator', 'invoice', 'discount', 'cost explorer'] },
  { domain: 'Cloud Concepts', kw: ['value proposition', 'economies of scale', 'capex', 'opex', 'elasticity', 'agility', 'well-architected', 'cloud adoption', 'benefits of', 'scalability', 'high availability', 'fault tolerance'] },
  { domain: 'Cloud Technology & Services', kw: ['ec2', 's3', 'lambda', 'vpc', 'rds', 'dynamodb', 'cloudfront', 'route 53', 'auto scaling', 'load balanc', 'snowball', 'region', 'availability zone', 'edge', 'sqs', 'sns', 'ebs', 'efs', 'glacier', 'ecs', 'eks', 'fargate', 'cloudwatch', 'cloudformation'] },
]

function classifyDomain(text) {
  const t = text.toLowerCase()
  let best = 'Cloud Technology & Services'
  let bestScore = 0
  for (const { domain, kw } of DOMAIN_RULES) {
    const score = kw.reduce((n, k) => (t.includes(k) ? n + 1 : n), 0)
    if (score > bestScore) { bestScore = score; best = domain }
  }
  return best
}

// --- parsing helpers -------------------------------------------------------
const OPTION_RE = /^\s*[-*]\s*([A-Ea-e])[.)]\s*(.+)$/
const QSTART_RE = /^(\d+)\.\s+(.+)$/
// Matches the answer line and captures the answer token only (option letters,
// optionally separated by commas/spaces, to end of line). Handles "D", "A, C",
// "A,B", "AB", "BCD", and mixed case "Ac" — while rejecting prose lines that
// merely contain the words "correct answer".
const ANSWER_RE = /correct answers?\s*[:\-]?\s*([A-Ea-e][A-Ea-e\s,]*?)\s*$/i
const EXPL_RE = /explanation\s*[:\-]?\s*(.+)$/i
const URL_RE = /<?(https?:\/\/[^\s>)]+)>?/

function cleanText(s) {
  return s
    .replace(/<details[^>]*>/gi, '')
    .replace(/<\/details>/gi, '')
    .replace(/<summary[^>]*>.*?<\/summary>/gi, '')
    .replace(/<br\s*\/?>/gi, ' ')      // strip literal line-break tags
    .replace(/<\/?[a-z][^>]*>/gi, ' ') // strip any other stray inline HTML
    .replace(/\s+/g, ' ')
    .trim()
}

function parseExam(md, examNumber) {
  const lines = md.split(/\r?\n/)
  const questions = []
  let cur = null

  const push = () => {
    if (!cur) return
    // finalize
    cur.question = cleanText(cur.question)
    cur.options = cur.options.filter((o) => o && o.text)
    if (cur.question && cur.options.length >= 2 && cur.correct.length) {
      cur.isMulti = cur.correct.length > 1 || /choose\s+(two|three|2|3)/i.test(cur.question)
      cur.domain = classifyDomain(cur.question + ' ' + cur.options.map((o) => o.text).join(' '))
      cur.id = `e${examNumber}-q${questions.length + 1}`
      questions.push(cur)
    }
  }

  for (let raw of lines) {
    const line = raw.replace(/ /g, ' ')
    if (/^\s*#/.test(line) || /^---\s*$/.test(line)) continue // headings / frontmatter fences

    const opt = line.match(OPTION_RE)
    const qs = line.match(QSTART_RE)

    if (opt && cur) {
      cur.options.push({ key: opt[1].toUpperCase(), text: cleanText(opt[2]) })
      continue
    }

    // A new question begins on a numbered line that is NOT inside an option list
    if (qs && !OPTION_RE.test(line)) {
      // Guard: only treat as new question if we already have options collected,
      // or no current question yet. (Format B reuses "1." so we rely on options.)
      if (!cur || cur.options.length > 0) {
        push()
        cur = { question: qs[2], options: [], correct: [], explanation: '', docLink: '' }
        continue
      }
    }

    if (!cur) continue

    const ans = line.match(ANSWER_RE)
    if (ans && cur.correct.length === 0) {
      const letters = ans[1].toUpperCase().match(/[A-E]/g) || []
      if (letters.length) {
        cur.correct = [...new Set(letters)]
        continue
      }
    }

    const expl = line.match(EXPL_RE)
    if (expl) {
      const urlInExpl = expl[1].match(URL_RE)
      if (urlInExpl) cur.docLink = urlInExpl[1]
      const explText = cleanText(expl[1].replace(URL_RE, '').trim()).replace(/^[:\-–\s.]+/, '').trim()
      if (explText.length > 2) cur.explanation = explText
      continue
    }

    // capture a bare doc link line
    const url = line.match(URL_RE)
    if (url && !cur.docLink) cur.docLink = url[1]

    // accumulate multi-line question text (before options appear)
    if (cur.options.length === 0 && cur.correct.length === 0) {
      const extra = cleanText(line)
      if (extra) cur.question += ' ' + extra
    }
  }
  push()
  return questions
}

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.error(`Source folder not found: ${SRC_DIR}`)
    process.exit(1)
  }
  await mkdir(OUT_DIR, { recursive: true })

  const files = (await readdir(SRC_DIR))
    .filter((f) => /^practice-exam-\d+\.md$/i.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)[0], 10)
      const nb = parseInt(b.match(/\d+/)[0], 10)
      return na - nb
    })

  const index = []
  let grandTotal = 0

  for (const file of files) {
    const num = parseInt(file.match(/\d+/)[0], 10)
    const md = await readFile(join(SRC_DIR, file), 'utf8')
    const questions = parseExam(md, num)
    if (!questions.length) {
      console.warn(`  ! ${file}: 0 questions parsed (skipped)`)
      continue
    }
    // Merge the human-reviewed override layer (explanations.../exam-N.json).
    // Two supported formats:
    //   1) Flat map  { "1": "explanation", "2": "..." }  (keyed by question number)
    //   2) Full exam { ..., questions: [{ id, correct, explanation, ... }] }
    // The full format may also CORRECT the answer key — reviewed answers win.
    let overrideCount = 0
    let answerFixes = 0
    const ovrPath = join(OVERRIDE_DIR, `exam-${num}.json`)
    if (existsSync(ovrPath)) {
      const ovr = JSON.parse(await readFile(ovrPath, 'utf8'))
      if (Array.isArray(ovr.questions)) {
        // Match by normalized question TEXT (robust to a missing/reordered
        // question in the override file, which id/index matching would shift).
        const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
        const byText = new Map()
        for (const oq of ovr.questions) {
          const k = norm(oq.question)
          if (!byText.has(k)) byText.set(k, oq)
        }
        const byId = new Map(ovr.questions.map((q) => [q.id, q]))
        let unmatched = 0
        questions.forEach((q) => {
          const src = byText.get(norm(q.question)) || byId.get(q.id)
          if (!src) { unmatched++; return }
          if (typeof src.explanation === 'string' && src.explanation.trim().length > 5) {
            q.explanation = src.explanation.trim()
            overrideCount++
          }
          if (typeof src.docLink === 'string' && src.docLink.trim()) {
            q.docLink = src.docLink.trim()
          }
          if (Array.isArray(src.correct) && src.correct.length) {
            const a = [...q.correct].sort().join()
            const b = [...src.correct].sort().join()
            if (a !== b) {
              q.correct = src.correct
              q.isMulti = src.correct.length > 1 || /choose\s+(two|three|2|3)/i.test(q.question)
              answerFixes++
            }
          }
        })
        // Warn only when a file that looks meant-to-be-complete misaligns
        // (small correction-only files are expected to match just a few).
        if (unmatched > 0 && ovr.questions.length >= questions.length * 0.5) {
          console.warn(`    ⚠ exam-${num}: override has ${ovr.questions.length} q, source has ${questions.length}; ${unmatched} source question(s) had no override match (using glossary fallback).`)
        }
      } else {
        questions.forEach((q, i) => {
          const ex = ovr[String(i + 1)]
          if (ex && typeof ex === 'string') { q.explanation = ex; overrideCount++ }
        })
      }
    }
    const hasExpl = questions.filter((q) => q.explanation || q.docLink).length
    const exam = {
      id: `exam-${num}`,
      number: num,
      title: `Practice Exam ${num}`,
      total: questions.length,
      hasExplanations: hasExpl > questions.length * 0.3,
      questions,
    }
    const outName = `exam-${num}.json`
    await writeFile(join(OUT_DIR, outName), JSON.stringify(exam, null, 2))
    index.push({
      id: exam.id,
      number: num,
      title: exam.title,
      total: exam.total,
      hasExplanations: exam.hasExplanations,
      file: outName,
    })
    grandTotal += questions.length
    console.log(`  ✓ ${file} -> ${outName} (${questions.length} q, ${hasExpl} explained${overrideCount ? `, ${overrideCount} authored` : ''}${answerFixes ? `, ${answerFixes} answer-fix` : ''})`)
  }

  index.sort((a, b) => a.number - b.number)
  await writeFile(join(OUT_DIR, 'index.json'), JSON.stringify({ exams: index, totalQuestions: grandTotal }, null, 2))
  console.log(`\nDone. ${index.length} exams, ${grandTotal} questions total -> ${OUT_DIR}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
