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

const defaultMenuCategories = [
  { slug: "entradas", group: "MENU", name: "ENTRADAS" },
  { slug: "fuertes", group: "MENU", name: "FUERTES" },
  { slug: "especiales", group: "MENU", name: "ESPECIALES" },
  { slug: "menu-istmeno", group: "MENU", name: "MENU ISTMEÑO" },
  { slug: "bebidas", group: "MENU", name: "BEBIDAS" }
];

const mainCategoryMap = {
  entradas: ["entradas-frias", "entradas-cocteles", "entradas-ensaladas", "entradas-calientes", "entradas-caldos", "entradas-sopas", "entradas-consomes"],
  fuertes: ["fuertes-pesca-del-dia", "fuertes-camarones", "fuertes-para-compartir"],
  especiales: ["fuertes-especiales-istmenos", "fuertes-extras", "postres"],
  "menu-istmeno": ["fuertes-especiales-istmenos"],
  bebidas: ["bebidas-con-alcohol", "bebidas-sin-alcohol"]
};

const fallbackMenuItems = {
  "entradas-frias": [menuItems.frias[0]],
  "entradas-cocteles": [menuItems.frias[3]],
  "entradas-ensaladas": [menuItems.frias[1]],
  "entradas-calientes": [menuItems.calientes[0]],
  "entradas-caldos": [menuItems.calientes[1]],
  "entradas-sopas": [menuItems.calientes[2]],
  "entradas-consomes": [menuItems.calientes[3]],
  "fuertes-pesca-del-dia": [menuItems.fuertes[1]],
  "fuertes-especiales-istmenos": [menuItems.fuertes[0]],
  "fuertes-camarones": [menuItems.frias[2]],
  "fuertes-para-compartir": [menuItems.fuertes[3]],
  "fuertes-extras": [menuItems.fuertes[4]],
  postres: [menuItems.postres[0]],
  "bebidas-con-alcohol": [menuItems.bebidas[0]],
  "bebidas-sin-alcohol": [menuItems.bebidas[2]]
};

const grid = document.querySelector("#menu-grid");
const menuTabs = document.querySelector("#menu-tabs");
const fullMenuGrid = document.querySelector("#full-menu-grid");
const galleryGrid = document.querySelector("#gallery-grid");
const experienceGrid = document.querySelector("#experience-grid");
const photoLightbox = document.querySelector("#photo-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxKicker = document.querySelector("#lightbox-kicker");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxDescription = document.querySelector("#lightbox-description");
const lightboxMeta = document.querySelector("#lightbox-meta");
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
const staleHeroTextPattern = /moles\s+profundos|Ma[ií]z\s+criollo|paisanos/i;
const stalePhonePattern = /951\s*672\s*4141|529516724141|9516724141|951\s*343\s*8483|529513438483|9513438483/;

function sanitizeSiteSettings(settings) {
  const nextSettings = { ...settings };
  if (staleHeroTextPattern.test(nextSettings.heroText || "")) {
    nextSettings.heroText = defaultSiteSettings.heroText;
  }
  if (stalePhonePattern.test(`${nextSettings.phone || ""} ${nextSettings.phoneHref || ""}`)) {
    nextSettings.phone = defaultSiteSettings.phone;
    nextSettings.phoneHref = defaultSiteSettings.phoneHref;
  }
  if (stalePhonePattern.test(`${nextSettings.whatsapp || ""} ${nextSettings.whatsappHref || ""}`)) {
    nextSettings.whatsapp = defaultSiteSettings.whatsapp;
    nextSettings.whatsappHref = defaultSiteSettings.whatsappHref;
  }
  if (stalePhonePattern.test(nextSettings.contactIntro || "")) {
    nextSettings.contactIntro = defaultSiteSettings.contactIntro;
  }
  return nextSettings;
}
const reservationSubmit = document.querySelector("#reservation-submit");

const checkoutEndpoint = "/api/create-checkout-session";
const localFileApiBase = "http://127.0.0.1:3000";
const apiBase = location.protocol === "file:" ? localFileApiBase : "";
let remoteMenuItems = [];
let menuCategories = [...defaultMenuCategories];
let fullMenuCategories = [...defaultMenuCategories];
let galleryItems = [];
let experiences = [];
let activeMenuItems = [];
const defaultSiteSettings = {
  businessName: "Xadani en Oaxaca",
  domain: "xadanienoaxaca.com",
  phone: "951 150 9454",
  phoneHref: "+529511509454",
  whatsapp: "951 150 9454",
  whatsappHref: "https://wa.me/529511509454",
  email: "hola@xadanienoaxaca.com",
  address: "Calle Fundadores 105, 68127 Oaxaca de Juárez, Oaxaca",
  hours: "Martes a domingo, 12:00 - 19:30",
  contactIntro: "Reserva directo por WhatsApp o teléfono. También puedes comunicarte al +52 951 150 9454 para grupos y eventos.",
  heroText:
    "Garnachas, cocina al horno, pesca fresca y recetas familiares del Istmo para visitantes de Juchitán, Tehuantepec, Salina Cruz y viajeros que buscan una experiencia gastronómica auténtica.",
  reservationNotifyEmail: "gbcolorsc@gmail.com"
};

function formatPrice(price) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(price);
}

