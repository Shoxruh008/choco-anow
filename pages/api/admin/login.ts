import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  const adminUsername = process.env.ADMIN_USERNAME || 'shox';
  const adminPassword = process.env.ADMIN_PASSWORD || 'shox123';

  if (username !== adminUsername || password !== adminPassword) {
    return res.status(401).json({ message: 'Login yoki parol noto\'g\'ri' });
  }

  // Simple token - production da JWT ishlatish tavsiya etiladi
  const token = adminPassword;

  return res.status(200).json({ token, message: 'Muvaffaqiyatli kirildi' });
}
