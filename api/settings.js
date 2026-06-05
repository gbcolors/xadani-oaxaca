const { initializeDatabase, query, requireAdminRole, sendError } = require("../lib/db");

const fallbackSettings = {
  businessName: "Xadani en Oaxaca",
  domain: "xadanienoaxaca.com",
  phone: "951 150 9454",
  phoneHref: "+529511509454",
  whatsapp: "951 150 9454",
  whatsappHref: "https://wa.me/529511509454",
  email: "hola@xadanienoaxaca.com",
  address: "Calle Fundadores 105, 68127 Oaxaca de Juárez, Oaxaca",
  hours: "Martes a domingo, 12:00 - 19:30",
  googleProfileHref: "https://share.google/C5J90ehjHyg3jdsg1"
};

module.exports = async function handler(req, res) {
  try {
    await initializeDatabase();

    if (req.method === "GET") {
      const result = await query("select key, value from app_settings order by key");
      const settings = Object.fromEntries(result.rows.map((row) => [row.key, row.value]));
      return res.status(200).json({ settings });
    }

    if (req.method === "PUT") {
      await requireAdminRole(req, ["owner"]);
      const settings = req.body || {};

      for (const [key, value] of Object.entries(settings)) {
        await query(
          `insert into app_settings (key, value, updated_at)
           values ($1, $2, now())
           on conflict (key)
           do update set value = excluded.value, updated_at = now()`,
          [key, String(value)]
        );
      }

      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    if (req.method === "GET") {
      return res.status(200).json({ settings: fallbackSettings });
    }
    return sendError(res, error);
  }
};
