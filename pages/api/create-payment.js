// pages/api/create-payment.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { phone, amount } = req.body;

  // Validate
  if (!phone || !amount) return res.status(400).json({ error: "Phone and amount required" });

  // TODO: Call PayHero API here
  // Example:
  // const response = await fetch('https://payhero.example.com/api/stk', { ... });

  // Simulate success
  return res.status(200).json({ ok: true, message: "STK Push sent successfully" });
}
