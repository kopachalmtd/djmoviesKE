import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // IMPORTANT: must match .env
);

function normalizePhone(phone) {
  let p = phone.replace(/\s+/g, "");
  if (p.startsWith("0")) p = "+254" + p.substring(1);
  if (!p.startsWith("+254")) p = "+254" + p;
  return p;
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ error: "Missing phone or password" });

    const normalizedPhone = normalizePhone(phone);
    const hashed = await bcrypt.hash(password, 10);

    // Insert into Supabase
    const { data, error } = await supabase
      .from("users")
      .insert([{ phone: normalizedPhone, password: hashed, balance: 0 }])
      .select()
      .single();

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);
      return res.status(400).json({ error: error.message });
    }

    // Create JWT
    const token = jwt.sign(
      { sub: data.id, phone: normalizedPhone },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({ token });

  } catch (err) {
    console.error("SIGNUP API ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
