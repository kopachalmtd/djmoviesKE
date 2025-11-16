import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "../../../lib/supabase";

export default async function handler(req, res) {
  const { phone, password } = req.body;

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("phone", phone)
    .single();

  if (!user) return res.status(400).json({ error: "User not found" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET);

  res.status(200).json({ token });
}
