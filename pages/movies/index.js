// pages/movies/index.js
import Link from "next/link";
import movies from "../../data/movies";
import Nav from "../../components/Nav";

export default function Movies() {
  return (
    <div>
      <Nav />
      <div style={{ padding: 20 }}>
        <h1>Movies</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {movies.map(m => (
            <div key={m.id} style={{ border: "1px solid #222", padding: 8, borderRadius: 6 }}>
              <img src={m.poster} style={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 6 }} />
              <h3>{m.title}</h3>
              <p>KES {m.price}</p>
              <Link href={`/movies/${m.id}`}><a>View</a></Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
