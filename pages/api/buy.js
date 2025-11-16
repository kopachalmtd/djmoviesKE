// pages/api/buy.js
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MOVIE_PRICE = 10;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });

  const { movieId } = req.body;
  if (!movieId) return res.status(400).json({ error: "Missing movie ID" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) return res.status(404).json({ error: "User not found" });

    if (user.balance < MOVIE_PRICE)
      return res.status(400).json({ error: "Insufficient balance" });

    const newBalance = user.balance - MOVIE_PRICE;
    await supabase.from("users").update({ balance: newBalance }).eq("id", userId);

    // Optionally record purchase
    await supabase.from("purchases").insert({
      user_id: userId,
      movie_id: movieId,
      amount: MOVIE_PRICE,
      created_at: new Date()
    });

    return res.json({ ok: true, newBalance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
