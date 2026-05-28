const menuItems = {
  calientes: [
    {
      name: "Tetela de requesón y hoja santa",
      description: "Masa azul, requesón fresco, hoja santa y salsa de chile pasilla mixe.",
      price: 145,
      tags: ["Vegetariano", "Maíz criollo"],
      image: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Tostada tibia de pulpo",
      description: "Pulpo a la brasa, frijol negro, mayonesa de chile costeño y quelites.",
      price: 210,
      tags: ["Recomendado"],
      image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Empanada de amarillo con hongos",
      description: "Mole amarillo, hongos de temporada, quesillo y hierbas frescas.",
      price: 160,
      tags: ["Temporada"],
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Quesillo fundido con chorizo istmeño",
      description: "Servido con tortillas calientes, chile de agua asado y pico de gallo.",
      price: 175,
      tags: ["Para compartir"],
      image: "https://images.unsplash.com/photo-1633436375795-12b3b339712f?auto=format&fit=crop&w=900&q=80"
    }
  ],
  frias: [
    {
      name: "Aguachile de pesca local",
      description: "Chile de agua, pepino, cebolla morada, limón criollo y aceite de cilantro.",
      price: 235,
      tags: ["Picante", "Fresco"],
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Ensalada de quelites",
      description: "Tomate criollo, aguacate, vinagreta de limón y pepita tostada.",
      price: 155,
      tags: ["Vegetariano"],
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Tostada de atún con recado negro",
      description: "Atún sellado, recado negro, poro crujiente y emulsión de ajonjolí.",
      price: 245,
      tags: ["Recomendado"],
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Ceviche de camarón con mango y mezcal",
      description: "Camarón, mango ataulfo, chile manzano, mezcal joven y tostadas de maíz.",
      price: 220,
      tags: ["Cítrico"],
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80"
    }
  ],
  fuertes: [
    {
      name: "Mole negro con guajolote",
      description: "Receta de la casa, arroz con hierbas y ajonjolí tostado.",
      price: 365,
      tags: ["Casa"],
      image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Pesca del día con coloradito",
      description: "Filete a la plancha, coloradito, verduras tatemadas y limón quemado.",
      price: 390,
      tags: ["Fresco"],
      image: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Costilla braseada en chichilo",
      description: "Cocción lenta, puré de frijol ayocote y cebollitas encurtidas.",
      price: 420,
      tags: ["Fuego lento"],
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Tlayuda Xadani con tasajo premium",
      description: "Asiento, frijol, quesillo, col, aguacate y salsa de molcajete.",
      price: 285,
      tags: ["Oaxaca"],
      image: "https://images.unsplash.com/photo-1624300629298-e9de39c13be8?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Risotto de huitlacoche y quesillo",
      description: "Arroz cremoso, huitlacoche, queso de hebra y epazote.",
      price: 310,
      tags: ["Vegetariano"],
      image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80"
    }
  ],
  postres: [
    {
      name: "Nicuatole con frutos rojos",
      description: "Postre tradicional de maíz con compota de temporada.",
      price: 135,
      tags: ["Maíz"],
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Tamal de chocolate de metate",
      description: "Chocolate oaxaqueño, crema batida de canela y sal de gusano opcional.",
      price: 150,
      tags: ["Chocolate"],
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Helado de leche quemada",
      description: "Con crumble de maíz, naranja confitada y miel de agave.",
      price: 120,
      tags: ["Clásico"],
      image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Pan de elote criollo",
      description: "Servido tibio con crema de vainilla y hoja santa.",
      price: 140,
      tags: ["Casa"],
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80"
    }
  ],
  bebidas: [
    {
      name: "Coctel de mezcal con hoja santa",
      description: "Mezcal joven, hoja santa, limón, jarabe de agave y sal de chile.",
      price: 190,
      tags: ["Mezcal"],
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Margarita de chile de agua",
      description: "Tequila blanco, chile de agua, limón real y sal de gusano.",
      price: 180,
      tags: ["Picante"],
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Agua de cacao",
      description: "Cacao, maíz, canela y espuma ligera, servida fría.",
      price: 95,
      tags: ["Sin alcohol"],
      image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Café de olla",
      description: "Café de altura, piloncillo, canela y cáscara de naranja.",
      price: 75,
      tags: ["Caliente"],
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Vino mexicano por copa",
      description: "Selección rotativa de blancos, tintos y naranjos nacionales.",
      price: 165,
      tags: ["Copa"],
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80"
    }
  ]
};

