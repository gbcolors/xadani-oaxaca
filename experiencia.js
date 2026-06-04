const experienceTitle = document.querySelector("#experience-title");
const experienceDescription = document.querySelector("#experience-description");
const experiencePrice = document.querySelector("#experience-price");
const experienceBackground = document.querySelector("#experience-background");
const experienceIncluded = document.querySelector("#experience-included");

function escapeExperienceHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadFeaturedExperience() {
  try {
    const response = await fetch("/api/experiences");
    const data = await response.json();
    const item = data.experiences?.[0];
    if (!item) return;

    experienceTitle.textContent = item.title || experienceTitle.textContent;
    experienceDescription.textContent = item.description || experienceDescription.textContent;
    if (Number(item.price || 0) > 0) {
      experiencePrice.textContent = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0
      }).format(item.price);
    }
    if (item.image) {
      experienceBackground.style.backgroundImage = `url("${item.image}")`;
    }

    const included = String(item.includedItems || "")
      .split(/\r?\n|,/)
      .map((value) => value.trim())
      .filter(Boolean);
    if (included.length) {
      experienceIncluded.innerHTML = included
        .map((value, index) => `<article><span>Parte ${index + 1}</span><h3>${escapeExperienceHtml(value)}</h3></article>`)
        .join("");
    }
  } catch {
    // The curated fallback remains visible if the API is temporarily unavailable.
  }
}

loadFeaturedExperience();
