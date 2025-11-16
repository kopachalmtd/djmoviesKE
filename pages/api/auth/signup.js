// pages/api/auth/signup.js
import { connectToDatabase } from "../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function validatePhone(phone) {
  if (!phone) return false;
  const normalized = phone.replace(/\s+/g, "");
  return /^(\+254|254|0)7\d{8}$/.test(normalized);
}

function validatePassword(pw) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pw);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: "Missing phone or password" });
  if (!validatePhone(phone)) return res.status(400).json({ error: "Invalid phone number" });
  if (!validatePassword(password)) return res.status(400).json({ error: "Password does not meet strength requirements" });

  await connectToDatabase();
  const users = (await import("mongodb")).MongoClient; // placeholder to avoid eslint; we'll use collection below
  const db = (await import("mongoose")).connection.db;
  const usersColl = db.collection("users");

  let normalized = phone.replace(/\s+/g, "");
  if (normalized.startsWith("0")) normalized = "254" + normalized.slice(1);
  if (normalized.startsWith("+")) normalized = normalized.slice(1);

  const existing = await usersColl.findOne({ phone: normalized });
  if (existing) return res.status(409).json({ error: "User already exists" });

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = { phone: normalized, password: hashed, createdAt: new Date(), balance: 0, role: "user" };
  const r = await usersColl.insertOne(user);

  const payload = { sub: String(r.insertedId), phone: normalized, role: "user" };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

  res.status(201).json({ ok: true, token, user: { id: r.insertedId, phone: normalized } });
}
