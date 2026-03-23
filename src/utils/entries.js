/** @typedef {'paramedic' | 'driver'} Role */

export const ROLES = /** @type {const} */ (['paramedic', 'driver'])

export const ROLE_LABELS = {
  paramedic: '구급대원',
  driver: '구급운전',
}

/** @param {{ accidentName?: string, overtimeName?: string, kind?: string, personName?: string } | null | undefined} e */
export function entryAccidentName(e) {
  if (!e) return ''
  if (typeof e.accidentName === 'string') return e.accidentName.trim()
  if (e.kind === 'vacation') return (e.personName ?? '').trim()
  return ''
}

/** @param {{ accidentName?: string, overtimeName?: string, kind?: string, personName?: string } | null | undefined} e */
export function entryOvertimeName(e) {
  if (!e) return ''
  if (typeof e.overtimeName === 'string') return e.overtimeName.trim()
  if (e.kind === 'overtime') return (e.personName ?? '').trim()
  return ''
}

/** @param {{ workplace?: string } | null | undefined} e */
export function entryWorkplace(e) {
  if (!e) return ''
  return typeof e.workplace === 'string' ? e.workplace.trim() : ''
}

/** 달력·요약용: 근무지가 있으면 앞에 붙여 시인성 향상 */
export function formatNameWithWorkplace(name, workplace) {
  const n = (name ?? '').trim()
  const w = (workplace ?? '').trim()
  if (!n) return ''
  if (!w) return n
  return `${w} · ${n}`
}

/**
 * @param {{ dateKey: string, shift: string, role: string }[]} entries
 * @param {string} dateKey
 * @param {string} shift
 * @param {Role} role
 */
export function findEntry(entries, dateKey, shift, role) {
  return (
    entries.find(
      (e) => e.dateKey === dateKey && e.shift === shift && e.role === role
    ) ?? null
  )
}

/** 달력 셀 반반: 사고자 이름 / 초과근무 이름 (동시 표시) */
export function getCellSplitParts(paramedicEntry, driverEntry) {
  const accidentParts = []
  const overtimeParts = []

  for (const e of [paramedicEntry, driverEntry]) {
    if (!e) continue
    const wp = entryWorkplace(e)
    const a = entryAccidentName(e)
    const o = entryOvertimeName(e)
    if (a) accidentParts.push(formatNameWithWorkplace(a, wp))
    if (o) overtimeParts.push(formatNameWithWorkplace(o, wp))
  }

  return {
    accidentText: accidentParts.join(', '),
    overtimeText: overtimeParts.join(', '),
  }
}
