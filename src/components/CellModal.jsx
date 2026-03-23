import { useMemo, useRef, useState } from 'react'
import {
  ROLE_LABELS,
  ROLES,
  entryAccidentName,
  entryOvertimeName,
  entryWorkplace,
  formatNameWithWorkplace,
} from '../utils/entries'

const VACATION_BG = '#FFFF00'
const OVERTIME_BG = '#00FF00'

function newId() {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const btnPrimary =
  'min-h-12 touch-manipulation rounded-xl px-4 py-3.5 text-left text-sm font-medium active:opacity-90 sm:min-h-0 sm:py-3'
const btnSecondary =
  'min-h-12 touch-manipulation rounded-xl border px-4 py-3.5 text-left text-sm font-medium active:bg-slate-50 sm:min-h-0 sm:py-3'

function buildEntry({
  existing,
  dateKey,
  shift,
  activeRole,
  accidentName,
  overtimeName,
  workplace,
  adminMode,
}) {
  const approved = adminMode ? true : false
  if (existing) {
    return {
      ...existing,
      accidentName,
      overtimeName,
      workplace,
      approved,
    }
  }
  return {
    id: newId(),
    dateKey,
    shift,
    role: activeRole,
    accidentName,
    overtimeName,
    workplace,
    approved,
  }
}

export default function CellModal({
  open,
  onClose,
  context,
  staffDirectory,
  adminMode,
  vacationWarningThreshold,
  onSave,
  onDelete,
  vacationCountForDate,
}) {
  const [activeRole, setActiveRole] = useState('paramedic')
  const [mode, setMode] = useState('menu')
  /** @type {'accident' | 'overtime'} */
  const [formTarget, setFormTarget] = useState('accident')
  const [personName, setPersonName] = useState('')
  const [workplace, setWorkplace] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  const paramedicEntry = context?.paramedicEntry ?? null
  const driverEntry = context?.driverEntry ?? null

  const existing = activeRole === 'paramedic' ? paramedicEntry : driverEntry

  const accName = existing ? entryAccidentName(existing) : ''
  const otName = existing ? entryOvertimeName(existing) : ''

  const switchRole = (r) => {
    setActiveRole(r)
    setMode('menu')
  }

  const filtered = useMemo(() => {
    const q = personName.trim().toLowerCase()
    if (!q) return staffDirectory.slice(0, 8)
    return staffDirectory.filter((n) => n.toLowerCase().includes(q)).slice(0, 12)
  }, [personName, staffDirectory])

  if (!open || !context) return null

  const { dateKey, shiftLabel, dateLabel, shift } = context

  const openFormAccident = () => {
    setFormTarget('accident')
    setPersonName(accName)
    setWorkplace(existing?.workplace ?? '')
    setMode('form')
  }

  const openFormOvertime = () => {
    setFormTarget('overtime')
    setPersonName(otName)
    setWorkplace(existing?.workplace ?? '')
    setMode('form')
  }

  const handleSubmitForm = () => {
    const name = personName.trim()
    const wp = workplace.trim()

    const nextAcc =
      formTarget === 'accident' ? name : accName
    const nextOt =
      formTarget === 'overtime' ? name : otName

    if (formTarget === 'accident') {
      if (!name) {
        window.alert('사고자(휴가) 이름을 입력해 주세요.')
        return
      }
      const wasEmptyAccident = !accName
      if (wasEmptyAccident) {
        const count = vacationCountForDate(dateKey, existing?.id)
        if (count + 1 >= vacationWarningThreshold) {
          const ok = window.confirm(
            `해당 날짜 사고자 등록 후 휴가·사고자 인원이 ${vacationWarningThreshold}명 이상입니다. 계속할까요?`
          )
          if (!ok) return
        }
      }
    }

    const entry = buildEntry({
      existing,
      dateKey,
      shift,
      activeRole,
      accidentName: nextAcc,
      overtimeName: nextOt,
      workplace: wp,
      adminMode,
    })

    onSave(entry)
    onClose()
  }

  const handleDeleteSlot = () => {
    if (!existing) return
    if (!window.confirm('이 슬롯의 사고자·초과근무 정보를 모두 삭제할까요?')) return
    onDelete(existing.id)
    onClose()
  }

  const handleClearAccident = () => {
    if (!existing || !accName) return
    if (!window.confirm('사고자(휴가) 정보만 삭제할까요? 초과근무는 유지됩니다.')) return
    onSave(
      buildEntry({
        existing,
        dateKey,
        shift,
        activeRole,
        accidentName: '',
        overtimeName: otName,
        workplace: existing.workplace ?? '',
        adminMode,
      })
    )
    onClose()
  }

  const handleClearOvertime = () => {
    if (!existing || !otName) return
    if (!window.confirm('초과근무 정보만 삭제할까요? 사고자는 유지됩니다.')) return
    onSave(
      buildEntry({
        existing,
        dateKey,
        shift,
        activeRole,
        accidentName: accName,
        overtimeName: '',
        workplace: existing.workplace ?? '',
        adminMode,
      })
    )
    onClose()
  }

  const handleApprove = () => {
    if (!adminMode || !existing) return
    onSave({ ...existing, approved: true })
    onClose()
  }

  const wpPreview = workplace.trim()
  const previewAcc =
    formTarget === 'accident' ? personName.trim() : accName
  const previewOt =
    formTarget === 'overtime' ? personName.trim() : otName

  const formTitle =
    formTarget === 'accident' ? '사고자(휴가) 입력' : '초과근무(대체) 입력'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cell-modal-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex max-h-[100dvh] w-full max-w-md flex-col bg-white shadow-xl sm:max-h-[min(90dvh,900px)] sm:rounded-2xl rounded-t-3xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-slate-100 px-4 pb-3 pt-4 sm:px-5 sm:py-4">
          <div
            className="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden"
            aria-hidden
          />
          <h2
            id="cell-modal-title"
            className="text-balance text-base font-semibold text-slate-900 sm:text-lg"
          >
            {dateLabel} · {shiftLabel}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{dateKey}</p>
          {mode === 'form' && (
            <p className="mt-1 text-sm font-medium text-slate-700">{formTitle}</p>
          )}
        </div>

        <div className="shrink-0 border-b border-slate-100 px-4 pt-2 sm:px-5 sm:pt-3">
          <div className="flex flex-col gap-2 rounded-xl bg-slate-100 p-1 sm:flex-row">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchRole(r)}
                className={`min-h-11 flex-1 touch-manipulation rounded-lg px-2 py-2.5 text-center text-[11px] font-semibold leading-tight transition active:opacity-90 sm:min-h-10 sm:py-2 sm:text-sm ${
                  activeRole === r
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {adminMode && existing && existing.approved === false && mode === 'menu' && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              <p className="font-medium">검토 대기 중인 입력입니다.</p>
              <button
                type="button"
                onClick={handleApprove}
                className="mt-2 min-h-11 w-full touch-manipulation rounded-lg bg-amber-600 py-2.5 text-sm font-semibold text-white active:bg-amber-700"
              >
                승인
              </button>
            </div>
          )}

          {mode === 'menu' && (
            <div className="flex flex-col gap-2">
              <div className="mb-1 rounded-lg border border-slate-200 p-3 text-left text-sm">
                <p className="text-xs font-medium text-slate-500">
                  {ROLE_LABELS[activeRole]} · 현황
                </p>
                <div
                  className="mt-2 rounded-md border border-slate-200 px-2 py-2 text-center text-sm"
                  style={{
                    backgroundColor: accName ? VACATION_BG : '#fff',
                  }}
                >
                  <span className="text-xs text-slate-600">사고자</span>
                  <p className="mt-0.5 break-words font-medium leading-snug text-slate-900">
                    {formatNameWithWorkplace(accName, entryWorkplace(existing)) || '—'}
                  </p>
                </div>
                <div
                  className="mt-2 rounded-md border border-slate-200 px-2 py-2 text-center text-sm"
                  style={{
                    backgroundColor: otName ? OVERTIME_BG : '#fff',
                  }}
                >
                  <span className="text-xs text-slate-600">초과근무</span>
                  <p className="mt-0.5 break-words font-medium leading-snug text-slate-900">
                    {formatNameWithWorkplace(otName, entryWorkplace(existing)) || '—'}
                  </p>
                </div>
                {existing?.approved === false ? (
                  <p className="mt-2 text-xs font-medium text-amber-800">
                    · 관리자 승인 전
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={openFormAccident}
                className={`${btnPrimary} bg-amber-400/90 text-slate-900`}
              >
                {accName ? '사고자(휴가) 수정' : '사고자(휴가) 등록'}
              </button>
              <button
                type="button"
                onClick={openFormOvertime}
                className={`${btnPrimary} bg-emerald-400/90 text-slate-900`}
              >
                {otName ? '초과근무 수정' : '초과근무 등록'}
              </button>

              {accName ? (
                <button
                  type="button"
                  onClick={handleClearAccident}
                  className={`${btnSecondary} border-amber-200 bg-amber-50/80 text-amber-950`}
                >
                  사고자만 삭제
                </button>
              ) : null}
              {otName ? (
                <button
                  type="button"
                  onClick={handleClearOvertime}
                  className={`${btnSecondary} border-emerald-200 bg-emerald-50/80 text-emerald-950`}
                >
                  초과근무만 삭제
                </button>
              ) : null}

              {existing ? (
                <button
                  type="button"
                  onClick={handleDeleteSlot}
                  className={`${btnSecondary} border-red-200 bg-red-50 text-red-800`}
                >
                  이 슬롯 전체 삭제
                </button>
              ) : null}
            </div>
          )}

          {mode === 'form' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                {formTarget === 'accident'
                  ? '달력 위쪽(노란) 칸에 표시됩니다. 초과근무 이름은 그대로 유지됩니다.'
                  : '달력 아래쪽(초록) 칸에 표시됩니다. 사고자 이름은 그대로 유지됩니다.'}
              </p>

              <div>
                <label htmlFor="workplace-input" className="block text-sm font-medium text-slate-700">
                  근무지
                </label>
                <input
                  id="workplace-input"
                  autoComplete="off"
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                  placeholder="예: 본부, ○○센터"
                  className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:text-sm"
                />
              </div>

              <div className="relative">
                <label htmlFor="person-input" className="block text-sm font-medium text-slate-700">
                  {formTarget === 'accident'
                    ? '사고자(휴가) 이름'
                    : '초과근무 대체 인력'}
                </label>
                <input
                  id="person-input"
                  ref={inputRef}
                  autoComplete="off"
                  value={personName}
                  onChange={(e) => {
                    setPersonName(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  list="staff-datalist"
                  placeholder={
                    formTarget === 'overtime'
                      ? '이름 (비우고 저장 시 초과근무 삭제)'
                      : '이름을 입력하세요'
                  }
                  className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:text-sm"
                />
                <datalist id="staff-datalist">
                  {staffDirectory.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
                {showSuggestions && filtered.length > 0 && (
                  <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    {filtered.map((n) => (
                      <li key={n}>
                        <button
                          type="button"
                          className="min-h-11 w-full touch-manipulation px-3 py-2.5 text-left text-base active:bg-slate-50 sm:min-h-0 sm:py-2 sm:text-sm"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setPersonName(n)
                            setShowSuggestions(false)
                            inputRef.current?.focus()
                          }}
                        >
                          {n}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="overflow-hidden rounded-lg border border-dashed border-slate-300">
                <div
                  className="border-b border-slate-300/50 px-3 py-2 text-center text-sm"
                  style={{
                    backgroundColor: previewAcc ? VACATION_BG : '#f8fafc',
                  }}
                >
                  <span className="text-xs text-slate-600">미리보기 · 사고자</span>
                  <p className="break-words font-medium leading-snug text-slate-900">
                    {formatNameWithWorkplace(previewAcc, wpPreview) || '—'}
                  </p>
                </div>
                <div
                  className="px-3 py-2 text-center text-sm"
                  style={{
                    backgroundColor: previewOt ? OVERTIME_BG : '#f8fafc',
                  }}
                >
                  <span className="text-xs text-slate-600">미리보기 · 초과근무</span>
                  <p className="break-words font-medium leading-snug text-slate-900">
                    {formatNameWithWorkplace(previewOt, wpPreview) || '—'}
                  </p>
                </div>
              </div>
              {formTarget === 'overtime' && (
                <p className="text-xs text-slate-500">
                  이름을 비우고 저장하면 초과근무 칸만 비웁니다.
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('menu')}
                  className="min-h-12 flex-1 touch-manipulation rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700 active:bg-slate-50 sm:min-h-0 sm:py-2.5"
                >
                  뒤로
                </button>
                <button
                  type="button"
                  onClick={handleSubmitForm}
                  className="min-h-12 flex-1 touch-manipulation rounded-xl bg-slate-900 py-3 text-sm font-medium text-white active:opacity-90 sm:min-h-0 sm:py-2.5"
                >
                  저장
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 w-full touch-manipulation rounded-xl py-3 text-sm font-medium text-slate-600 active:bg-slate-50 sm:min-h-0 sm:py-2.5"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

export { VACATION_BG, OVERTIME_BG }
