/**
 * localStorage-backed progress store. No backend required.
 * Tracks: exam attempts/scores, module completion, bookmarked questions.
 */
const KEY = 'aws-ccp-academy:v1'

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}
function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* ignore quota / private mode */
  }
}

const defaults = () => ({ attempts: [], modulesDone: [], bookmarks: [], wrong: [] })

export function getState() {
  return { ...defaults(), ...read() }
}

/** Record a completed exam attempt. */
export function saveAttempt(attempt) {
  const s = getState()
  s.attempts = [
    { ...attempt, at: Date.now() },
    ...s.attempts,
  ].slice(0, 200)
  write(s)
  return s
}

export function getAttempts(examId) {
  const s = getState()
  return examId ? s.attempts.filter((a) => a.examId === examId) : s.attempts
}

export function bestScore(examId) {
  const a = getAttempts(examId)
  if (!a.length) return null
  return Math.max(...a.map((x) => x.percent))
}

export function toggleModuleDone(moduleId) {
  const s = getState()
  s.modulesDone = s.modulesDone.includes(moduleId)
    ? s.modulesDone.filter((m) => m !== moduleId)
    : [...s.modulesDone, moduleId]
  write(s)
  return s
}
export function isModuleDone(moduleId) {
  return getState().modulesDone.includes(moduleId)
}

/** Track wrong questions for "Retry my mistakes". */
export function recordWrong(questions) {
  const s = getState()
  const map = new Map(s.wrong.map((w) => [w.id, w]))
  for (const q of questions) map.set(q.id, q)
  s.wrong = [...map.values()].slice(0, 500)
  write(s)
}
export function clearWrong(ids) {
  const s = getState()
  const set = new Set(ids)
  s.wrong = s.wrong.filter((w) => !set.has(w.id))
  write(s)
}

/** Reset the entire saved-mistakes pool. */
export function clearAllWrong() {
  const s = getState()
  s.wrong = []
  write(s)
  return s
}

export function streakDays() {
  const s = getState()
  if (!s.attempts.length) return 0
  const days = new Set(s.attempts.map((a) => new Date(a.at).toDateString()))
  let streak = 0
  const d = new Date()
  // count consecutive days back from today that have an attempt
  for (;;) {
    if (days.has(d.toDateString())) {
      streak++
      d.setDate(d.getDate() - 1)
    } else break
  }
  return streak
}
