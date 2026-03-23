const KEY = 'save-schedule-v1'

export function loadSchedule() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveSchedule(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}
