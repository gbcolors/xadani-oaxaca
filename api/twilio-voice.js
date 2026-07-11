const crypto = require("crypto");
const { initializeDatabase, query, sendError } = require("../lib/db");

function xml(res, twiml) {
  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>${twiml}`);
}

function escapeXml(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function say(text) {
  return `<Say language="es-MX" voice="Polly.Mia">${escapeXml(text)}</Say>`;
}

function gather(action, prompt, numDigits, input = "dtmf speech") {
  const digits = numDigits ? ` numDigits="${numDigits}"` : "";
  return `<Gather input="${input}"${digits} timeout="8" speechTimeout="auto" actionOnEmptyResult="true" language="es-MX" action="${escapeXml(action)}" method="POST">${say(prompt)}</Gather>`;
}

function collectBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => resolve(Object.fromEntries(new URLSearchParams(raw).entries())));
    req.on("error", () => resolve({}));
  });
}

function clean(value = "") {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[<>"\r\n]/g, "").trim();
}

function absoluteUrl(req, step, params = {}) {
  const url = new URL("/api/twilio-voice", `https://${req.headers.host || "xadanienoaxaca.com"}`);
  url.searchParams.set("step", step);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  return url.toString();
}

function formatDate(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDate(value = "") {
  const digits = clean(value).replace(/\D/g, "");
  if (digits.length >= 4) {
    const day = Number(digits.slice(0, 2));
    const month = Number(digits.slice(2, 4));
    const year = digits.length >= 8 ? Number(digits.slice(4, 8)) : new Date().getFullYear();
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return formatDate(year, month, day);
  }
  return "";
}

function parseTime(value = "") {
  const digits = clean(value).replace(/\D/g, "");
  if (digits.length === 4) return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  if (digits.length <= 2 && digits) {
    let hour = Number(digits);
    if (hour >= 1 && hour <= 11) hour += 12;
    return `${String(hour).padStart(2, "0")}:00`;
  }
  return "";
}

async function createReservation(body, params) {
  const guestName = clean(body.SpeechResult || `Llamada ${body.From || body.Caller || "sin numero"}`) || "Llamada";
  const folio = `XAD-CALL-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
  const result = await query(
    `insert into reservations
     (folio, name, phone, email, reservation_date, guests, reservation_time, restrictions,
      payment_type, payment_label, payment_total, payment_status, status)
     values ($1,$2,$3,'',$4,$5,$6,$7,'free','Reserva sin cargo',0,'not_required','completed')
     returning *`,
    [
      folio,
      guestName,
      clean(body.From || body.Caller || ""),
      params.date,
      Number(params.party || 2),
      params.time,
      `Reserva capturada desde Conmutador Xadani. CallSid: ${body.CallSid || ""}`,
    ]
  );
  return result.rows[0];
}

module.exports = async function handler(req, res) {
  try {
    await initializeDatabase();
    const body = req.method === "POST" ? await collectBody(req) : {};
    const url = new URL(req.url || "/", `https://${req.headers.host || "xadanienoaxaca.com"}`);
    const step = url.searchParams.get("step") || "start";
    const params = Object.fromEntries(url.searchParams.entries());

    if (step === "menu") {
      if ((body.Digits || "") === "1") return xml(res, `<Response>${gather(absoluteUrl(req, "date"), "Para que fecha deseas reservar. Marca dia y mes en cuatro digitos, por ejemplo dos nueve cero siete.", 8)}${say("No recibi la fecha.")}<Hangup/></Response>`);
      return xml(res, `<Response>${say("Hemos registrado tu llamada para seguimiento.")}<Hangup/></Response>`);
    }
    if (step === "date") {
      const date = parseDate(body.Digits || body.SpeechResult || "");
      if (!date) return xml(res, `<Response>${gather(absoluteUrl(req, "date"), "No pude entender la fecha. Marca dia y mes en cuatro digitos.", 8)}${say("No recibi fecha valida.")}<Hangup/></Response>`);
      return xml(res, `<Response>${gather(absoluteUrl(req, "time", { date }), "Ahora marca la hora en cuatro digitos, por ejemplo uno cuatro cero cero.", 4)}${say("No recibi la hora.")}<Hangup/></Response>`);
    }
    if (step === "time") {
      const time = parseTime(body.Digits || body.SpeechResult || "");
      if (!time) return xml(res, `<Response>${gather(absoluteUrl(req, "time", { date: params.date }), "No pude entender la hora. Marca cuatro digitos.", 4)}${say("No recibi hora valida.")}<Hangup/></Response>`);
      return xml(res, `<Response>${gather(absoluteUrl(req, "party", { date: params.date, time }), "Para cuantas personas. Marca solo el numero.", 2)}${say("No recibi personas.")}<Hangup/></Response>`);
    }
    if (step === "party") {
      const party = Number((body.Digits || body.SpeechResult || "2").replace(/\D/g, "")) || 2;
      return xml(res, `<Response>${gather(absoluteUrl(req, "name", { date: params.date, time: params.time, party }), "A nombre de quien registro la reserva.", null, "speech")}${say("No recibi el nombre.")}<Hangup/></Response>`);
    }
    if (step === "name") {
      const row = await createReservation(body, params);
      return xml(res, `<Response>${say(`Listo. Tu reserva en Xadani quedo confirmada con folio ${row.folio}. Te esperamos.`)}<Hangup/></Response>`);
    }
    return xml(res, `<Response>${gather(absoluteUrl(req, "menu"), "Gracias por llamar a Xadani en Oaxaca. Oprime uno para nueva reserva.", 1)}${say("No entendi tu respuesta.")}<Hangup/></Response>`);
  } catch (error) {
    return sendError(res, error);
  }
};
