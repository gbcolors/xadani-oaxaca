(async function () {
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
  let state = {};

  function render() {
    $("[data-worker-rule]").textContent = state.config?.worker?.processingRule || "";
    const stats = state.stats || [];
    $("[data-stats]").innerHTML = ["completed", "pending", "cancelled", "seated"].map((status) => {
      const total = stats.find((item) => item.status === status)?.total || 0;
      return `<span><b>${total}</b><small>${status}</small></span>`;
    }).join("");
    const jobs = state.jobs || [];
    $("[data-jobs]").innerHTML = jobs.length ? jobs.map((job) => `
      <article class="job">
        <strong>${esc(job.guestName)}</strong>
        <span>${esc(job.dateLabel)} ${esc(job.timeLabel)}</span>
        <span>${esc(job.party)} pax</span>
        <small>${esc(job.status)} · ${esc(job.folio)}</small>
      </article>
    `).join("") : "<p>Sin reservas todavia.</p>";
  }

  async function load() {
    const response = await fetch("/api/gobookr", { cache: "no-store" });
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "No se pudo cargar");
    state = data;
    render();
  }

  $("#form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    $("#output").textContent = "Confirmando directo en motor Xadani...";
    const response = await fetch("/api/gobookr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    $("#output").textContent = JSON.stringify(data.reservation || data, null, 2);
    if (data.ok) {
      state = data;
      render();
      event.currentTarget.reset();
    }
  });

  load().catch((error) => { $("#output").textContent = error.message; });
})();
