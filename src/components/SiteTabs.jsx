import { SITE_TABS } from '../data/sites'

export default function SiteTabs({ activeSite, onSelect }) {
  return (
    <nav
      className="border-t border-slate-100 bg-slate-50/90"
      aria-label="거점 선택"
    >
      <div className="calendar-scroll flex gap-1.5 overflow-x-auto px-2 py-2.5 sm:gap-1 sm:px-4">
        <div className="flex min-h-11 flex-none gap-1" role="tablist">
          {SITE_TABS.map((site) => {
            const selected = site === activeSite
            return (
              <button
                key={site}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onSelect(site)}
                className={`touch-manipulation whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-semibold transition active:opacity-90 sm:px-4 sm:text-sm ${
                  selected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                }`}
              >
                {site}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
