import sampleSchedule from '../data/sampleSchedule.json'
import { DEFAULT_SITE, SITE_TABS, emptySchedules, isValidSite } from '../data/sites'

export function migrateEntry(e) {
  const role = e.role === 'driver' ? 'driver' : 'paramedic'
  const workplace = typeof e.workplace === 'string' ? e.workplace : ''
  const approved = e.approved === false ? false : true

  let accidentName = ''
  let overtimeName = ''

  if (typeof e.accidentName === 'string' || typeof e.overtimeName === 'string') {
    accidentName = (e.accidentName ?? '').trim()
    overtimeName = (e.overtimeName ?? '').trim()
  } else if (e.kind === 'vacation') {
    accidentName = (e.personName ?? '').trim()
  } else if (e.kind === 'overtime') {
    overtimeName = (e.personName ?? '').trim()
  }

  return {
    id: e.id,
    dateKey: e.dateKey,
    shift: e.shift,
    role,
    accidentName,
    overtimeName,
    workplace,
    approved,
  }
}

export function normalizeLoaded(raw) {
  if (!raw || typeof raw !== 'object') return null
  if (!Array.isArray(raw.staffDirectory)) return null

  let schedules
  if (
    raw.schedules &&
    typeof raw.schedules === 'object' &&
    !Array.isArray(raw.schedules)
  ) {
    schedules = emptySchedules()
    for (const site of SITE_TABS) {
      const arr = raw.schedules[site]
      if (Array.isArray(arr)) schedules[site] = arr.map(migrateEntry)
    }
  } else if (Array.isArray(raw.entries)) {
    schedules = emptySchedules()
    schedules[DEFAULT_SITE] = raw.entries.map(migrateEntry)
  } else {
    return null
  }

  const activeSite = isValidSite(raw.meta?.activeSite)
    ? raw.meta.activeSite
    : DEFAULT_SITE

  return {
    meta: {
      title: raw.meta?.title ?? sampleSchedule.meta.title,
      year: Number(raw.meta?.year) || sampleSchedule.meta.year,
      month: Number(raw.meta?.month) || sampleSchedule.meta.month,
      vacationWarningThreshold:
        Number(raw.meta?.vacationWarningThreshold) ||
        sampleSchedule.meta.vacationWarningThreshold,
      activeSite,
    },
    staffDirectory: raw.staffDirectory,
    schedules,
  }
}
