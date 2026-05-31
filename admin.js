const RESERVATIONS_KEY = "xadaniReservations";
const TABLES_KEY = "xadaniTables";
const WALKINS_KEY = "xadaniWalkins";
const MENU_KEY = "xadaniMenuOverrides";
const SETTINGS_KEY = "xadaniSiteSettings";
const LIBRARY_KEY = "xadaniLibrary";
const EXPERIENCES_KEY = "xadaniExperiences";

let adminToken = sessionStorage.getItem("xadaniAdminToken") || "";
const localFileApiBase = "http://127.0.0.1:3000";
const apiBase = location.protocol === "file:" ? localFileApiBase : "";

const defaultSettings = {
  businessName: "Xadani en Oaxaca",
  domain: "xadanienoaxaca.com",
  phone: "951 672 4141",
  phoneHref: "+529516724141",
  whatsapp: "951 672 4141",
  whatsappHref: "https://wa.me/9516724141",
  email: "hola@xadanienoaxaca.com",
  address: "Calle Fundadores 105, 68127 Oaxaca de Juárez, Oaxaca",
  hours: "Martes a domingo, 12:00 - 19:30",
  contactIntro:
    "Reserva directo por WhatsApp o teléfono. Para grupos, comparte fecha, hora y número de personas.",
  heroText:
    "Maíz criollo, moles profundos, pesca fresca y mezcalería en una carta contemporánea pensada para compartirse sin prisa."
};

const defaultTables = [
  { id: "M1", capacity: 2, zone: "Ventana", status: "free", shape: "round", x: 8, y: 12 },
  { id: "M2", capacity: 4, zone: "Salón", status: "reserved", shape: "square", x: 32, y: 12 },
  { id: "M3", capacity: 4, zone: "Salón", status: "free", shape: "square", x: 58, y: 12 },
  { id: "M4", capacity: 6, zone: "Terraza", status: "occupied", shape: "square", x: 14, y: 48 },
  { id: "M5", capacity: 8, zone: "Terraza", status: "free", shape: "square", x: 45, y: 48 },
  { id: "B1", capacity: 3, zone: "Barra", status: "blocked", shape: "round", x: 76, y: 46 }
];

const demoMenu = [
  { category: "entradas-frias", name: "Aguachile de pesca local", price: 235, description: "Chile de agua, pepino, cebolla morada y limón criollo." },
  { category: "entradas-calientes", name: "Tetela de requesón y hoja santa", price: 145, description: "Masa azul, requesón fresco y salsa de chile pasilla mixe." },
  { category: "fuertes-pesca-del-dia", name: "Pesca del día con coloradito", price: 390, description: "Filete a la plancha, coloradito y verduras tatemadas." },
  { category: "postres", name: "Nicuatole con frutos rojos", price: 135, description: "Postre tradicional de maíz con compota de temporada." },
  { category: "bebidas-con-alcohol", name: "Coctel de mezcal con hoja santa", price: 190, description: "Mezcal joven, hoja santa, limón y agave." }
];

const defaultCategories = [
  { slug: "entradas-frias", group: "ENTRADAS", name: "FRIAS", sortOrder: 0 },
  { slug: "entradas-cocteles", group: "ENTRADAS", name: "COCTELES", sortOrder: 1 },
  { slug: "entradas-ensaladas", group: "ENTRADAS", name: "ENSALADAS", sortOrder: 2 },
  { slug: "entradas-calientes", group: "ENTRADAS", name: "CALIENTES", sortOrder: 3 },
  { slug: "entradas-caldos", group: "ENTRADAS", name: "CALDOS", sortOrder: 4 },
  { slug: "entradas-sopas", group: "ENTRADAS", name: "SOPAS", sortOrder: 5 },
  { slug: "entradas-consomes", group: "ENTRADAS", name: "CONSOMES", sortOrder: 6 },
  { slug: "fuertes-pesca-del-dia", group: "FUERTES", name: "PESCA DEL DÍA", sortOrder: 7 },
  { slug: "fuertes-especiales-istmenos", group: "FUERTES", name: "ESPECIALES ISTMEÑOS", sortOrder: 8 },
  { slug: "fuertes-camarones", group: "FUERTES", name: "CAMARONES", sortOrder: 9 },
  { slug: "fuertes-para-compartir", group: "FUERTES", name: "PARA COMPARTIR", sortOrder: 10 },
  { slug: "fuertes-extras", group: "FUERTES", name: "EXTRAS", sortOrder: 11 },
  { slug: "postres", group: "POSTRES", name: "POSTRES", sortOrder: 12 },
  { slug: "bebidas-con-alcohol", group: "BEBIDAS", name: "CON ALCOHOL", sortOrder: 13 },
  { slug: "bebidas-sin-alcohol", group: "BEBIDAS", name: "SIN ALCOHOL", sortOrder: 14 }
];

const loginPanel = document.querySelector("#login-panel");
const adminApp = document.querySelector("#admin-app");
const adminShell = document.querySelector("#admin-shell");
const adminSidebar = document.querySelector("#admin-sidebar");
const adminHeader = document.querySelector("#admin-header");
const loginForm = document.querySelector("#admin-login");
const lockButton = document.querySelector("#lock-admin");
const reservationTable = document.querySelector("#reservation-table");
const searchInput = document.querySelector("#reservation-search");
const statusFilter = document.querySelector("#reservation-status-filter");
const seedButton = document.querySelector("#seed-reservation");
const exportButton = document.querySelector("#export-reservations");
const reportFilters = document.querySelector("#report-filters");
const reportSummary = document.querySelector("#report-summary");
const reportTable = document.querySelector("#report-table");
const exportReportCsvButton = document.querySelector("#export-report-csv");
const exportReportXlsButton = document.querySelector("#export-report-xls");
const exportReportPdfButton = document.querySelector("#export-report-pdf");
const floorPlan = document.querySelector("#floor-plan");
const resetTablesButton = document.querySelector("#reset-tables");
const tableEditor = document.querySelector("#table-editor");
const tableList = document.querySelector("#table-admin-list");
const tableSubmitButton = document.querySelector("#table-submit");
const cancelTableEditButton = document.querySelector("#cancel-table-edit");
const walkinEditor = document.querySelector("#walkin-editor");
const walkinTable = document.querySelector("#walkin-table");
const walkinTableSelect = document.querySelector("#walkin-table-select");
const menuEditor = document.querySelector("#menu-editor");
const menuList = document.querySelector("#menu-admin-list");
const categoryEditor = document.querySelector("#category-editor");
const categoryList = document.querySelector("#category-admin-list");
const categorySubmitButton = document.querySelector("#category-submit");
const cancelCategoryEditButton = document.querySelector("#cancel-category-edit");
const menuCategorySelect = document.querySelector("#menu-category-select");
const resetMenuButton = document.querySelector("#reset-menu");
const menuSubmitButton = document.querySelector("#menu-submit");
const cancelMenuEditButton = document.querySelector("#cancel-menu-edit");
const settingsEditor = document.querySelector("#settings-editor");
const resetSettingsButton = document.querySelector("#reset-settings");
const passwordEditor = document.querySelector("#password-editor");
const libraryEditor = document.querySelector("#library-editor");
const libraryBulkUploader = document.querySelector("#library-bulk-uploader");
const libraryBulkStatus = document.querySelector("#library-bulk-status");
const libraryList = document.querySelector("#library-admin-list");
const librarySubmitButton = document.querySelector("#library-submit");
const cancelLibraryEditButton = document.querySelector("#cancel-library-edit");
const experienceEditor = document.querySelector("#experience-editor");
const experienceList = document.querySelector("#experience-admin-list");
const experienceSubmitButton = document.querySelector("#experience-submit");
const cancelExperienceEditButton = document.querySelector("#cancel-experience-edit");

