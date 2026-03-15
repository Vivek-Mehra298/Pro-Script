"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.replace("/signin");
      return;
    }
    setToken(storedToken);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/signin");
  };

  return (
    <main className="min-h-screen bg-paper px-6 py-12">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">Dashboard</h1>
            <p className="mt-2 text-sm text-black/60">You are signed in.</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-lg border border-black/15 px-4 py-2 text-sm text-black/80 hover:bg-black/5"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-black/10 bg-black/5 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-black/60">Token</p>
          <p className="mt-2 break-all text-sm text-black/80">{token ?? "Checking..."}</p>
        </div>
      </section>
    </main>
  );
}

