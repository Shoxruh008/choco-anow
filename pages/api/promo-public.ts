import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  const { data, error } = await supabase.from('promo').select('*').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') return res.status(500).json({ message: error.message });
  return res.status(200).json({ promo: data || null });
}