const { initializeDatabase, query, requireAdminRole, sendError } = require("../../lib/db");

function mapSite(row) {
  return {
    id: row.id,
    siteKey: row.site_key,
    name: row.name,
    domain: row.domain,
    type: row.type,
    status: row.status,
    publicUrl: row.public_url,
    adminUrl: row.admin_url,
    reservationUrl: row.reservation_url,
    notes: row.notes || ""
  };
}

function normalizeKey(value, fallback = "") {
  return String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
      const result = await query("select * from managed_sites order by status, name, id");
      return res.status(200).json({ sites: result.rows.map(mapSite) });
    }

    if (req.method === "POST") {
      const item = req.body || {};
      const siteKey = normalizeKey(item.siteKey, item.domain || item.name);
      const result = await query(
        `insert into managed_sites (site_key, name, domain, type, status, public_url, admin_url, reservation_url, notes)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         on conflict (site_key)
         do update set name=excluded.name,
                       domain=excluded.domain,
                       type=excluded.type,
                       status=excluded.status,
                       public_url=excluded.public_url,
                       admin_url=excluded.admin_url,
                       reservation_url=excluded.reservation_url,
                       notes=excluded.notes,
                       updated_at=now()
         returning *`,
        [
          siteKey,
          item.name || item.domain || siteKey,
          item.domain || "",
          item.type || "restaurant",
          item.status || "active",
          item.publicUrl || "",
          item.adminUrl || "",
          item.reservationUrl || "",
          item.notes || ""
        ]
      );
      return res.status(200).json({ site: mapSite(result.rows[0]) });
    }

    if (req.method === "DELETE") {
      await query("delete from managed_sites where id = $1", [req.body?.id]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendError(res, error);
  }
};
