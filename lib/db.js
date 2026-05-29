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

    create table if not exists table_sessions (
      id serial primary key,
      name text not null,
      phone text default '',
      guests integer not null default 1,
      table_id text not null,
      arrival_at timestamptz not null default now(),
      status text not null default 'active',
      source text not null default 'walk_in',
      closed_at timestamptz,
      created_at timestamptz default now(),
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

    create table if not exists menu_categories (
      slug text primary key,
      group_name text not null,
      name text not null,
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
  await seedMenuStructure();
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

function getDefaultMenuCategories() {
  return [
    ["entradas-frias", "ENTRADAS", "FRIAS"],
    ["entradas-cocteles", "ENTRADAS", "COCTELES"],
    ["entradas-ensaladas", "ENTRADAS", "ENSALADAS"],
    ["entradas-calientes", "ENTRADAS", "CALIENTES"],
    ["entradas-caldos", "ENTRADAS", "CALDOS"],
    ["entradas-sopas", "ENTRADAS", "SOPAS"],
    ["entradas-consomes", "ENTRADAS", "CONSOMES"],
    ["fuertes-pesca-del-dia", "FUERTES", "PESCA DEL DÍA"],
    ["fuertes-especiales-istmenos", "FUERTES", "ESPECIALES ISTMEÑOS"],
    ["fuertes-camarones", "FUERTES", "CAMARONES"],
    ["fuertes-para-compartir", "FUERTES", "PARA COMPARTIR"],
    ["fuertes-extras", "FUERTES", "EXTRAS"],
    ["postres", "POSTRES", "POSTRES"],
    ["bebidas-con-alcohol", "BEBIDAS", "CON ALCOHOL"],
    ["bebidas-sin-alcohol", "BEBIDAS", "SIN ALCOHOL"]
  ];
}

function getDefaultMenuItems() {
  return [
    ["entradas-frias", "Aguachile de pesca local", "Chile de agua, pepino, cebolla morada, limon criollo y aceite de cilantro.", 235, "Picante, Fresco", "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=80"],
    ["entradas-cocteles", "Coctel de camaron Xadani", "Camaron, jitomate, aguacate, cilantro y salsa de la casa.", 210, "Fresco", "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80"],
    ["entradas-ensaladas", "Ensalada de quelites", "Tomate criollo, aguacate, vinagreta de limon y pepita tostada.", 155, "Vegetariano", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80"],
    ["entradas-calientes", "Tetela de requeson y hoja santa", "Masa azul, requeson fresco, hoja santa y salsa de chile pasilla mixe.", 145, "Maiz criollo", "https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=900&q=80"],
    ["entradas-caldos", "Caldo de piedra estilo casa", "Caldo claro con pescado, jitomate, chile y hierbas frescas.", 185, "Casa", "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80"],
    ["entradas-sopas", "Sopa de guias", "Guias de calabaza, elote, flor de calabaza y chochoyotes.", 165, "Temporada", "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=900&q=80"],
    ["entradas-consomes", "Consome de barbacoa", "Consome especiado con garbanzo, arroz y chile de agua.", 170, "Caliente", "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=900&q=80"],
    ["fuertes-pesca-del-dia", "Pesca del dia con coloradito", "Filete a la plancha, coloradito, verduras tatemadas y limon quemado.", 390, "Fresco", "https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=900&q=80"],
    ["fuertes-especiales-istmenos", "Garnacha istmena de res", "Tortilla crujiente, carne especiada, curtido y salsa roja.", 245, "Istmo", "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=900&q=80"],
    ["fuertes-camarones", "Camarones al mojo de chile costeño", "Camarones salteados, ajo, chile costeño y arroz con hierbas.", 360, "Mar", "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=900&q=80"],
    ["fuertes-para-compartir", "Tlayuda Xadani con tasajo premium", "Asiento, frijol, quesillo, col, aguacate y salsa de molcajete.", 285, "Oaxaca", "https://images.unsplash.com/photo-1624300629298-e9de39c13be8?auto=format&fit=crop&w=900&q=80"],
    ["fuertes-extras", "Orden de quesillo", "Quesillo fresco para acompanar tlayudas, moles o entradas.", 85, "Extra", "https://images.unsplash.com/photo-1633436375795-12b3b339712f?auto=format&fit=crop&w=900&q=80"],
    ["postres", "Nicuatole con frutos rojos", "Postre tradicional de maiz con compota de temporada.", 135, "Maiz", "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80"],
    ["bebidas-con-alcohol", "Coctel de mezcal con hoja santa", "Mezcal joven, hoja santa, limon, jarabe de agave y sal de chile.", 190, "Mezcal", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"],
    ["bebidas-sin-alcohol", "Agua de cacao", "Cacao, maiz, canela y espuma ligera, servida fria.", 95, "Sin alcohol", "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80"]
  ];
}

async function seedMenuStructure(reset = false) {
  const version = await query("select value from app_settings where key = 'menu_structure_version'");
  if (!reset && version.rows[0]?.value === "20260529-v2") return;

  await query("update menu_items set active = false, updated_at = now()");
  await query("update menu_categories set active = false, updated_at = now()");

  const categories = getDefaultMenuCategories();
  for (const [index, category] of categories.entries()) {
    const [slug, groupName, name] = category;
    await query(
      `insert into menu_categories (slug, group_name, name, active, sort_order)
       values ($1, $2, $3, true, $4)
       on conflict (slug)
       do update set group_name = excluded.group_name,
                     name = excluded.name,
                     active = true,
                     sort_order = excluded.sort_order,
                     updated_at = now()`,
      [slug, groupName, name, index]
    );
  }

  const items = getDefaultMenuItems();
  for (const [index, item] of items.entries()) {
    const [category, name, description, price, tagText, image] = item;
    await query(
      `insert into menu_items (category, name, description, price, image, tags, active, sort_order)
       values ($1, $2, $3, $4, $5, $6, true, $7)`,
      [category, name, description, price, image, tagText.split(",").map((tag) => tag.trim()), index]
    );
  }

  await query(
    `insert into app_settings (key, value, updated_at)
     values ('menu_structure_version', '20260529-v2', now())
     on conflict (key)
     do update set value = excluded.value, updated_at = now()`
  );
}

async function resetMenuStructure() {
  await seedMenuStructure(true);
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
  resetMenuStructure,
  sendError
};
