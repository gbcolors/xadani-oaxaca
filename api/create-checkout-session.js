const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const paymentCatalog = {
  deposit: {
    name: "Anticipo de reserva Xadani",
    description: "Anticipo fijo para confirmar la mesa.",
    unitAmount: 10000
  }
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY" });
  }

  const {
    folio,
    name,
    phone,
    email,
    guests,
    date,
    time,
    restrictions,
    paymentType
  } = req.body || {};

  const item = paymentCatalog[paymentType];
  const quantity = 1;

  if (!item) {
    return res.status(400).json({ error: "Unsupported payment type" });
  }

  if (!name || !phone || !email || !date || !time || quantity < 1) {
    return res.status(400).json({ error: "Missing reservation data" });
  }

  const siteUrl = process.env.PUBLIC_SITE_URL || req.headers.origin || "http://localhost:5177";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    client_reference_id: folio,
    line_items: [
      {
        price_data: {
          currency: "mxn",
          product_data: {
            name: item.name,
            description: item.description
          },
          unit_amount: item.unitAmount
        },
        quantity
      }
    ],
    metadata: {
      folio,
      name,
      phone,
      email,
      guests: String(guests),
      date,
      time,
      restrictions: restrictions || "",
      paymentType
    },
    success_url: `${siteUrl}/index.html?stripe=success&folio=${encodeURIComponent(folio)}`,
    cancel_url: `${siteUrl}/index.html?stripe=cancel&folio=${encodeURIComponent(folio)}`
  });

  return res.status(200).json({ url: session.url });
};
