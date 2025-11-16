// pages/api/create-payment.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { phone, amount } = req.body;

  if (!phone || amount < 5) {
    return res.status(400).json({ error: "Phone required and minimum KES 5" });
  }

  try {
    // Make STK Push request to PayHero API
    const response = await fetch("https://payhero.co.ke/api/stkpush", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PAYHERO_KEY}`
      },
      body: JSON.stringify({
        phone,
        amount,
        external_reference: `topup_${phone}_${Date.now()}`, // unique
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payhero-callback`
      })
    });

    const data = await response.json();
    if (data.success) {
      return res.json({ ok: true, data });
    } else {
      return res.status(400).json({ ok: false, error: data.message || "Payment failed" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
