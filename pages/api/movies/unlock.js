import jwt from "jsonwebtoken";
import { supabaseAdmin } from "../../../lib/supabase";

export default async function handler(req, res) {
  const { token, movieId } = req.body;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("phone", decoded.phone)
    .single();

  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.balance < 10)
    return res.status(400).json({ error: "Insufficient balance" });

  // Deduct 10 KES
  await supabaseAdmin
    .from("users")
    .update({ balance: user.balance - 10 })
    .eq("id", user.id);

  // Record purchase
  await supabaseAdmin.from("purchases").insert([
    {
      user_id: user.id,
      movie_id: movieId,
    },
  ]);

  res.status(200).json({ unlocked: true });
}
