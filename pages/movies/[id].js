import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function MoviesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/signup"); // new users
      return;
    }

    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) router.replace("/auth/login"); // returning users
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p>Checking authentication...</p>;

  return <div>{/* movie list here */}</div>;
}
