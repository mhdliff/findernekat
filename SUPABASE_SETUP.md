# 🔧 Fix Data Storage & Supabase Connection

## ❌ Masalah Saat Ini

✓ Data hanya di React state (dalam memori)  
✓ Data hilang saat page di-refresh  
✓ User lain tidak bisa lihat laporan  
✓ Foto disimpan sebagai Base64 (tidak efisien)  

## ✅ Solusi: 3 Langkah

### 1️⃣ Setup File `.env`

Buat file `c:\xampp\htdocs\FinderNeekat\temukembali\.env` dengan:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Dapatkan dari:** Supabase Dashboard → Settings → API

### 2️⃣ Buat Tabel Database

Jalankan SQL ini di Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  initials TEXT,
  online BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'user',
  rating FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Posts table (laporan hilang/temuan)
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL, -- 'lost' or 'found'
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  photo TEXT, -- atau bisa pakai URL ke storage
  location JSONB, -- {label, lat, lng}
  lastSeen TIMESTAMPTZ,
  status TEXT DEFAULT 'active', -- 'active', 'found'
  comments JSONB DEFAULT '[]'::jsonb,
  ratings JSONB DEFAULT '[]'::jsonb,
  createdAt TIMESTAMPTZ DEFAULT now()
);

-- Laporan Error (dari ErrorReportForm)
CREATE TABLE IF NOT EXISTS public.error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  message TEXT,
  url TEXT,
  user_info JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3️⃣ Setup Storage untuk Foto

**Option A: Supabase Storage (Recommended)**
```sql
-- Buat bucket di Supabase Storage panel
-- Nama: post-photos
-- Visibility: Public
```

Update `src/App.jsx` untuk upload foto:

```javascript
const handlePhoto = async (e) => {
  const file = e.target.files[0]; 
  if (!file) return;
  
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('post-photos')
      .upload(fileName, file);
      
    if (error) throw error;
    
    const photoUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/post-photos/${fileName}`;
    setPForm(p => ({ ...p, photoUrl }));
  } catch (err) {
    console.error('Upload error:', err);
  }
};
```

**Option B: Cloudinary (Gratis, mudah)**
- Daftar: https://cloudinary.com
- Gunakan widget mereka
- Foto disimpan di CDN (cepat, global)

---

## 🧪 Test Koneksi

1. Buka browser DevTools (F12)
2. Masuk akun di app
3. Buat laporan baru
4. Cek di Supabase Dashboard → Tables → posts
5. Lihat apakah data muncul ✅

---

## 🔒 Keamanan

Jangan:
- Push `.env` ke Git ❌
- Expose `VITE_SUPABASE_ANON_KEY` di frontend ❌

Lakukan:
- Gunakan `.env` lokal saja ✅
- Encrypt foto sebelum upload ✅
- Validasi di backend/trigger Postgres ✅
