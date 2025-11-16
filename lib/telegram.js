// lib/telegram.js

export async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId || !text) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
}

// Send a file to a Telegram chat
export async function sendTelegramFileToChat(chatId, fileId, caption = "") {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId || !fileId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      document: fileId,
      caption,
      parse_mode: "HTML",
    }),
  });
}

// Get the file download URL from Telegram
export async function getTelegramFileUrl(fileId) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !fileId) return null;

  // 1. Get file info
  const infoRes = await fetch(
    `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
  );
  const infoData = await infoRes.json();
  if (!infoData.ok) return null;

  const filePath = infoData.result.file_path;

  // 2. Return file URL
  return `https://api.telegram.org/file/bot${token}/${filePath}`;
}
