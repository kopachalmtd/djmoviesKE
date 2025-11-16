// pages/api/auth/login.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { phone, password } = req.body;

  if (!phone || !password)
    return res.status(400).json({ error: "Missing phone or password" });

  // lookup user
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .single();

  if (error || !user)
    return res.status(400).json({ error: "User not found" });

  // compare password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(401).json({ error: "Invalid password" });

  // JWT token
  const token = jwt.sign(
    { sub: user.id, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    ok: true,
    token,
    user: {
      id: user.id,
      phone: user.phone,
      balance: user.balance,
    },
  });
}
