const { initializeDatabase, query, sendError } = require("../lib/db");

const PORTFOLIO = {
  id: "portfolio-xadani-oaxaca",
  slug: "xadani-oaxaca",
  businessCode: "GB-XADANI-001",
  name: "Xadani en Oaxaca",
  legalOwner: "Portafolio comercial Xadani en Oaxaca",
  productSuite: ["gobookr", "goreservas", "gocrm", "gophone", "gowallet"],
  primaryDomain: "xadanienoaxaca.com",
  publicUrl: "https://xadanienoaxaca.com",
  adminUrl: "https://xadanienoaxaca.com/admin",
  reservationsUrl: "https://xadanienoaxaca.com/reservas.html",
  goReservasUrl: "https://xadanienoaxaca.com/goreservas",
  phone: "+529514420408",
  voiceAssistant: {
    name: "Gala",
    providerRoute: "twilio-voice",
    webhook: "https://xadanienoaxaca.com/api/twilio-voice?line=xadani",
    mode: "new-reservations-and-transfer"
  },
  canonicalVercel: {
    projectName: "xadani-oaxaca",
    projectId: "prj_Vz3DcTmriqSecIYN95Hzw3oNnHW1",
    keepDeployment: "xadani-oaxaca-45bamvfgm-gato-bronco.vercel.app"
  },
  historicalProjectsToRetire: [
    {
      project: "toma-como-base-https-www-fishers",
      deployment: "toma-como-base-https-www-fishers-c3cb6bwcr-gato-bronco.vercel.app",
      reason: "Repo historico/fuente de diseno inicial; no debe recibir configuraciones productivas."
    },
    {
      project: "deploy-xadani-oaxaca",
      deployment: "deploy-xadani-oaxaca-jkjfl3ntd-gato-bronco.vercel.app",
      reason: "Paquete temporal de despliegue; no debe quedar como consola ni origen operativo."
    }
  ]
};

function nowIso() {
  return new Date().toISOString();
}

