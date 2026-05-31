const { initializeDatabase, query, requireAdmin, sendError } = require("../lib/db");

function toIsoDate(value, fallback) {
  const date = value ? new Date(`${value}T00:00:00`) : fallback;
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function endOfDay(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await initializeDatabase();
    requireAdmin(req);

    const now = new Date();
    const defaultStart = new Date(now);
    defaultStart.setHours(0, 0, 0, 0);
    const start = toIsoDate(req.query.start, defaultStart);
    const end = endOfDay(toIsoDate(req.query.end, now));

    const reservations = await query(
      `select created_at as happened_at,
              'Reserva' as kind,
              folio,
              name,
              phone,
              email,
              guests,
              reservation_time as time_label,
              table_id,
              status,
              payment_total,
              payment_status
         from reservations
        where created_at between $1 and $2
        order by created_at desc`,
      [start.toISOString(), end.toISOString()]
    );

    const walkins = await query(
      `select arrival_at as happened_at,
              'Walk-in' as kind,
              id::text as folio,
              name,
              phone,
              '' as email,
              guests,
              to_char(arrival_at, 'HH24:MI') as time_label,
              table_id,
              status,
              0 as payment_total,
              '' as payment_status
         from table_sessions
        where arrival_at between $1 and $2
        order by arrival_at desc`,
      [start.toISOString(), end.toISOString()]
    );

    const rows = [...reservations.rows, ...walkins.rows]
      .sort((a, b) => new Date(b.happened_at) - new Date(a.happened_at))
      .map((row) => ({
        date: row.happened_at,
        kind: row.kind,
        folio: row.folio,
        name: row.name,
        phone: row.phone,
        email: row.email,
        guests: Number(row.guests || 0),
        time: row.time_label,
        tableId: row.table_id,
        status: row.status,
        paymentTotal: Number(row.payment_total || 0),
        paymentStatus: row.payment_status
      }));

    const summary = rows.reduce(
      (acc, row) => {
        acc.records += 1;
        acc.guests += row.guests;
        if (row.kind === "Reserva") acc.reservations += 1;
        if (row.kind === "Walk-in") acc.walkins += 1;
        acc.payments += row.paymentTotal;
        return acc;
      },
      { records: 0, guests: 0, reservations: 0, walkins: 0, payments: 0 }
    );

    return res.status(200).json({
      start: start.toISOString(),
      end: end.toISOString(),
      summary,
      rows
    });
  } catch (error) {
    return sendError(res, error);
  }
};
