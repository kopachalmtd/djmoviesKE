import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // IMPORTANT!
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

  const { phone, password } = req.body;

  const normalizedPhone = normalizePhone(phone);
  const hashed = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([{ phone: normalizedPhone, password: hashed, balance: 0 }])
    .select()
    .single();

  if (error) return res.status(400).json({ error });

  const token = jwt.sign(
    { sub: data.id, phone: normalizedPhone },
    process.env.JWT_SECRET
  );

  res.status(200).json({ token });
}
