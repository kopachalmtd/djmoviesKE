// pages/api/payhero-callback.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const payload = req.body;

  const ext = payload.external_reference;
  const status = (payload.status || payload.transaction_status || "").toLowerCase();
  const amount = Number(payload.amount || payload.total || 0);

  if (!ext || !ext.startsWith("topup_")) {
    return res.json({ ok: true });
  }

  const parts = ext.split("_");
  const phone = parts[1];

  try {
    if (status.includes("success") || status.includes("completed")) {
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone)
        .single();

      if (!user) {
        console.error("Topup success but user not found:", phone);
        return res.json({ ok: false });
      }

      const newBalance = (user.balance || 0) + amount;
      await supabase
        .from("users")
        .update({ balance: newBalance })
        .eq("phone", phone);

      console.log(`Credited KES ${amount} to ${phone}. New balance: ${newBalance}`);
      return res.json({ ok: true });
    } else {
      console.log(`Payment not successful for ${phone}, status: ${status}`);
      return res.json({ ok: false, error: "Payment failed/canceled" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
