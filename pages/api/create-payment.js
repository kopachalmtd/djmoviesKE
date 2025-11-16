// pages/api/create-payment.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  const { amount, phone_number, userId } = req.body;
  if (!amount || !phone_number || !userId) return res.status(400).json({ ok: false, error: "Missing fields" });

  const username = process.env.PAYHERO_USERNAME;
  const password = process.env.PAYHERO_PASSWORD;
  const channel_id = process.env.PAYHERO_CHANNEL_ID;
  if (!username || !password || !channel_id) return res.status(500).json({ ok: false, error: "PayHero not configured" });

  const basic = Buffer.from(`${username}:${password}`).toString("base64");
  const external_reference = `topup_${userId}_${Date.now()}`;

  try {
    const resp = await fetch("https://backend.payhero.co.ke/api/v2/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Basic ${basic}` },
      body: JSON.stringify({
        amount: Number(amount),
        phone_number,
        channel_id: Number(channel_id),
        provider: "m-pesa",
        external_reference
      })
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(500).json({ ok: false, error: data });
    return res.json({ ok: true, data, external_reference });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