let reservationsCache = [];
let tablesCache = [];
let walkinsCache = [];
let menuCache = [];
let categoryCache = [...defaultCategories];
let libraryCache = [];
let experienceCache = [];
let reportCache = { summary: {}, rows: [] };
let currentUser = JSON.parse(sessionStorage.getItem("xadaniAdminUser") || "null");
let draggedTable = null;
let suppressTableClick = false;

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": adminToken,
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }

  return response.json();
}

async function adminLogin(password) {
  const username = loginForm.elements.username.value.trim();
  const response = await fetch(`${apiBase}/api/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    throw new Error("Unauthorized");
  }

  return response.json();
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function toInputDate(date) {
  return date.toISOString().slice(0, 10);
}

function setReportPeriod(period = "day") {
  const now = new Date();
  const start = new Date(now);
  if (period === "week") start.setDate(now.getDate() - 6);
  if (period === "month") start.setDate(1);
  reportFilters.elements.startDate.value = toInputDate(start);
  reportFilters.elements.endDate.value = toInputDate(now);
}

function downloadFile(fileName, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getTableGuest(table) {
  const walkin = walkinsCache.find(
    (item) => item.tableId === table.id && item.status !== "closed"
  );

  if (walkin) {
    return {
      label: walkin.name?.trim() || "Walk-in",
      type: "Walk-in"
    };
  }

  const reservation = reservationsCache.find(
    (item) =>
      item.tableId === table.id &&
      !["completed", "cancelled"].includes(item.status)
  );

  if (reservation) {
    return {
      label: reservation.name?.trim() || "Reserva",
      type: "Reserva"
    };
  }

  return null;
}

async function loadReservations() {
  try {
    const data = await apiRequest("/api/reservations");
    reservationsCache = data.reservations || [];
    writeStorage(RESERVATIONS_KEY, reservationsCache);
  } catch {
    lockAdmin();
    reservationsCache = [];
  }
}

async function saveReservationPatch(folio, patch) {
  const data = await apiRequest("/api/reservations", {
    method: "PATCH",
    body: JSON.stringify({ folio, ...patch })
  });
  const reservation = reservationsCache.find((item) => item.folio === folio);
  if (reservation) Object.assign(reservation, data.reservation || patch);
  writeStorage(RESERVATIONS_KEY, reservationsCache);
}

async function loadTables() {
  try {
    const data = await apiRequest("/api/tables");
    tablesCache = data.tables || [];
    writeStorage(TABLES_KEY, tablesCache);
  } catch {
    tablesCache = readStorage(TABLES_KEY, defaultTables);
  }
}

async function saveTables(tables) {
  await apiRequest("/api/tables", {
    method: "PUT",
    body: JSON.stringify({ tables })
  });
  tablesCache = tables;
  writeStorage(TABLES_KEY, tables);
}

async function saveTable(table) {
  await apiRequest("/api/tables", {
    method: "PUT",
    body: JSON.stringify(table)
  });
  await loadTables();
}

async function deleteTable(id) {
  await apiRequest("/api/tables", {
    method: "DELETE",
    body: JSON.stringify({ id })
  });
  await loadTables();
}

async function loadWalkins() {
  try {
    const data = await apiRequest("/api/walkins");
    walkinsCache = data.walkins || [];
    writeStorage(WALKINS_KEY, walkinsCache);
  } catch {
    walkinsCache = readStorage(WALKINS_KEY, []);
  }
}

async function addWalkin(walkin) {
  const data = await apiRequest("/api/walkins", {
    method: "POST",
    body: JSON.stringify(walkin)
  });
  walkinsCache.unshift(data.walkin);
  await loadTables();
}

async function closeWalkin(id) {
  await apiRequest("/api/walkins", {
    method: "PATCH",
    body: JSON.stringify({ id, status: "closed" })
  });
  walkinsCache = walkinsCache.filter((walkin) => String(walkin.id) !== String(id));
  await loadTables();
}

async function loadMenu() {
  try {
    const data = await apiRequest("/api/menu");
    categoryCache = data.categories?.length ? data.categories : [...defaultCategories];
    menuCache = (data.menu || []).map((item, index) => ({ ...item, id: item.id || `api-${index}` }));
    writeStorage(MENU_KEY, menuCache);
  } catch {
    categoryCache = [...defaultCategories];
    menuCache = readStorage(MENU_KEY, demoMenu).map((item, index) => ({
      ...item,
      id: item.id || `local-${index}`
    }));
  }
}

async function addCategory(category) {
  const data = await apiRequest("/api/menu/categories", {
    method: "POST",
    body: JSON.stringify(category)
  });
  categoryCache.push(data.category);
}

async function updateCategory(category) {
  const data = await apiRequest("/api/menu/categories", {
    method: "PUT",
    body: JSON.stringify(category)
  });
  const index = categoryCache.findIndex((row) => row.slug === category.slug);
  if (index >= 0) categoryCache[index] = data.category;
}

async function deleteCategory(slug) {
  await apiRequest("/api/menu/categories", {
    method: "DELETE",
    body: JSON.stringify({ slug })
  });
  categoryCache = categoryCache.filter((category) => category.slug !== slug);
  menuCache = menuCache.filter((item) => item.category !== slug);
}

async function addMenuItem(item) {
  const data = await apiRequest("/api/menu", {
    method: "POST",
    body: JSON.stringify(item)
  });
  menuCache.push(data.item);
  writeStorage(MENU_KEY, menuCache);
}

async function updateMenuItem(item) {
  const data = await apiRequest("/api/menu", {
    method: "PUT",
    body: JSON.stringify(item)
  });
  const index = menuCache.findIndex((row) => String(row.id) === String(item.id));
  if (index >= 0) menuCache[index] = data.item;
  writeStorage(MENU_KEY, menuCache);
}

async function deleteMenuItem(id) {
  await apiRequest("/api/menu", {
    method: "DELETE",
    body: JSON.stringify({ id })
  });
  menuCache = menuCache.filter((item) => String(item.id) !== String(id));
  writeStorage(MENU_KEY, menuCache);
}

async function loadLibrary() {
  try {
    const data = await apiRequest("/api/gallery");
    libraryCache = data.gallery || [];
    writeStorage(LIBRARY_KEY, libraryCache);
  } catch {
    libraryCache = readStorage(LIBRARY_KEY, []);
  }
}

async function saveLibraryItem(item) {
  const data = await apiRequest("/api/gallery", {
    method: item.id ? "PUT" : "POST",
    body: JSON.stringify(item)
  });
  const index = libraryCache.findIndex((row) => String(row.id) === String(data.item.id));
  if (index >= 0) libraryCache[index] = data.item;
  else libraryCache.push(data.item);
  writeStorage(LIBRARY_KEY, libraryCache);
}

async function deleteLibraryItem(id) {
  await apiRequest("/api/gallery", {
    method: "DELETE",
    body: JSON.stringify({ id })
  });
  libraryCache = libraryCache.filter((item) => String(item.id) !== String(id));
  writeStorage(LIBRARY_KEY, libraryCache);
}

async function loadExperiences() {
  try {
    const data = await apiRequest("/api/experiences");
    experienceCache = data.experiences || [];
    writeStorage(EXPERIENCES_KEY, experienceCache);
  } catch {
    experienceCache = readStorage(EXPERIENCES_KEY, []);
  }
}

async function loadReport() {
  const params = new URLSearchParams({
    start: reportFilters.elements.startDate.value,
    end: reportFilters.elements.endDate.value
  });
  reportCache = await apiRequest(`/api/reports?${params.toString()}`);
}

async function saveExperienceItem(item) {
  const data = await apiRequest("/api/experiences", {
    method: item.id ? "PUT" : "POST",
    body: JSON.stringify(item)
  });
  const index = experienceCache.findIndex((row) => String(row.id) === String(data.item.id));
  if (index >= 0) experienceCache[index] = data.item;
  else experienceCache.push(data.item);
  writeStorage(EXPERIENCES_KEY, experienceCache);
}

async function deleteExperienceItem(id) {
  await apiRequest("/api/experiences", {
    method: "DELETE",
    body: JSON.stringify({ id })
  });
  experienceCache = experienceCache.filter((item) => String(item.id) !== String(id));
  writeStorage(EXPERIENCES_KEY, experienceCache);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function imageToDataUrl(file, maxSize = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(image.src);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => {
      URL.revokeObjectURL(image.src);
      reject(new Error("Invalid image"));
    };
    image.src = URL.createObjectURL(file);
  });
}

async function uploadImage(file) {
  if (!file) return "";
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Image is too large");
  }

  let dataUrl = await imageToDataUrl(file);
  if (dataUrl.length > 3.8 * 1024 * 1024) {
    dataUrl = await imageToDataUrl(file, 1200, 0.74);
  }
  if (dataUrl.length > 3.8 * 1024 * 1024) {
    dataUrl = await fileToDataUrl(file);
  }
  const data = await apiRequest("/api/uploads", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      dataUrl
    })
  });
  return data.url;
}

function titleFromFileName(fileName) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findLibraryImageId(imageUrl) {
  const match = libraryCache.find((item) => item.image && item.image === imageUrl);
  return match ? String(match.id) : "";
}

function getLibraryImageById(id) {
  if (!id) return "";
  const match = libraryCache.find((item) => String(item.id) === String(id));
  return match?.image || "";
}

async function loadSettings() {
  try {
    const data = await apiRequest("/api/settings");
    const settings = { ...defaultSettings, ...(data.settings || {}) };
    writeStorage(SETTINGS_KEY, settings);
    return settings;
  } catch {
    return { ...defaultSettings, ...readStorage(SETTINGS_KEY, {}) };
  }
}

async function saveSettings(settings) {
  await apiRequest("/api/settings", {
    method: "PUT",
    body: JSON.stringify(settings)
  });
  writeStorage(SETTINGS_KEY, settings);
}

function updateMetrics() {
  document.querySelector("#metric-reservations").textContent = reservationsCache.length;
  document.querySelector("#metric-guests").textContent = reservationsCache.reduce(
    (total, item) => total + Number(item.guests || 0),
    0
  );
  document.querySelector("#metric-payments").textContent = reservationsCache.filter(
    (item) => item.paymentStatus === "pending"
  ).length;
}

function renderReservations() {
  const query = searchInput.value.trim().toLowerCase();
  const filter = statusFilter.value;
  const visibleReservations = reservationsCache.filter((reservation) => {
    const haystack = `${reservation.folio} ${reservation.name} ${reservation.phone} ${reservation.email}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesStatus = filter === "all" || reservation.status === filter;
    return matchesQuery && matchesStatus;
  });

  updateMetrics();
  const tableOptions = [
    `<option value="">Sin mesa</option>`,
    ...tablesCache.map(
      (table) => `<option value="${table.id}">${table.id} · ${table.capacity} pax · ${table.status}</option>`
    )
  ].join("");

  reservationTable.innerHTML = visibleReservations
    .map(
      (reservation) => `
        <tr>
          <td><strong>${reservation.folio}</strong></td>
          <td class="client-cell">
            <strong>${reservation.name}</strong>
            <small>${reservation.phone || ""}</small>
            <small>${reservation.email || ""}</small>
            <small>${reservation.restrictions || "Sin restricciones"}</small>
          </td>
          <td>${reservation.time}</td>
          <td>${reservation.guests}</td>
          <td class="payment-cell">
            <strong>${formatPrice(reservation.paymentTotal)}</strong>
            <small>${reservation.paymentLabel || "Reserva sin cargo"}</small>
            <small>${reservation.paymentStatus || "not_required"}</small>
          </td>
          <td>
            <select class="table-select" data-folio-table="${reservation.folio}">
              ${tableOptions.replace(`value="${reservation.tableId}"`, `value="${reservation.tableId}" selected`)}
            </select>
          </td>
          <td>
            <select class="status-select" data-folio="${reservation.folio}">
              ${["pending", "confirmed", "seated", "completed", "cancelled"]
                .map((status) => `<option value="${status}" ${reservation.status === status ? "selected" : ""}>${status}</option>`)
                .join("")}
            </select>
          </td>
        </tr>
      `
    )
    .join("");

  if (!visibleReservations.length) {
    reservationTable.innerHTML = `<tr><td colspan="7">No hay reservas para mostrar.</td></tr>`;
  }
}

