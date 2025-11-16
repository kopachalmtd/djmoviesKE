// pages/movies/[id].js
import { useRouter } from "next/router";
import movies from "../../data/movies";
import { useState, useEffect } from "react";
import Nav from "../../components/Nav";

export default function MoviePage() {
  const router = useRouter();
  const { id } = router.query;
  const movie = movies.find(m => m.id === id);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token })
      });
      if (!res.ok) return;
      const j = await res.json();
      setBalance(j.user.balance);
    }
    if (id) load();
  }, [id]);

  if (!movie) return <div style={{ padding: 20 }}>Loading...</div>;

  async function buy() {
    setMsg("");
    const token = localStorage.getItem("token");
    if (!token) return setMsg("You must login to buy");
    setLoading(true);
    const res = await fetch("/api/buy", {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ movieId: movie.id })
    });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(j.error || "Purchase failed");
    setMsg("Purchase successful — movie will be delivered on Telegram.");
    // refresh balance
    const r2 = await fetch("/api/auth/me", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }) });
    if (r2.ok) { const q = await r2.json(); setBalance(q.user.balance); }
  }

  return (
    <div>
      <Nav />
      <div style={{ padding: 20 }}>
        <img src={movie.poster} style={{ width: 320, borderRadius: 8 }} />
        <h1>{movie.title}</h1>
        <p>Price: KES {movie.price}</p>
        <p>Your balance: {balance === null ? "—" : `KES ${balance}`}</p>
        <button onClick={buy} disabled={loading} style={{ background: "#e50914", color: "#fff", padding: "8px 10px", border: "none", borderRadius: 6 }}>
          {loading ? "Processing..." : `Buy for KES ${movie.price}`}
        </button>
        {msg && <div style={{ marginTop: 10 }}>{msg}</div>}
      </div>
    </div>
  );
}
