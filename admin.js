const RESERVATIONS_KEY = "xadaniReservations";
const TABLES_KEY = "xadaniTables";
const MENU_KEY = "xadaniMenuOverrides";
const SETTINGS_KEY = "xadaniSiteSettings";

let adminToken = sessionStorage.getItem("xadaniAdminToken") || "";
const localFileApiBase = "http://127.0.0.1:3000";
const apiBase = location.protocol === "file:" ? localFileApiBase : "";

const defaultSettings = {
  businessName: "Xadani en Oaxaca",
  domain: "xadanienoaxaca.com",
  phone: "951 672 4141",
  phoneHref: "+529516724141",
  email: "hola@xadanienoaxaca.com",
  address: "Calle Fundadores 105, 68127 Oaxaca de Juárez, Oaxaca",
  hours: "Miércoles a lunes, 13:00 - 19:00",
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
const floorPlan = document.querySelector("#floor-plan");
const resetTablesButton = document.querySelector("#reset-tables");
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

let reservationsCache = [];
let tablesCache = [];
let menuCache = [];
let categoryCache = [...defaultCategories];

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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function uploadImage(file) {
  if (!file) return "";
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image is too large");
  }

  const dataUrl = await fileToDataUrl(file);
  const data = await apiRequest("/api/uploads", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      dataUrl
    })
  });
  return data.url;
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
    reservationTable.innerHTML = `<tr><td colspan="6">No hay reservas para mostrar.</td></tr>`;
  }
}

function renderTables() {
  floorPlan.innerHTML = tablesCache
    .map(
      (table) => `
        <button class="table-node ${table.shape} ${table.status}" type="button" data-table="${table.id}"
          style="left: ${table.x}%; top: ${table.y}%;">
          <span>
            <strong>${table.id}</strong>
            <small>${table.capacity} pax</small>
            <small>${table.zone}</small>
            <small>${table.status}</small>
          </span>
        </button>
      `
    )
    .join("");
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
  menuEditor.elements.imageFile.value = "";
  menuSubmitButton.textContent = "Guardar cambios";
  cancelMenuEditButton.hidden = false;
  menuEditor.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderSettingsEditor(settings) {
  Object.entries(settings).forEach(([key, value]) => {
    if (settingsEditor.elements[key]) {
      settingsEditor.elements[key].value = value;
    }
  });
}

async function renderAll() {
  await Promise.all([loadReservations(), loadTables(), loadMenu()]);
  const settings = await loadSettings();
  renderReservations();
  renderTables();
  renderCategoryAdmin();
  renderMenuAdmin();
  clearCategoryEditor();
  renderSettingsEditor(settings);
}

function unlockAdmin(token) {
  adminToken = token || adminToken;
  sessionStorage.setItem("xadaniAdminUnlocked", "true");
  sessionStorage.setItem("xadaniAdminToken", adminToken);
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
    .then(({ token }) => {
      unlockAdmin(token);
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

  if (newPassword !== confirmPassword) {
    alert("La nueva contraseña no coincide.");
    return;
  }

  try {
    await apiRequest("/api/admin/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword })
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

reservationTable.addEventListener("change", async (event) => {
  if (!event.target.matches(".status-select")) return;
  try {
    await saveReservationPatch(event.target.dataset.folio, { status: event.target.value });
    renderReservations();
  } catch {
    alert("No se pudo actualizar la reserva. Vuelve a iniciar sesión.");
    renderReservations();
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
    const item = {
      id: data.get("id"),
      category: data.get("category"),
      name: data.get("name").trim(),
      price: Number(data.get("price")),
      description: data.get("description").trim(),
      image: uploadedImage || data.get("image").trim(),
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

if (sessionStorage.getItem("xadaniAdminUnlocked") === "true") {
  unlockAdmin(adminToken);
}
