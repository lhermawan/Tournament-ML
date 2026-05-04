# Mobile Legends Diskominfo League System

Aplikasi web internal turnamen Mobile Legends berbasis Next.js App Router.

## Fitur Phase 1

- Login/register UI
- Form pendaftaran peserta dan role
- Auto team balancer berdasarkan role utama, role cadangan, dan poin rank
- Generate jadwal round robin
- Klasemen otomatis dari hasil match
- Panel admin untuk alur operasional turnamen

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- ShadCN-inspired UI components
- Prisma ORM
- MySQL/MariaDB

## Menjalankan Lokal

```bash
npm install
npx prisma generate
npm run dev
```

File `.env` sudah disiapkan untuk database lokal:

```env
DATABASE_URL="mysql://root:@localhost:3306/ml_dleague"
```

Jika MySQL kamu memakai password, ubah menjadi:

```env
DATABASE_URL="mysql://root:password_kamu@localhost:3306/ml_dleague"
```

## Setup Database

Buat database di MySQL/MariaDB:

```sql
CREATE DATABASE ml_dleague;
```

Lalu jalankan:

```bash
npx prisma migrate dev --name init
npm run db:seed
```

Seed membuat akun admin default:

- Email: `admin@diskominfo.local`
- Password: `admin12345`

## Environment

Lihat [.env.example](.env.example).

## Halaman

- `/` dashboard publik
- `/login`
- `/register`
- `/dashboard`
- `/season`
- `/teams`
- `/schedule`
- `/standings`
- `/admin`

## Core Logic

Algoritma utama ada di [lib/tournament.ts](lib/tournament.ts). File ini berisi:

- grouping peserta berdasarkan role
- pemakaian role cadangan jika role utama tidak seimbang
- shuffle deterministik
- reroll untuk mencari selisih power tim paling kecil
- generate round robin
- kalkulasi klasemen
