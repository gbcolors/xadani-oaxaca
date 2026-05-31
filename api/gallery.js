const { initializeDatabase, query, requireAdminRole, sendError } = require("../lib/db");

function mapItem(row) {
  return {
    id: row.id,
    title: row.title,
    caption: row.caption,
    image: row.image,
    type: row.type,
    active: row.active,
    sortOrder: row.sort_order
  };
}

module.exports = async function handler(req, res) {
  try {
    await initializeDatabase();

    if (req.method === "GET") {
      const result = await query(
        "select * from gallery_items where active = true order by sort_order, id"
      );
      return res.status(200).json({ gallery: result.rows.map(mapItem) });
    }

    await requireAdminRole(req, ["owner"]);

    if (req.method === "POST") {
      const item = req.body || {};
      const result = await query(
        `insert into gallery_items (title, caption, image, type, sort_order, active)
         values ($1,$2,$3,$4,$5,true)
         returning *`,
        [
          item.title,
          item.caption || "",
          item.image,
          item.type || "concepto",
          Number(item.sortOrder || 0)
        ]
      );
      return res.status(200).json({ item: mapItem(result.rows[0]) });
    }

    if (req.method === "PUT") {
      const item = req.body || {};
      const result = await query(
        `update gallery_items
         set title=$2, caption=$3, image=$4, type=$5, sort_order=$6, updated_at=now()
         where id=$1
         returning *`,
        [
          item.id,
          item.title,
          item.caption || "",
          item.image,
          item.type || "concepto",
          Number(item.sortOrder || 0)
        ]
      );
      return res.status(200).json({ item: mapItem(result.rows[0]) });
    }

    if (req.method === "DELETE") {
      await query("update gallery_items set active=false, updated_at=now() where id=$1", [req.body?.id]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendError(res, error);
  }
};

