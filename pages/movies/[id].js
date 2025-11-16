import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function MovieDetailPage() {
  const router = useRouter();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/auth/signup");
      return;
    }

    // Optional: validate token
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) router.replace("/auth/login");
      });
  }, [router]);

  useEffect(() => {
    if (router.query.id) {
      // Load movie from data/movies.js
      import("../../data/movies").then((mod) => {
        const movie = mod.movies.find((m) => m.id === router.query.id);
        setMovie(movie);
      });
    }
  }, [router.query.id]);

  if (!movie) return <p>Loading...</p>;

  return (
    <div>
      <h1>{movie.title}</h1>
      <button>Buy/View</button>
    </div>
  );
}
