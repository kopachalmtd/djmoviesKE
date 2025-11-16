// pages/watch/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import movies from "../../data/movies";

export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;

  const MOVIE_PRICE = 10; // or from env
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [movie, setMovie] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(MOVIE_PRICE);
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/auth/signup");
        return;
      }

      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!data.ok) {
        router.replace("/auth/login");
        return;
      }

      setAuthenticated(true);
      setUser(data.user);
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (id) {
      const m = movies.find(x => x.id === id);
      setMovie(m || null);
    }
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Checking authentication...</div>;
  if (!authenticated) return null;
  if (!movie) return <div style={{ padding: 20 }}>Movie not found</div>;

  const handleWatch = async () => {
    if (user.balance >= MOVIE_PRICE) {
      // Deduct movie price via API
      const res = await fetch("/api/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ movieId: movie.id })
      });
      const data = await res.json();
      if (data.ok) {
        alert("Balance deducted. Enjoy your movie!");
      }
    } else {
      // Show payment popup
      setShowPayment(true);
    }
  };

  const handlePayment = async () => {
    if (!phone || amount < 5) {
      alert("Phone required & minimum KES 5");
      return;
    }

    setPaymentStatus("Processing payment...");

    const res = await fetch("/api/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, amount })
    });

    const data = await res.json();
    if (data.ok) {
      setPaymentStatus("Payment successful! Balance updated.");
      setShowPayment(false);
      setUser(prev => ({ ...prev, balance: prev.balance + amount }));
    } else {
      setPaymentStatus("Payment failed or canceled.");
    }
  };

  return (
    <div style={{ padding: 20, position: "relative" }}>
      {/* Sidebar */}
      <div style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 60,
        height: "100%",
        background: "#111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 20
      }}>
        <button onClick={() => router.push("/movies")} style={{ marginBottom: 20 }}>🏠</button>
        <button onClick={() => setShowPayment(true)} style={{ marginBottom: 20 }}>💰</button>
        <button onClick={() => { localStorage.removeItem("token"); router.push("/auth/login"); }}>🚪</button>
      </div>

      <div style={{ marginLeft: 80 }}>
        <h1>{movie.title}</h1>
        <img src={movie.poster} width="200" />
        <p>Price: KES {MOVIE_PRICE}</p>
        <p>Your balance: KES {user.balance}</p>
        <button onClick={handleWatch}>Buy / Watch</button>

        {/* Payment Popup */}
        {showPayment && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
              <h2>Pay with PayHero</h2>
              <input
                type="text"
                placeholder="Phone (01 or 07)"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ display: "block", marginBottom: 10, padding: 8 }}
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                style={{ display: "block", marginBottom: 10, padding: 8 }}
                min={5}
              />
              <button onClick={handlePayment}>Complete Payment</button>
              <button onClick={() => setShowPayment(false)} style={{ marginLeft: 10 }}>Cancel</button>
              <p>{paymentStatus}</p>
            </div>
          </div>
        )}

        {/* Telegram Video Player */}
        {user.balance >= MOVIE_PRICE && (
          <div style={{ marginTop: 20 }}>
            <iframe
              title={movie.title}
              src={`https://t.me/v/${movie.telegramFileId}`}
              width="640"
              height="360"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
}
