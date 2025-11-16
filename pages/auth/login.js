// pages/auth/login.js
import { useState } from "react";
import Router from "next/router";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone, password })
    });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(j.error || "Login failed");
    localStorage.setItem("token", j.token);
    Router.push("/movies");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Sign in</h1>
      <form onSubmit={handleLogin} style={{ maxWidth: 420 }}>
        <label>Phone</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="07XXXXXXXX" style={{ width: "100%", padding: 8 }} />
        <label style={{ marginTop: 8 }}>Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Your password" style={{ width: "100%", padding: 8 }} />
        {err && <div style={{ color: "red", marginTop: 8 }}>{err}</div>}
        <button disabled={loading} style={{ marginTop: 12, padding: 10 }}>{loading ? "Signing..." : "Sign in"}</button>
      </form>
    </div>
  );
}
