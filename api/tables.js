const { initializeDatabase, query, requireAdmin, sendError } = require("../lib/db");

module.exports = async function handler(req, res) {
  try {
    await initializeDatabase();

    if (req.method === "GET") {
      const result = await query("select * from tables order by id");
      return res.status(200).json({ tables: result.rows });
    }

    if (req.method === "PUT") {
      requireAdmin(req);
      const tables = Array.isArray(req.body?.tables) ? req.body.tables : [];

      for (const table of tables) {
        await query(
          `insert into tables (id, capacity, zone, status, shape, x, y, updated_at)
           values ($1,$2,$3,$4,$5,$6,$7,now())
           on conflict (id)
           do update set capacity = excluded.capacity,
                         zone = excluded.zone,
                         status = excluded.status,
                         shape = excluded.shape,
                         x = excluded.x,
                         y = excluded.y,
                         updated_at = now()`,
          [table.id, table.capacity, table.zone, table.status, table.shape, table.x, table.y]
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
