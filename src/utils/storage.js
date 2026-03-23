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
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* 할당량·사생활 보호 모드 등 */
  }
}
