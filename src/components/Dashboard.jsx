import { entryAccidentName, entryOvertimeName } from '../utils/entries'

function todayKey() {
  const t = new Date()
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const d = String(t.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function Dashboard({ entries, adminMode }) {
  const list = Array.isArray(entries) ? entries : []
  const key = todayKey()
  const todayEntries = list.filter((e) => e.dateKey === key)

  const vacationCount = todayEntries.filter((e) => entryAccidentName(e)).length
  const overtimeFilled = todayEntries.filter((e) => entryOvertimeName(e)).length
  const pendingAll = list.filter((e) => e.approved === false).length

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <p className="text-balance text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
          오늘 휴가자
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 sm:text-3xl">
          {vacationCount}
          <span className="ml-0.5 text-sm font-normal text-slate-500 sm:text-base">건</span>
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <p className="text-balance text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
          오늘 초과근무 투입(대체 확정)
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 sm:text-3xl">
          {overtimeFilled}
          <span className="ml-0.5 text-sm font-normal text-slate-500 sm:text-base">건</span>
        </p>
      </div>
      {adminMode && (
        <div className="col-span-2 rounded-xl border border-amber-200 bg-amber-50/80 p-3 shadow-sm sm:col-span-2 sm:p-4 lg:col-span-1">
          <p className="text-balance text-[10px] font-medium uppercase tracking-wide text-amber-900 sm:text-xs">
            승인 대기(전체)
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-950 sm:text-3xl">
            {pendingAll}
            <span className="ml-0.5 text-sm font-normal text-amber-800 sm:text-base">건</span>
          </p>
        </div>
      )}
    </div>
  )
}
