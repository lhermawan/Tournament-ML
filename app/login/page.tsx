import Link from "next/link";
import { loginUser } from "@/app/actions";
import { ActionSubmitButton } from "@/components/ui/action-submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Masuk Admin / Peserta</CardTitle>
          <p className="text-sm text-muted-foreground">Gunakan akun turnamen untuk mengakses dashboard.</p>
        </CardHeader>
        <CardContent>
          <form action={loginUser} className="space-y-4">
            <label className="block text-sm font-semibold">
              Email
              <input name="email" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" type="email" placeholder="admin@diskominfo.local" />
            </label>
            <label className="block text-sm font-semibold">
              Password
              <input name="password" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" type="password" placeholder="admin12345" />
            </label>
            <ActionSubmitButton className="w-full" label="Masuk" pendingLabel="Sedang masuk..." />
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/register" className="font-bold text-primary">
              Daftar peserta
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
