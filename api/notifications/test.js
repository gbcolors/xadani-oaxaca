const { initializeDatabase, query, requireAdmin, sendError } = require("../../lib/db");
const { sendMail } = require("../../lib/mailer");

async function getNotificationRecipient(bodyEmail) {
  if (bodyEmail) return bodyEmail;
  const result = await query("select value from app_settings where key = 'reservationNotifyEmail'");
  return result.rows[0]?.value || "gbcolorsc@gmail.com";
}

module.exports = async function handler(req, res) {
  try {
    await initializeDatabase();
    requireAdmin(req);

    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const to = await getNotificationRecipient(req.body?.email);
    const sentAt = new Date().toISOString();
    const result = await sendMail({
      to,
      subject: "Prueba de notificacion Xadani",
      text: [
        "Prueba de correo de notificacion Xadani en Oaxaca.",
        "",
        `Destino: ${to}`,
        `Fecha de prueba: ${sentAt}`,
        "",
        "Si recibes este mensaje, las notificaciones SMTP estan funcionando."
      ].join("\n")
    });

    return res.status(200).json({ notification: result, to });
  } catch (error) {
    return sendError(res, error);
  }
};