function renderTables() {
  floorPlan.innerHTML = tablesCache
    .map((table) => {
      const guest = getTableGuest(table);
      return `
        <button class="table-node ${table.shape} ${table.status}" type="button" data-table-edit="${table.id}" data-table-id="${table.id}"
          style="left: ${table.x}%; top: ${table.y}%;" aria-label="Mesa ${escapeHtml(table.id)}">
          <span>
            <strong>${escapeHtml(table.id)}</strong>
            <small>${escapeHtml(table.capacity)} pax</small>
            <small>${escapeHtml(table.zone)}</small>
            <small>${escapeHtml(table.status)}</small>
            ${guest ? `<small class="table-guest">${escapeHtml(guest.label)}</small>` : ""}
          </span>
        </button>
      `;
    })
    .join("");

  tableList.innerHTML = tablesCache
    .map(
      (table) => `
        <article class="table-row">
          <div>
            <strong>${table.id}</strong>
            <p>${table.zone} · ${table.capacity} pax · ${table.shape} · ${table.status}</p>
          </div>
          <div class="button-row">
            <button class="button" type="button" data-edit-table="${table.id}">Editar</button>
            <button class="button" type="button" data-delete-table="${table.id}">Eliminar</button>
          </div>
        </article>
      `
    )
    .join("");

  const freeTables = tablesCache.filter((table) => table.status === "free");
  walkinTableSelect.innerHTML = freeTables.length
    ? freeTables
        .map((table) => `<option value="${table.id}">${table.id} · ${table.capacity} pax · ${table.zone}</option>`)
        .join("")
    : `<option value="">Sin mesas libres</option>`;
}

