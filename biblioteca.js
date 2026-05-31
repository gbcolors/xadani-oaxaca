const grid = document.querySelector("#full-gallery-grid");
const photoLightbox = document.querySelector("#photo-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxDescription = document.querySelector("#lightbox-description");
const lightboxMeta = document.querySelector("#lightbox-meta");
let galleryItems = [];

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
  const response = await fetch("/api/gallery");
  const data = await response.json();
  galleryItems = data.gallery || [];
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
