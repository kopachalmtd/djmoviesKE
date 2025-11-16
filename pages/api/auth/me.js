// pages/api/auth/me.js
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const token = req.body?.token || (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;

    // Fetch user from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, username, created_at") // adjust fields you want to return
      .eq("id", userId)
      .single();

    if (error) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ ok: true, user });
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
