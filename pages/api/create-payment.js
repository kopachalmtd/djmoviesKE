// pages/api/create-payment.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { phone, amount } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({ error: "Phone and amount are required" });
  }

  // Normalize phone (allow 01 or 07)
  let normalizedPhone = phone.replace(/\s+/g, "");
  if (normalizedPhone.startsWith("0")) normalizedPhone = "+254" + normalizedPhone.substring(1);
  if (!normalizedPhone.startsWith("+254")) normalizedPhone = "+254" + normalizedPhone;

  try {
    // Call PayHero API
    const payload = {
      username: process.env.PAYHERO_USERNAME,
      password: process.env.PAYHERO_PASSWORD,
      channel: process.env.PAYHERO_CHANNEL,
      amount,
      phone: normalizedPhone,
      externalReference: `topup_${Date.now()}`, // unique reference
    };

    const response = await fetch("https://api.payhero.co.ke/stkpush", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({ ok: true, message: "STK Push sent successfully" });
    } else {
      return res.status(400).json({ ok: false, error: data.message || "Payment failed" });
    }
  } catch (err) {
    console.error("PayHero API error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