function renderWalkins() {
  walkinTable.innerHTML = walkinsCache
    .map(
      (walkin) => `
        <tr>
          <td><strong>${walkin.name}</strong></td>
          <td>${walkin.tableId}</td>
          <td>${walkin.guests}</td>
          <td>${new Date(walkin.arrivalAt).toLocaleString("es-MX")}</td>
          <td><button class="button" type="button" data-close-walkin="${walkin.id}">Liberar mesa</button></td>
        </tr>
      `
    )
    .join("");

  if (!walkinsCache.length) {
    walkinTable.innerHTML = `<tr><td colspan="5">No hay walk-ins activos.</td></tr>`;
  }
}

function clearTableEditor() {
  tableEditor.reset();
  tableEditor.elements.originalId.value = "";
  tableEditor.elements.id.value = "";
  tableEditor.elements.capacity.value = "2";
  tableEditor.elements.shape.value = "square";
  tableEditor.elements.status.value = "free";
  tableEditor.elements.x.value = "10";
  tableEditor.elements.y.value = "10";
  tableSubmitButton.textContent = "Guardar mesa";
  cancelTableEditButton.hidden = true;
}

function fillTableEditor(table) {
  tableEditor.elements.originalId.value = table.id;
  tableEditor.elements.id.value = table.id;
  tableEditor.elements.capacity.value = String(table.capacity);
  tableEditor.elements.shape.value = table.shape;
  tableEditor.elements.zone.value = table.zone;
  tableEditor.elements.status.value = table.status;
  tableEditor.elements.x.value = table.x;
  tableEditor.elements.y.value = table.y;
  tableSubmitButton.textContent = "Guardar cambios";
  cancelTableEditButton.hidden = false;
}

