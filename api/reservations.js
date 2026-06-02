const { initializeDatabase, query, requireAdmin, sendError } = require("../lib/db");
const { sendReservationNotification } = require("../lib/mailer");

function mapReservation(row) {
  return {
    id: row.id,
    folio: row.folio,
    name: row.name,
    phone: row.phone,
    email: row.email,
    date: row.reservation_date,
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

async function setTableStatusForReservation(tableId, status) {
  if (!tableId) return;
  const tableStatus = status === "seated" ? "occupied" : "reserved";
  await query("update tables set status = $2, updated_at = now() where id = $1", [tableId, tableStatus]);
}

async function releaseTable(tableId) {
  if (!tableId) return;
  await query("update tables set status = 'free', updated_at = now() where id = $1", [tableId]);
}

async function getReservationNotificationEmail() {
  const result = await query("select value from app_settings where key = 'reservationNotifyEmail'");
  return result.rows[0]?.value || "gbcolorsc@gmail.com";
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
      const tableId = reservation.tableId || (await findAvailableTable(reservation.guests));
      const result = await query(
        `insert into reservations
         (folio, name, phone, email, reservation_date, guests, reservation_time, restrictions,
          payment_type, payment_label, payment_total, payment_status, status, table_id)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         on conflict (folio)
         do update set
           name = excluded.name,
           phone = excluded.phone,
           email = excluded.email,
           reservation_date = excluded.reservation_date,
           guests = excluded.guests,
           reservation_time = excluded.reservation_time,
           restrictions = excluded.restrictions,
           payment_type = excluded.payment_type,
           payment_label = excluded.payment_label,
           payment_total = excluded.payment_total,
           payment_status = excluded.payment_status,
           table_id = excluded.table_id,
           updated_at = now()
         returning *`,
        [
          reservation.folio,
          reservation.name,
          reservation.phone,
          reservation.email || "",
          reservation.date || reservation.reservationDate || "",
          Number(reservation.guests || 1),
          reservation.time,
          reservation.restrictions || "",
          reservation.paymentType || "free",
          reservation.paymentLabel || "Reserva sin cargo",
          Number(reservation.paymentTotal || 0),
          reservation.paymentStatus || "not_required",
          reservation.status || "pending",
          tableId
        ]
      );

      await setTableStatusForReservation(result.rows[0].table_id, result.rows[0].status);
      const savedReservation = mapReservation(result.rows[0]);
      sendReservationNotification({
        reservation: savedReservation,
        to: await getReservationNotificationEmail()
      }).catch((error) => {
        console.warn("Reservation notification email failed", error.message);
      });
      return res.status(200).json({ reservation: savedReservation });
    }

    if (req.method === "PATCH") {
      requireAdmin(req);
      const { folio, status, paymentStatus, tableId } = req.body || {};

      if (!folio) {
        return res.status(400).json({ error: "Missing folio" });
      }

      const current = await query("select table_id from reservations where folio = $1", [folio]);
      const previousTableId = current.rows[0]?.table_id || null;
      const nextTableId = Object.prototype.hasOwnProperty.call(req.body || {}, "tableId") ? tableId || null : previousTableId;

      const result = await query(
        `update reservations
         set status = coalesce($2, status),
             payment_status = coalesce($3, payment_status),
             table_id = $4,
             updated_at = now()
         where folio = $1
         returning *`,
        [folio, status || null, paymentStatus || null, nextTableId]
      );

      if (previousTableId && previousTableId !== nextTableId) {
        await releaseTable(previousTableId);
      }

      if (["completed", "cancelled"].includes(result.rows[0].status)) {
        await releaseTable(result.rows[0].table_id);
      } else {
        await setTableStatusForReservation(result.rows[0].table_id, result.rows[0].status);
      }

      return res.status(200).json({ reservation: mapReservation(result.rows[0]) });
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendError(res, error);
  }
};
