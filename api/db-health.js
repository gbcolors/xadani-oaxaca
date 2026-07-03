const { initializeDatabase, query } = require("../lib/db");

function databaseInfo() {
  const databaseUrl =
    process.env.XADANI_DATABASE_URL ||
    process.env.xadani_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    "";
  try {
    const parsed = new URL(databaseUrl);
    return {
      host: parsed.hostname,
      database: parsed.pathname.replace("/", ""),
      provider: parsed.hostname.includes("neon.tech")
        ? "neon"
        : parsed.hostname.includes("rds.amazonaws.com")
          ? "aws-rds"
          : "postgres",
      isGbMaster: /gb_master/i.test(parsed.pathname)
    };
  } catch {
    return { host: "unknown", database: "unknown", provider: "unknown", isGbMaster: false };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const database = databaseInfo();
  try {
    await initializeDatabase();
    const result = await query(`
      select
        (select count(*)::int from menu_items) as menu_items,
        (select count(*)::int from menu_categories) as menu_categories,
        (select count(*)::int from reservations) as reservations,
        now() as checked_at
    `);
    return res.status(200).json({ ok: true, database, counts: result.rows[0] || {} });
  } catch (error) {
    return res.status(503).json({ ok: false, database, error: error.message });
  }
};
