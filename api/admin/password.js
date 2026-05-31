const {
  getAdminUsernameFromToken,
  initializeDatabase,
  requireAdmin,
  sendError,
  updateAdminPassword,
  updateAdminRecoveryEmail
} = require("../../lib/db");

module.exports = async function handler(req, res) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await initializeDatabase();
    requireAdmin(req);

    const token = req.headers["x-admin-token"];
    const username = getAdminUsernameFromToken(token);
    const { currentPassword, newPassword, recoveryEmail } = req.body || {};

    if (newPassword || currentPassword) {
      if (!currentPassword || !newPassword || String(newPassword).length < 8) {
        return res.status(400).json({ error: "Invalid password" });
      }
      await updateAdminPassword(username, currentPassword, newPassword);
    }

    if (typeof recoveryEmail === "string") {
      await updateAdminRecoveryEmail(username, recoveryEmail.trim());
    }

    if (!newPassword && typeof recoveryEmail !== "string") {
      return res.status(400).json({ error: "Invalid password" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return sendError(res, error);
  }
};
