import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ message: 'Ruxsat yo\'q' });
  }

  const form = formidable({ maxFileSize: 5 * 1024 * 1024 }); // 5MB

  try {
    const [, files] = await form.parse(req);
    const fileField = files.file;
    const file = Array.isArray(fileField) ? fileField[0] : (fileField as unknown as File);

    if (!file) {
      return res.status(400).json({ message: 'Fayl topilmadi' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      return res.status(400).json({ message: 'Faqat rasm fayllar qabul qilinadi (jpg, png, webp, gif)' });
    }

    const ext = path.extname(file.originalFilename || '.jpg');
    const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    const fileBuffer = fs.readFileSync(file.filepath);

    const supabase = getServiceClient();
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({ message: 'Yuklashda xato: ' + uploadError.message });
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    // Temp faylni tozalash
    fs.unlinkSync(file.filepath);

    return res.status(200).json({ url: data.publicUrl });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server xatosi' });
  }
}