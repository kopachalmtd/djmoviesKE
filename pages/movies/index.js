import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import movies from "../../data/movies"; // your movies data

export default function MoviesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // ✅ Add useEffect here to check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/signup"); // first-time users
      return;
    }

    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) router.replace("/auth/login"); // returning users with invalid token
        else setAuthenticated(true);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p>Checking authentication...</p>; // show while checking

  if (!authenticated) return null; // redirecting

  return (
    <div>
      <h1>Movies</h1>
      <div>
        {movies.map((movie) => (
          <div key={movie.id}>
            <h2>{movie.title}</h2>
            <button onClick={() => router.push(`/movies/${movie.id}`)}>
              View/Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
