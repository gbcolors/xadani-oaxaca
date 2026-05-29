const { initializeDatabase, query, requireAdmin, sendError } = require("../lib/db");

function mapSession(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    guests: row.guests,
    tableId: row.table_id,
    arrivalAt: row.arrival_at,
    status: row.status,
    source: row.source,
    closedAt: row.closed_at
  };
}

async function findAvailableTable(guests) {
  const result = await query(
    `select id from tables
     where status = 'free' and capacity >= $1
     order by capacity asc, id asc
     limit 1`,
    [Math.min(10, Math.max(1, Number(guests || 1)))]
  );
  return result.rows[0]?.id || null;
}

module.exports = async function handler(req, res) {
  try {
    await initializeDatabase();
    requireAdmin(req);

    if (req.method === "GET") {
      const result = await query(
        "select * from table_sessions where status = 'active' order by arrival_at desc, id desc"
      );
      return res.status(200).json({ walkins: result.rows.map(mapSession) });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const guests = Math.min(10, Math.max(1, Number(body.guests || 1)));
      const tableId = body.tableId || (await findAvailableTable(guests));

      if (!tableId) {
        return res.status(409).json({ error: "No available table" });
      }

      const result = await query(
        `insert into table_sessions (name, phone, guests, table_id, arrival_at, status, source)
         values ($1, $2, $3, $4, $5, 'active', 'walk_in')
         returning *`,
        [
          String(body.name || "Walk-in").trim(),
          String(body.phone || "").trim(),
          guests,
          tableId,
          body.arrivalAt || new Date().toISOString()
        ]
      );
      await query("update tables set status = 'occupied', updated_at = now() where id = $1", [tableId]);
      return res.status(200).json({ walkin: mapSession(result.rows[0]) });
    }

    if (req.method === "PATCH") {
      const body = req.body || {};
      const id = Number(body.id);
      if (!id) return res.status(400).json({ error: "Missing walk-in id" });

      const current = await query("select * from table_sessions where id = $1", [id]);
      const previous = current.rows[0];
      if (!previous) return res.status(404).json({ error: "Walk-in not found" });

      if (body.status === "closed") {
        const result = await query(
          `update table_sessions
           set status = 'closed', closed_at = now(), updated_at = now()
           where id = $1
           returning *`,
          [id]
        );
        await query("update tables set status = 'free', updated_at = now() where id = $1", [previous.table_id]);
        return res.status(200).json({ walkin: mapSession(result.rows[0]) });
      }

      const nextTableId = body.tableId || previous.table_id;
      const result = await query(
        `update table_sessions
         set name = coalesce($2, name),
             phone = coalesce($3, phone),
             guests = coalesce($4, guests),
             table_id = $5,
             arrival_at = coalesce($6, arrival_at),
             updated_at = now()
         where id = $1
         returning *`,
        [
          id,
          body.name || null,
          body.phone || null,
          body.guests ? Math.min(10, Math.max(1, Number(body.guests))) : null,
          nextTableId,
          body.arrivalAt || null
        ]
      );

      if (previous.table_id !== nextTableId) {
        await query("update tables set status = 'free', updated_at = now() where id = $1", [previous.table_id]);
      }
      await query("update tables set status = 'occupied', updated_at = now() where id = $1", [nextTableId]);
      return res.status(200).json({ walkin: mapSession(result.rows[0]) });
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendError(res, error);
  }
};
