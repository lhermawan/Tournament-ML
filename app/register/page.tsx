import Link from "next/link";
import { Save } from "lucide-react";
import { registerPlayer } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RANKS, ROLES } from "@/lib/types";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Peserta</CardTitle>
            <p className="text-sm text-muted-foreground">Isi data Mobile Legends dan preferensi role untuk balancing tim.</p>
          </CardHeader>
          <CardContent>
            <form action={registerPlayer} className="grid gap-4 md:grid-cols-2">
              <Field name="name" label="Nama lengkap" placeholder="Nama pegawai" />
              <Field name="nickname" label="Nickname MLBB" placeholder="Nickname in-game" />
              <Field name="mlId" label="ID Mobile Legends" placeholder="12345678 (1234)" />
              <Field name="phone" label="No HP" placeholder="08xxxxxxxxxx" />
              <Field name="unit" label="Unit kerja / bidang" placeholder="Aptika, IKP, Statistik..." />
              <label className="block text-sm font-semibold">
                Rank saat ini
                <select name="rank" className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                  {RANKS.map((rank) => (
                    <option key={rank}>{rank}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Role utama
                <select name="mainRole" className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                  {ROLES.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Role cadangan
                <select name="secondRole" className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Opsional</option>
                  {ROLES.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold md:col-span-2">
                Email
                <input name="email" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" type="email" placeholder="nama@diskominfo.go.id" />
              </label>
              <label className="block text-sm font-semibold md:col-span-2">
                Password
                <input name="password" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" type="password" placeholder="Minimal 8 karakter" />
              </label>
              <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
                <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                  Sudah punya akun
                </Link>
                <Button type="submit">
                  <Save className="h-4 w-4" />
                  Kirim Pendaftaran
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Field({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input name={name} className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder={placeholder} />
    </label>
  );
}