const grid = document.querySelector("#menu-grid");
const tabs = document.querySelectorAll(".tab");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");
const reservationModal = document.querySelector("#reservation-modal");
const reservationForm = document.querySelector("#reservation-form");
const reservationSuccess = document.querySelector("#reservation-success");
const reservationSummary = document.querySelector("#reservation-summary");
const openReservationButtons = document.querySelectorAll("[data-open-reservation]");
const closeReservationButtons = document.querySelectorAll("[data-close-reservation]");
const paymentTypeInput = document.querySelector("#payment-type");
const paymentPreview = document.querySelector("#payment-preview");
const reservationSubmit = document.querySelector("#reservation-submit");

const checkoutEndpoint = "/api/create-checkout-session";
const provisionalApiBase = "https://spell-jenny-commissioner-remain.trycloudflare.com";
const apiBase = location.hostname === "xadanienoaxaca.com" ? provisionalApiBase : "";
let remoteMenuItems = [];
const defaultSiteSettings = {
  businessName: "Xadani en Oaxaca",
  domain: "xadanienoaxaca.com",
  phone: "951 672 4141",
  phoneHref: "+529516724141",
  email: "hola@xadanienoaxaca.com",
  address: "Calle Fundadores 105, 68127 Oaxaca de Juárez, Oaxaca",
  hours: "Miércoles a lunes, 13:00 - 19:00",
  contactIntro: "Reserva directo por WhatsApp o teléfono. Para grupos, comparte fecha, hora y número de personas.",
  heroText:
    "Maíz criollo, moles profundos, pesca fresca y mezcalería en una carta contemporánea pensada para compartirse sin prisa."
};

function formatPrice(price) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(price);
}

function getSelectedPayment() {
  const option = paymentTypeInput.options[paymentTypeInput.selectedIndex];
  const unitAmount = Number(option.dataset.amount || 0);
  const guests = Number(reservationForm.elements.guests.value || 1);
  const paymentType = paymentTypeInput.value;
  const quantity = paymentType === "event" ? 1 : guests;
  const total = unitAmount * quantity;

  return {
    paymentType,
    label: option.textContent,
    unitAmount,
    quantity,
    total
  };
}

function updatePaymentPreview() {
  const payment = getSelectedPayment();
  paymentPreview.querySelector("strong").textContent = formatPrice(payment.total);
  reservationSubmit.textContent = payment.total > 0 ? "Continuar a pago seguro" : "Enviar solicitud";
}

async function apiJson(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }

  return response.json();
}

function getSiteSettings() {
  try {
    return {
      ...defaultSiteSettings,
      ...(JSON.parse(localStorage.getItem("xadaniSiteSettings")) || {})
    };
  } catch {
    return defaultSiteSettings;
  }
}

async function loadRemoteSettings() {
  try {
    const data = await apiJson("/api/settings");
    localStorage.setItem(
      "xadaniSiteSettings",
      JSON.stringify({ ...defaultSiteSettings, ...(data.settings || {}) })
    );
  } catch {
    // Local settings remain available before DATABASE_URL is configured.
  }
}

async function loadRemoteMenu() {
  try {
    const data = await apiJson("/api/menu");
    remoteMenuItems = data.menu || [];
  } catch {
    remoteMenuItems = [];
  }
}

function applySiteSettings() {
  const settings = getSiteSettings();
  document.querySelectorAll("[data-setting]").forEach((element) => {
    const key = element.dataset.setting;
    if (Object.prototype.hasOwnProperty.call(settings, key)) {
      element.textContent = settings[key];
    }
  });
  document.querySelectorAll("[data-setting-href]").forEach((element) => {
    const key = element.dataset.settingHref;
    if (key === "phoneHref" && settings.phoneHref) {
      element.href = `tel:${settings.phoneHref}`;
    }
    if (key === "emailHref" && settings.email) {
      element.href = `mailto:${settings.email}`;
    }
  });
  document.querySelectorAll("[data-setting-placeholder]").forEach((element) => {
    const key = element.dataset.settingPlaceholder;
    if (settings[key]) {
      element.placeholder = settings[key];
    }
  });
}