function formatMenuPrice(item) {
  return item?.priceLabel || formatPrice(Number(item?.price || 0));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isCameraFileName(value = "") {
  return /^img[\s_-]*\d+/i.test(String(value).trim());
}

function displayGalleryTitle(item, index) {
  if (!item?.title || isCameraFileName(item.title)) {
    return `Fotografía ${index + 1}`;
  }
  return item.title;
}

function openPhotoLightbox({ image, title, description, meta, kicker }) {
  if (!photoLightbox || !image) return;
  lightboxImage.src = image;
  lightboxImage.alt = title || "Fotografía Xadani";
  lightboxKicker.textContent = kicker || "Xadani";
  lightboxTitle.textContent = title || "Fotografía Xadani";
  lightboxDescription.textContent = description || "Cocina, platillos e instalaciones de Xadani en Oaxaca.";
  lightboxMeta.textContent = meta || "";
  photoLightbox.classList.add("open");
  photoLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
}

function closePhotoLightbox() {
  if (!photoLightbox) return;
  photoLightbox.classList.remove("open");
  photoLightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  lightboxImage.src = "";
}

function getSelectedPayment() {
  if (!paymentTypeInput || !reservationForm) {
    return { paymentType: "free", label: "Reserva sin cargo", unitAmount: 0, quantity: 1, total: 0 };
  }
  const option = paymentTypeInput.options[paymentTypeInput.selectedIndex];
  const unitAmount = Number(option.dataset.amount || 0);
  const guests = Number(reservationForm.elements.guests.value || 1);
  const paymentType = paymentTypeInput.value;
  const quantity = paymentType === "deposit" ? 1 : guests;
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
  if (!paymentPreview || !reservationSubmit) return;
  const payment = getSelectedPayment();
  paymentPreview.querySelector("strong").textContent = formatPrice(payment.total);
  reservationSubmit.textContent = payment.total > 0 ? "Continuar a pago seguro" : "Reservar";
}

function trackAdsEvent(eventName, params = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, {
    send_to: "AW-18209814109",
    ...params
  });
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
    const storedSettings = sanitizeSiteSettings(JSON.parse(localStorage.getItem("xadaniSiteSettings")) || {});
    localStorage.setItem("xadaniSiteSettings", JSON.stringify({ ...defaultSiteSettings, ...storedSettings }));
    return {
      ...defaultSiteSettings,
      ...storedSettings
    };
  } catch {
    return defaultSiteSettings;
  }
}

async function loadRemoteSettings() {
  try {
    const data = await apiJson("/api/settings");
    const remoteSettings = sanitizeSiteSettings(data.settings || {});
    localStorage.setItem("xadaniSiteSettings", JSON.stringify({ ...defaultSiteSettings, ...remoteSettings }));
  } catch {
    // Local settings remain available before DATABASE_URL is configured.
  }
}

