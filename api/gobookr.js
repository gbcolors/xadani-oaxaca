const crypto = require("crypto");
const { initializeDatabase, query, sendError } = require("../lib/db");

function clean(value = "") {
  return String(value || "").replace(/[<>"\r\n]/g, "").trim();
}

function folio() {
  return `XAD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
}

function mapReservation(row) {
  return {
    id: row.id,
    folio: row.folio,
    guestName: row.name,
    phone: row.phone,
    email: row.email,
    dateLabel: row.reservation_date,
    timeLabel: row.reservation_time,
    party: row.guests,
    status: row.status,
    source: "gobookr-direct-engine",
    processedAt: row.updated_at || row.created_at,
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

async function snapshot() {
  const stats = await query(`
    select status, count(*)::int as total
    from reservations
    group by status
    order by status asc
  `);
  const rows = await query(`
    select *
    from reservations
    order by created_at desc
    limit 60
  `);
  return {
    config: {
      product: "gobookr",
      portfolio: "xadani-oaxaca",
      businessName: "Xadani en Oaxaca",
      engine: "direct",
      worker: {
        mode: "direct engine",
        commitEnabled: true,
        processingRule: "Xadani no usa CoverManager. Cada solicitud completa se escribe directamente en la tabla reservations de su motor y queda completed.",
      },
    },
    stats: stats.rows,
    jobs: rows.rows.map(mapReservation),
    latestCompleted: rows.rows.filter((row) => row.status === "completed").slice(0, 5).map(mapReservation),
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    await initializeDatabase();
    if (req.method === "GET") return res.status(200).json({ ok: true, ...(await snapshot()) });
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

    const body = req.body || {};
    const guestName = clean(body.guestName || body.name);
    const dateLabel = clean(body.dateLabel || body.date);
    const timeLabel = clean(body.timeLabel || body.time);
    const party = Math.max(1, Math.min(40, Number(body.party || body.guests || 2)));
    if (!guestName || !dateLabel || !timeLabel) {
      return res.status(400).json({ ok: false, error: "missing_required_fields", required: ["guestName", "date", "time"] });
    }

    const tableId = body.tableId || (await findAvailableTable(party));
    const result = await query(
      `insert into reservations
       (folio, name, phone, email, reservation_date, guests, reservation_time, restrictions,
        payment_type, payment_label, payment_total, payment_status, status, table_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,'free','Reserva sin cargo',0,'not_required','completed',$9)
       returning *`,
      [
        clean(body.folio || folio()),
        guestName,
        clean(body.phone),
        clean(body.email),
        dateLabel,
        party,
        timeLabel,
        clean(body.notes || body.restrictions || "Reserva creada desde gobookr direct engine."),
        tableId,
      ]
    );
    if (tableId) await query("update tables set status = 'reserved', updated_at = now() where id = $1", [tableId]);
    return res.status(201).json({ ok: true, reservation: mapReservation(result.rows[0]), ...(await snapshot()) });
  } catch (error) {
    return sendError(res, error);
  }
};
