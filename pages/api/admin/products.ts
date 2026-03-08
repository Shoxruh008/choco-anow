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
  if (!isAdmin(req)) return res.status(401).json({ message: "Ruxsat yo'q" });

  const supabase = getServiceClient();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('products').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json({ products: data });
  }

  if (req.method === 'POST') {
    const { name, description, price, old_price, image_url, image_url_2, image_url_3, image_url_4, image_url_5 } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Mahsulot nomi kiritilishi shart' });

    const { data, error } = await supabase
      .from('products')
      .insert([{ name, description, price, old_price, image_url, image_url_2, image_url_3, image_url_4, image_url_5 }])
      .select().single();

    if (error) return res.status(500).json({ message: error.message });
    return res.status(201).json({ product: data });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}