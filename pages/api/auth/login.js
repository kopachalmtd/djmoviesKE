import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { phone, password } = req.body;

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("phone", phone)
    .single();

  if (error || !user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ sub: user.id, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: "30d" });

  res.status(200).json({ token });
}
