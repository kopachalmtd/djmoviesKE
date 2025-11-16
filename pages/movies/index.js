// pages/movies/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import movies from "../../data/movies";

export default function MoviesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/auth/signup");
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!data.ok) {
          router.replace("/auth/login");
          return;
        }

        setAuthenticated(true);
      } catch (err) {
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) return <div style={{ padding: 20 }}>Checking authentication...</div>;
  if (!authenticated) return null;

  return (
    <div style={{ padding: 20 }}>
      <h1>Movies</h1>

      {movies.map(movie => (
        <div key={movie.id} style={{
          border: "1px solid #ccc",
          padding: 15,
          marginBottom: 10,
          borderRadius: 6
        }}>
          <h2>{movie.title}</h2>
          <button onClick={() => router.push(`/movies/${movie.id}`)}>
            View / Buy
          </button>
        </div>
      ))}
    </div>
  );
}
