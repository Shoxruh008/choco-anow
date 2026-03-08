import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function isAdmin(req: NextApiRequest): boolean {
  return req.headers['x-admin-token'] === (process.env.ADMIN_PASSWORD || 'shox123');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getServiceClient();

  // GET - hamma o'qiy oladi
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('promo')
      .select('*')
      .eq('id', 1)
      .single();
    if (error && error.code !== 'PGRST116') return res.status(500).json({ message: error.message });
    return res.status(200).json({ promo: data || null });
  }

  // PUT - faqat admin
  if (req.method === 'PUT') {
    if (!isAdmin(req)) return res.status(401).json({ message: "Ruxsat yo'q" });
    const { title, text, btn1_text, btn1_url, btn2_text, btn2_url, emoji1, emoji2, emoji3, emoji4, visible } = req.body;

    const { data, error } = await supabase
      .from('promo')
      .upsert({ id: 1, title, text, btn1_text, btn1_url, btn2_text, btn2_url, emoji1, emoji2, emoji3, emoji4, visible })
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json({ promo: data });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}