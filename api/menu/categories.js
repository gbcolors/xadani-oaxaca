const { initializeDatabase, query, requireAdmin, sendError } = require("../../lib/db");

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function mapCategory(row) {
  return {
    slug: row.slug,
    group: row.group_name,
    name: row.name,
    active: row.active,
    sortOrder: row.sort_order
  };
}

module.exports = async function handler(req, res) {
  try {
    await initializeDatabase();

    if (req.method === "GET") {
      const result = await query(
        "select * from menu_categories where active = true order by sort_order, group_name, name"
      );
      return res.status(200).json({ categories: result.rows.map(mapCategory) });
    }

    requireAdmin(req);

    if (req.method === "POST") {
      const category = req.body || {};
      const groupName = String(category.group || "").trim().toUpperCase();
      const name = String(category.name || "").trim().toUpperCase();
      const baseSlug = slugify(`${groupName}-${name}`);

      if (!groupName || !name || !baseSlug) {
        return res.status(400).json({ error: "Missing category data" });
      }

      const result = await query(
        `insert into menu_categories (slug, group_name, name, active, sort_order)
         values ($1, $2, $3, true, $4)
         on conflict (slug)
         do update set group_name = excluded.group_name,
                       name = excluded.name,
                       active = true,
                       sort_order = excluded.sort_order,
                       updated_at = now()
         returning *`,
        [baseSlug, groupName, name, Number(category.sortOrder || 0)]
      );

      return res.status(200).json({ category: mapCategory(result.rows[0]) });
    }

    if (req.method === "PUT") {
      const category = req.body || {};
      const slug = String(category.slug || "").trim();
      const groupName = String(category.group || "").trim().toUpperCase();
      const name = String(category.name || "").trim().toUpperCase();

      if (!slug || !groupName || !name) {
        return res.status(400).json({ error: "Missing category data" });
      }

      const result = await query(
        `update menu_categories
         set group_name = $2,
             name = $3,
             sort_order = $4,
             updated_at = now()
         where slug = $1
         returning *`,
        [slug, groupName, name, Number(category.sortOrder || 0)]
      );

      return res.status(200).json({ category: mapCategory(result.rows[0]) });
    }

    if (req.method === "DELETE") {
      const slug = String(req.body?.slug || "").trim();
      if (!slug) return res.status(400).json({ error: "Missing slug" });

      await query("update menu_categories set active = false, updated_at = now() where slug = $1", [slug]);
      await query("update menu_items set active = false, updated_at = now() where category = $1", [slug]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendError(res, error);
  }
};
