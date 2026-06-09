const { initializeDatabase, query, requireAdminRole, sendError } = require("../../lib/db");

function mapEmail(row) {
  return {
    id: row.id,
    siteKey: row.site_key,
    displayName: row.display_name,
    email: row.email,
    role: row.role,
    provider: row.provider,
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
      const result = await query("select * from team_email_accounts order by site_key, email, id");
      return res.status(200).json({ emails: result.rows.map(mapEmail) });
    }

    if (req.method === "POST") {
      const item = req.body || {};
      const result = await query(
        `insert into team_email_accounts (site_key, display_name, email, role, provider, status, notes)
         values ($1,$2,$3,$4,$5,$6,$7)
         on conflict (id)
         do update set site_key=excluded.site_key,
                       display_name=excluded.display_name,
                       email=excluded.email,
                       role=excluded.role,
                       provider=excluded.provider,
                       status=excluded.status,
                       notes=excluded.notes,
                       updated_at=now()
         returning *`,
        [
          item.siteKey || "xadani",
          item.displayName || "",
          item.email || "",
          item.role || "team",
          item.provider || "pending",
          item.status || "requested",
          item.notes || ""
        ]
      );
      return res.status(200).json({ email: mapEmail(result.rows[0]) });
    }

    if (req.method === "DELETE") {
      await query("delete from team_email_accounts where id = $1", [req.body?.id]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendError(res, error);
  }
};
