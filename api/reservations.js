const { initializeDatabase, query, requireAdmin, sendError } = require("../lib/db");

function mapReservation(row) {
  return {
    id: row.id,
    folio: row.folio,
    name: row.name,
    phone: row.phone,
    email: row.email,
    guests: row.guests,
    time: row.reservation_time,
    restrictions: row.restrictions,
    paymentType: row.payment_type,
    paymentLabel: row.payment_label,
    paymentTotal: row.payment_total,
    paymentStatus: row.payment_status,
    status: row.status,
    tableId: row.table_id,
    createdAt: row.created_at
  };
}

module.exports = async function handler(req, res) {
  try {
    await initializeDatabase();

    if (req.method === "GET") {
      requireAdmin(req);
      const result = await query("select * from reservations order by created_at desc");
      return res.status(200).json({ reservations: result.rows.map(mapReservation) });
    }

    if (req.method === "POST") {
      const reservation = req.body || {};
      const result = await query(
        `insert into reservations
         (folio, name, phone, email, guests, reservation_time, restrictions,
          payment_type, payment_label, payment_total, payment_status, status)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         on conflict (folio)
         do update set
           name = excluded.name,
           phone = excluded.phone,
           email = excluded.email,
           guests = excluded.guests,
           reservation_time = excluded.reservation_time,
           restrictions = excluded.restrictions,
           payment_type = excluded.payment_type,
           payment_label = excluded.payment_label,
           payment_total = excluded.payment_total,
           payment_status = excluded.payment_status,
           updated_at = now()
         returning *`,
        [
          reservation.folio,
          reservation.name,
          reservation.phone,
          reservation.email || "",
          Number(reservation.guests || 1),
          reservation.time,
          reservation.restrictions || "",
          reservation.paymentType || "free",
          reservation.paymentLabel || "Reserva sin cargo",
          Number(reservation.paymentTotal || 0),
          reservation.paymentStatus || "not_required",
          reservation.status || "pending"
        ]
      );

      return res.status(200).json({ reservation: mapReservation(result.rows[0]) });
    }

    if (req.method === "PATCH") {
      requireAdmin(req);
      const { folio, status, paymentStatus, tableId } = req.body || {};

      if (!folio) {
        return res.status(400).json({ error: "Missing folio" });
      }

      const result = await query(
        `update reservations
         set status = coalesce($2, status),
             payment_status = coalesce($3, payment_status),
             table_id = coalesce($4, table_id),
             updated_at = now()
         where folio = $1
         returning *`,
        [folio, status || null, paymentStatus || null, tableId || null]
      );

      return res.status(200).json({ reservation: mapReservation(result.rows[0]) });
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendError(res, error);
  }
};
