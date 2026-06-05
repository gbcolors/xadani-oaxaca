const {
  initializeDatabase,
  query,
  requireAdminRole,
  sendError,
  getDefaultMenuCategories,
  getPhysicalMenuItems
} = require("../lib/db");

function mapMenu(row) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    description: row.description,
    price: row.price,
    priceLabel: row.price_label || "",
    image: row.image && String(row.image).startsWith("data:") ? "" : row.image,
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

function publicFallbackMenu() {
  return {
    categories: getDefaultMenuCategories().map(([slug, group, name], index) => ({
      slug,
      group,
      name,
      active: true,
      sortOrder: index
    })),
    menu: getPhysicalMenuItems().map(([category, name, description, price, priceLabel, tagText], index) => ({
      id: `static-${index}`,
      category,
      name,
      description,
      price,
      priceLabel: priceLabel || "",
      image: "",
      tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean),
      active: true
    }))
  };
}

module.exports = async function handler(req, res) {
  try {
    await initializeDatabase();

    if (req.method === "GET") {
      const includeInactive = String(req.query?.includeInactive || "") === "true";
      if (includeInactive) {
        await requireAdminRole(req, ["owner"]);
      }
      const menuResult = await query(
        includeInactive
          ? "select id, category, name, description, price, price_label, case when image like 'data:%' then '' else image end as image, tags, active from menu_items order by active desc, category, sort_order, id"
          : "select id, category, name, description, price, price_label, case when image like 'data:%' then '' else image end as image, tags, active from menu_items where active = true order by category, sort_order, id"
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
        `insert into menu_items (category, name, description, price, price_label, image, tags, active)
         values ($1,$2,$3,$4,$5,$6,$7,$8)
         returning *`,
        [
          item.category,
          item.name,
          item.description,
          Number(item.price || 0),
          item.priceLabel || "",
          item.image || "",
          item.tags || [],
          item.active !== false
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
             price_label = $6,
             image = $7,
             tags = $8,
             active = $9,
             updated_at = now()
         where id = $1
         returning *`,
        [
          item.id,
          item.category,
          item.name,
          item.description,
          Number(item.price || 0),
          item.priceLabel || "",
          item.image || "",
          item.tags || [],
          item.active !== false
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
    if (req.method === "GET" && String(req.query?.includeInactive || "") !== "true") {
      return res.status(200).json(publicFallbackMenu());
    }
    return sendError(res, error);
  }
};
