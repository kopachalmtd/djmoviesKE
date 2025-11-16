import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ ok: false, error: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;

    // Fetch user from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("id, phone, balance, created_at")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    res.json({ ok: true, user });
  } catch (err) {
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }
}
