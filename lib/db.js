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
      reservation_date text,
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
      price_label text default '',
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

    create table if not exists gallery_items (
      id serial primary key,
      title text not null,
      caption text default '',
      image text not null,
      type text default 'concepto',
      active boolean default true,
      sort_order integer default 0,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists experiences (
      id serial primary key,
      title text not null,
      description text not null,
      image text,
      event_date text,
      event_time text,
      price integer default 0,
      payment_type text default 'experience',
      cta_label text default 'Reservar',
      active boolean default true,
      sort_order integer default 0,
      included_items text default '',
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
      role text default 'owner',
      recovery_email text default '',
      updated_at timestamptz default now()
    );

    alter table admin_users add column if not exists role text default 'owner';
    alter table admin_users add column if not exists recovery_email text default '';
    alter table reservations add column if not exists reservation_date text;
    alter table experiences add column if not exists included_items text default '';
    alter table menu_items add column if not exists price_label text default '';
    update menu_items
       set price_label = 'S/T', updated_at = now()
     where lower(name) like 'lisa al horno%'
       and coalesce(price_label, '') = '';
    update app_settings
       set value = 'Una cocina del Istmo hecha para encontrarse.', updated_at = now()
     where key = 'homeIntroTitle'
       and value = 'Una cocina tradicional del Istmo hecha para encontrarse.';
  `);

  await seedTables();
  await seedSettings();
  await seedMenuStructure();
  await syncPhysicalMenuItems();
  await seedGalleryItems();
  await syncGalleryMetadata();
  await seedExperiences();
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
    phone: "951 150 9454",
    phoneHref: "+529511509454",
    whatsapp: "951 150 9454",
    whatsappHref: "https://wa.me/529511509454",
    email: "hola@xadanienoaxaca.com",
    address: "Calle Fundadores 105, 68127 Oaxaca de Juárez, Oaxaca",
    hours: "Martes a domingo, 12:00 - 19:30",
    contactIntro:
      "Reserva directo por WhatsApp o teléfono. También puedes comunicarte al +52 951 150 9454 para grupos y eventos.",
    heroText:
      "Garnachas, cocina al horno, pesca fresca y recetas familiares del Istmo para visitantes de Juchitán, Tehuantepec, Salina Cruz y viajeros que buscan una experiencia gastronómica auténtica.",
    reservationNotifyEmail: "gbcolorsc@gmail.com",
    googleProfileHref: "https://share.google/C5J90ehjHyg3jdsg1",
    homeHeroImage: "assets/xadani-portada-foto-02.jpg",
    homeHeroTitle: "El sabor del Istmo servido al centro.",
    homeHeroDescription: "Recetas familiares, cocina tradicional para compartir sin prisa.",
    homeIntroTitle: "Una cocina del Istmo hecha para encontrarse.",
    homeIntroText: "Nuestra carta reúne los sabores tradicionales del Istmo, pesca fresca de la región y preparaciones especiales al horno en un menú con platos fieles al sazón autóctono de Santa María Xadani, generosos y abundantes, pensados para llegar al centro de la mesa.",
    aboutHeroImage: "assets/xadani-fondo-calido.jpg",
    aboutHeroTitle: "Una cocina nacida en Santa María Xadani.",
    aboutHeroDescription: "Memoria familiar, producto del mar y una manera generosa de compartir la mesa.",
    menuHeroImage: "assets/xadani-portada-foto-10.jpg",
    menuHeroTitle: "Menú Xadani",
    menuHeroDescription: "Consulta todos los platillos publicados con fotografía, descripción y precio.",
    experienceHeroImage: "assets/xadani-fondo-calido.jpg",
    contactTitle: "Encuentra tu mesa en Xadani.",
    contactDescription: "Estamos en Oaxaca de Juárez para compartir contigo los sabores familiares de Santa María Xadani."
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

function getPhysicalMenuItems() {
  return [
    ["entradas-frias", "Tacos de camarón", "Cinco tacos en tortilla de maíz con camarón, tomate, cebolla, chile, queso, salsa de la casa y aguacate.", 250, "", "Camarón, Istmo"],
    ["entradas-ensaladas", "Ensalada con camarón seco", "Tomate, cebolla, cilantro y chile curtido con camarón seco; fresca, directa y de sabor intenso.", 180, "", "Fresco"],
    ["entradas-ensaladas", "Ensalada con camarón fresco", "Camarón fresco con tomate, cebolla, cilantro, chile, aceite de oliva, pepino y aguacate.", 250, "", "Camarón"],
    ["entradas-calientes", "Empanadas de pescado", "Cinco empanadas de masa con pescado, cebolla, tomate y cilantro, servidas calientes.", 200, "", "Maíz"],
    ["entradas-frias", "Minilla Xadani", "Pescado desmenuzado con tomate, cebolla y huevo, preparado al sazón de la casa.", 150, "", "Casa"],
    ["entradas-frias", "Ceviche de pescado", "Pescado curtido en jugo de limón con cebolla morada, pepino y supremas de naranja.", 250, "", "Fresco"],
    ["entradas-ensaladas", "Ensalada de mariscos", "Camarón, caracol y pulpo con tomate, cebolla, chile, cilantro, pepino y aguacate.", 280, "", "Mariscos"],
    ["entradas-frias", "Jaibas enchipotladas", "Jaibas servidas con aderezo de chipotle o preparación enchipotlada, de carácter profundo y ligeramente picante.", 180, "", "Chipotle"],
    ["entradas-frias", "Aguachile de camarón", "Camarones con limón, pepino, cebolla y chile habanero; una entrada fresca y vibrante.", 250, "", "Picante"],
    ["fuertes-pesca-del-dia", "Filete relleno de mariscos", "Filete con pulpo, camarón, caracol y queso gratinado, terminado con tomate, cebolla y aderezo de chipotle.", 280, "", "Mariscos"],
    ["fuertes-pesca-del-dia", "Filete de pescado empanizado", "Filete empanizado acompañado con ensalada de verduras y arroz a la jardinera.", 250, "", "Crujiente"],
    ["fuertes-pesca-del-dia", "Hueva de lisa", "Hueva de lisa frita o al horno, acompañada con ensalada de verduras.", 250, "", "Especial"],
    ["fuertes-especiales-istmenos", "Nuggets de pollo", "Nuggets de pollo acompañados con papas fritas, cátsup y mayonesa.", 200, "", "Familiar"],
    ["fuertes-pesca-del-dia", "Filete al horno al mojo de ajo", "Filete horneado al mojo de ajo, servido con ensalada de verduras y arroz a la jardinera.", 250, "", "Horno"],
    ["fuertes-extras", "Papas a la francesa", "Papas fritas servidas con cátsup.", 150, "", "Extra"],
    ["fuertes-camarones", "Camarones con aderezo al horno", "Seis camarones preparados al horno, a elegir natural, mojo de ajo, enchipotado o aderezo de chipotle; servidos con ensalada de verduras.", 250, "", "Horno"],
    ["fuertes-camarones", "Camarones al mojo de ajo horneados", "Seis camarones al mojo de ajo, acompañados con ensalada de verduras, arroz a la jardinera y aderezo de chipotle.", 250, "", "Ajo"],
    ["fuertes-camarones", "Camarones empanizados", "Seis camarones empanizados con ensalada de verduras, arroz a la jardinera y aderezo de chipotle.", 250, "", "Crujiente"],
    ["fuertes-camarones", "Camarones para pelar", "Camarones hervidos en agua caliente con sal, servidos con limones.", 250, "", "Clásico"],
    ["entradas-cocteles", "Cóctel de camarón mediano", "Camarón en salsa de cátsup con cilantro, cebolla y aguacate. Disponible en tamaño mediano o grande.", 200, "M $200 / G $250", "Fresco"],
    ["entradas-cocteles", "Cóctel campechano", "Combinación de pulpo, camarón y caracol en salsa de cátsup con cilantro, cebolla y aguacate. Disponible en tamaño mediano o grande.", 200, "M $200 / G $250", "Mariscos"],
    ["entradas-cocteles", "Vuelve a la vida", "Pulpo, camarón y caracol en salsa de cátsup con cilantro, cebolla y aguacate; fresco, abundante y reparador.", 200, "M $200 / G $250", "Mariscos"],
    ["fuertes-para-compartir", "Botana istmeña", "Selección para compartir con beela doo, empanadas, garnachas, guetabingui, ensalada con camarón seco, camarones al horno, tamales de elote, bolitas de queso y totopos.", 0, "S/P", "Para compartir"],
    ["fuertes-para-compartir", "Botana istmeña para 2 personas", "Botana istmeña servida al centro para dos personas.", 700, "", "Para compartir"],
    ["fuertes-para-compartir", "Botana istmeña para 3 personas", "Botana istmeña servida al centro para tres personas.", 900, "", "Para compartir"],
    ["fuertes-para-compartir", "Botana istmeña para 4 personas", "Botana istmeña servida al centro para cuatro personas.", 1200, "", "Para compartir"],
    ["fuertes-para-compartir", "Botana istmeña para 5 personas", "Botana istmeña servida al centro para cinco personas.", 1500, "", "Para compartir"],
    ["entradas-caldos", "Caldo de camarón", "Caldo de camarón con tomate, cebolla, chipotle, fumet de camarón y epazote. Incluye seis piezas.", 250, "", "Caldo"],
    ["entradas-caldos", "Caldo de pescado", "Caldo de pescado con tomate, cebolla, chipotle, fumet de pescado y epazote.", 230, "", "Caldo"],
    ["entradas-caldos", "Caldo de pescado con camarones", "Caldo de pescado con camarones, tomate, cebolla, chipotle, fumet de pescado y epazote.", 250, "", "Caldo"],
    ["entradas-sopas", "Sopa de mariscos", "Sopa con camarón, pulpo, caracol, pescado y jaibas en fumet de pescado con tomate, cebolla, epazote y chipotle.", 280, "", "Mariscos"],
    ["entradas-consomes", "Consomé de pescado", "Consomé de pescado con tomate, cebolla, chipotle, fumet de pescado, epazote y pescado.", 150, "", "Consomé"],
    ["fuertes-extras", "Orden de frijoles", "Orden extra de frijoles para acompañar la mesa.", 35, "", "Extra"],
    ["fuertes-extras", "Orden de queso", "Orden extra de queso fresco o vaquero.", 35, "", "Extra"],
    ["fuertes-extras", "Orden de totopos", "Totopos crujientes para acompañar entradas, caldos o botanas.", 30, "", "Extra"],
    ["fuertes-extras", "Orden de salsas", "Selección de salsas de la casa.", 30, "", "Extra"],
    ["fuertes-extras", "Orden de tortillas", "Tortillas calientes para acompañar los platillos.", 30, "", "Extra"],
    ["postres", "Plátanos al horno", "Plátanos al horno acompañados con queso vaquero o fresco y crema.", 80, "", "Postre"],
    ["postres", "Plátanos fritos", "Plátanos fritos acompañados con queso vaquero o fresco y crema.", 100, "", "Postre"],
    ["postres", "Helado", "Helado servido con chocolate líquido.", 80, "", "Postre"],
    ["postres", "Ciruela curada", "Ciruela y nance curtidos en alcohol y azúcar.", 80, "", "Postre"],
    ["fuertes-especiales-istmenos", "Garnachas", "Tortillas de nixtamal con carne, cebolla, col en vinagre, chile curtido y salsa de chipotle.", 150, "", "Istmo"],
    ["fuertes-especiales-istmenos", "Pollo garnachero", "Pollo acompañado con col y chile curtido, dos garnachas, papas y salsa de chipotle.", 250, "", "Istmo"],
    ["fuertes-especiales-istmenos", "Tasajo al horno (beela doo’)", "Tasajo de 300 g al horno con frijol refrito seco, guacamole y pico de gallo.", 280, "", "Horno"],
    ["fuertes-especiales-istmenos", "Molote istmeño (guetabingui)", "Cinco molotes de nixtamal especiado con epazote, rellenos de camarón seco y cubiertos con pepita en mole.", 120, "", "Istmo"],
    ["entradas-calientes", "Molote de plátano", "Puré de plátano relleno de queso, servido con crema y queso fresco.", 120, "", "Istmo"],
    ["fuertes-especiales-istmenos", "Puré de papa", "Papa y zanahoria con queso vaquero, crema, mostaza, chícharos y chile curtido.", 150, "", "Istmo"],
    ["fuertes-especiales-istmenos", "Tamal de elote al horno", "Tamal de elote al horno acompañado con queso fresco y crema.", 150, "", "Horno"],
    ["fuertes-especiales-istmenos", "Ubre de vaca al horno", "Ubre de vaca al horno acompañada con frijol refrito seco, guacamole y pico de gallo.", 280, "", "Horno"],
    ["entradas-calientes", "Bolitas de queso", "Cinco bolitas de queso vaquero con huevo, fritas en aceite.", 100, "", "Queso"],
    ["fuertes-pesca-del-dia", "Lisa al horno con aderezo", "Lisa preparada al horno a elegir natural, mojo de ajo, a la mexicana, enchipotlada o con aderezo de chipotle; servida con ensalada de verduras.", 0, "S/T", "Horno"],
    ["fuertes-pesca-del-dia", "Posta de robalo", "Posta de robalo a elegir natural, mojo de ajo, a la mexicana, enchipotlada o con aderezo de chipotle; servida con ensalada de verduras.", 0, "S/T", "Pesca"],
    ["fuertes-pesca-del-dia", "Salmón del patrón", "Salmón horneado con orégano, aceite de oliva y ajo; acompañado con ensalada de verduras y arroz a la jardinera.", 350, "", "Horno"]
  ];
}

async function syncPhysicalMenuItems() {
  const version = await query("select value from app_settings where key = 'physical_menu_sync_version'");
  if (version.rows[0]?.value === "20260605-menu-fisico-v3") return;

  const items = getPhysicalMenuItems();
  for (const [index, item] of items.entries()) {
    const [category, name, description, price, priceLabel, tagText] = item;
    const tags = tagText.split(",").map((tag) => tag.trim()).filter(Boolean);
    const existing = await query("select id from menu_items where lower(name) = lower($1) limit 1", [name]);
    if (existing.rows[0]) {
      await query(
        `update menu_items
            set category=$2, description=$3, price=$4, price_label=$5, tags=$6,
                active=true, sort_order=$7, updated_at=now()
          where id=$1`,
        [existing.rows[0].id, category, description, Number(price || 0), priceLabel || "", tags, index]
      );
    } else {
      await query(
        `insert into menu_items (category, name, description, price, price_label, image, tags, active, sort_order)
         values ($1,$2,$3,$4,$5,'',$6,true,$7)`,
        [category, name, description, Number(price || 0), priceLabel || "", tags, index]
      );
    }
  }

  await query(
    `update menu_items
        set active=false, updated_at=now()
      where lower(name) in (
        'lisa al horno con aderezo',
        'salmón del patrón',
        'aguachile de camarón',
        'cóctel de camarón mediano',
        'camarones con aderezo al horno',
        'camarones al mojo de ajo horneados',
        'lisa al horno',
        'salmón al orégano al horno',
        'camarón al horno',
        'camarón al mojo de ajo frito',
        'camarones en aguachile',
        'cóctel de camarón'
      )`
  );

  await query(
    `update menu_items
        set active=true, updated_at=now()
      where lower(name) in (
        'lisa al horno con aderezo',
        'salmón del patrón',
        'aguachile de camarón',
        'cóctel de camarón mediano',
        'camarones con aderezo al horno',
        'camarones al mojo de ajo horneados'
      )`
  );

  await query(
    `insert into app_settings (key, value, updated_at)
     values ('physical_menu_sync_version', '20260605-menu-fisico-v3', now())
     on conflict (key)
     do update set value=excluded.value, updated_at=now()`
  );
}

async function seedGalleryItems() {
  return;
}

async function syncGalleryMetadata() {
  await query(`
    update gallery_items g
       set title = 'Menú y cocina Xadani',
           caption = 'Imagen de nuestra cocina istmeña, platillos, horno y propuesta familiar en Oaxaca.',
           type = case when coalesce(g.type, '') = '' then 'concepto' else g.type end,
           updated_at = now()
     where g.active = true
       and (
         g.title ~* '^IMG '
         or g.title in (
           'Mesa istmeña al centro',
           'Sabores de Santa María Xadani',
           'Del horno a la mesa',
           'Cocina familiar del Istmo',
           'Mar, maíz y sazón',
           'Especialidades de la casa',
           'Platos para compartir',
           'Texturas del Istmo',
           'Horno, fuego y tradición',
           'Detalle de nuestra cocina',
           'Mesa para familias y grupos',
           'Recetas servidas sin prisa',
           'Producto fresco de la región',
           'La carta visual de Xadani',
           'Momentos en Xadani',
           'Cocina con raíz familiar',
           'Especiales de temporada',
           'El sabor del Istmo',
           'Xadani en Oaxaca',
           'Cocina y mesa Xadani'
         )
         or coalesce(g.caption, '') = ''
       )
  `);
}

async function seedExperiences() {
  const count = await query("select count(*)::int as total from experiences");
  if (count.rows[0]?.total > 0) return;

  await query(
    `insert into experiences (title, description, image, event_date, event_time, price, payment_type, cta_label, sort_order, included_items)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      "La mesa completa, al centro",
      "Una selección especial de nuestra cocina para familias, celebraciones, festejos y grupos medianos.",
      "assets/xadani-fondo-calido.jpg",
      "",
      "12:00 - 19:30",
      650,
      "experience",
      "Reservar experiencia",
      0,
      "Garnachas y entradas istmeñas\nPesca o especial del día\nArroz, ensalada y guarniciones\nPostre de la casa"
    ]
  );
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const passwordHash = crypto
    .pbkdf2Sync(String(password), salt, 150000, 64, "sha512")
    .toString("hex");
  return { salt, passwordHash };
}

