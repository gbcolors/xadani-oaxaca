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
  await seedMenuItems();
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

async function seedMenuItems() {
  const count = await query("select count(*)::int as total from menu_items");
  if (count.rows[0]?.total > 0) return;

  const items = [
    ["calientes", "Tetela de requeson y hoja santa", "Masa azul, requeson fresco, hoja santa y salsa de chile pasilla mixe.", 145, "Vegetariano, Maiz criollo", "https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=900&q=80"],
    ["calientes", "Tostada tibia de pulpo", "Pulpo a la brasa, frijol negro, mayonesa de chile costeno y quelites.", 210, "Recomendado", "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=900&q=80"],
    ["calientes", "Empanada de amarillo con hongos", "Mole amarillo, hongos de temporada, quesillo y hierbas frescas.", 160, "Temporada", "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80"],
    ["calientes", "Quesillo fundido con chorizo istmeno", "Servido con tortillas calientes, chile de agua asado y pico de gallo.", 175, "Para compartir", "https://images.unsplash.com/photo-1633436375795-12b3b339712f?auto=format&fit=crop&w=900&q=80"],
    ["frias", "Aguachile de pesca local", "Chile de agua, pepino, cebolla morada, limon criollo y aceite de cilantro.", 235, "Picante, Fresco", "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=80"],
    ["frias", "Ensalada de quelites", "Tomate criollo, aguacate, vinagreta de limon y pepita tostada.", 155, "Vegetariano", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80"],
    ["frias", "Tostada de atun con recado negro", "Atun sellado, recado negro, poro crujiente y emulsion de ajonjoli.", 245, "Recomendado", "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80"],
    ["frias", "Ceviche de camaron con mango y mezcal", "Camaron, mango ataulfo, chile manzano, mezcal joven y tostadas de maiz.", 220, "Citrico", "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80"],
    ["fuertes", "Mole negro con guajolote", "Receta de la casa, arroz con hierbas y ajonjoli tostado.", 365, "Casa", "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=900&q=80"],
    ["fuertes", "Pesca del dia con coloradito", "Filete a la plancha, coloradito, verduras tatemadas y limon quemado.", 390, "Fresco", "https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=900&q=80"],
    ["fuertes", "Costilla braseada en chichilo", "Coccion lenta, pure de frijol ayocote y cebollitas encurtidas.", 420, "Fuego lento", "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80"],
    ["fuertes", "Tlayuda Xadani con tasajo premium", "Asiento, frijol, quesillo, col, aguacate y salsa de molcajete.", 285, "Oaxaca", "https://images.unsplash.com/photo-1624300629298-e9de39c13be8?auto=format&fit=crop&w=900&q=80"],
    ["fuertes", "Risotto de huitlacoche y quesillo", "Arroz cremoso, huitlacoche, queso de hebra y epazote.", 310, "Vegetariano", "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80"],
    ["postres", "Nicuatole con frutos rojos", "Postre tradicional de maiz con compota de temporada.", 135, "Maiz", "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80"],
    ["postres", "Tamal de chocolate de metate", "Chocolate oaxaqueno, crema batida de canela y sal de gusano opcional.", 150, "Chocolate", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80"],
    ["postres", "Helado de leche quemada", "Con crumble de maiz, naranja confitada y miel de agave.", 120, "Clasico", "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80"],
    ["postres", "Pan de elote criollo", "Servido tibio con crema de vainilla y hoja santa.", 140, "Casa", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80"],
    ["bebidas", "Coctel de mezcal con hoja santa", "Mezcal joven, hoja santa, limon, jarabe de agave y sal de chile.", 190, "Mezcal", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"],
    ["bebidas", "Margarita de chile de agua", "Tequila blanco, chile de agua, limon real y sal de gusano.", 180, "Picante", "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=900&q=80"],
    ["bebidas", "Agua de cacao", "Cacao, maiz, canela y espuma ligera, servida fria.", 95, "Sin alcohol", "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80"],
    ["bebidas", "Cafe de olla", "Cafe de altura, piloncillo, canela y cascara de naranja.", 75, "Caliente", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"],
    ["bebidas", "Vino mexicano por copa", "Seleccion rotativa de blancos, tintos y naranjos nacionales.", 165, "Copa", "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80"]
  ];

  for (const [index, item] of items.entries()) {
    const [category, name, description, price, tagText, image] = item;
    await query(
      `insert into menu_items (category, name, description, price, image, tags, active, sort_order)
       values ($1, $2, $3, $4, $5, $6, true, $7)`,
      [category, name, description, price, image, tagText.split(",").map((tag) => tag.trim()), index]
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
