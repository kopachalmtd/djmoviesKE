import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { phone, password } = req.body;
  const normalizedPhone = phone.startsWith("0")
    ? "+254" + phone.substring(1)
    : phone.startsWith("+254")
    ? phone
    : "+254" + phone;

  const hashed = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({ phone: normalizedPhone, password: hashed, balance: 0 })
    .select()
    .single();

  if (error) return res.status(400).json({ error });

  const token = jwt.sign({ sub: data.id, phone: normalizedPhone }, process.env.JWT_SECRET, { expiresIn: "30d" });

  res.status(200).json({ token });
}
