const ADMIN_PASSWORD = "xadani2026";
const RESERVATIONS_KEY = "xadaniReservations";
const TABLES_KEY = "xadaniTables";
const MENU_KEY = "xadaniMenuOverrides";

const defaultTables = [
  { id: "M1", capacity: 2, zone: "Ventana", status: "free", shape: "round", x: 8, y: 12 },
  { id: "M2", capacity: 4, zone: "Salón", status: "reserved", shape: "square", x: 32, y: 12 },
  { id: "M3", capacity: 4, zone: "Salón", status: "free", shape: "square", x: 58, y: 12 },
  { id: "M4", capacity: 6, zone: "Terraza", status: "occupied", shape: "square", x: 14, y: 48 },
  { id: "M5", capacity: 8, zone: "Terraza", status: "free", shape: "square", x: 45, y: 48 },
  { id: "B1", capacity: 3, zone: "Barra", status: "blocked", shape: "round", x: 76, y: 46 }
];

const demoMenu = [
  { category: "calientes", name: "Tetela de requesón y hoja santa", price: 145, description: "Masa azul, requesón fresco y salsa de chile pasilla mixe." },
  { category: "frias", name: "Aguachile de pesca local", price: 235, description: "Chile de agua, pepino, cebolla morada y limón criollo." },
  { category: "fuertes", name: "Mole negro con guajolote", price: 365, description: "Receta de la casa con arroz y ajonjolí tostado." },
  { category: "postres", name: "Nicuatole con frutos rojos", price: 135, description: "Postre tradicional de maíz con compota de temporada." },
  { category: "bebidas", name: "Coctel de mezcal con hoja santa", price: 190, description: "Mezcal joven, hoja santa, limón y agave." }
];

const loginPanel = document.querySelector("#login-panel");
const adminApp = document.querySelector("#admin-app");
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
const resetMenuButton = document.querySelector("#reset-menu");

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

function formatPrice(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function getReservations() {
  return readStorage(RESERVATIONS_KEY, []).map((reservation) => ({
    status: "pending",
    paymentStatus: "not_required",
    paymentTotal: 0,
    ...reservation
  }));
}

function saveReservations(reservations) {
  writeStorage(RESERVATIONS_KEY, reservations);
}

function unlockAdmin() {
  loginPanel.hidden = true;
  adminApp.hidden = false;
  sessionStorage.setItem("xadaniAdminUnlocked", "true");
  renderAll();
}

function lockAdmin() {
  sessionStorage.removeItem("xadaniAdminUnlocked");
  loginPanel.hidden = false;
  adminApp.hidden = true;
}

function updateMetrics(reservations) {
  document.querySelector("#metric-reservations").textContent = reservations.length;
  document.querySelector("#metric-guests").textContent = reservations.reduce((total, item) => total + Number(item.guests || 0), 0);
  document.querySelector("#metric-payments").textContent = reservations.filter((item) => item.paymentStatus === "pending").length;
}

function renderReservations() {
  const reservations = getReservations();
  const query = searchInput.value.trim().toLowerCase();
  const filter = statusFilter.value;
  const visibleReservations = reservations.filter((reservation) => {
    const haystack = `${reservation.folio} ${reservation.name} ${reservation.phone} ${reservation.email}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesStatus = filter === "all" || reservation.status === filter;
    return matchesQuery && matchesStatus;
  });

  updateMetrics(reservations);

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
            <small>${reservation.paymentStatus}</small>
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
  const tables = readStorage(TABLES_KEY, defaultTables);
  floorPlan.innerHTML = tables
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

function getMenuRows() {
  return readStorage(MENU_KEY, demoMenu);
}

function renderMenuAdmin() {
  const rows = getMenuRows();
  menuList.innerHTML = rows
    .map(
      (item, index) => `
        <article class="menu-row">
          <div>
            <strong>${item.name}</strong>
            <p>${item.category} · ${item.description}</p>
          </div>
          <span>${formatPrice(item.price)}</span>
          <button class="button" type="button" data-delete-menu="${index}">Eliminar</button>
        </article>
      `
    )
    .join("");
}

function renderAll() {
  renderReservations();
  renderTables();
  renderMenuAdmin();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const password = new FormData(loginForm).get("password");
  if (password === ADMIN_PASSWORD) {
    unlockAdmin();
    loginForm.reset();
  } else {
    alert("Clave incorrecta. Para demo usa: xadani2026");
  }
});

lockButton.addEventListener("click", lockAdmin);
searchInput.addEventListener("input", renderReservations);
statusFilter.addEventListener("change", renderReservations);

reservationTable.addEventListener("change", (event) => {
  if (!event.target.matches(".status-select")) return;
  const reservations = getReservations();
  const reservation = reservations.find((item) => item.folio === event.target.dataset.folio);
  if (reservation) {
    reservation.status = event.target.value;
    saveReservations(reservations);
    renderReservations();
  }
});

seedButton.addEventListener("click", () => {
  const reservations = getReservations();
  reservations.push({
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
  });
  saveReservations(reservations);
  renderReservations();
});

exportButton.addEventListener("click", () => {
  const reservations = getReservations();
  const header = ["folio", "name", "phone", "email", "guests", "time", "status", "paymentTotal", "paymentStatus", "restrictions"];
  const rows = reservations.map((reservation) =>
    header.map((key) => `"${String(reservation[key] || "").replaceAll('"', '""')}"`).join(",")
  );
  const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "reservas-xadani.csv";
  link.click();
  URL.revokeObjectURL(link.href);
});

floorPlan.addEventListener("click", (event) => {
  const tableButton = event.target.closest("[data-table]");
  if (!tableButton) return;
  const tables = readStorage(TABLES_KEY, defaultTables);
  const table = tables.find((item) => item.id === tableButton.dataset.table);
  const statuses = ["free", "reserved", "occupied", "blocked"];
  table.status = statuses[(statuses.indexOf(table.status) + 1) % statuses.length];
  writeStorage(TABLES_KEY, tables);
  renderTables();
});

resetTablesButton.addEventListener("click", () => {
  writeStorage(TABLES_KEY, defaultTables);
  renderTables();
});

menuEditor.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(menuEditor);
  const rows = getMenuRows();
  rows.push({
    category: data.get("category"),
    name: data.get("name").trim(),
    price: Number(data.get("price")),
    description: data.get("description").trim()
  });
  writeStorage(MENU_KEY, rows);
  menuEditor.reset();
  renderMenuAdmin();
});

menuList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-menu]");
  if (!button) return;
  const rows = getMenuRows();
  rows.splice(Number(button.dataset.deleteMenu), 1);
  writeStorage(MENU_KEY, rows);
  renderMenuAdmin();
});

resetMenuButton.addEventListener("click", () => {
  writeStorage(MENU_KEY, demoMenu);
  renderMenuAdmin();
});

if (sessionStorage.getItem("xadaniAdminUnlocked") === "true") {
  unlockAdmin();
}
