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

## Menjalankan dengan Docker (Windows/Linux/macOS)

Bisa digabung 1 `docker-compose.yml` untuk app + MySQL (seperti contoh kamu).
Di repo ini sudah disiapkan model yang sama:

- Service `app` (Next.js)
- Service `db` (MySQL 8.0)
- SQL bootstrap dari `db/ml_dleague.sql`

Jalankan:

```bash
docker compose up --build
```

Akses layanan:

- App: `http://localhost:${APP_PORT:-4000}`
- MySQL: `localhost:${MYSQL_PORT:-3306}`

Default kredensial MySQL di compose:

- user: `root`
- password: `Diskominfo2026#`
- database: `ml_dleague`

Kalau mau ganti password/nama DB tanpa edit compose, buat file `.env`:

```env
MYSQL_ROOT_PASSWORD=PasswordKamu
MYSQL_DATABASE=ml_dleague
```

Kalau di Docker kamu sudah ada aplikasi lain (port bentrok), ganti port host di `.env`:

```env
APP_PORT=4010
MYSQL_PORT=3307
MYSQL_ROOT_PASSWORD=PasswordKamu
MYSQL_DATABASE=ml_dleague
```

Dengan ini kamu bisa jalanin banyak stack sekaligus tanpa bentrok port.


Lalu jalankan ulang:

```bash
docker compose up --build
```

> Catatan penting: file SQL di `/docker-entrypoint-initdb.d` hanya dieksekusi saat volume database masih baru.
> Kalau ingin import ulang dari nol:

```bash
docker compose down -v
docker compose up --build
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
