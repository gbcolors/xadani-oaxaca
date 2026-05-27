const { initializeDatabase, sendError } = require("../../lib/db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await initializeDatabase();
    return res.status(200).json({ ok: true });
  } catch (error) {
    return sendError(res, error);
  }
};
