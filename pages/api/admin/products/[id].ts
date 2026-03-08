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
  const token = req.headers['x-admin-token'];
  const adminPassword = process.env.ADMIN_PASSWORD || 'shox123';
  return token === adminPassword;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdmin(req)) {
    return res.status(401).json({ message: 'Ruxsat yo\'q' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID kerak' });
  }

  const supabase = getServiceClient();

  // PUT - update
  if (req.method === 'PUT') {
    const { name, description, price, old_price, image_url } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Mahsulot nomi kiritilishi shart' });
    }

    const { data, error } = await supabase
      .from('products')
      .update({ name, description, price, old_price, image_url })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json({ product: data });
  }

  // DELETE
  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json({ message: 'O\'chirildi' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
