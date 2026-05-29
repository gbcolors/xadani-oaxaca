const { requireAdmin, sendError } = require("../lib/db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    requireAdmin(req);

    const { dataUrl } = req.body || {};
    const match = /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=]+$/i.exec(dataUrl || "");

    if (!match) {
      return res.status(400).json({ error: "Invalid image" });
    }

    if (Buffer.byteLength(dataUrl, "utf8") > 4 * 1024 * 1024) {
      return res.status(413).json({ error: "Image too large" });
    }

    return res.status(200).json({ url: dataUrl });
  } catch (error) {
    return sendError(res, error);
  }
};
