const { initializeDatabase, query, requireAdmin, sendError } = require("../lib/db");

module.exports = async function handler(req, res) {
  try {
    await initializeDatabase();

    if (req.method === "GET") {
      const result = await query("select key, value from app_settings order by key");
      const settings = Object.fromEntries(result.rows.map((row) => [row.key, row.value]));
      return res.status(200).json({ settings });
    }

    if (req.method === "PUT") {
      requireAdmin(req);
      const settings = req.body || {};

      for (const [key, value] of Object.entries(settings)) {
        await query(
          `insert into app_settings (key, value, updated_at)
           values ($1, $2, now())
           on conflict (key)
           do update set value = excluded.value, updated_at = now()`,
          [key, String(value)]
        );
      }

      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendError(res, error);
  }
};
