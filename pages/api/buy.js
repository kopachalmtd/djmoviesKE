// pages/api/buy.js
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import movies from "../../data/movies";
import { sendTelegramFileToChat } from "../../lib/telegram";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // backend only
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const userId = decoded.sub;

  // -------------------------------
  // 1️⃣ GET USER FROM SUPABASE
  // -------------------------------
  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (userErr || !user)
    return res.status(404).json({ error: "User not found" });

  // -------------------------------
  // 2️⃣ GET MOVIE
  // -------------------------------
  const { movieId } = req.body;
  const movie = movies.find((m) => m.id === movieId);

  if (!movie) return res.status(404).json({ error: "Movie not found" });

  const price = movie.price || 10;

  // -------------------------------
  // 3️⃣ CHECK BALANCE
  // -------------------------------
  if (user.balance < price)
    return res.status(400).json({ error: "Insufficient balance" });

  // -------------------------------
  // 4️⃣ DEDUCT BALANCE (SUPABASE UPDATE)
  // -------------------------------
  const newBalance = user.balance - price;

  const { error: updateErr } = await supabase
    .from("users")
    .update({ balance: newBalance })
    .eq("id", userId);

  if (updateErr)
    return res.status(500).json({ error: "Failed to update balance" });

  // -------------------------------
  // 5️⃣ DELIVER MOVIE VIA TELEGRAM
  // -------------------------------
  const chatId =
    user.telegram_chat_id || process.env.TELEGRAM_ADMIN_CHAT_ID;

  try {
    await sendTelegramFileToChat(
      chatId,
      movie.tg_file_id,
      `🎬 Enjoy your movie: ${movie.title}\nPhone: ${user.phone}`
    );
  } catch (err) {
    // refund
    await supabase
      .from("users")
      .update({ balance: user.balance })
      .eq("id", userId);

    return res.status(500).json({
      error: "Movie delivery failed: " + err.message,
    });
  }

  // -------------------------------
  // 6️⃣ SUCCESS RESPONSE
  // -------------------------------
  return res.json({
    ok: true,
    newBalance,
  });
}
