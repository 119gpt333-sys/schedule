import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import sampleSchedule from './data/sampleSchedule.json'
import { DEFAULT_SITE, isValidSite } from './data/sites'
import { isSupabaseConfigured } from './lib/supabase'
import Dashboard from './components/Dashboard'
import ShiftCalendar from './components/ShiftCalendar'
import SiteTabs from './components/SiteTabs'
import CellModal from './components/CellModal'
import { entryAccidentName } from './utils/entries'
import { normalizeLoaded } from './utils/scheduleNormalize'
import { loadSchedule, saveSchedule } from './utils/storage'
import {
  fetchScheduleFromSupabase,
  saveScheduleToSupabase,
} from './utils/supabaseSchedule'

const supabaseOn = isSupabaseConfigured()

export default function App() {
  const [data, setData] = useState(() =>
    supabaseOn ? null : normalizeLoaded(loadSchedule()) ?? normalizeLoaded(sampleSchedule)
  )
  const [hydrated, setHydrated] = useState(!supabaseOn)
  const [remoteError, setRemoteError] = useState(null)
  const [adminMode, setAdminMode] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [cellContext, setCellContext] = useState(null)
  const [modalKey, setModalKey] = useState(0)
  const [saveFlash, setSaveFlash] = useState(false)
  const fileInputRef = useRef(null)
  const saveTimer = useRef(null)
  const remoteTimer = useRef(null)

  const { meta: metaRaw, staffDirectory: staffRaw, schedules } = data ?? {}
  const meta =
    metaRaw && typeof metaRaw === 'object' ? metaRaw : sampleSchedule.meta
  const staffDirectory = Array.isArray(staffRaw) ? staffRaw : sampleSchedule.staffDirectory
  const year = Number(meta.year) || sampleSchedule.meta.year
  const month = Number(meta.month) || sampleSchedule.meta.month
  const title = typeof meta.title === 'string' ? meta.title : sampleSchedule.meta.title
  const vacationWarningThreshold =
    Number(meta.vacationWarningThreshold) || sampleSchedule.meta.vacationWarningThreshold

  const activeSite = isValidSite(meta.activeSite) ? meta.activeSite : DEFAULT_SITE
  const entries = useMemo(
    () => (schedules ? schedules[activeSite] ?? [] : []),
    [schedules, activeSite]
  )

  useEffect(() => {
    if (!supabaseOn) return
    let cancelled = false
    ;(async () => {
      try {
        const row = await fetchScheduleFromSupabase()
        if (cancelled) return
        if (row?.payload) {
          const n = normalizeLoaded(row.payload)
          if (n) {
            setData(n)
            saveSchedule(n)
            setHydrated(true)
            setRemoteError(null)
            return
          }
        }
        const local = normalizeLoaded(loadSchedule()) ?? normalizeLoaded(sampleSchedule)
        setData(local)
        setHydrated(true)
        setRemoteError(null)
      } catch (e) {
        if (cancelled) return
        setRemoteError(String(e?.message || e))
        const local = normalizeLoaded(loadSchedule()) ?? normalizeLoaded(sampleSchedule)
        setData(local)
        setHydrated(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!data || !hydrated) return

    saveSchedule(data)
    setSaveFlash(true)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => setSaveFlash(false), 1200)

    if (!supabaseOn) return

    if (remoteTimer.current) clearTimeout(remoteTimer.current)
    remoteTimer.current = setTimeout(async () => {
      const err = await saveScheduleToSupabase(data)
      setRemoteError(err)
    }, 800)

    return () => {
      if (remoteTimer.current) clearTimeout(remoteTimer.current)
    }
  }, [data, hydrated])

  useEffect(() => {
    setModalOpen(false)
  }, [activeSite])

  const vacationCountForDate = useCallback(
    (dateKey, excludeEntryId) =>
      entries.filter(
        (e) =>
          entryAccidentName(e) &&
          e.dateKey === dateKey &&
          e.id !== excludeEntryId
      ).length,
    [entries]
  )

  const setActiveSite = (site) => {
    if (!isValidSite(site)) return
    setData((d) => ({ ...d, meta: { ...d.meta, activeSite: site } }))
  }

  const setYearMonth = (y, m) => {
    setData((d) => ({
      ...d,
      meta: { ...d.meta, year: y, month: m },
    }))
  }

  const onSaveEntry = (entry) => {
    const accident = (entry.accidentName ?? '').trim()
    const ot = (entry.overtimeName ?? '').trim()
    const normalized = { ...entry, accidentName: accident, overtimeName: ot }

    setData((d) => {
      const site = isValidSite(d.meta.activeSite) ? d.meta.activeSite : DEFAULT_SITE
      const list = [...(d.schedules[site] ?? [])]

      if (!accident && !ot) {
        return {
          ...d,
          schedules: {
            ...d.schedules,
            [site]: list.filter((e) => e.id !== entry.id),
          },
        }
      }

      const idx = list.findIndex((e) => e.id === normalized.id)
      let nextList
      if (idx >= 0) {
        nextList = list.map((e) => (e.id === normalized.id ? normalized : e))
      } else {
        const slotIdx = list.findIndex(
          (e) =>
            e.dateKey === normalized.dateKey &&
            e.shift === normalized.shift &&
            e.role === normalized.role
        )
        if (slotIdx >= 0) {
          nextList = [...list]
          nextList[slotIdx] = { ...normalized, id: list[slotIdx].id }
        } else {
          nextList = [...list, normalized]
        }
      }

      return {
        ...d,
        schedules: { ...d.schedules, [site]: nextList },
      }
    })
  }

  const onDeleteEntry = (id) => {
    setData((d) => {
      const site = isValidSite(d.meta.activeSite) ? d.meta.activeSite : DEFAULT_SITE
      const list = d.schedules[site] ?? []
      return {
        ...d,
        schedules: {
          ...d.schedules,
          [site]: list.filter((e) => e.id !== id),
        },
      }
    })
  }

  const exportJson = () => {
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    const siteSafe = activeSite.replace(/\s+/g, '-')
    a.download = `schedule-${year}-${String(month).padStart(2, '0')}-${siteSafe}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const onImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = normalizeLoaded(JSON.parse(String(reader.result)))
        if (!parsed) throw new Error('형식 오류')
        setData(parsed)
      } catch {
        window.alert('JSON 파일을 읽을 수 없습니다.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const monthLabel = useMemo(() => `${year}년 ${month}월`, [year, month])

  const prevMonth = () => {
    let y = year
    let m = month - 1
    if (m < 1) {
      m = 12
      y -= 1
    }
    setYearMonth(y, m)
  }

  const nextMonth = () => {
    let y = year
    let m = month + 1
    if (m > 12) {
      m = 1
      y += 1
    }
    setYearMonth(y, m)
  }

  if (!hydrated || !data) {
    return (
      <div className="flex min-h-dvh min-h-svh flex-col items-center justify-center gap-2 bg-slate-100 px-4 text-center text-slate-600">
        <p className="text-base font-medium text-slate-800">일정 불러오는 중…</p>
        {supabaseOn && (
          <p className="max-w-sm text-sm">Supabase에서 데이터를 가져오고 있습니다.</p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-dvh min-h-svh bg-slate-100 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur">
        <header>
          <div className="mx-auto flex max-w-6xl flex-col gap-3 py-3 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4">
            <div className="min-w-0 text-left">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 sm:text-xs">
                Save-Schedule
              </p>
              <h1 className="text-balance text-lg font-bold leading-snug text-slate-900 sm:text-2xl">
                희망근무를 위한 사고자 파악
              </h1>
              <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
                누구나 입력 · 관리자는 승인·검토
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setAdminMode((v) => !v)}
                className={`min-h-11 touch-manipulation rounded-full px-4 py-2.5 text-sm font-semibold transition active:opacity-90 ${
                  adminMode
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-300 bg-white text-slate-700'
                }`}
              >
                관리자 {adminMode ? 'ON' : 'OFF'}
              </button>
              {adminMode && (
                <>
                  <button
                    type="button"
                    onClick={exportJson}
                    className="min-h-11 touch-manipulation rounded-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 active:bg-slate-50"
                  >
                    JSON보내기
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-11 touch-manipulation rounded-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 active:bg-slate-50"
                  >
                    JSON 가져오기
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={onImportFile}
                  />
                </>
              )}
              <div className="flex flex-col items-end gap-0.5 text-xs text-slate-500">
                <span className={saveFlash ? 'opacity-100' : 'opacity-60'}>
                  {saveFlash ? '로컬 저장됨' : '로컬 자동 저장'}
                </span>
                {supabaseOn && (
                  <span className={remoteError ? 'font-medium text-red-600' : 'text-emerald-700'}>
                    {remoteError ? `클라우드: ${remoteError}` : '클라우드 동기화'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>
        <SiteTabs activeSite={activeSite} onSelect={setActiveSite} />
      </div>

      <main className="mx-auto max-w-6xl space-y-4 py-4 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:space-y-6 sm:px-4 sm:py-6">
        <p className="text-center text-xs font-medium text-slate-600 sm:text-left">
          현재 거점: <span className="text-slate-900">{activeSite}</span>
        </p>

        <Dashboard entries={entries} adminMode={adminMode} />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center justify-center gap-1 sm:justify-start sm:gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-lg border border-slate-300 bg-white text-base font-medium shadow-sm active:bg-slate-50"
              aria-label="이전 달"
            >
              ←
            </button>
            <span className="min-w-[6.5rem] flex-1 text-center text-base font-semibold sm:min-w-[7rem] sm:flex-none">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-lg border border-slate-300 bg-white text-base font-medium shadow-sm active:bg-slate-50"
              aria-label="다음 달"
            >
              →
            </button>
          </div>
          {adminMode && (
            <label className="flex w-full flex-col gap-1 text-sm sm:max-w-xs sm:flex-1">
              <span className="text-slate-600">표 제목</span>
              <input
                value={title}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    meta: { ...d.meta, title: e.target.value },
                  }))
                }
                className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-base sm:text-sm"
              />
            </label>
          )}
        </div>

        <ShiftCalendar
          year={year}
          month={month}
          entries={entries}
          title={title}
          onCellClick={(ctx) => {
            setCellContext(ctx)
            setModalKey((k) => k + 1)
            setModalOpen(true)
          }}
        />

        <footer className="text-center text-[10px] leading-relaxed text-slate-500 sm:pb-4 sm:text-xs">
          휴가 <span className="inline-block rounded px-1" style={{ background: '#FFFF00' }}>노랑</span>
          {' · '}
          초과근무 대체 확정{' '}
          <span className="inline-block rounded px-1" style={{ background: '#00FF00' }}>초록</span>
          {' · '}
          대응단·화곡 등 거점 탭마다 일정이 구분됩니다 ·
          {supabaseOn
            ? ' Supabase에 공통 저장되어 기기 간 동일 데이터를 볼 수 있습니다.'
            : ' 브라우저 로컬에 저장됩니다(.env에 Supabase 설정 시 클라우드 동기화).'}
        </footer>
      </main>

      <CellModal
        key={modalKey}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        context={cellContext}
        staffDirectory={staffDirectory}
        adminMode={adminMode}
        vacationWarningThreshold={vacationWarningThreshold}
        vacationCountForDate={vacationCountForDate}
        onSave={onSaveEntry}
        onDelete={onDeleteEntry}
      />
    </div>
  )
}
