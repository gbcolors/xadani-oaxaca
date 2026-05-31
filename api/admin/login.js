const {
  initializeDatabase,
  sendError,
  signAdminToken,
  verifyAdminCredentials
} = require("../../lib/db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await initializeDatabase();

    const { username, password } = req.body || {};
    const user = await verifyAdminCredentials(username, password);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.status(200).json({ token: signAdminToken(username), user });
  } catch (error) {
    return sendError(res, error);
  }
};
