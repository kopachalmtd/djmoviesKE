// pages/api/movies/getLink.js
import movies from "../../../data/movies";
import { getTelegramFileUrl } from "../../../lib/telegram";

export default async function handler(req, res) {
  const { id } = req.query;
  const movie = movies.find(m => m.id === id);
  if (!movie) return res.status(404).json({ error: "Movie not found" });
  try {
    const url = await getTelegramFileUrl(movie.tg_file_id);
    return res.json({ url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
