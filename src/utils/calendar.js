const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function pad2(n) {
  return String(n).padStart(2, '0')
}

/** @returns {string} YYYY-MM-DD */
export function toDateKey(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

/**
 * @param {number} year
 * @param {number} month 1-12
 * @returns {(null | { day: number, dateKey: string })[][]}
 */
export function buildMonthGrid(year, month) {
  const first = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0).getDate()
  const startPad = first.getDay()

  const cells = []
  for (let i = 0; i < startPad; i++) cells.push(null)

  for (let d = 1; d <= lastDay; d++) {
    cells.push({ day: d, dateKey: toDateKey(year, month, d) })
  }

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  const last = weeks[weeks.length - 1]
  while (last.length < 7) last.push(null)

  return weeks
}

export { DAY_LABELS }

export function weekdayIndexFromDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}