async function loadRemoteMenu() {
  try {
    const data = await apiJson("/api/menu");
    remoteMenuItems = data.menu || [];
    fullMenuCategories = data.categories?.length ? data.categories : [...defaultMenuCategories];
    menuCategories = [...defaultMenuCategories];
  } catch {
    remoteMenuItems = [];
    fullMenuCategories = [...defaultMenuCategories];
    menuCategories = [...defaultMenuCategories];
  }
}

async function loadRemoteGallery() {
  try {
    const data = await apiJson("/api/gallery");
    galleryItems = data.gallery || [];
  } catch {
    galleryItems = [];
  }
}

async function loadRemoteExperiences() {
  try {
    const data = await apiJson("/api/experiences");
    experiences = data.experiences || [];
  } catch {
    experiences = [];
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
    if (key === "whatsappHref" && settings.whatsappHref) {
      element.href = settings.whatsappHref.startsWith("http")
        ? settings.whatsappHref
        : `https://wa.me/${settings.whatsappHref.replace(/\D/g, "")}`;
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

function resolveImageUrl(imageUrl) {
  if (!imageUrl) {
    return "assets/xadani-hero-portada.jpg";
  }

  if (imageUrl.startsWith("http") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  return `${apiBase}${imageUrl}`;
}

function renderMenu(category) {
  if (!grid) return;
  const categorySlugs = mainCategoryMap[category] || [category];
  const visibleItems = getLocalMenuItems(categorySlugs);
  activeMenuItems = visibleItems;
  grid.innerHTML = visibleItems.length
    ? visibleItems
    .map(
      (item, index) => `
        <article class="dish-card" data-menu-photo="${index}" tabindex="0">
          <img class="dish-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">
          <div class="dish-content">
            <div class="dish-top">
              <h3>${escapeHtml(item.name)}</h3>
              <span class="price">${escapeHtml(formatMenuPrice(item))}</span>
            </div>
            <p>${escapeHtml(item.description)}</p>
            <div class="tags">
              ${item.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
            </div>
          </div>
        </article>
      `
    )
    .join("")
    : `<p class="empty-menu">Aun no hay platillos en esta categoria.</p>`;
}

function getLocalMenuItems(category) {
  const categories = Array.isArray(category) ? category : [category];
  try {
    const rows = JSON.parse(localStorage.getItem("xadaniMenuOverrides")) || [];
    const localRows = (remoteMenuItems.length ? [] : rows)
      .filter((item) => categories.includes(item.category))
      .map((item) => ({
        name: item.name,
        description: item.description,
        price: Number(item.price),
        priceLabel: item.priceLabel || "",
        tags: ["Nuevo"],
        image: resolveImageUrl(item.image)
      }));
    const remoteRows = remoteMenuItems
      .filter((item) => categories.includes(item.category))
      .map((item) => ({
        name: item.name,
        description: item.description,
        price: Number(item.price),
        priceLabel: item.priceLabel || "",
        tags: item.tags?.length ? item.tags : ["Nuevo"],
        image: resolveImageUrl(item.image)
      }));
    return [...remoteRows, ...localRows];
  } catch {
    return remoteMenuItems.filter((item) => categories.includes(item.category));
  }
}

function renderMenuTabs(activeCategory = menuCategories[0]?.slug || "entradas-frias") {
  if (!menuTabs) return;
  menuTabs.innerHTML = menuCategories
    .map(
      (category) => `
        <button class="tab ${category.slug === activeCategory ? "active" : ""}" type="button" role="tab"
          aria-selected="${category.slug === activeCategory}" data-category="${category.slug}">
          ${category.name}
        </button>
      `
    )
    .join("");
}

function renderFullMenu() {
  if (!fullMenuGrid) return;
  const categories = fullMenuCategories.length ? fullMenuCategories : defaultMenuCategories;
  fullMenuGrid.innerHTML = categories
    .map((category) => {
      const items = getLocalMenuItems(mainCategoryMap[category.slug] || category.slug);
      if (!items.length) return "";
      return `
        <section class="full-menu-category">
          <div class="section-heading">
            <p class="eyebrow">${escapeHtml(category.group || "Menú")}</p>
            <h2>${escapeHtml(category.name)}</h2>
          </div>
          <div class="menu-grid">
            ${items
              .map(
                (item, index) => `
                  <article class="dish-card" data-full-menu-photo data-full-menu-category="${escapeHtml(category.slug)}" data-full-menu-index="${index}" tabindex="0">
                    <img class="dish-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">
                    <div class="dish-content">
                      <div class="dish-top">
                        <h3>${escapeHtml(item.name)}</h3>
                        <span class="price">${escapeHtml(formatMenuPrice(item))}</span>
                      </div>
                      <p>${escapeHtml(item.description)}</p>
                      <div class="tags">
                        ${item.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
                      </div>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderGallery() {
  if (!galleryGrid) return;
  if (!galleryItems.length) {
    galleryGrid.innerHTML = `<p class="empty-menu">La biblioteca aun no tiene fotografias publicadas.</p>`;
    return;
  }

  galleryGrid.innerHTML = galleryItems.slice(0, 4)
    .map(
      (item, index) => `
        <figure data-gallery-photo="${index}" tabindex="0">
          <img src="${escapeHtml(resolveImageUrl(item.image))}" alt="${escapeHtml(displayGalleryTitle(item, index))}" loading="lazy" />
          <figcaption>Ver foto</figcaption>
        </figure>
      `
    )
    .join("");
}

function renderExperiences() {
  if (!experienceGrid) return;
  experienceGrid.innerHTML = (experiences.length ? experiences : [])
    .map(
      (item) => `
        <article class="experience-card">
          <img src="${resolveImageUrl(item.image)}" alt="${item.title}" loading="lazy" />
          <div>
            <span>${[item.eventDate, item.eventTime].filter(Boolean).join(" · ") || "Experiencia permanente"}</span>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            ${Number(item.price || 0) > 0 ? `<strong>${formatPrice(item.price)}</strong>` : ""}
            <button class="button primary" type="button" data-experience-reserve="${item.paymentType || "experience"}">
              ${item.ctaLabel || "Reservar"}
            </button>
          </div>
        </article>
      `
    )
    .join("");

  if (!experienceGrid.innerHTML) {
    experienceGrid.innerHTML = `<p class="empty-menu">Pronto anunciaremos nuevas experiencias.</p>`;
  }
}

menuTabs?.addEventListener("click", (event) => {
  const tab = event.target.closest(".tab");
  if (!tab) return;
  menuTabs.querySelectorAll(".tab").forEach((item) => {
    item.classList.remove("active");
    item.setAttribute("aria-selected", "false");
  });
  tab.classList.add("active");
  tab.setAttribute("aria-selected", "true");
  renderMenu(tab.dataset.category);
});

grid?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-menu-photo]");
  if (!card) return;
  const item = activeMenuItems[Number(card.dataset.menuPhoto)];
  if (!item) return;
  openPhotoLightbox({
    image: item.image,
    title: item.name,
    description: item.description,
    meta: `${formatMenuPrice(item)}${item.tags?.length ? ` · ${item.tags.join(" · ")}` : ""}`,
    kicker: "Menú Xadani"
  });
});

grid?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-menu-photo]");
  if (!card) return;
  event.preventDefault();
  card.click();
});

fullMenuGrid?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-full-menu-photo]");
  if (!card) return;
  const slug = card.dataset.fullMenuCategory;
  const indexValue = card.dataset.fullMenuIndex;
  const items = getLocalMenuItems(mainCategoryMap[slug] || slug);
  const item = items[Number(indexValue)];
  if (!item) return;
  openPhotoLightbox({
    image: item.image,
    title: item.name,
    description: item.description,
    meta: `${formatMenuPrice(item)}${item.tags?.length ? ` · ${item.tags.join(" · ")}` : ""}`,
    kicker: "Menú Xadani"
  });
});

