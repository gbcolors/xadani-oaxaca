const { Pool } = require("pg");
const crypto = require("crypto");

let pool;
let initialized = false;
const tokenTtlMs = 12 * 60 * 60 * 1000;

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

    create table if not exists admin_users (
      username text primary key,
      salt text not null,
      password_hash text not null,
      updated_at timestamptz default now()
    );
  `);

  await seedTables();
  await seedSettings();
  await seedAdminUser();
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

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const passwordHash = crypto
    .pbkdf2Sync(String(password), salt, 150000, 64, "sha512")
    .toString("hex");
  return { salt, passwordHash };
}

async function seedAdminUser() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "xadani2026";
  const { salt, passwordHash } = hashPassword(password);

  await query(
    `insert into admin_users (username, salt, password_hash)
     values ($1, $2, $3)
     on conflict (username) do nothing`,
    [username, salt, passwordHash]
  );
}

async function verifyAdminCredentials(username, password) {
  const result = await query("select * from admin_users where username = $1", [username]);
  const admin = result.rows[0];
  if (!admin) return false;

  const { passwordHash } = hashPassword(password, admin.salt);
  return crypto.timingSafeEqual(
    Buffer.from(passwordHash, "hex"),
    Buffer.from(admin.password_hash, "hex")
  );
}

async function updateAdminPassword(username, currentPassword, newPassword) {
  const isValid = await verifyAdminCredentials(username, currentPassword);
  if (!isValid) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }

  const { salt, passwordHash } = hashPassword(newPassword);
  await query(
    `update admin_users
     set salt = $2, password_hash = $3, updated_at = now()
     where username = $1`,
    [username, salt, passwordHash]
  );
}

function getTokenSecret() {
  return process.env.ADMIN_API_TOKEN || getDatabaseUrl();
}

function signAdminToken(username) {
  const issuedAt = Date.now();
  const payload = `${username}.${issuedAt}`;
  const signature = crypto.createHmac("sha256", getTokenSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

function verifyAdminToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return false;

  const [username, issuedAt, signature] = parts;
  const age = Date.now() - Number(issuedAt);
  if (!username || !Number.isFinite(age) || age < 0 || age > tokenTtlMs) return false;

  const payload = `${username}.${issuedAt}`;
  const expected = crypto.createHmac("sha256", getTokenSecret()).update(payload).digest("hex");
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function getAdminUsernameFromToken(token) {
  if (!verifyAdminToken(token)) return "";
  return String(token).split(".")[0];
}

function requireAdmin(req) {
  const token = req.headers["x-admin-token"];
  if (!verifyAdminToken(token)) {
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
  signAdminToken,
  getAdminUsernameFromToken,
  updateAdminPassword,
  verifyAdminCredentials,
  sendError
};
