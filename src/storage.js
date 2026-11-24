const KEY = 'lockedin.v1'

export const EMPTY = {
  profile: null,
  logs: {},
  prs: { squat: '', bench: '', deadlift: '', press: '' },
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structured()
    const parsed = JSON.parse(raw)
    return {
      ...structured(),
      ...parsed,
      prs: { ...EMPTY.prs, ...(parsed.prs || {}) },
      logs: parsed.logs || {},
    }
  } catch {
    return structured()
  }
}

export function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

function structured() {
  return JSON.parse(JSON.stringify(EMPTY))
}
