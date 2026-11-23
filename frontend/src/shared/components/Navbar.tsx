"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth";

export default function Navbar() {
  const { owner, isReady, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-serif text-xl text-foreground">
          Rumahku<span className="text-primary">.</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-foreground-muted hover:text-foreground">
            Cari Properti
          </Link>
          {isReady && owner ? (
            <>
              <Link
                href="/pemilik/dashboard"
                className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
              >
                Dashboard Saya
              </Link>
              <button onClick={logout} className="text-foreground-muted hover:text-foreground">
                Keluar
              </button>
            </>
          ) : isReady ? (
            <>
              <Link href="/pemilik/masuk" className="text-foreground-muted hover:text-foreground">
                Masuk Pemilik
              </Link>
              <Link
                href="/pemilik/daftar"
                className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
              >
                Pasang Iklan
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}