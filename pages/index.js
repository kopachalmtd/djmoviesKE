// pages/index.js
import Link from "next/link";
import Nav from "../components/Nav";
import movies from "../data/movies";

export default function Home() {
  return (
    <div>
      <Nav />
      <div style={{ padding: 20 }}>
        <h1 style={{ color: "#e50914" }}>DjmoviesKE</h1>
        <p>Each movie KES 10 — pay with M-Pesa (PayHero)</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 16 }}>
          {movies.map(m => (
            <div key={m.id} style={{ background: "#111", padding: 12, borderRadius: 8 }}>
              <img src={m.poster} style={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 6 }} />
              <h3 style={{ marginTop: 8 }}>{m.title}</h3>
              <p>KES {m.price}</p>
              <Link href={`/movies/${m.id}`}><a style={{ background: "#e50914", color: "#fff", padding: "8px 10px", borderRadius: 6 }}>View / Buy</a></Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
