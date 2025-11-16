// pages/movies/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import movies from "../../data/movies";

export default function MoviePage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/auth/signup");
        return;
      }

      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!data.ok) {
        router.replace("/auth/login");
        return;
      }

      setAuthenticated(true);
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (id) {
      const m = movies.find(x => x.id === id);
      setMovie(m || null);
    }
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Checking authentication...</div>;
  if (!authenticated) return null;

  if (!movie) return <div style={{ padding: 20 }}>Movie not found</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{movie.title}</h1>

      <img src={movie.poster} width="200" />

      <p>Price: KES 10</p>

      <button onClick={() => router.push(`/watch/${movie.id}`)}>
        Buy / Watch
      </button>
    </div>
  );
}
