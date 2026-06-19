/**
 * Exam loader with AUTO-DISCOVERY.
 * Vite's import.meta.glob picks up every exam-*.json the parser generates,
 * so adding a new exam needs ZERO code changes here — just run the parser.
 */
const examModules = import.meta.glob('../data/exams/exam-*.json', { eager: true })

const exams = Object.values(examModules)
  .map((m) => m.default || m)
  .sort((a, b) => a.number - b.number)

export function getAllExams() {
  return exams
}

export function getExamSummaries() {
  return exams.map((e) => ({
    id: e.id,
    number: e.number,
    title: e.title,
    total: e.total,
    hasExplanations: e.hasExplanations,
  }))
}

export function getExam(id) {
  return exams.find((e) => e.id === id)
}

export function getTotalQuestions() {
  return exams.reduce((n, e) => n + e.total, 0)
}

/** Build a randomized exam by pulling N questions from across all exams. */
export function buildMixedExam(n = 50) {
  const pool = []
  for (const e of exams) {
    for (const q of e.questions) pool.push(q)
  }
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return {
    id: 'mixed',
    number: 0,
    title: 'Mixed Mock Exam',
    total: Math.min(n, pool.length),
    hasExplanations: true,
    questions: pool.slice(0, n),
  }
}

/**
 * The four CLF-C02 domains (names must match the parser's classifier output).
 * `chunk` = how many questions per ordered set for that domain.
 */
export const DOMAINS = [
  { slug: 'cloud-concepts', name: 'Cloud Concepts', weight: 24, chunk: 30 },
  { slug: 'security', name: 'Security & Compliance', weight: 30, chunk: 30 },
  { slug: 'technology', name: 'Cloud Technology & Services', weight: 34, chunk: 60 },
  { slug: 'billing', name: 'Billing & Pricing', weight: 12, chunk: 30 },
]

export function getDomain(slug) {
  return DOMAINS.find((x) => x.slug === slug) || null
}

/** All questions for a domain, in a stable order (exam order). */
export function getDomainPool(slug) {
  const d = getDomain(slug)
  if (!d) return []
  const pool = []
  for (const e of exams) {
    for (const q of e.questions) if (q.domain === d.name) pool.push(q)
  }
  return pool
}

/**
 * Describe the ordered sets for a domain, e.g. Cloud Concepts (65, chunk 30)
 * -> [{n:1, start:1, end:30, count:30}, {n:2,...30}, {n:3, start:61, end:65, count:5}].
 */
export function getDomainSets(slug) {
  const d = getDomain(slug)
  if (!d) return []
  const total = getDomainPool(slug).length
  const sets = []
  for (let i = 0, n = 1; i < total; i += d.chunk, n++) {
    const start = i + 1
    const end = Math.min(i + d.chunk, total)
    sets.push({ n, start, end, count: end - start + 1 })
  }
  return sets
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** A specific ordered set (1-based index) of a domain. */
export function buildDomainSet(slug, setNumber) {
  const d = getDomain(slug)
  if (!d) return null
  const pool = getDomainPool(slug)
  const startIdx = (setNumber - 1) * d.chunk
  const questions = pool.slice(startIdx, startIdx + d.chunk)
  if (!questions.length) return null
  return {
    id: `domain-${slug}-set-${setNumber}`,
    number: 0,
    title: `${d.name} — Set ${setNumber}`,
    total: questions.length,
    hasExplanations: true,
    questions,
  }
}

/** A randomized drill from the whole domain (size defaults to the chunk size). */
export function buildDomainRandom(slug, size) {
  const d = getDomain(slug)
  if (!d) return null
  const pool = shuffle(getDomainPool(slug))
  const n = Math.min(size || d.chunk, pool.length)
  return {
    id: `domain-${slug}-random`,
    number: 0,
    title: `${d.name} — Random ${n}`,
    total: n,
    hasExplanations: true,
    questions: pool.slice(0, n),
  }
}

/** Domain distribution across the whole question bank. */
export function getDomainStats() {
  const counts = {}
  for (const e of exams) {
    for (const q of e.questions) {
      counts[q.domain] = (counts[q.domain] || 0) + 1
    }
  }
  return counts
}