function renderMenuAdmin() {
  const categoryLabels = Object.fromEntries(
    categoryCache.map((category) => [category.slug, `${category.group} / ${category.name}`])
  );

  menuList.innerHTML = menuCache
    .map(
      (item) => `
        <article class="menu-row">
          <div>
            <strong>${item.name}</strong>
            <p>${categoryLabels[item.category] || item.category} · ${item.description}</p>
          </div>
          <span>${formatPrice(item.price)}</span>
          <div class="button-row">
            <button class="button" type="button" data-edit-menu="${item.id}">Editar</button>
            <button class="button" type="button" data-delete-menu="${item.id}">Eliminar</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderCategoryAdmin() {
  const sortedCategories = [...categoryCache].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  menuCategorySelect.innerHTML = sortedCategories
    .map((category) => `<option value="${category.slug}">${category.group} / ${category.name}</option>`)
    .join("");

  categoryList.innerHTML = sortedCategories
    .map(
      (category) => `
        <article class="category-row">
          <div>
            <strong>${category.group}</strong>
            <p>${category.name}</p>
          </div>
          <span>${Number(category.sortOrder || 0)}</span>
          <div class="button-row">
            <button class="button" type="button" data-edit-category="${category.slug}">Editar</button>
            <button class="button" type="button" data-delete-category="${category.slug}">Eliminar</button>
          </div>
        </article>
      `
    )
    .join("");
}

function clearMenuEditor() {
  menuEditor.reset();
  menuEditor.elements.id.value = "";
  menuSubmitButton.textContent = "Agregar platillo";
  cancelMenuEditButton.hidden = true;
}

function clearCategoryEditor() {
  categoryEditor.reset();
  categoryEditor.elements.slug.value = "";
  categoryEditor.elements.sortOrder.value = categoryCache.length;
  categorySubmitButton.textContent = "Agregar categoría";
  cancelCategoryEditButton.hidden = true;
}

function fillCategoryEditor(category) {
  categoryEditor.elements.slug.value = category.slug;
  categoryEditor.elements.group.value = category.group;
  categoryEditor.elements.name.value = category.name;
  categoryEditor.elements.sortOrder.value = category.sortOrder || 0;
  categorySubmitButton.textContent = "Guardar categoría";
  cancelCategoryEditButton.hidden = false;
  categoryEditor.scrollIntoView({ behavior: "smooth", block: "center" });
}

function fillMenuEditor(item) {
  menuEditor.elements.id.value = item.id;
  menuEditor.elements.category.value = item.category;
  menuEditor.elements.name.value = item.name;
  menuEditor.elements.price.value = item.price;
  menuEditor.elements.description.value = item.description;
  menuEditor.elements.image.value = item.image || "";
  menuEditor.elements.libraryImage.value = findLibraryImageId(item.image || "");
  menuEditor.elements.imageFile.value = "";
  menuSubmitButton.textContent = "Guardar cambios";
  cancelMenuEditButton.hidden = false;
  menuEditor.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderLibraryAdmin() {
  libraryList.innerHTML = libraryCache
    .map(
      (item) => `
        <article class="menu-row library-row">
          <img class="library-thumb" src="${item.image}" alt="${item.title}" loading="lazy" />
          <div>
            <strong>${item.title}</strong>
            <p>${item.type || "foto"} · ${item.caption || ""}</p>
          </div>
          <span>${Number(item.sortOrder || 0)}</span>
          <div class="button-row">
            <button class="button" type="button" data-edit-library="${item.id}">Editar</button>
            <button class="button" type="button" data-delete-library="${item.id}">Eliminar</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderLibraryImageOptions() {
  const options = [
    `<option value="">Seleccionar foto guardada...</option>`,
    ...libraryCache.map((item) => `<option value="${item.id}">${item.title} · ${item.type || "foto"}</option>`)
  ].join("");

  if (menuEditor.elements.libraryImage) {
    menuEditor.elements.libraryImage.innerHTML = options;
  }

  if (experienceEditor.elements.libraryImage) {
    experienceEditor.elements.libraryImage.innerHTML = options;
  }
}

function clearLibraryEditor() {
  libraryEditor.reset();
  libraryEditor.elements.id.value = "";
  libraryEditor.elements.sortOrder.value = libraryCache.length;
  librarySubmitButton.textContent = "Guardar foto";
  cancelLibraryEditButton.hidden = true;
}

function fillLibraryEditor(item) {
  libraryEditor.elements.id.value = item.id;
  libraryEditor.elements.title.value = item.title;
  libraryEditor.elements.type.value = item.type || "";
  libraryEditor.elements.sortOrder.value = item.sortOrder || 0;
  libraryEditor.elements.caption.value = item.caption || "";
  libraryEditor.elements.image.value = item.image || "";
  libraryEditor.elements.imageFile.value = "";
  librarySubmitButton.textContent = "Guardar cambios";
  cancelLibraryEditButton.hidden = false;
}

function renderExperienceAdmin() {
  experienceList.innerHTML = experienceCache
    .map(
      (item) => `
        <article class="menu-row">
          <div>
            <strong>${item.title}</strong>
            <p>${[item.eventDate, item.eventTime].filter(Boolean).join(" · ") || "permanente"} · ${item.description}</p>
          </div>
          <span>${formatPrice(item.price || 0)}</span>
          <div class="button-row">
            <button class="button" type="button" data-edit-experience="${item.id}">Editar</button>
            <button class="button" type="button" data-delete-experience="${item.id}">Eliminar</button>
          </div>
        </article>
      `
    )
    .join("");
}

function clearExperienceEditor() {
  experienceEditor.reset();
  experienceEditor.elements.id.value = "";
  experienceEditor.elements.price.value = "0";
  experienceEditor.elements.ctaLabel.value = "Reservar";
  experienceSubmitButton.textContent = "Guardar experiencia";
  cancelExperienceEditButton.hidden = true;
}

function fillExperienceEditor(item) {
  experienceEditor.elements.id.value = item.id;
  experienceEditor.elements.title.value = item.title;
  experienceEditor.elements.description.value = item.description;
  experienceEditor.elements.eventDate.value = item.eventDate || "";
  experienceEditor.elements.eventTime.value = item.eventTime || "";
  experienceEditor.elements.price.value = item.price || 0;
  experienceEditor.elements.paymentType.value = item.paymentType || "experience";
  experienceEditor.elements.ctaLabel.value = item.ctaLabel || "Reservar";
  experienceEditor.elements.image.value = item.image || "";
  experienceEditor.elements.libraryImage.value = findLibraryImageId(item.image || "");
  experienceEditor.elements.imageFile.value = "";
  experienceSubmitButton.textContent = "Guardar cambios";
  cancelExperienceEditButton.hidden = false;
}

function renderSettingsEditor(settings) {
  Object.entries(settings).forEach(([key, value]) => {
    if (settingsEditor.elements[key]) {
      settingsEditor.elements[key].value = value;
    }
  });
}

function renderReport() {
  const summary = reportCache.summary || {};
  reportSummary.innerHTML = [
    ["Registros", summary.records || 0],
    ["Comensales", summary.guests || 0],
    ["Reservas", summary.reservations || 0],
    ["Walk-ins", summary.walkins || 0]
  ]
    .map(([label, value]) => `<article><span>${label}</span><strong>${value}</strong></article>`)
    .join("");

  reportTable.innerHTML = (reportCache.rows || [])
    .map(
      (row) => `
        <tr>
          <td>${new Date(row.date).toLocaleString("es-MX")}</td>
          <td>${row.kind}</td>
          <td>${row.name || ""}<br><small>${row.phone || ""}</small></td>
          <td>${row.guests}</td>
          <td>${row.tableId || ""}</td>
          <td>${row.status || ""}</td>
          <td>${formatPrice(row.paymentTotal || 0)}<br><small>${row.paymentStatus || ""}</small></td>
        </tr>
      `
    )
    .join("");
}

function reportRowsForExport() {
  return [
    ["Fecha", "Tipo", "Folio", "Comensal", "Telefono", "Email", "Personas", "Hora", "Mesa", "Estado", "Pago", "Estado pago"],
    ...(reportCache.rows || []).map((row) => [
      new Date(row.date).toLocaleString("es-MX"),
      row.kind,
      row.folio,
      row.name,
      row.phone,
      row.email,
      row.guests,
      row.time,
      row.tableId,
      row.status,
      row.paymentTotal,
      row.paymentStatus
    ])
  ];
}

function exportReportCsv() {
  const csv = reportRowsForExport().map((row) => row.map(csvEscape).join(",")).join("\n");
  downloadFile("informe-xadani.csv", csv, "text/csv;charset=utf-8");
}

function exportReportXls() {
  const rows = reportRowsForExport()
    .map((row) => `<tr>${row.map((cell) => `<td>${String(cell ?? "")}</td>`).join("")}</tr>`)
    .join("");
  downloadFile("informe-xadani.xls", `<table>${rows}</table>`, "application/vnd.ms-excel;charset=utf-8");
}

function exportReportPdf() {
  const rows = reportRowsForExport()
    .map((row) => `<tr>${row.map((cell) => `<td>${String(cell ?? "")}</td>`).join("")}</tr>`)
    .join("");
  const win = window.open("", "_blank");
  win.document.write(`
    <title>Informe Xadani</title>
    <style>body{font-family:Arial,sans-serif}table{width:100%;border-collapse:collapse}td{border:1px solid #ddd;padding:6px;font-size:12px}h1{font-size:22px}</style>
    <h1>Informe Xadani</h1>
    <p>${reportFilters.elements.startDate.value} a ${reportFilters.elements.endDate.value}</p>
    <table>${rows}</table>
  `);
  win.document.close();
  win.print();
}

function applyRoleAccess() {
  const isOwner = (currentUser?.role || "owner") === "owner";
  document.querySelectorAll(".owner-only").forEach((element) => {
    element.hidden = !isOwner;
  });
  if (!isOwner && location.hash && document.querySelector(location.hash)?.classList.contains("owner-only")) {
    location.hash = "#reservas";
  }
  if (passwordEditor.elements.recoveryEmail) {
    passwordEditor.elements.recoveryEmail.value = currentUser?.recoveryEmail || "";
  }
}

async function renderAll() {
  await Promise.all([loadReservations(), loadTables(), loadWalkins(), loadMenu(), loadLibrary(), loadExperiences()]);
  await loadReport();
  const settings = await loadSettings();
  renderReservations();
  renderTables();
  renderWalkins();
  clearTableEditor();
  setWalkinDefaults();
  renderCategoryAdmin();
  renderMenuAdmin();
  renderLibraryAdmin();
  renderLibraryImageOptions();
  renderExperienceAdmin();
  clearLibraryEditor();
  clearExperienceEditor();
  clearCategoryEditor();
  renderSettingsEditor(settings);
  renderReport();
  applyRoleAccess();
}

function unlockAdmin(token, user = currentUser) {
  adminToken = token || adminToken;
  currentUser = user || currentUser || { username: "admin", role: "owner", recoveryEmail: "" };
  sessionStorage.setItem("xadaniAdminUnlocked", "true");
  sessionStorage.setItem("xadaniAdminToken", adminToken);
  sessionStorage.setItem("xadaniAdminUser", JSON.stringify(currentUser));
  adminShell.classList.remove("locked");
  adminSidebar.hidden = false;
  adminHeader.hidden = false;
  loginPanel.hidden = true;
  adminApp.hidden = false;
  renderAll();
}

function lockAdmin() {
  sessionStorage.removeItem("xadaniAdminUnlocked");
  sessionStorage.removeItem("xadaniAdminToken");
  sessionStorage.removeItem("xadaniAdminUser");
  adminShell.classList.add("locked");
  adminSidebar.hidden = true;
  adminHeader.hidden = true;
  loginPanel.hidden = false;
  adminApp.hidden = true;
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const password = new FormData(loginForm).get("password");
  adminLogin(password)
    .then(({ token, user }) => {
      unlockAdmin(token, user);
      loginForm.reset();
    })
    .catch(() => {
      alert("Clave incorrecta.");
    });
});

passwordEditor.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(passwordEditor);
  const currentPassword = data.get("currentPassword");
  const newPassword = data.get("newPassword");
  const confirmPassword = data.get("confirmPassword");
  const recoveryEmail = data.get("recoveryEmail").trim();

  if (newPassword !== confirmPassword) {
    alert("La nueva contraseña no coincide.");
    return;
  }

  try {
    await apiRequest("/api/admin/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword, recoveryEmail })
    });
    alert("Contraseña actualizada. Vuelve a iniciar sesión.");
    passwordEditor.reset();
    lockAdmin();
  } catch {
    alert("No se pudo actualizar la contraseña.");
  }
});

