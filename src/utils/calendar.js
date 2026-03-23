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
  const y = Number(year)
  const m = Number(month)
  const now = new Date()
  const safeY = Number.isFinite(y) ? y : now.getFullYear()
  const safeM =
    Number.isFinite(m) && m >= 1 && m <= 12 ? m : now.getMonth() + 1

  const first = new Date(safeY, safeM - 1, 1)
  const lastDay = new Date(safeY, safeM, 0).getDate()
  const startPad = first.getDay()

  if (!Number.isFinite(lastDay) || lastDay < 1) {
    return [Array.from({ length: 7 }, () => null)]
  }

  const cells = []
  for (let i = 0; i < startPad; i++) cells.push(null)

  for (let d = 1; d <= lastDay; d++) {
    cells.push({ day: d, dateKey: toDateKey(safeY, safeM, d) })
  }

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  if (weeks.length === 0) {
    return [Array.from({ length: 7 }, () => null)]
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
