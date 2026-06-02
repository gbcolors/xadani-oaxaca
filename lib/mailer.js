const tls = require("tls");

function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    user: process.env.SMTP_USER || "gbcolorsc@gmail.com",
    pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "",
    from: process.env.MAIL_FROM || process.env.SMTP_USER || "gbcolorsc@gmail.com"
  };
}

function readLine(socket) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const onData = (chunk) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] || "";
      if (/^\d{3}\s/.test(last)) {
        socket.off("data", onData);
        resolve(buffer);
      }
    };
    socket.on("data", onData);
    socket.once("error", reject);
  });
}

async function command(socket, text, expectedCodes = []) {
  socket.write(`${text}\r\n`);
  const response = await readLine(socket);
  if (expectedCodes.length && !expectedCodes.some((code) => response.startsWith(String(code)))) {
    throw new Error(`SMTP command failed: ${text}`);
  }
  return response;
}

function encodeHeader(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

function formatMessage({ from, to, subject, text }) {
  return [
    `From: ${encodeHeader(from)}`,
    `To: ${encodeHeader(to)}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    text
  ].join("\r\n");
}

async function sendMail({ to, subject, text }) {
  const config = getSmtpConfig();
  if (!config.pass || !to) {
    return { ok: false, skipped: true };
  }

  const socket = tls.connect(config.port, config.host, { servername: config.host });
  await new Promise((resolve, reject) => {
    socket.once("secureConnect", resolve);
    socket.once("error", reject);
  });

  try {
    await readLine(socket);
    await command(socket, `EHLO ${config.host}`, [250]);
    await command(socket, "AUTH LOGIN", [334]);
    await command(socket, Buffer.from(config.user).toString("base64"), [334]);
    await command(socket, Buffer.from(config.pass).toString("base64"), [235]);
    await command(socket, `MAIL FROM:<${config.from}>`, [250]);
    await command(socket, `RCPT TO:<${to}>`, [250, 251]);
    await command(socket, "DATA", [354]);
    socket.write(`${formatMessage({ from: config.from, to, subject, text })}\r\n.\r\n`);
    await readLine(socket);
    await command(socket, "QUIT", [221]);
    return { ok: true };
  } finally {
    socket.end();
  }
}

function reservationEmailText(reservation) {
  return [
    "Nueva solicitud de reserva Xadani en Oaxaca",
    "",
    `Folio: ${reservation.folio || ""}`,
    `Nombre: ${reservation.name || ""}`,
    `Teléfono: ${reservation.phone || ""}`,
    `Email: ${reservation.email || ""}`,
    `Personas: ${reservation.guests || ""}`,
    `Fecha: ${reservation.date || reservation.reservationDate || ""}`,
    `Hora: ${reservation.time || ""}`,
    `Mesa asignada: ${reservation.tableId || "Pendiente"}`,
    `Modalidad: ${reservation.paymentLabel || "Reserva sin cargo"}`,
    `Pago: ${reservation.paymentStatus || "not_required"}`,
    "",
    `Alergias o restricciones: ${reservation.restrictions || "Sin restricciones"}`
  ].join("\n");
}

async function sendReservationNotification({ reservation, to }) {
  return sendMail({
    to,
    subject: `Nueva reserva Xadani ${reservation.folio || ""}`.trim(),
    text: reservationEmailText(reservation)
  });
}

module.exports = {
  sendMail,
  sendReservationNotification
};
