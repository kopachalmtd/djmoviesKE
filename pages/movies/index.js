import { useEffect } from "react";
import { useRouter } from "next/router";

export default function MoviesPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // No token → first-time user → redirect to signup
      router.replace("/auth/signup");
    } else {
      // Optional: validate token with backend
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.ok) {
            // Invalid token → redirect to login
            router.replace("/auth/login");
          }
        })
        .catch(() => router.replace("/auth/login"));
    }
  }, [router]);

  return (
    <div>
      <h1>Movies</h1>
      {/* Only visible if user is authenticated */}
      <p>Loading movies...</p>
    </div>
  );
}
