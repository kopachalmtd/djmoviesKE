// pages/api/payhero-callback.js
import { createClient } from "@supabase/supabase-js";
import { sendTelegramMessage } from "../../lib/telegram";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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
      // Fetch user from Supabase
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("id, phone, balance")
        .eq("id", userId)
        .single();

      if (fetchError || !user) {
        await sendTelegramMessage(
          process.env.TELEGRAM_ADMIN_CHAT_ID,
          `Topup success but user not found: ${userId} ref:${ext}`
        );
        return res.json({ ok: true });
      }

      const newBalance = (user.balance || 0) + amount;

      // Update user balance
      const { error: updateError } = await supabase
        .from("users")
        .update({ balance: newBalance })
        .eq("id", userId);

      if (updateError) throw updateError;

      await sendTelegramMessage(
        process.env.TELEGRAM_ADMIN_CHAT_ID,
        `Credited KES ${amount} to ${user.phone}. New balance: KES ${newBalance}`
      );

      return res.json({ ok: true });
    } catch (err) {
      console.error("PayHero callback error:", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  } else {
    await sendTelegramMessage(
      process.env.TELEGRAM_ADMIN_CHAT_ID,
      `PayHero transaction not successful. ref: ${ext}, status: ${payload.status}`
    );
    return res.json({ ok: true });
  }
}
