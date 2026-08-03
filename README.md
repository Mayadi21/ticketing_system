# Sistem Informasi Ticketing (Helpdesk & Support)

Aplikasi Ticketing System berbasis web yang dirancang untuk mengelola dan memantau pelaporan kendala teknis/operasional antar unit kerja (Branch), Tim Admin, Super Admin, dan Teknisi (Engineer).

---

## 🚀 Teknologi Utama

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Bahasa**: TypeScript
- **Database & ORM**: PostgreSQL & [Prisma ORM v7](https://www.prisma.io/)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), Lucide Icons, Recharts, React Hot Toast
- **Email Service**: Nodemailer (SMTP)
- **Autentikasi & Keamanan**: Custom Cookie/Session Auth & `bcryptjs`

---

## 👥 Peran Pengguna (User Roles)

1. **SUPER_ADMIN**: manajemen pengguna dan bank cabang
2. **ADMIN**: Mengelola tiket kendala, melakukan verifikasi, assign kendala ke Engineer, dan menutup status tiket.
3. **ENGINEER**: Menerima penugasan tiket, menangani permasalahan di lapangan/sistem, serta mengunggah bukti penanganan.
4. **BRANCH**: Mengajukan tiket kendala baru dari unit cabang dan memantau progres penanganan.

---

## 🛠️ Prasyarat Sistem (Prerequisites)

Sebelum menjalankan aplikasi ini, pastikan sistem Anda telah terpasang:
- **Node.js**: (disarankan v20+)
- **NPM**
- **PostgreSQL**: Server PostgreSQL lokal atau cloud database (Supabase, Neon, AWS RDS, dll.)

---

## ⚙️ Pengaturan Variabel Lingkungan (.env)

Buat file `.env` pada akar direktori proyek berdasarkan file `.env.example`:

```bash
cp .env.example .env
```

Isi variabel lingkungan berikut sesuai konfigurasi Anda:

```env
# Koneksi Database PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/db_ticketing?schema=public"

# Lokasi Penyimpanan File Lampiran
STORAGE_PATH="public/attachments"

# Pengaturan Pengiriman Email (SMTP)
MAIL_PROVIDER="smtp"
SMTP_USER="email@example.com"
SMTP_PASS="password_smtp_atau_app_password"

# URL Aplikasi (Digunakan untuk link di dalam email notification)
DEV_APP_URL="http://localhost:3000"
```

---

## 💻 Cara Jalankan untuk Development

1. **Clone Repository & Install Dependencies**:
   ```bash
   git clone <URL_REPOSITORY_ANDA>
   cd ticketing_system1
   npm install
   ```

2. **Generate Prisma Client & Sync Database Schema**:
   ```bash
   # Melakukan sinkronisasi skema Prisma ke database PostgreSQL
   npx prisma db push

   # Menggenerate Prisma Client ke folder src/generated/prisma
   npx prisma generate
   ```

3. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```

4. **Akses Aplikasi**:
   Buka browser dan akses `http://localhost:3000`.

---

## 🏗️ Production

Untuk menjalankan aplikasi ini di lingkungan produksi (Production Environment), ikuti langkah-langkah berikut:

### Metode 1: Menggunakan Node.js Server + PM2 (Rekomendasi On-Premise / VPS)

1. **Persiapan Environment (.env)**:
   Pastikan variabel `DATABASE_URL` mengarah ke database produksi dan `DEV_APP_URL` disesuaikan dengan domain produksi (misal: `https://helpdesk.banksumut.co.id`).

2. **Sync Database Skema di Production**:
   ```bash
   npx prisma db push
   # atau jika menggunakan Prisma Migrations:
   # npx prisma migrate deploy
   ```

3. **Build Aplikasi (Compilation)**:
   ```bash
   npm run build
   ```

4. **Jalankan Aplikasi dengan Process Manager (PM2)**:
   Disarankan menggunakan **PM2** agar aplikasi tetap berjalan di background dan otomatis restart jika server melakukan reboot.

   - Install PM2 secara global (jika belum ada):
     ```bash
     npm install -g pm2
     ```
   - Jalankan aplikasi:
     ```bash
     pm2 start npm --name "ticketing-app" -- start
     ```
   - Simpan konfigurasi PM2 agar otomatis jalan saat boot:
     ```bash
     pm2 save
     pm2 startup
     ```

5. **Konfigurasi Reverse Proxy (Nginx / IIS)**:
   Hubungkan domain/IP server ke port aplikasi (default: 3000) menggunakan Nginx.

   **Contoh Konfigurasi Nginx:**
   ```nginx
   server {
       listen 80;
       server_name helpdesk.banksumut.co.id;

       client_max_body_size 20M; # Sesuaikan untuk batas ukuran upload lampiran

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

---

### Metode 2: Containerization dengan Docker (Opsional)

Aplikasi dapat dijalankan dalam kontainer Docker dengan `Dockerfile` standar Next.js:

1. **Build Docker Image**:
   ```bash
   docker build -t ticketing-system:latest .
   ```


2. **Run Container**:
   ```bash
   docker run -d \
     --name ticketing-app \
     -p 3000:3000 \
     --env-file .env \
     ticketing-system:latest
   ```

---

### Metode 3: Deploy ke Vercel / Cloud Platform

Jika menggunakan platform cloud seperti **Vercel**:

1. Push kode ke repositori Git (GitHub / GitLab).
2. Hubungkan repositori ke Vercel.
3. Atur **Environment Variables** di dashboard Vercel (`DATABASE_URL`, `SMTP_USER`, `SMTP_PASS`, dll).
4. Sesuaikan **Build Command**:
   ```bash
   npx prisma generate && next build
   ```

---

## 📁 Struktur Direktori Proyek

```text
ticketing_system1/
├── prisma/
│   └── schema.prisma        # Definisi database schema & Prisma ORM
├── public/
│   └── attachments/         # Direktori penyimpanan file upload lampiran
├── src/
│   ├── app/                 # Next.js App Router (Pages, Layouts, API & Server Actions)
│   ├── components/          # Komponen UI Reusable (Ticket, Form, Table, Dashboard)
│   ├── generated/           # Output Prisma Client yang di-generate
│   ├── lib/                 # Utility library (Prisma Client instance, dll)
│   ├── utils/               # Helper fungsi & pengiriman email (Nodemailer)
│   └── middleware.ts        # Next.js Middleware untuk proteksi route & auth
├── .env.example             # Template variabel lingkungan
├── next.config.ts           # Konfigurasi Next.js
├── package.json             # Dependensi & script proyek
└── README.md                # Dokumentasi proyek
```

---

## 📝 Catatan Tambahan

- **Penyimpanan File**: Pastikan folder `public/attachments` memiliki izin tulis (*write permission*) pada OS/server produksi agar proses upload lampiran berjalan lancar.
- **Backup Database**: Disarankan melakukan backup otomatis basis data PostgreSQL secara berkala di lingkungan produksi.
