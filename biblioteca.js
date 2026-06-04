const grid = document.querySelector("#full-gallery-grid");
const photoLightbox = document.querySelector("#photo-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxDescription = document.querySelector("#lightbox-description");
const lightboxMeta = document.querySelector("#lightbox-meta");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");
let galleryItems = [];
const fallbackGalleryItems = [
  { title: "Salmón al horno", caption: "Preparación al horno servida con arroz y ensalada.", image: "assets/xadani-portada-foto-02.jpg", type: "Platos al horno" },
  { title: "Pesca del día", caption: "Pesca preparada al horno con sazón de la casa.", image: "assets/xadani-portada-foto-10.jpg", type: "Pesca fresca" },
  { title: "Garnachas istmeñas", caption: "Una entrada tradicional para compartir al centro.", image: "assets/xadani-portada-foto-11.jpg", type: "Cocina istmeña" },
  { title: "Mesa para compartir", caption: "Especiales de nuestra cocina para familias y grupos.", image: "uploads/1780015412509-img-3378.jpg", type: "Experiencia" },
  { title: "Ceviche de la casa", caption: "Producto fresco servido con aguacate y vegetales.", image: "uploads/1780015523077-img-3373.jpg", type: "Mar" },
  { title: "Camarones", caption: "Camarones acompañados con arroz, aguacate y ensalada.", image: "uploads/1780013922387-img-3196.jpg", type: "Mar" }
];

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

function displayTitle(item, index) {
  if (!item?.title || isCameraFileName(item.title)) return `Fotografía ${index + 1}`;
  return item.title;
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return "assets/xadani-hero-portada.jpg";
  if (imageUrl.startsWith("http") || imageUrl.startsWith("data:")) return imageUrl;
  return imageUrl;
}

function openLightbox(item, index) {
  lightboxImage.src = resolveImageUrl(item.image);
  lightboxImage.alt = displayTitle(item, index);
  lightboxTitle.textContent = displayTitle(item, index);
  lightboxDescription.textContent =
    item.caption || "Una mirada a los platillos, el horno y los momentos de mesa en Xadani.";
  lightboxMeta.textContent = item.type || "Fotografía";
  photoLightbox.classList.add("open");
  photoLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  photoLightbox.classList.remove("open");
  photoLightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  lightboxImage.src = "";
}

async function loadGallery() {
  try {
    const response = await fetch("/api/gallery");
    const data = await response.json();
    galleryItems = data.gallery?.length ? data.gallery : fallbackGalleryItems;
  } catch {
    galleryItems = fallbackGalleryItems;
  }
  grid.innerHTML = galleryItems
    .map(
      (item, index) => `
        <figure data-gallery-photo="${index}" tabindex="0">
          <img src="${escapeHtml(resolveImageUrl(item.image))}" alt="${escapeHtml(displayTitle(item, index))}" loading="lazy" />
          <figcaption>Ver foto</figcaption>
        </figure>
      `
    )
    .join("");
}

grid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-gallery-photo]");
  if (!card) return;
  openLightbox(galleryItems[Number(card.dataset.galleryPhoto)], Number(card.dataset.galleryPhoto));
});

grid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-gallery-photo]");
  if (!card) return;
  event.preventDefault();
  card.click();
});

photoLightbox.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-lightbox]")) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

loadGallery();

navToggle?.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
  siteNav?.classList.toggle("open");
});
