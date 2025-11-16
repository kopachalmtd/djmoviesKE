import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function SignupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // If already logged in, redirect to movies
      router.replace("/movies");
    }
  }, [router]);

  const handleSignup = async () => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      router.push("/movies"); // redirect after signup
    } else {
      alert("Signup failed");
    }
  };

  return (
    <div>
      <h1>Signup</h1>
      <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
      <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" />
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}
