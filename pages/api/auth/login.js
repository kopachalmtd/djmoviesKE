// pages/api/auth/login.js
import { connectToDatabase } from "../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

function normalizePhone(phone) {
  let p = phone.replace(/\s+/g, "");
  if (p.startsWith("0")) p = "254" + p.slice(1);
  if (p.startsWith("+")) p = p.slice(1);
  return p;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: "Missing fields" });

  await connectToDatabase();
  const db = (await import("mongoose")).connection.db;
  const users = db.collection("users");

  const normalized = normalizePhone(phone);
  const user = await users.findOne({ phone: normalized });
  if (!user) return res.status(401).json({ error: "Invalid phone or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid phone or password" });

  const payload = { sub: String(user._id), phone: user.phone, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

  res.json({ ok: true, token, user: { id: user._id, phone: user.phone } });
}