lockButton.addEventListener("click", lockAdmin);
searchInput.addEventListener("input", renderReservations);
statusFilter.addEventListener("change", renderReservations);

reportFilters.elements.period.addEventListener("change", (event) => {
  if (event.target.value !== "custom") {
    setReportPeriod(event.target.value);
  }
});

reportFilters.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await loadReport();
    renderReport();
  } catch {
    alert("No se pudo cargar el informe.");
  }
});

exportReportCsvButton.addEventListener("click", exportReportCsv);
exportReportXlsButton.addEventListener("click", exportReportXls);
exportReportPdfButton.addEventListener("click", exportReportPdf);

function updateDraggedTablePosition(event) {
  if (!draggedTable) return;
  const { table, node } = draggedTable;
  const planRect = floorPlan.getBoundingClientRect();
  const nodeWidthPercent = (node.offsetWidth / planRect.width) * 100;
  const nodeHeightPercent = (node.offsetHeight / planRect.height) * 100;
  const x = ((event.clientX - planRect.left - draggedTable.offsetX) / planRect.width) * 100;
  const y = ((event.clientY - planRect.top - draggedTable.offsetY) / planRect.height) * 100;

  table.x = Number(clamp(x, 0, 100 - nodeWidthPercent).toFixed(1));
  table.y = Number(clamp(y, 0, 100 - nodeHeightPercent).toFixed(1));
  node.style.left = `${table.x}%`;
  node.style.top = `${table.y}%`;

  if (tableEditor.elements.originalId.value === table.id || tableEditor.elements.id.value === table.id) {
    tableEditor.elements.x.value = table.x;
    tableEditor.elements.y.value = table.y;
  }
}

function startTableDrag(event) {
  if (event.button !== undefined && event.button !== 0) return;
  const tableButton = event.target.closest("[data-table-id]");
  if (!tableButton) return;
  const table = tablesCache.find((item) => item.id === tableButton.dataset.tableId);
  if (!table) return;

  event.preventDefault();
  const buttonRect = tableButton.getBoundingClientRect();
  draggedTable = {
    table,
    node: tableButton,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: event.clientX - buttonRect.left,
    offsetY: event.clientY - buttonRect.top,
    moved: false
  };
  tableButton.setPointerCapture?.(event.pointerId);
  tableButton.classList.add("dragging");
}

function moveTableDrag(event) {
  if (!draggedTable) return;
  if (Math.abs(event.clientX - draggedTable.startX) > 3 || Math.abs(event.clientY - draggedTable.startY) > 3) {
    draggedTable.moved = true;
  }
  updateDraggedTablePosition(event);
}

async function finishTableDrag() {
  if (!draggedTable) return;
  const currentDrag = draggedTable;
  draggedTable = null;
  currentDrag.node.classList.remove("dragging");

  if (!currentDrag.moved) return;

  suppressTableClick = true;
  try {
    await saveTable(currentDrag.table);
    renderTables();
  } catch {
    alert("No se pudo guardar la nueva posicion de la mesa.");
    await loadTables();
    renderTables();
  } finally {
    setTimeout(() => {
      suppressTableClick = false;
    }, 0);
  }
}

if (window.PointerEvent) {
  floorPlan.addEventListener("pointerdown", startTableDrag);
  floorPlan.addEventListener("pointermove", moveTableDrag);
  floorPlan.addEventListener("pointerup", finishTableDrag);
  floorPlan.addEventListener("pointercancel", finishTableDrag);
} else {
  floorPlan.addEventListener("mousedown", startTableDrag);
  document.addEventListener("mousemove", moveTableDrag);
  document.addEventListener("mouseup", finishTableDrag);
}

