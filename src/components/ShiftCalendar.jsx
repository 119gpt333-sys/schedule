import { Fragment } from 'react'
import { DAY_LABELS, buildMonthGrid, weekdayIndexFromDateKey } from '../utils/calendar'
import { VACATION_BG, OVERTIME_BG } from './CellModal'
import { ROLES, findEntry, getCellSplitParts } from '../utils/entries'

const SHIFT_ROWS = [
  { key: 'day', label: '주간' },
  { key: 'night', label: '야간' },
]

export default function ShiftCalendar({ year, month, entries, onCellClick, title }) {
  const weeks = buildMonthGrid(year, month)

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm sm:overflow-hidden">
      {title && (
        <div className="border-b border-slate-100 px-3 py-2.5 text-center sm:px-4 sm:py-3">
          <h2 className="text-balance text-sm font-semibold text-slate-900 sm:text-lg">
            {title}
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500 sm:text-sm">
            {year}년 {month}월 · 셀을 눌러 입력
          </p>
          <p className="mt-1 flex items-center justify-center gap-1 text-[10px] text-slate-400 sm:hidden">
            <span className="tabular-nums" aria-hidden>
              ↔
            </span>
            좌우로 밀어 전체 달력을 볼 수 있어요
          </p>
        </div>
      )}

      <div className="calendar-scroll touch-pan-x overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm sm:min-w-[720px]">
        <thead>
          <tr>
            <th className="sticky left-0 z-20 w-12 border border-slate-200 bg-slate-100 px-0.5 py-2 text-center text-[10px] font-semibold text-slate-600 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.12)] sm:w-14 sm:px-1 sm:text-xs sm:shadow-none">
              구분
            </th>
            {DAY_LABELS.map((label, i) => (
              <th
                key={label}
                className={`border border-slate-200 bg-slate-100 px-0.5 py-1.5 text-center text-[10px] font-semibold sm:px-2 sm:py-2 sm:text-xs ${
                  i === 0 ? 'text-red-600' : i === 6 ? 'text-blue-600' : 'text-slate-800'
                }`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <Fragment key={wi}>
              <tr>
                <td className="sticky left-0 z-10 w-12 border border-slate-200 bg-slate-50 px-0.5 py-1 text-center text-[9px] font-medium text-slate-500 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] sm:w-14 sm:px-1 sm:text-xs sm:shadow-none">
                  일자
                </td>
                {week.map((cell, di) => {
                  if (!cell) {
                    return (
                      <td
                        key={`e-${wi}-${di}`}
                        className="border border-slate-200 bg-slate-50"
                      />
                    )
                  }
                  const idx = weekdayIndexFromDateKey(cell.dateKey)
                  const color =
                    idx === 0 ? 'text-red-600' : idx === 6 ? 'text-blue-600' : 'text-slate-900'
                  return (
                    <td
                      key={cell.dateKey}
                      className={`border border-slate-200 bg-slate-100 px-0.5 py-1.5 text-center text-xs font-semibold sm:px-1 sm:py-2 sm:text-base ${color}`}
                    >
                      {cell.day}
                    </td>
                  )
                })}
              </tr>
              {SHIFT_ROWS.map((row) => (
                <tr key={`${wi}-${row.key}`}>
                  <td className="sticky left-0 z-10 w-12 border border-slate-200 bg-white px-0.5 py-1.5 text-center text-[9px] font-semibold text-slate-700 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] sm:w-14 sm:px-1 sm:py-2 sm:text-xs sm:shadow-none">
                    {row.label}
                  </td>
                  {week.map((cell, di) => {
                    if (!cell) {
                      return (
                        <td
                          key={`${row.key}-${wi}-${di}`}
                          className="border border-slate-200 bg-slate-50"
                        />
                      )
                    }
                    const byRole = Object.fromEntries(
                      ROLES.map((r) => [r, findEntry(entries, cell.dateKey, row.key, r)])
                    )
                    const { accidentText, overtimeText } = getCellSplitParts(
                      byRole.paramedic,
                      byRole.driver
                    )
                    const pending =
                      (byRole.paramedic && byRole.paramedic.approved === false) ||
                      (byRole.driver && byRole.driver.approved === false)
                    return (
                      <td
                        key={`${row.key}-${cell.dateKey}`}
                        className={`cursor-pointer border border-slate-200 p-0 align-top transition active:bg-slate-50/80 sm:hover:ring-2 sm:hover:ring-slate-300 ${
                          pending ? 'ring-1 ring-amber-400/80 ring-inset' : ''
                        }`}
                        onClick={() =>
                          onCellClick({
                            dateKey: cell.dateKey,
                            shift: row.key,
                            shiftLabel: row.label,
                            dateLabel: `${month}월 ${cell.day}일`,
                            paramedicEntry: byRole.paramedic,
                            driverEntry: byRole.driver,
                          })
                        }
                      >
                        <div className="flex min-h-[5rem] flex-col sm:min-h-[4.5rem]">
                          <div
                            className="flex min-h-[2.5rem] flex-1 basis-0 items-center justify-center break-words border-b border-slate-300/50 px-0.5 py-1 text-center text-[9px] leading-snug text-slate-900 sm:min-h-0 sm:px-1 sm:py-1.5 sm:text-xs"
                            style={
                              accidentText
                                ? { backgroundColor: VACATION_BG }
                                : { backgroundColor: '#ffffff' }
                            }
                          >
                            {accidentText}
                          </div>
                          <div
                            className="flex min-h-[2.5rem] flex-1 basis-0 items-center justify-center break-words px-0.5 py-1 text-center text-[9px] leading-snug text-slate-900 sm:min-h-0 sm:px-1 sm:py-1.5 sm:text-xs"
                            style={
                              overtimeText
                                ? { backgroundColor: OVERTIME_BG }
                                : { backgroundColor: '#ffffff' }
                            }
                          >
                            {overtimeText}
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
