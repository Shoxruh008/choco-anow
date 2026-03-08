import { createClient } from '@supabase/supabase-js';

// Server-side admin client
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export function checkAdminAuth(req: Request): boolean {
  const token = req.headers.get('x-admin-token');
  return token === process.env.ADMIN_PASSWORD;
}
