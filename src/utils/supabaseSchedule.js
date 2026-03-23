import { supabase, isSupabaseConfigured } from '../lib/supabase'

const ROW_ID = 'main'
const FETCH_TIMEOUT_MS = 12_000

/**
 * @returns {Promise<{ payload: object } | null>}
 */
export async function fetchScheduleFromSupabase() {
  if (!isSupabaseConfigured() || !supabase) return null

  const query = supabase
    .from('app_schedule')
    .select('payload')
    .eq('id', ROW_ID)
    .maybeSingle()

  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error('Supabase 응답 시간 초과(네트워크·차단 앱 확인)')),
      FETCH_TIMEOUT_MS
    )
  })

  try {
    const { data, error } = await Promise.race([query, timeout])
    clearTimeout(timeoutId)
    if (error) throw error
    if (!data?.payload) return null
    return { payload: data.payload }
  } catch (e) {
    clearTimeout(timeoutId)
    throw e
  }
}

/**
 * @param {object} data — { meta, staffDirectory, schedules }
 * @returns {Promise<string | null>} 오류 메시지 또는 null
 */
export async function saveScheduleToSupabase(data) {
  if (!isSupabaseConfigured() || !supabase) return null

  const { error } = await supabase.from('app_schedule').upsert(
    {
      id: ROW_ID,
      payload: data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )

  if (error) return error.message || String(error)
  return null
}
