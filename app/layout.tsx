import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ML Diskominfo League",
  description: "Sistem turnamen Mobile Legends Diskominfo League",
  icons: {
    icon: "/favicon-32.png",
    shortcut: "/favicon-32.png",
    apple: "/apple-touch-icon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