function renderMenu(category) {
  const menuOverrides = getLocalMenuItems(category);
  const visibleItems = [...menuItems[category], ...menuOverrides];
  grid.innerHTML = visibleItems
    .map(
      (item) => `
        <article class="dish-card">
          <img class="dish-image" src="${item.image}" alt="${item.name}" loading="lazy">
          <div class="dish-content">
            <div class="dish-top">
              <h3>${item.name}</h3>
              <span class="price">${formatPrice(item.price)}</span>
            </div>
            <p>${item.description}</p>
            <div class="tags">
              ${item.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function getLocalMenuItems(category) {
  try {
    const rows = JSON.parse(localStorage.getItem("xadaniMenuOverrides")) || [];
    const localRows = (remoteMenuItems.length ? [] : rows)
      .filter((item) => item.category === category)
      .map((item) => ({
        name: item.name,
        description: item.description,
        price: Number(item.price),
        tags: ["Nuevo"],
        image:
          item.image ||
          "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80"
      }));
    const remoteRows = remoteMenuItems
      .filter((item) => item.category === category)
      .map((item) => ({
        name: item.name,
        description: item.description,
        price: Number(item.price),
        tags: item.tags?.length ? item.tags : ["Nuevo"],
        image:
          item.image ||
          "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80"
      }));
    return [...remoteRows, ...localRows];
  } catch {
    return remoteMenuItems.filter((item) => item.category === category);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    renderMenu(tab.dataset.category);
  });
});

navToggle.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
  siteNav.classList.toggle("open");
});

siteNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

function openReservationModal() {
  reservationModal.classList.add("open");
  reservationModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  reservationForm.hidden = false;
  reservationSuccess.hidden = true;
  updatePaymentPreview();
  reservationForm.querySelector("input[name='name']").focus();
}

function closeReservationModal() {
  reservationModal.classList.remove("open");
  reservationModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function getSavedReservations() {
  try {
    return JSON.parse(localStorage.getItem("xadaniReservations")) || [];
  } catch {
    return [];
  }
}

function saveReservation(reservation) {
  const reservations = getSavedReservations();
  reservations.push(reservation);
  localStorage.setItem("xadaniReservations", JSON.stringify(reservations));
  apiJson("/api/reservations", {
    method: "POST",
    body: JSON.stringify(reservation)
  }).catch(() => {
    // The local copy is kept when the database is not configured yet.
  });
}

openReservationButtons.forEach((button) => {
  button.addEventListener("click", openReservationModal);
});

closeReservationButtons.forEach((button) => {
  button.addEventListener("click", closeReservationModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && reservationModal.classList.contains("open")) {
    closeReservationModal();
  }
});

reservationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(reservationForm);
  const folio = `XAD-${Date.now().toString().slice(-6)}`;
  const payment = getSelectedPayment();
  const reservation = {
    folio,
    name: formData.get("name").trim(),
    phone: formData.get("phone").trim(),
    email: formData.get("email").trim(),
    guests: Number(formData.get("guests")),
    time: formData.get("time"),
    paymentType: payment.paymentType,
    paymentLabel: payment.label,
    paymentTotal: payment.total,
    paymentStatus: payment.total > 0 ? "pending" : "not_required",
    restrictions: formData.get("restrictions").trim(),
    createdAt: new Date().toISOString()
  };

  saveReservation(reservation);

  if (payment.total > 0) {
    reservationSubmit.disabled = true;
    reservationSubmit.textContent = "Preparando pago...";

    fetch(checkoutEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reservation)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Stripe checkout endpoint unavailable");
        }
        return response.json();
      })
      .then((data) => {
        if (!data.url) {
          throw new Error("Stripe checkout URL missing");
        }
        window.location.href = data.url;
      })
      .catch(() => {
        reservationForm.hidden = true;
        reservationSuccess.hidden = false;
        reservationSummary.textContent = `${reservation.name}, guardamos tu solicitud con folio ${
          reservation.folio
        } por ${formatPrice(
          reservation.paymentTotal
        )}. Falta configurar Stripe en el servidor para cobrar este prepago.`;
        reservationForm.reset();
        reservationSubmit.disabled = false;
        updatePaymentPreview();
      });
    return;
  }

  reservationForm.hidden = true;
  reservationSuccess.hidden = false;
  reservationSummary.textContent = `${reservation.name}, recibimos tu solicitud para ${reservation.guests} persona${
    reservation.guests === 1 ? "" : "s"
  } a las ${reservation.time}. Folio ${reservation.folio}. Confirmaremos disponibilidad al ${reservation.phone}.`;
  reservationForm.reset();
  updatePaymentPreview();
});

reservationForm.elements.guests.addEventListener("input", updatePaymentPreview);
paymentTypeInput.addEventListener("change", updatePaymentPreview);

const stripeStatus = new URLSearchParams(window.location.search).get("stripe");
if (stripeStatus === "success" || stripeStatus === "cancel") {
  const folio = new URLSearchParams(window.location.search).get("folio") || "";
  window.addEventListener("load", () => {
    openReservationModal();
    reservationForm.hidden = true;
    reservationSuccess.hidden = false;
    reservationSummary.textContent =
      stripeStatus === "success"
        ? `Pago recibido en Stripe. Reserva ${folio} pendiente de confirmacion final del restaurante.`
        : `El pago de la reserva ${folio} fue cancelado. Puedes intentar de nuevo o elegir reserva sin cargo.`;
  });
}

applySiteSettings();
renderMenu("calientes");

Promise.all([loadRemoteSettings(), loadRemoteMenu()]).then(() => {
  applySiteSettings();
  const activeTab = document.querySelector(".tab.active");
  renderMenu(activeTab?.dataset.category || "calientes");
});