fullMenuGrid?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-full-menu-photo]");
  if (!card) return;
  event.preventDefault();
  card.click();
});

galleryGrid?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-gallery-photo]");
  if (!card) return;
  const index = Number(card.dataset.galleryPhoto);
  const item = galleryItems[index];
  if (!item) return;
  openPhotoLightbox({
    image: resolveImageUrl(item.image),
    title: displayGalleryTitle(item, index),
    description: item.caption || "Una mirada a los platillos, el horno y los momentos de mesa en Xadani.",
    meta: item.type ? item.type : "Fotografía",
    kicker: "Biblioteca"
  });
});

galleryGrid?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-gallery-photo]");
  if (!card) return;
  event.preventDefault();
  card.click();
});

photoLightbox?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-lightbox]")) {
    closePhotoLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePhotoLightbox();
  }
});

navToggle?.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
  siteNav.classList.toggle("open");
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

function openReservationModal() {
  if (reservationModal) {
    reservationModal.classList.add("open");
    reservationModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  reservationForm.hidden = false;
  reservationSuccess.hidden = true;
  updatePaymentPreview();
  reservationForm?.querySelector("input[name='name']")?.focus();
}

function closeReservationModal() {
  if (!reservationModal) return;
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
  if (event.key === "Escape" && reservationModal?.classList.contains("open")) {
    closeReservationModal();
  }
});

