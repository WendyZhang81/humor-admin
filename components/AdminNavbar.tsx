"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error.message);
      setSigningOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  };

  const linkClass = (href: string) => {
    const active =
      href === "/"
        ? pathname === "/"
        : pathname.startsWith(href);

    return active
      ? "font-semibold text-[#1D4F91]"
      : "text-slate-500 hover:text-[#1D4F91]";
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1D4F91]/10 bg-[#F7F5F0]/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-[#B9D9EB] border border-[#1D4F91]/20 flex items-center justify-center text-xl">
            🗽
          </div>

          <div>
            <p className="font-bold text-lg leading-none">
              Campus Laughs Admin
            </p>

            <p className="text-[10px] uppercase tracking-[0.18em] text-[#1D4F91] mt-1">
              Operations Dashboard
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-5 text-sm">
          <Link
            href="/"
            className={linkClass("/")}
          >
            Dashboard
          </Link>

          <Link
            href="/users"
            className={linkClass("/users")}
          >
            Users
          </Link>

          <Link
            href="/generations"
            className={linkClass("/generations")}
          >
            Generations
          </Link>

          <Link
            href="/votes"
            className={linkClass("/votes")}
          >
            Votes
          </Link>

          <div className="h-5 w-px bg-[#1D4F91]/15" />

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-slate-500 hover:text-[#1D4F91] disabled:opacity-50"
          >
            {signingOut
              ? "Signing Out..."
              : "Sign Out"}
          </button>
        </div>
      </div>
    </nav>
  );
}