const { initializeDatabase, query, requireAdminRole, sendError } = require("../lib/db");

function mapMenu(row) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image,
    tags: row.tags || [],
    active: row.active
  };
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
      const menuResult = await query(
        "select * from menu_items where active = true order by category, sort_order, id"
      );
      const categoryResult = await query(
        "select * from menu_categories where active = true order by sort_order, group_name, name"
      );
      return res.status(200).json({
        categories: categoryResult.rows.map(mapCategory),
        menu: menuResult.rows.map(mapMenu)
      });
    }

    if (req.method === "POST") {
      await requireAdminRole(req, ["owner"]);
      const item = req.body || {};
      const result = await query(
        `insert into menu_items (category, name, description, price, image, tags, active)
         values ($1,$2,$3,$4,$5,$6,true)
         returning *`,
        [
          item.category,
          item.name,
          item.description,
          Number(item.price),
          item.image || "",
          item.tags || []
        ]
      );
      return res.status(200).json({ item: mapMenu(result.rows[0]) });
    }

    if (req.method === "PUT") {
      await requireAdminRole(req, ["owner"]);
      const item = req.body || {};
      const result = await query(
        `update menu_items
         set category = $2,
             name = $3,
             description = $4,
             price = $5,
             image = $6,
             tags = $7,
             updated_at = now()
         where id = $1
         returning *`,
        [
          item.id,
          item.category,
          item.name,
          item.description,
          Number(item.price),
          item.image || "",
          item.tags || []
        ]
      );
      return res.status(200).json({ item: mapMenu(result.rows[0]) });
    }

    if (req.method === "DELETE") {
      await requireAdminRole(req, ["owner"]);
      const { id } = req.body || {};
      await query("update menu_items set active = false, updated_at = now() where id = $1", [id]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendError(res, error);
  }
};

