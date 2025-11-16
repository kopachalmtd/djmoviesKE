import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { phone, password } = req.body;

  if (!phone || !password)
    return res.status(400).json({ error: "Missing phone or password" });

  try {
    const hashed = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert({
        phone,
        password: hashed,
        balance: 0
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Create JWT token
    const token = jwt.sign(
      { id: data.id, phone: data.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ token });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
