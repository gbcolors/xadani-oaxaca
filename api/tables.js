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
      const tables = Array.isArray(req.body?.tables) ? req.body.tables : [req.body].filter(Boolean);

      for (const table of tables) {
        const originalId = table.originalId || table.id;
        if (originalId && originalId !== table.id) {
          await query("update reservations set table_id = $2 where table_id = $1", [originalId, table.id]);
          await query("update table_sessions set table_id = $2 where table_id = $1", [originalId, table.id]);
          await query("delete from tables where id = $1", [originalId]);
        }

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
          [
            String(table.id || "").trim(),
            Math.min(10, Math.max(1, Number(table.capacity || 1))),
            String(table.zone || "").trim(),
            table.status || "free",
            table.shape === "round" ? "round" : "square",
            Number(table.x || 0),
            Number(table.y || 0)
          ]
        );
      }

      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      requireAdmin(req);
      const id = String(req.body?.id || "").trim();
      if (!id) return res.status(400).json({ error: "Missing table id" });

      await query("delete from tables where id = $1", [id]);
      await query("update reservations set table_id = null where table_id = $1", [id]);
      await query("update table_sessions set status = 'closed', closed_at = now(), updated_at = now() where table_id = $1 and status = 'active'", [id]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendError(res, error);
  }
};
