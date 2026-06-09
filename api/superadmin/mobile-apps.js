const { initializeDatabase, query, requireAdminRole, sendError } = require("../../lib/db");

function mapApp(row) {
  return {
    id: row.id,
    siteKey: row.site_key,
    platform: row.platform,
    appName: row.app_name,
    bundleId: row.bundle_id,
    status: row.status,
    notes: row.notes || ""
  };
}

module.exports = async function handler(req, res) {
  try {
    await initializeDatabase();
    const user = await requireAdminRole(req, ["owner"]);
    if (user.username !== "superadmin") {
      const error = new Error("Forbidden");
      error.statusCode = 403;
      throw error;
    }

    if (req.method === "GET") {
      const result = await query("select * from mobile_app_projects order by site_key, platform, id");
      return res.status(200).json({ apps: result.rows.map(mapApp) });
    }

    if (req.method === "POST") {
      const item = req.body || {};
      const result = await query(
        `insert into mobile_app_projects (site_key, platform, app_name, bundle_id, status, notes)
         values ($1,$2,$3,$4,$5,$6)
         returning *`,
        [
          item.siteKey || "xadani",
          item.platform || "ios",
          item.appName || "",
          item.bundleId || "",
          item.status || "planning",
          item.notes || ""
        ]
      );
      return res.status(200).json({ app: mapApp(result.rows[0]) });
    }

    if (req.method === "DELETE") {
      await query("delete from mobile_app_projects where id = $1", [req.body?.id]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendError(res, error);
  }
};
