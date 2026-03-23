import { createClient } from '@supabase/supabase-js'

/**
 * 기본 Supabase 프로젝트 (환경 변수 없이도 연결).
 * VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 있으면 그 값이 우선합니다.
 */
const DEFAULT_URL = 'https://seiwzdshcqcunxrwyxbw.supabase.co'
const DEFAULT_ANON_KEY =
  'sb_publishable_rrn5rLLpeEiaq60WvQRE1w_nE4382cD'

const url =
  import.meta.env.VITE_SUPABASE_URL?.trim() || DEFAULT_URL
const key =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || DEFAULT_ANON_KEY

export function isSupabaseConfigured() {
  return Boolean(url && key)
}

export const supabase = createClient(url, key)
