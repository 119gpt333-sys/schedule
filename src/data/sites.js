/** 거점 탭 (일정이 거점별로 분리 저장됨) */
export const SITE_TABS = Object.freeze([
  '대응단',
  '화곡',
  '발산',
  '방화',
  '개화',
  '마곡',
])

export const DEFAULT_SITE = SITE_TABS[0]

export function emptySchedules() {
  return Object.fromEntries(SITE_TABS.map((s) => [s, []]))
}

export function isValidSite(s) {
  return typeof s === 'string' && SITE_TABS.includes(s)
}