function clean(value = "") {
  return String(value || "").replace(/[<>"\r\n]/g, "").trim();
}

function mapReservation(row) {
  return {
    folio: row.folio,
    customer: row.name,
    phone: row.phone,
    email: row.email,
    date: row.reservation_date,
    time: row.reservation_time,
    guests: row.guests,
    status: row.status,
    tableId: row.table_id,
    source: String(row.restrictions || "").includes("Conmutador Xadani")
      ? "gophone:gala"
      : "gobookr:public",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function ensureWorkerSchema() {
  await query(`
    create table if not exists portfolio_registry (
      portfolio_id text primary key,
      slug text not null,
      business_code text not null,
      name text not null,
      primary_domain text not null,
      public_url text default '',
      admin_url text default '',
      reservations_url text default '',
      phone text default '',
      metadata jsonb default '{}'::jsonb,
      status text default 'active',
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists crm_worker_tasks (
      id serial primary key,
      ticket text unique not null,
      portfolio_id text not null,
      channel text not null,
      title text not null,
      description text default '',
      priority text default 'normal',
      status text default 'open',
      source text default 'crm-worker',
      assigned_to text default 'operadorc101-xadani',
      payload jsonb default '{}'::jsonb,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists connector_credentials_status (
      id serial primary key,
      portfolio_id text not null,
      connector text not null,
      account_label text not null,
      status text not null default 'configured',
      public_reference text default '',
      notes text default '',
      last_checked_at timestamptz default now(),
      created_at timestamptz default now(),
      updated_at timestamptz default now(),
      unique(portfolio_id, connector, account_label)
    );
  `);
}

async function upsertPortfolioRegistry() {
  await query(
    `insert into portfolio_registry
       (portfolio_id, slug, business_code, name, primary_domain, public_url, admin_url,
        reservations_url, phone, metadata, status)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,'active')
     on conflict (portfolio_id)
     do update set slug=excluded.slug,
                   business_code=excluded.business_code,
                   name=excluded.name,
                   primary_domain=excluded.primary_domain,
                   public_url=excluded.public_url,
                   admin_url=excluded.admin_url,
                   reservations_url=excluded.reservations_url,
                   phone=excluded.phone,
                   metadata=excluded.metadata,
                   status='active',
                   updated_at=now()`,
    [
      PORTFOLIO.id,
      PORTFOLIO.slug,
      PORTFOLIO.businessCode,
      PORTFOLIO.name,
      PORTFOLIO.primaryDomain,
      PORTFOLIO.publicUrl,
      PORTFOLIO.adminUrl,
      PORTFOLIO.reservationsUrl,
      PORTFOLIO.phone,
      JSON.stringify({
        productSuite: PORTFOLIO.productSuite,
        goReservasUrl: PORTFOLIO.goReservasUrl,
        voiceAssistant: PORTFOLIO.voiceAssistant,
        canonicalVercel: PORTFOLIO.canonicalVercel,
        historicalProjectsToRetire: PORTFOLIO.historicalProjectsToRetire
      })
    ]
  );
}

async function upsertConnector(connector, accountLabel, status, publicReference, notes = "") {
  await query(
    `insert into connector_credentials_status
       (portfolio_id, connector, account_label, status, public_reference, notes, last_checked_at)
     values ($1,$2,$3,$4,$5,$6,now())
     on conflict (portfolio_id, connector, account_label)
     do update set status=excluded.status,
                   public_reference=excluded.public_reference,
                   notes=excluded.notes,
                   last_checked_at=now(),
                   updated_at=now()`,
    [PORTFOLIO.id, connector, accountLabel, status, publicReference, notes]
  );
}

async function seedConnectors() {
  const connectors = [
    ["website", "xadanienoaxaca.com", "configured", PORTFOLIO.publicUrl, "Dominio publico del portafolio."],
    ["admin", "xadani-admin", "configured", PORTFOLIO.adminUrl, "Panel admin propio del proyecto."],
    ["gobookr", "motor-reservas-publico", "configured", PORTFOLIO.reservationsUrl, "Motor publico sin informacion operativa interna."],
    ["goreservas", "plano-y-lista-operativa", "configured", PORTFOLIO.goReservasUrl, "Vista operativa de reservas y plano."],
    ["gophone", "gala-xadani", "configured", PORTFOLIO.voiceAssistant.webhook, "Asistente telefonico para nuevas reservas y transferencia."],
    ["database", "xadani-independent-postgres", "configured", "XADANI_DATABASE_URL", "BD independiente; no mezclar con master ni clientes externos."],
    ["vercel", "xadani-oaxaca", "configured", PORTFOLIO.canonicalVercel.keepDeployment, "Proyecto canonico vivo."],
    ["vercel-retire", "project-hu322/fishers", "retire", "toma-como-base-https-www-fishers", "Congelar y eliminar cuando direccion confirme."],
    ["vercel-retire", "deploy-xadani-oaxaca", "retire", "deploy-xadani-oaxaca", "Paquete temporal a retirar cuando quede respaldado."]
  ];

  for (const item of connectors) {
    await upsertConnector(...item);
  }
}

async function upsertTask(ticket, channel, title, description, priority, status, payload = {}) {
  await query(
    `insert into crm_worker_tasks
       (ticket, portfolio_id, channel, title, description, priority, status, payload)
     values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
     on conflict (ticket)
     do update set channel=excluded.channel,
                   title=excluded.title,
                   description=excluded.description,
                   priority=excluded.priority,
                   status=excluded.status,
                   payload=excluded.payload,
                   updated_at=now()`,
    [ticket, PORTFOLIO.id, channel, title, description, priority, status, JSON.stringify(payload)]
  );
}

async function seedControlTasks() {
  await upsertTask(
    "XAD-OPS-20260711-001",
    "crm-worker",
    "Unificar Xadani en proyecto canonico",
    "Mantener vivo solo el proyecto xadani-oaxaca y retirar fishers/deploy-xadani-oaxaca despues de respaldo.",
    "high",
    "open",
    { canonical: PORTFOLIO.canonicalVercel, retire: PORTFOLIO.historicalProjectsToRetire }
  );
  await upsertTask(
    "XAD-OPS-20260711-002",
    "gophone",
    "Validar Gala contra BD independiente",
    "Cada nueva reserva telefonica debe escribirse en reservations de Xadani y reflejarse en goreservas.",
    "high",
    "open",
    { endpoint: PORTFOLIO.voiceAssistant.webhook }
  );
}

async function buildSnapshot() {
  const reservations = await query(`
    select *
    from reservations
    order by created_at desc
    limit 50
  `);
  const reservationStats = await query(`
    select status, count(*)::int as total
    from reservations
    group by status
    order by status
  `);
  const tables = await query(`
    select status, count(*)::int as total
    from tables
    group by status
    order by status
  `);
  const tasks = await query(`
    select ticket, channel, title, priority, status, assigned_to, created_at, updated_at
    from crm_worker_tasks
    where portfolio_id = $1
    order by updated_at desc
    limit 30
  `, [PORTFOLIO.id]);
  const connectors = await query(`
    select connector, account_label, status, public_reference, notes, last_checked_at
    from connector_credentials_status
    where portfolio_id = $1
    order by connector, account_label
  `, [PORTFOLIO.id]);

  return {
    ok: true,
    checkedAt: nowIso(),
    portfolio: PORTFOLIO,
    health: {
      reservations: reservationStats.rows,
      tables: tables.rows,
      latestReservations: reservations.rows.map(mapReservation)
    },
    tasks: tasks.rows,
    connectors: connectors.rows
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    await initializeDatabase();
    await ensureWorkerSchema();
    await upsertPortfolioRegistry();
    await seedConnectors();
    await seedControlTasks();

    if (req.method === "GET") {
      return res.status(200).json(await buildSnapshot());
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const ticket = clean(body.ticket) || `XAD-CRM-${Date.now().toString(36).toUpperCase()}`;
      await upsertTask(
        ticket,
        clean(body.channel) || "manual",
        clean(body.title) || "Tarea CRM Xadani",
        clean(body.description) || "",
        clean(body.priority) || "normal",
        clean(body.status) || "open",
        body.payload || {}
      );
      return res.status(201).json(await buildSnapshot());
    }

    res.setHeader("Allow", "GET,POST,OPTIONS");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  } catch (error) {
    return sendError(res, error);
  }
};
