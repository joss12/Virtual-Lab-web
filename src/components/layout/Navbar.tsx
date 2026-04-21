"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`font-mono text-sm transition ${
          active
            ? "text-white border-b border-white pb-0.5"
            : "text-white/50 hover:text-white"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="border-b border-white/10 bg-[#0e1420] px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="font-mono text-lg font-bold text-white">
          vlab
        </Link>

        <div className="flex items-center gap-6">
          {navLink("/study", "Study")}
          {navLink("/lab", "3D Lab")}
          {navLink("/quiz", "Quiz")}
          {navLink("/build", "Build")}
          {navLink("/specs", "Specs")}
          {navLink("/benchmarks", "Benchmarks")}
          {navLink("/glossary", "Glossary")}
          {navLink("/troubleshoot", "Fix")}
          {navLink("/leaderboard", "Ranks")}

          {isAuthenticated && navLink("/dashboard", "Dashboard")}
          {isAuthenticated && navLink("/profile", "Profile")}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="font-mono text-sm text-red-400 transition hover:text-red-300"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/auth/login"
              className={`rounded-md border px-4 py-1.5 font-mono text-sm text-white transition hover:border-white/60 ${
                pathname === "/auth/login"
                  ? "border-white/60"
                  : "border-white/20"
              }`}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
