/**
 * Progress store with two SEPARATE local caches:
 *   - GUEST_KEY : progress for not-signed-in (guest) use. Survives login/logout.
 *   - USER_KEY  : a local mirror of the signed-in account's Supabase data.
 * The active cache depends on whether a user is signed in. Supabase is the
 * source of truth for accounts; the mirror just makes reads instant + offline.
 */
import { supabase } from './supabase.js'

const GUEST_KEY = 'aws-ccp-academy:guest:v1'
const USER_KEY = 'aws-ccp-academy:user:v1'
const LEGACY_KEY = 'aws-ccp-academy:v1'

/* ---------------- cloud sync state ---------------- */
let _userId = null
let _pushTimer = null

/** Which local cache is active right now. */
function activeKey() {
  return _userId ? USER_KEY : GUEST_KEY
}

// One-time migration: fold any pre-split cache into the guest store.
try {
  const legacy = localStorage.getItem(LEGACY_KEY)
  if (legacy && !localStorage.getItem(GUEST_KEY)) {
    localStorage.setItem(GUEST_KEY, legacy)
    localStorage.removeItem(LEGACY_KEY)
  }
} catch { /* ignore */ }

function read(key = activeKey()) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {}
  } catch {
    return {}
  }
}
function write(data) {
  try {
    localStorage.setItem(activeKey(), JSON.stringify(data))
  } catch {
    /* ignore quota / private mode */
  }
  pushCloud()
}

const defaults = () => ({ attempts: [], modulesDone: [], bookmarks: [], wrong: [], recents: [] })

export function getState() {
  return { ...defaults(), ...read() }
}

function emitUpdated() {
  window.dispatchEvent(new Event('ccp-progress-updated'))
}

function pushCloud() {
  if (!supabase || !_userId) return
  clearTimeout(_pushTimer)
  _pushTimer = setTimeout(() => {
    supabase
      .from('user_progress')
      .upsert({ user_id: _userId, data: getState(), updated_at: new Date().toISOString() })
      .then(() => {}, () => {})
  }, 800)
}

function dedupeAttempts(list) {
  const seen = new Set()
  const out = []
  for (const a of list) {
    const k = `${a.examId}|${a.at}|${a.percent}`
    if (seen.has(k)) continue
    seen.add(k)
    out.push(a)
  }
  return out.sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 200)
}

function mergeStates(a, b) {
  const wrongMap = new Map()
  for (const w of [...(a.wrong || []), ...(b.wrong || [])]) wrongMap.set(w.id, w)
  return {
    attempts: dedupeAttempts([...(a.attempts || []), ...(b.attempts || [])]),
    modulesDone: [...new Set([...(a.modulesDone || []), ...(b.modulesDone || [])])],
    bookmarks: [...new Set([...(a.bookmarks || []), ...(b.bookmarks || [])])],
    wrong: [...wrongMap.values()].slice(0, 500),
  }
}

/**
 * Called by the auth layer when the signed-in user changes.
 * - Logout: switch back to the (untouched) guest cache; drop the account mirror.
 * - First signup (account has no cloud data): IMPORT the guest progress into the
 *   new account's cloud (one-time seed). The guest cache is left intact.
 * - Returning account (cloud already has data): load that account's own data
 *   only — guest data is never merged in, so accounts stay isolated.
 */
export async function setSyncUser(userId, profile) {
  _userId = userId || null

  if (!userId) {
    // Logout / guest: the active store reverts to GUEST_KEY (preserved). Drop
    // the account mirror so a different account can't read it.
    clearTimeout(_pushTimer)
    try { localStorage.removeItem(USER_KEY) } catch { /* ignore */ }
    emitUpdated()
    return
  }
  if (!supabase) return

  // Read the guest cache BEFORE switching the active store to the account.
  const guestState = { ...defaults(), ...read(GUEST_KEY) }
  try {
    const { data } = await supabase
      .from('user_progress')
      .select('data')
      .eq('user_id', userId)
      .maybeSingle()
    const cloud = (data && data.data) || {}
    const cloudEmpty = !(
      (cloud.attempts || []).length ||
      (cloud.modulesDone || []).length ||
      (cloud.wrong || []).length
    )
    // First signup -> seed the account from guest progress; otherwise load the
    // account's own cloud data only (no merge).
    const next = cloudEmpty ? { ...defaults(), ...guestState } : { ...defaults(), ...cloud }
    const prof = { ...(cloud.profile || {}), ...(next.profile || {}), ...(profile || {}) }
    if (prof.email || prof.name) next.profile = prof
    // _userId is already set, so writes target USER_KEY (the account mirror).
    localStorage.setItem(USER_KEY, JSON.stringify(next))
    pushCloud() // persist imported progress / profile for new accounts
    emitUpdated()
  } catch {
    /* offline / table missing — keep whatever is cached */
  }
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

/** Record that the user opened a module or test, for "Jump back in". */
export function recordVisit(item) {
  if (!item || !item.id) return
  const s = getState()
  const recents = [
    { type: item.type, id: item.id, title: item.title, at: Date.now() },
    ...(s.recents || []).filter((r) => !(r.type === item.type && r.id === item.id)),
  ].slice(0, 12)
  s.recents = recents
  write(s)
}

export function getRecents(n) {
  const r = getState().recents || []
  return n ? r.slice(0, n) : r
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
