# 🍫 Chocoa — Mahsulot Katalogi

Supabase + Next.js asosidagi mahsulot katalogi sayt.

---

## 🚀 O'rnatish va Ishga Tushirish

### 1. Supabase Sozlash

1. [supabase.com](https://supabase.com) ga o'ting va yangi loyiha yarating
2. **SQL Editor** ga o'ting va `supabase-schema.sql` fayl ichidagi barcha kodni nusxalab ishga tushiring
3. **Authentication > Users** ga o'ting:
   - "Add User" tugmasini bosing
   - Email: `admin@shop.com`
   - Password: `shox123`
   - "Auto Confirm User" ni belgilang
4. **Settings > API** ga o'ting va quyidagilarni nusxalang:
   - `Project URL`
   - `anon public` key
   - `service_role secret` key

### 2. Environment Variables

`.env.local.example` faylni `.env.local` nomi bilan nusxa oling:

```bash
cp .env.local.example .env.local
```

So'ng `.env.local` faylni Supabase ma'lumotlari bilan to'ldiring:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_USERNAME=shox
ADMIN_PASSWORD=shox123
NEXTAUTH_SECRET=blossom-endorse-embark-2wwerAxxdf
```

### 3. Loyihani Ishga Tushirish

```bash
npm install
npm run dev
```

Brauzerda `http://localhost:3000` ni oching.

---

## 📁 Loyiha Tuzilmasi

```
shop-catalog/
├── pages/
│   ├── index.tsx           # Asosiy sahifa (foydalanuvchi)
│   ├── admin/
│   │   ├── index.tsx       # Admin login
│   │   └── dashboard.tsx   # Admin panel
│   └── api/
│       ├── products.ts     # Ommaviy API
│       └── admin/
│           ├── login.ts    # Login API
│           ├── products.ts # CRUD API
│           ├── products/[id].ts
│           └── upload.ts   # Rasm yuklash
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── admin.ts            # Admin helper
│   └── format.ts           # Narx formatlash
├── styles/
│   ├── globals.css
│   ├── Home.module.css
│   ├── AdminLogin.module.css
│   └── AdminDashboard.module.css
├── supabase-schema.sql     # DB schema
└── .env.local.example
```

---

## 🌐 Vercel ga Deploy Qilish

1. [vercel.com](https://vercel.com) ga kiring
2. "New Project" > GitHub reponi import qiling
3. **Environment Variables** bo'limida `.env.local` dagi barcha o'zgaruvchilarni qo'shing
4. "Deploy" tugmasini bosing

---

## 🔐 Admin Panelga Kirish

- URL: `yoursite.com/admin`
- Login: `shox`
- Parol: `shox123`

---

## 📌 Sahifalar

| Sahifa | URL |
|--------|-----|
| Asosiy sahifa | `/` |
| Admin login | `/admin` |
| Admin panel | `/admin/dashboard` |

---

## ⚡ Texnologiyalar

- **Next.js 14** — React framework
- **TypeScript** — Type safety
- **Supabase** — PostgreSQL database + Storage
- **Vercel** — Hosting

---

## 🔧 Muammolar va Yechimlar

**Rasm yuklanmayapti:**
- Supabase Storage da `product-images` bucket yaratilganiga ishonch hosil qiling
- Bucket public qilib belgilangan bo'lishi kerak

**Admin kirish ishlamayapti:**
- `.env.local` da `ADMIN_USERNAME` va `ADMIN_PASSWORD` to'g'ri kiritilganini tekshiring

**Mahsulotlar ko'rinmayapti:**
- `supabase-schema.sql` to'liq ishga tushirilganini tekshiring
- RLS politsiyalari to'g'ri sozlanganini tekshiring
