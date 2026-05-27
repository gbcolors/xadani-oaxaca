const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const root = __dirname;
const dataDir = path.join(root, "data");
const port = Number(process.env.PORT || 3000);

const defaultSettings = {
  businessName: "Xadani en Oaxaca",
  domain: "xadanienoaxaca.com",
  phone: "951 672 4141",
  phoneHref: "+529516724141",
  email: "hola@xadanienoaxaca.com",
  address: "Calle Fundadores 105, 68127 Oaxaca de Juárez, Oaxaca",
  hours: "Miércoles a lunes, 13:00 - 19:00",
  contactIntro:
    "Reserva directo por WhatsApp o teléfono. Para grupos, comparte fecha, hora y número de personas.",
  heroText:
    "Maíz criollo, moles profundos, pesca fresca y mezcalería en una carta contemporánea pensada para compartirse sin prisa."
};

const defaultTables = [
  { id: "M1", capacity: 2, zone: "Ventana", status: "free", shape: "round", x: 8, y: 12 },
  { id: "M2", capacity: 4, zone: "Salón", status: "reserved", shape: "square", x: 32, y: 12 },
  { id: "M3", capacity: 4, zone: "Salón", status: "free", shape: "square", x: 58, y: 12 },
  { id: "M4", capacity: 6, zone: "Terraza", status: "occupied", shape: "square", x: 14, y: 48 },
  { id: "M5", capacity: 8, zone: "Terraza", status: "free", shape: "square", x: 45, y: 48 },
  { id: "B1", capacity: 3, zone: "Barra", status: "blocked", shape: "round", x: 76, y: 46 }
];

const defaultFiles = {
  "reservations.json": [],
  "tables.json": defaultTables,
  "menu.json": [],
  "settings.json": defaultSettings
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

async function ensureData() {
  await fs.mkdir(dataDir, { recursive: true });
  await Promise.all(
    Object.entries(defaultFiles).map(async ([fileName, value]) => {
      const filePath = path.join(dataDir, fileName);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, JSON.stringify(value, null, 2));
      }
    })
  );
}

async function readJson(fileName) {
  await ensureData();
  const filePath = path.join(dataDir, fileName);
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(fileName, value) {
  await ensureData();
  const filePath = path.join(dataDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function notFound(res) {
  sendJson(res, 404, { error: "Not found" });
}

async function handleApi(req, res, pathname) {
  if (pathname === "/api/db/init" && req.method === "POST") {
    await ensureData();
    return sendJson(res, 200, { ok: true, mode: "local-json" });
  }

  if (pathname === "/api/settings") {
    if (req.method === "GET") {
      return sendJson(res, 200, { settings: await readJson("settings.json") });
    }
    if (req.method === "PUT") {
      const body = await readBody(req);
      await writeJson("settings.json", body);
      return sendJson(res, 200, { ok: true });
    }
  }

  if (pathname === "/api/tables") {
    if (req.method === "GET") {
      return sendJson(res, 200, { tables: await readJson("tables.json") });
    }
    if (req.method === "PUT") {
      const body = await readBody(req);
      await writeJson("tables.json", body.tables || []);
      return sendJson(res, 200, { ok: true });
    }
  }

  if (pathname === "/api/menu") {
    const menu = await readJson("menu.json");
    if (req.method === "GET") {
      return sendJson(res, 200, { menu: menu.filter((item) => item.active !== false) });
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      const item = {
        id: body.id || crypto.randomUUID(),
        category: body.category,
        name: body.name,
        description: body.description,
        price: Number(body.price || 0),
        image: body.image || "",
        tags: body.tags || [],
        active: true
      };
      menu.push(item);
      await writeJson("menu.json", menu);
      return sendJson(res, 200, { item });
    }
    if (req.method === "DELETE") {
      const body = await readBody(req);
      await writeJson(
        "menu.json",
        menu.map((item) => (String(item.id) === String(body.id) ? { ...item, active: false } : item))
      );
      return sendJson(res, 200, { ok: true });
    }
  }

  if (pathname === "/api/reservations") {
    const reservations = await readJson("reservations.json");
    if (req.method === "GET") {
      return sendJson(res, 200, { reservations });
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      const existing = reservations.findIndex((item) => item.folio === body.folio);
      const reservation = {
        status: "pending",
        paymentStatus: "not_required",
        paymentTotal: 0,
        createdAt: new Date().toISOString(),
        ...body
      };
      if (existing >= 0) reservations[existing] = { ...reservations[existing], ...reservation };
      else reservations.unshift(reservation);
      await writeJson("reservations.json", reservations);
      return sendJson(res, 200, { reservation });
    }
    if (req.method === "PATCH") {
      const body = await readBody(req);
      const reservation = reservations.find((item) => item.folio === body.folio);
      if (!reservation) return notFound(res);
      Object.assign(reservation, body);
      await writeJson("reservations.json", reservations);
      return sendJson(res, 200, { reservation });
    }
  }

  if (pathname === "/api/create-checkout-session") {
    return sendJson(res, 503, {
      error: "Stripe checkout requires deployed server environment variables"
    });
  }

  return notFound(res);
}

async function serveStatic(req, res, pathname) {
  const cleanPath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filePath = path.resolve(root, `.${cleanPath}`);

  if (!filePath.startsWith(root) || filePath.includes(`${path.sep}.git${path.sep}`)) {
    return notFound(res);
  }

  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream"
    });
    res.end(content);
  } catch {
    notFound(res);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url.pathname);
      return;
    }
    await serveStatic(req, res, url.pathname);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Server error" });
  }
});

ensureData().then(() => {
  server.listen(port, "0.0.0.0", () => {
    console.log(`Xadani local server running on http://localhost:${port}`);
  });
});
