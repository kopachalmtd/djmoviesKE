// pages/api/buy.js
import { connectToDatabase } from "../../lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import movies from "../../data/movies";
import { sendTelegramFileToChat } from "../../lib/telegram";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });

  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
  catch (e) { return res.status(401).json({ error: "Invalid token" }); }

  await connectToDatabase();
  const db = (await import("mongoose")).connection.db;
  const users = db.collection("users");
  const user = await users.findOne({ _id: new ObjectId(decoded.sub) });
  if (!user) return res.status(404).json({ error: "User not found" });

  const { movieId } = req.body;
  const movie = movies.find(m => m.id === movieId);
  if (!movie) return res.status(404).json({ error: "Movie not found" });

  const price = movie.price || 10;

  // Atomic decrement
  const result = await users.findOneAndUpdate(
    { _id: user._id, balance: { $gte: price } },
    { $inc: { balance: -price } },
    { returnDocument: "after" }
  );
  if (!result.value) return res.status(400).json({ error: "Insufficient balance" });

  const chatId = user.telegramChatId || process.env.TELEGRAM_ADMIN_CHAT_ID;
  try {
    await sendTelegramFileToChat(chatId, movie.tg_file_id, `Enjoy ${movie.title}! Purchased by ${user.phone}`);
  } catch (err) {
    // refund
    await users.updateOne({ _id: user._id }, { $inc: { balance: price } });
    return res.status(500).json({ error: "Failed to deliver movie: " + err.message });
  }

  res.json({ ok: true, newBalance: result.value.balance });
}