reservationTable.addEventListener("change", async (event) => {
  if (!event.target.matches(".table-select")) return;
  try {
    await saveReservationPatch(event.target.dataset.folioTable, { tableId: event.target.value });
    await loadTables();
    renderReservations();
    renderTables();
  } catch {
    alert("No se pudo cambiar la mesa de la reserva.");
    renderReservations();
  }
});

reservationTable.addEventListener("change", async (event) => {
  if (!event.target.matches(".status-select")) return;
  try {
    await saveReservationPatch(event.target.dataset.folio, { status: event.target.value });
    await loadTables();
    renderReservations();
    renderTables();
  } catch {
    alert("No se pudo actualizar la reserva. Vuelve a iniciar sesión.");
    renderReservations();
  }
});

floorPlan.addEventListener("click", (event) => {
  if (suppressTableClick) return;
  const tableButton = event.target.closest("[data-table-edit]");
  if (!tableButton) return;
  const table = tablesCache.find((item) => item.id === tableButton.dataset.tableEdit);
  if (table) fillTableEditor(table);
});

tableEditor.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(tableEditor);
  const table = {
    originalId: data.get("originalId"),
    id: data.get("id").trim(),
    capacity: Number(data.get("capacity")),
    zone: data.get("zone").trim(),
    status: data.get("status"),
    shape: data.get("shape"),
    x: Number(data.get("x")),
    y: Number(data.get("y"))
  };

  try {
    await saveTable(table);
    renderTables();
    renderReservations();
    clearTableEditor();
  } catch {
    alert("No se pudo guardar la mesa.");
  }
});

tableList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-table]");
  if (editButton) {
    const table = tablesCache.find((item) => item.id === editButton.dataset.editTable);
    if (table) fillTableEditor(table);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-table]");
  if (!deleteButton) return;
  if (!confirm("Eliminar esta mesa quitará su asignación de reservas activas.")) return;

  try {
    await deleteTable(deleteButton.dataset.deleteTable);
    renderTables();
    renderReservations();
  } catch {
    alert("No se pudo eliminar la mesa.");
  }
});

cancelTableEditButton.addEventListener("click", clearTableEditor);

function setWalkinDefaults() {
  const now = new Date();
  walkinEditor.elements.arrivalDate.value = now.toISOString().slice(0, 10);
  walkinEditor.elements.arrivalTime.value = now.toTimeString().slice(0, 5);
}

walkinEditor.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(walkinEditor);
  const arrivalAt = new Date(`${data.get("arrivalDate")}T${data.get("arrivalTime")}`).toISOString();

  try {
    await addWalkin({
      name: data.get("name").trim(),
      guests: Number(data.get("guests")),
      tableId: data.get("tableId"),
      arrivalAt
    });
    walkinEditor.reset();
    setWalkinDefaults();
    renderWalkins();
    renderTables();
  } catch {
    alert("No se pudo sentar el walk-in. Revisa que la mesa esté libre.");
  }
});

walkinTable.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-close-walkin]");
  if (!button) return;

  try {
    await closeWalkin(button.dataset.closeWalkin);
    renderWalkins();
    renderTables();
  } catch {
    alert("No se pudo liberar la mesa.");
  }
});

seedButton.addEventListener("click", async () => {
  const reservation = {
    folio: `XAD-${Date.now().toString().slice(-6)}`,
    name: "Reserva demo",
    phone: "951 672 4141",
    email: "hola@xadanienoaxaca.com",
    guests: 4,
    time: "14:30",
    restrictions: "Mesa familiar",
    paymentLabel: "Reserva sin cargo",
    paymentTotal: 0,
    paymentStatus: "not_required",
    status: "pending",
    createdAt: new Date().toISOString()
  };

  try {
    const data = await apiRequest("/api/reservations", {
      method: "POST",
      body: JSON.stringify(reservation)
    });
    reservationsCache.unshift(data.reservation || reservation);
    writeStorage(RESERVATIONS_KEY, reservationsCache);
  } catch {
    alert("No se pudo guardar la reserva demo en el servidor.");
  }

  renderReservations();
});

exportButton.addEventListener("click", () => {
  const header = ["folio", "name", "phone", "email", "guests", "time", "status", "paymentTotal", "paymentStatus", "restrictions"];
  const rows = reservationsCache.map((reservation) =>
    header.map((key) => `"${String(reservation[key] || "").replaceAll('"', '""')}"`).join(",")
  );
  const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "reservas-xadani.csv";
  link.click();
  URL.revokeObjectURL(link.href);
});

floorPlan.addEventListener("click", async (event) => {
  const tableButton = event.target.closest("[data-table]");
  if (!tableButton) return;
  const table = tablesCache.find((item) => item.id === tableButton.dataset.table);
  const statuses = ["free", "reserved", "occupied", "blocked"];
  const previousStatus = table.status;
  table.status = statuses[(statuses.indexOf(table.status) + 1) % statuses.length];
  try {
    await saveTables(tablesCache);
  } catch {
    table.status = previousStatus;
    alert("No se pudo guardar el plano en el servidor. Vuelve a iniciar sesión.");
  }
  renderTables();
});

categoryEditor.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(categoryEditor);
  const category = {
    slug: data.get("slug"),
    group: data.get("group").trim(),
    name: data.get("name").trim(),
    sortOrder: Number(data.get("sortOrder"))
  };

  try {
    if (category.slug) {
      await updateCategory(category);
    } else {
      delete category.slug;
      await addCategory(category);
    }
    renderCategoryAdmin();
    clearCategoryEditor();
  } catch {
    alert("No se pudo guardar la categoría en el servidor.");
  }
});

categoryList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-category]");
  if (editButton) {
    const category = categoryCache.find((row) => row.slug === editButton.dataset.editCategory);
    if (category) fillCategoryEditor(category);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-category]");
  if (!deleteButton) return;
  if (!confirm("Eliminar esta categoría también ocultará sus platillos.")) return;

  try {
    await deleteCategory(deleteButton.dataset.deleteCategory);
    renderCategoryAdmin();
    renderMenuAdmin();
    clearCategoryEditor();
  } catch {
    alert("No se pudo eliminar la categoría en el servidor.");
  }
});

cancelCategoryEditButton.addEventListener("click", clearCategoryEditor);

resetTablesButton.addEventListener("click", async () => {
  try {
    await saveTables(defaultTables);
    renderTables();
  } catch {
    alert("No se pudo restaurar el plano en el servidor.");
  }
});

