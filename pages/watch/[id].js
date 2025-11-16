// pages/watch/[id].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Nav from "../../components/Nav";

export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const [ok, setOk] = useState(null);
  const [stream, setStream] = useState("");

  useEffect(() => {
    async function check() {
      const token = localStorage.getItem("token");
      if (!token) return setOk(false);
      const res = await fetch("/api/auth/me", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }) });
      if (!res.ok) { setOk(false); return; }
      setOk(true);
    }
    if (id) check();
  }, [id]);

  useEffect(() => {
    async function getLink() {
      if (!id) return;
      const r = await fetch(`/api/movies/getLink?id=${id}`);
      const j = await r.json();
      if (j.url) setStream(j.url);
    }
    if (id) getLink();
  }, [id]);

  if (ok === null) return <div style={{ padding: 20 }}>Checking authentication...</div>;
  if (ok === false) return <div style={{ padding: 20 }}>You must <a href="/auth/login">login</a> to watch this movie.</div>;
  if (!stream) return <div style={{ padding: 20 }}>Loading stream...</div>;

  return (
    <div>
      <Nav />
      <div style={{ padding: 20 }}>
        <h1>Watching {id}</h1>
        <video controls style={{ width: "100%", maxHeight: "70vh" }} src={stream} />
      </div>
    </div>
  );
}
