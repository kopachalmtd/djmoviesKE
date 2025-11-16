// pages/api/payhero-callback.js
import { connectToDatabase } from "../../lib/mongodb";
import { sendTelegramMessage } from "../../lib/telegram";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const payload = req.body;

  const ext = payload.external_reference || payload.externalReference;
  const status = (payload.status || payload.transaction_status || "").toString().toLowerCase();
  const amount = Number(payload.amount || payload.total || 0);

  if (!ext || !ext.startsWith("topup_")) {
    return res.json({ ok: true });
  }

  const parts = ext.split("_");
  const userId = parts[1];
  if (status.includes("success") || status.includes("completed")) {
    try {
      await connectToDatabase();
      const db = (await import("mongoose")).connection.db;
      const users = db.collection("users");
      const uid = new ObjectId(userId);
      const u = await users.findOne({ _id: uid });
      if (!u) {
        await sendTelegramMessage(process.env.TELEGRAM_ADMIN_CHAT_ID, `Topup success but user not found: ${userId} ref:${ext}`);
        return res.json({ ok: true });
      }
      const newBal = (u.balance || 0) + amount;
      await users.updateOne({ _id: uid }, { $set: { balance: newBal } });
      await sendTelegramMessage(process.env.TELEGRAM_ADMIN_CHAT_ID, `Credited KES ${amount} to ${u.phone}. New balance: KES ${newBal}`);
      return res.json({ ok: true });
    } catch (err) {
      console.error("PayHero callback error:", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  } else {
    await sendTelegramMessage(process.env.TELEGRAM_ADMIN_CHAT_ID, `PayHero transaction not successful. ref: ${ext}, status: ${payload.status}`);
    return res.json({ ok: true });
  }
}
