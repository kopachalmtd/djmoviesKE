// components/Nav.js
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Nav() {
  const [balance, setBalance] = useState(null);

  async function load() {
    const token = localStorage.getItem("token");
    if (!token) { setBalance(null); return; }
    try {
      const res = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token })
      });
      if (!res.ok) { setBalance(null); return; }
      const j = await res.json();
      setBalance(j.user?.balance ?? 0);
    } catch (e) { setBalance(null); }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: 12, background: "#0b0b0b", alignItems: "center" }}>
      <div style={{ fontWeight: 700, color: "#e50914" }}><Link href="/"><a>DjmoviesKE</a></Link></div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/movies"><a>Movies</a></Link>
        <Link href="/auth/signup"><a>Sign up</a></Link>
        <Link href="/auth/login"><a>Login</a></Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#111", padding: "6px 10px", borderRadius: 20 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffd700"><path d="M12 1L3 5v6c0 5.523 3.58 10.74 9 12 5.42-1.26 9-6.477 9-12V5l-9-4z"/></svg>
          <div style={{ fontSize: 14 }}>
            {balance === null ? "—" : `KES ${balance}`}
          </div>
        </div>

        <Link href="/topup"><a style={{ marginLeft: 8 }}>Top-up</a></Link>
      </div>
    </nav>
  );
}
