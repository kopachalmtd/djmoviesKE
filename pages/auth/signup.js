import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function SignupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If token exists → go to movies page
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.replace("/movies");
  }, [router]);

  async function handleSignup() {
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      router.push("/movies"); // Go to movies page
    } else {
      alert(data.error?.message || "Signup failed");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Create Account</h1>

      <input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8 }}
      />

      <button
        onClick={handleSignup}
        disabled={loading}
        style={{ padding: "10px 20px", background: "blue", color: "white" }}
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </div>
  );
}
