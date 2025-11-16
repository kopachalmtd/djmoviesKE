import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function SignupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/movies");

    } catch (err) {
      alert("Network error");
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