async function seedAdminUser() {
  const users = [
    {
      username: process.env.ADMIN_USERNAME || "admin",
      password: process.env.ADMIN_PASSWORD || "xadani2026",
      role: "owner",
      recoveryEmail: process.env.ADMIN_RECOVERY_EMAIL || ""
    },
    {
      username: process.env.RESTAURANT_USERNAME || "rest1",
      password: process.env.RESTAURANT_PASSWORD || "xadani2026",
      role: "restaurant",
      recoveryEmail: process.env.RESTAURANT_RECOVERY_EMAIL || ""
    }
  ];

  for (const user of users) {
    const { salt, passwordHash } = hashPassword(user.password);
    await query(
      `insert into admin_users (username, salt, password_hash, role, recovery_email)
       values ($1, $2, $3, $4, $5)
       on conflict (username)
       do update set role = coalesce(admin_users.role, excluded.role)`,
      [user.username, salt, passwordHash, user.role, user.recoveryEmail]
    );
  }
}

async function verifyAdminCredentials(username, password) {
  const result = await query("select * from admin_users where username = $1", [username]);
  const admin = result.rows[0];
  if (!admin) return false;

  const { passwordHash } = hashPassword(password, admin.salt);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(passwordHash, "hex"),
    Buffer.from(admin.password_hash, "hex")
  );
  if (!isValid) return false;
  return {
    username: admin.username,
    role: admin.role || "owner",
    recoveryEmail: admin.recovery_email || ""
  };
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

