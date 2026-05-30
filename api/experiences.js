const { initializeDatabase, query, requireAdmin, sendError } = require("../lib/db");

function mapItem(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    eventDate: row.event_date,
    eventTime: row.event_time,
    price: row.price,
    paymentType: row.payment_type,
    ctaLabel: row.cta_label,
    active: row.active,
    sortOrder: row.sort_order
  };
}

module.exports = async function handler(req, res) {
  try {
    await initializeDatabase();

    if (req.method === "GET") {
      const result = await query(
        "select * from experiences where active = true order by sort_order, id"
      );
      return res.status(200).json({ experiences: result.rows.map(mapItem) });
    }

    requireAdmin(req);

    if (req.method === "POST") {
      const item = req.body || {};
      const result = await query(
        `insert into experiences
         (title, description, image, event_date, event_time, price, payment_type, cta_label, sort_order, active)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
         returning *`,
        [
          item.title,
          item.description,
          item.image || "",
          item.eventDate || "",
          item.eventTime || "",
          Number(item.price || 0),
          item.paymentType || "experience",
          item.ctaLabel || "Reservar",
          Number(item.sortOrder || 0)
        ]
      );
      return res.status(200).json({ item: mapItem(result.rows[0]) });
    }

    if (req.method === "PUT") {
      const item = req.body || {};
      const result = await query(
        `update experiences
         set title=$2, description=$3, image=$4, event_date=$5, event_time=$6,
             price=$7, payment_type=$8, cta_label=$9, sort_order=$10, updated_at=now()
         where id=$1
         returning *`,
        [
          item.id,
          item.title,
          item.description,
          item.image || "",
          item.eventDate || "",
          item.eventTime || "",
          Number(item.price || 0),
          item.paymentType || "experience",
          item.ctaLabel || "Reservar",
          Number(item.sortOrder || 0)
        ]
      );
      return res.status(200).json({ item: mapItem(result.rows[0]) });
    }

    if (req.method === "DELETE") {
      await query("update experiences set active=false, updated_at=now() where id=$1", [req.body?.id]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendError(res, error);
  }
};
