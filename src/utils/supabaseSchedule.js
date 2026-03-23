import { supabase, isSupabaseConfigured } from '../lib/supabase'

const ROW_ID = 'main'

/**
 * @returns {Promise<{ payload: object } | null>}
 */
export async function fetchScheduleFromSupabase() {
  if (!isSupabaseConfigured() || !supabase) return null

  const { data, error } = await supabase
    .from('app_schedule')
    .select('payload')
    .eq('id', ROW_ID)
    .maybeSingle()

  if (error) throw error
  if (!data?.payload) return null
  return { payload: data.payload }
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
