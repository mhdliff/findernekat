# 🔥 FIX DATABASE: Langkah-Langkah Lengkap

## ❌ Masalah
Tabel `posts` di Supabase bermasalah (struktur corrupt atau kolom tidak ada).

## ✅ Solusi (2 Langkah)

### Langkah 1️⃣: Jalankan SQL di Supabase Dashboard

1. Buka https://app.supabase.com/project/gfzidlhfplczcatfenfx/sql/new
2. Copy-paste **SEMUA** kode dari file: `CREATE_POSTS_TABLE.sql`
3. Klik **RUN** (tombol biru di atas editor)
4. Tunggu sampai sukses (hijau) ✅

**Apa yang terjadi:**
- Tabel lama dihapus (jika ada)
- Tabel baru dibuat dengan struktur benar
- Row Level Security (RLS) aktif agar bisa diakses dari frontend
- Index dibuat untuk performa

### Langkah 2️⃣: Restart Frontend

1. Buka terminal: `c:\xampp\htdocs\FinderNeekat\temukembali`
2. Stop server (Ctrl+C jika masih running)
3. Jalankan: 
   ```bash
   npm.cmd run dev
   ```
4. Buka browser: http://localhost:5173/

### Langkah 3️⃣: Test Insert

Di browser:
1. Klik **"Masuk / Daftar"**
2. Sign In dengan: `mahfud@email.com / 123456`
3. Klik **"🔍 Laporkan Kehilangan"**
4. Isi form dan **Laporkan**
5. Cek Supabase Dashboard → **Table Editor** → **posts** 
6. Data harus ada ✅

---

## 🧪 Verifikasi Tanpa UI

Jika masih error, jalankan test di terminal:

```bash
cd c:\xampp\htdocs\FinderNeekat\temukembali
node test-db.js
```

Harus output:
```
✓ Users table: ✅ OK
✓ Posts table: ✅ OK
✅ Insert successful!
```

---

## 📝 Catatan

- File `CREATE_POSTS_TABLE.sql` sudah siap di folder project
- Jangan ubah nama kolom di App.jsx (sudah benar)
- RLS policy memungkinkan siapa saja baca/tulis (untuk development)
- Di production: tighten RLS policies untuk keamanan
