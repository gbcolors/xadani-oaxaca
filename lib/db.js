const { Pool } = require("pg");

let pool;
let initialized = false;

function getDatabaseUrl() {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING
  ].filter(Boolean);

  const validUrl = candidates.find((url) => !url.includes("@host:") && !url.includes("@host/"));
  if (validUrl) return validUrl;

  const error = new Error("Missing valid DATABASE_URL or POSTGRES_URL");
  error.statusCode = 503;
  throw error;
}

function getPool() {
  const databaseUrl = getDatabaseUrl();

  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("localhost")
        ? false
        : { rejectUnauthorized: false }
    });
  }

  return pool;
}

async function query(text, params = []) {
  return getPool().query(text, params);
}

async function initializeDatabase() {
  if (initialized) return;

  await query(`
    create table if not exists reservations (
      id serial primary key,
      folio text unique not null,
      name text not null,
      phone text not null,
      email text,
      guests integer not null default 1,
      reservation_time text not null,
      restrictions text default '',
      payment_type text default 'free',
      payment_label text default 'Reserva sin cargo',
      payment_total integer default 0,
      payment_status text default 'not_required',
      status text default 'pending',
      table_id text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists tables (
      id text primary key,
      capacity integer not null,
      zone text not null,
      status text not null default 'free',
      shape text not null default 'square',
      x integer not null default 0,
      y integer not null default 0,
      updated_at timestamptz default now()
    );

    create table if not exists menu_items (
      id serial primary key,
      category text not null,
      name text not null,
      description text not null,
      price integer not null,
      image text,
      tags text[] default array[]::text[],
      active boolean default true,
      sort_order integer default 0,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists app_settings (
      key text primary key,
      value text not null,
      updated_at timestamptz default now()
    );
  `);

  await seedTables();
  await seedSettings();
  initialized = true;
}

async function seedTables() {
  const tables = [
    ["M1", 2, "Ventana", "free", "round", 8, 12],
    ["M2", 4, "Salon", "reserved", "square", 32, 12],
    ["M3", 4, "Salon", "free", "square", 58, 12],
    ["M4", 6, "Terraza", "occupied", "square", 14, 48],
    ["M5", 8, "Terraza", "free", "square", 45, 48],
    ["B1", 3, "Barra", "blocked", "round", 76, 46]
  ];

  for (const table of tables) {
    await query(
      `insert into tables (id, capacity, zone, status, shape, x, y)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (id) do nothing`,
      table
    );
  }
}

async function seedSettings() {
  const settings = {
    businessName: "Xadani en Oaxaca",
    domain: "xadanienoaxaca.com",
    phone: "951 672 4141",
    phoneHref: "+529516724141",
    email: "hola@xadanienoaxaca.com",
    address: "Calle Fundadores 105, 68127 Oaxaca de Juarez, Oaxaca",
    hours: "Miercoles a lunes, 13:00 - 19:00",
    contactIntro:
      "Reserva directo por WhatsApp o telefono. Para grupos, comparte fecha, hora y numero de personas.",
    heroText:
      "Maiz criollo, moles profundos, pesca fresca y mezcaleria en una carta contemporanea pensada para compartirse sin prisa."
  };

  for (const [key, value] of Object.entries(settings)) {
    await query(
      `insert into app_settings (key, value)
       values ($1, $2)
       on conflict (key) do nothing`,
      [key, value]
    );
  }
}

function requireAdmin(req) {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) return;

  const token = req.headers["x-admin-token"];
  if (token !== expected) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }
}

function sendError(res, error) {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: error.message || "Server error"
  });
}

module.exports = {
  initializeDatabase,
  query,
  requireAdmin,
  sendError
};