async function updateAdminRecoveryEmail(username, recoveryEmail) {
  await query(
    `update admin_users
     set recovery_email = $2, updated_at = now()
     where username = $1`,
    [username, recoveryEmail]
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

async function getAdminUserFromToken(token) {
  const username = getAdminUsernameFromToken(token);
  if (!username) return null;
  const result = await query(
    "select username, role, recovery_email from admin_users where username = $1",
    [username]
  );
  const user = result.rows[0];
  if (!user) return null;
  return {
    username: user.username,
    role: user.role || "owner",
    recoveryEmail: user.recovery_email || ""
  };
}

function requireAdmin(req) {
  const token = req.headers["x-admin-token"];
  if (!verifyAdminToken(token)) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }
}

async function requireAdminRole(req, allowedRoles = ["owner"]) {
  requireAdmin(req);
  const user = await getAdminUserFromToken(req.headers["x-admin-token"]);
  if (!user || !allowedRoles.includes(user.role)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }
  return user;
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
  requireAdminRole,
  signAdminToken,
  getAdminUsernameFromToken,
  getAdminUserFromToken,
  updateAdminPassword,
  updateAdminRecoveryEmail,
  verifyAdminCredentials,
  resetMenuStructure,
  sendError,
  getDefaultMenuCategories,
  getPhysicalMenuItems
};