reservationForm?.addEventListener("submit", (event) => {
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
    date: formData.get("date"),
    time: formData.get("time"),
    paymentType: payment.paymentType,
    paymentLabel: payment.label,
    paymentTotal: payment.total,
    paymentStatus: payment.total > 0 ? "pending" : "not_required",
    restrictions: formData.get("restrictions").trim(),
    createdAt: new Date().toISOString()
  };

  saveReservation(reservation);
  trackAdsEvent("reservation_request", {
    value: payment.total || 1,
    currency: "MXN",
    event_category: "reservas"
  });

  if (payment.total > 0) {
    reservationSubmit.disabled = true;
    reservationSubmit.textContent = "Preparando pago...";

    fetch(`${apiBase}${checkoutEndpoint}`, {
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
        } para el ${reservation.date} a las ${reservation.time} por ${formatPrice(
          reservation.paymentTotal
        )}. No pudimos iniciar el pago en este momento; confirmaremos la reserva por teléfono.`;
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
  } el ${reservation.date} a las ${reservation.time}. Folio ${reservation.folio}. Confirmaremos disponibilidad al ${reservation.phone}.`;
  reservationForm.reset();
  updatePaymentPreview();
});

reservationForm?.elements.guests?.addEventListener("input", updatePaymentPreview);
reservationForm?.elements.date?.setAttribute("min", new Date().toISOString().slice(0, 10));
reservationForm?.elements.date && (reservationForm.elements.date.value = new Date().toISOString().slice(0, 10));
paymentTypeInput?.addEventListener("change", updatePaymentPreview);

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href*='wa.me']");
  if (!link) return;
  trackAdsEvent("whatsapp_click", {
    event_category: "contacto",
    event_label: link.href
  });
});

experienceGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-experience-reserve]");
  if (!button) return;
  if (!paymentTypeInput) return;
  paymentTypeInput.value = button.dataset.experienceReserve || "experience";
  document.querySelector("#reservas")?.scrollIntoView({ behavior: "smooth" });
  updatePaymentPreview();
});

const stripeStatus = new URLSearchParams(window.location.search).get("stripe");
if (stripeStatus === "success" || stripeStatus === "cancel") {
  const folio = new URLSearchParams(window.location.search).get("folio") || "";
  window.addEventListener("load", () => {
    if (!reservationForm || !reservationSuccess) return;
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
renderMenuTabs("entradas");
renderMenu("entradas");
renderFullMenu();

Promise.all([loadRemoteSettings(), loadRemoteMenu(), loadRemoteGallery(), loadRemoteExperiences()]).then(() => {
  applySiteSettings();
  renderGallery();
  renderExperiences();
  const activeCategory = menuCategories[0]?.slug || "entradas";
  renderMenuTabs(activeCategory);
  renderMenu(activeCategory);
  renderFullMenu();
});
