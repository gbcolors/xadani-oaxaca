const { initializeDatabase, query, requireAdminRole, sendError } = require("../lib/db");

function mapItem(row) {
  return {
    id: row.id,
    title: row.title,
    caption: row.caption,
    image: row.image,
    type: row.type,
    active: row.active,
    sortOrder: row.sort_order
  };
}

function fallbackGallery() {
  const items = [
    {
      file: "xadani-portada-foto-02.jpg",
      title: "Salmón del patrón",
      caption: "Salmón horneado con orégano, aceite de oliva y ajo, servido con arroz y ensalada."
    },
    {
      file: "xadani-portada-foto-09.jpg",
      title: "Plátanos al horno",
      caption: "Plátanos al horno con queso y crema, un postre cálido de la casa."
    },
    {
      file: "xadani-portada-foto-10.jpg",
      title: "Lisa al horno con aderezo",
      caption: "Lisa al horno servida con ensalada, preparada al estilo Xadani."
    },
    {
      file: "xadani-portada-foto-11.jpg",
      title: "Garnachas",
      caption: "Garnachas istmeñas con carne, queso, curtido y salsa."
    },
    {
      file: "xadani-portada-foto-18.jpg",
      title: "Aguachile de camarón",
      caption: "Preparación fresca con cítricos, cebolla morada, pepino y chile."
    },
    {
      file: "xadani-portada-foto-19.jpg",
      title: "Molote de plátano",
      caption: "Molote de plátano con queso y crema, servido al centro."
    },
    {
      file: "xadani-fondo-calido.jpg",
      title: "Cocina al horno",
      caption: "Detalle de nuestra cocina al horno y preparaciones calientes."
    },
    {
      file: "xadani-hero-portada.jpg",
      title: "Carta visual Xadani",
      caption: "Composición visual de platos, pesca fresca y cocina istmeña para compartir."
    }
  ];
  return items.map((item, index) => ({
    id: `static-gallery-${index}`,
    title: item.title,
    caption: item.caption,
    image: `/assets/${item.file}`,
    type: "concepto",
    active: true,
    sortOrder: index
  }));
}

module.exports = async function handler(req, res) {
  try {
    await initializeDatabase();

    if (req.method === "GET") {
      const result = await query(
        "select * from gallery_items where active = true order by sort_order, id"
      );
      return res.status(200).json({ gallery: result.rows.map(mapItem) });
    }

    await requireAdminRole(req, ["owner"]);

    if (req.method === "POST") {
      const item = req.body || {};
      const result = await query(
        `insert into gallery_items (title, caption, image, type, sort_order, active)
         values ($1,$2,$3,$4,$5,true)
         returning *`,
        [
          item.title,
          item.caption || "",
          item.image,
          item.type || "concepto",
          Number(item.sortOrder || 0)
        ]
      );
      return res.status(200).json({ item: mapItem(result.rows[0]) });
    }

    if (req.method === "PUT") {
      const item = req.body || {};
      const result = await query(
        `update gallery_items
         set title=$2, caption=$3, image=$4, type=$5, sort_order=$6, updated_at=now()
         where id=$1
         returning *`,
        [
          item.id,
          item.title,
          item.caption || "",
          item.image,
          item.type || "concepto",
          Number(item.sortOrder || 0)
        ]
      );
      return res.status(200).json({ item: mapItem(result.rows[0]) });
    }

    if (req.method === "DELETE") {
      await query("update gallery_items set active=false, updated_at=now() where id=$1", [req.body?.id]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    if (req.method === "GET") {
      return res.status(200).json({ gallery: fallbackGallery() });
    }
    return sendError(res, error);
  }
};

