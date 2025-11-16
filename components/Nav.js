import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Nav() {
  const router = useRouter();
  const [userPhone, setUserPhone] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) setUserPhone(data.user.phone);
          else localStorage.removeItem("token");
        });
    }
  }, []);

  return (
    <nav className="p-4 bg-blue-600 text-white flex justify-between">
      <a href="/">Home</a>
      <div className="space-x-4">
        {userPhone ? (
          <span>{userPhone}</span>
        ) : (
          <>
            <a href="/auth/login">Login</a>
            <a href="/auth/signup">Sign Up</a>
          </>
        )}
      </div>
    </nav>
  );
}
