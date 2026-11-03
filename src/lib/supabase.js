import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

// Support either environment variable name
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL detected:', Boolean(supabaseUrl))
console.log('Supabase key detected:', Boolean(supabaseKey))

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase environment variables are missing. Check your root .env file.'
  )
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)