menuEditor.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(menuEditor);
  try {
    const uploadedImage = await uploadImage(menuEditor.elements.imageFile.files[0]);
    const libraryImage = getLibraryImageById(data.get("libraryImage"));
    const item = {
      id: data.get("id"),
      category: data.get("category"),
      name: data.get("name").trim(),
      price: Number(data.get("price")),
      description: data.get("description").trim(),
      image: uploadedImage || libraryImage || data.get("image").trim(),
      tags: ["Nuevo"]
    };
    if (item.id) {
      await updateMenuItem(item);
    } else {
      delete item.id;
      await addMenuItem(item);
    }
    clearMenuEditor();
    renderMenuAdmin();
  } catch {
    alert("No se pudo guardar el platillo en el servidor. Vuelve a iniciar sesión.");
  }
});

menuList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-menu]");
  if (editButton) {
    const item = menuCache.find((row) => String(row.id) === String(editButton.dataset.editMenu));
    if (item) fillMenuEditor(item);
    return;
  }

  const button = event.target.closest("[data-delete-menu]");
  if (!button) return;
  try {
    await deleteMenuItem(button.dataset.deleteMenu);
    renderMenuAdmin();
  } catch {
    alert("No se pudo eliminar el platillo en el servidor.");
  }
});

cancelMenuEditButton.addEventListener("click", clearMenuEditor);

libraryEditor.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(libraryEditor);
  try {
    const uploadedImage = await uploadImage(libraryEditor.elements.imageFile.files[0]);
    await saveLibraryItem({
      id: data.get("id"),
      title: data.get("title").trim(),
      type: data.get("type").trim(),
      sortOrder: Number(data.get("sortOrder")),
      caption: data.get("caption").trim(),
      image: uploadedImage || data.get("image").trim()
    });
    renderLibraryAdmin();
    renderLibraryImageOptions();
    clearLibraryEditor();
  } catch {
    alert("No se pudo guardar la foto.");
  }
});

libraryBulkUploader.addEventListener("submit", async (event) => {
  event.preventDefault();
  const files = [...libraryBulkUploader.elements.imageFiles.files];
  const type = libraryBulkUploader.elements.type.value.trim();
  const caption = libraryBulkUploader.elements.caption.value.trim();

  if (!files.length) {
    libraryBulkStatus.textContent = "Selecciona una o varias fotos.";
    return;
  }

  libraryBulkStatus.textContent = `Subiendo 0 de ${files.length}...`;

  let uploadedCount = 0;
  let failedCount = 0;

  for (const [index, file] of files.entries()) {
    try {
      const uploadedImage = await uploadImage(file);
      await saveLibraryItem({
        title: titleFromFileName(file.name) || `Foto ${libraryCache.length + 1}`,
        type,
        sortOrder: libraryCache.length,
        caption,
        image: uploadedImage
      });
      uploadedCount += 1;
    } catch {
      failedCount += 1;
    }

    libraryBulkStatus.textContent = `Procesadas ${index + 1} de ${files.length}...`;
  }

  libraryBulkUploader.reset();
  renderLibraryAdmin();
  renderLibraryImageOptions();
  libraryBulkStatus.textContent =
    failedCount > 0
      ? `${uploadedCount} subida${uploadedCount === 1 ? "" : "s"}; ${failedCount} no se pudieron cargar.`
      : `${uploadedCount} foto${uploadedCount === 1 ? "" : "s"} subida${uploadedCount === 1 ? "" : "s"}.`;
});

libraryList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-library]");
  if (editButton) {
    const item = libraryCache.find((row) => String(row.id) === String(editButton.dataset.editLibrary));
    if (item) fillLibraryEditor(item);
    return;
  }
  const deleteButton = event.target.closest("[data-delete-library]");
  if (!deleteButton) return;
  try {
    await deleteLibraryItem(deleteButton.dataset.deleteLibrary);
    renderLibraryAdmin();
    renderLibraryImageOptions();
  } catch {
    alert("No se pudo eliminar la foto.");
  }
});

cancelLibraryEditButton.addEventListener("click", clearLibraryEditor);

experienceEditor.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(experienceEditor);
  try {
    const uploadedImage = await uploadImage(experienceEditor.elements.imageFile.files[0]);
    const libraryImage = getLibraryImageById(data.get("libraryImage"));
    await saveExperienceItem({
      id: data.get("id"),
      title: data.get("title").trim(),
      description: data.get("description").trim(),
      eventDate: data.get("eventDate"),
      eventTime: data.get("eventTime"),
      price: Number(data.get("price")),
      paymentType: data.get("paymentType"),
      ctaLabel: data.get("ctaLabel").trim(),
      image: uploadedImage || libraryImage || data.get("image").trim()
    });
    renderExperienceAdmin();
    clearExperienceEditor();
  } catch {
    alert("No se pudo guardar la experiencia.");
  }
});

experienceList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-experience]");
  if (editButton) {
    const item = experienceCache.find((row) => String(row.id) === String(editButton.dataset.editExperience));
    if (item) fillExperienceEditor(item);
    return;
  }
  const deleteButton = event.target.closest("[data-delete-experience]");
  if (!deleteButton) return;
  try {
    await deleteExperienceItem(deleteButton.dataset.deleteExperience);
    renderExperienceAdmin();
  } catch {
    alert("No se pudo eliminar la experiencia.");
  }
});

cancelExperienceEditButton.addEventListener("click", clearExperienceEditor);

resetMenuButton.addEventListener("click", async () => {
  if (!confirm("Restaurar el menú demo ocultará las categorías y platillos actuales.")) return;

  try {
    await apiRequest("/api/menu/reset", { method: "POST" });
    await loadMenu();
    renderCategoryAdmin();
    renderMenuAdmin();
    clearCategoryEditor();
    clearMenuEditor();
  } catch {
    alert("No se pudo restaurar el menú demo en el servidor.");
  }
});

settingsEditor.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(settingsEditor);
  const settings = {
    businessName: data.get("businessName").trim(),
    domain: data.get("domain").trim(),
    phone: data.get("phone").trim(),
    phoneHref: data.get("phoneHref").trim(),
    whatsapp: data.get("whatsapp").trim(),
    whatsappHref: data.get("whatsappHref").trim(),
    email: data.get("email").trim(),
    address: data.get("address").trim(),
    hours: data.get("hours").trim(),
    contactIntro: data.get("contactIntro").trim(),
    heroText: data.get("heroText").trim()
  };
  try {
    await saveSettings(settings);
    renderSettingsEditor(settings);
    alert("Datos guardados globalmente. Recarga el sitio público para ver los cambios.");
  } catch {
    alert("No se pudo guardar globalmente. Vuelve a iniciar sesión.");
  }
});

resetSettingsButton.addEventListener("click", async () => {
  try {
    await saveSettings(defaultSettings);
    renderSettingsEditor(defaultSettings);
  } catch {
    alert("No se pudieron restaurar los datos globales.");
  }
});

setReportPeriod("day");
lockAdmin();
