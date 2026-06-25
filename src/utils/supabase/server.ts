import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
// FIX: Berikan alias "supabaseAdmin" agar tidak bentrok dengan fungsi createClient kamu
import { createClient as supabaseAdmin } from '@supabase/supabase-js';

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Error ini wajar terjadi jika dipanggil dari Server Component
          }
        },
      },
    }
  )
}

// Fungsi khusus untuk bypass RLS di server side
export async function createAdminClient() {
  // FIX: Panggil menggunakan nama alias yang baru
  return supabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );
}