import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client. Created only when the env vars are present, so the app
 * still builds and runs (guest / localStorage mode) without any config.
 * The anon key is public by design — Row Level Security protects the data.
 */
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null
export const isCloudEnabled = !!supabase
