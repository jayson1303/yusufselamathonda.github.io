// ==========================================================================
// YUSUF SELAMAT MOTOR HONDA - LANDING PAGE SCRIPT
// Real-time Firestore Integration with Offline Fallback
// ==========================================================================

import { DEFAULT_PRODUCTS, DEFAULT_TESTIMONIALS, DEFAULT_SETTINGS } from "./default-data.js";
import { db, collection, doc, onSnapshot, query, orderBy } from "./firebase-config.js";

// RUNTIME STATE
let PRODUCTS_DATA = [...DEFAULT_PRODUCTS];
let TESTIMONIALS_DATA = [...DEFAULT_TESTIMONIALS];
let SETTINGS_DATA = { ...DEFAULT_SETTINGS };

let currentProduct = null;
let currentVariantIndex = 0;
let currentPaymentMode = "cash"; // "cash" | "cicilan"
let currentDpValue = null;
let currentTenor = null;

// HELPER: Format rupiah
export function formatRupiah(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return "Rp 0";
  return "Rp " + Math.round(amount).toLocaleString("id-ID");
}

// HELPER: Resolve product image URL
export function resolveProductImage(product, imageFileNameOrUrl) {
  if (!imageFileNameOrUrl) {
    if (product.imageUrl) return product.imageUrl;
    if (product.variants && product.variants[0] && product.variants[0].image) {
      return resolveProductImage(product, product.variants[0].image);
    }
    return "tambahan tentang kami/WhatsApp Image 2026-07-03 at 18.30.10_cropped.jpeg";
  }
  if (imageFileNameOrUrl.startsWith("http://") || 
      imageFileNameOrUrl.startsWith("https://") || 
      imageFileNameOrUrl.startsWith("data:image/") ||
      imageFileNameOrUrl.startsWith("blob:")) {
    return imageFileNameOrUrl;
  }
  if (imageFileNameOrUrl.startsWith("Foto Produk/")) {
    return imageFileNameOrUrl;
  }
  if (product.folder) {
    return `Foto Produk/${product.folder}/${imageFileNameOrUrl}`;
  }
  return imageFileNameOrUrl;
}

// HELPER: Resolve testimonial image URL
export function resolveTestimonialImage(imgStr) {
  if (!imgStr) return "Foto Testimoni History/WhatsApp Image 2026-07-03 at 18.36.26.jpeg";
  if (imgStr.startsWith("http://") || 
      imgStr.startsWith("https://") || 
      imgStr.startsWith("data:image/") ||
      imgStr.startsWith("blob:") ||
      imgStr.startsWith("Foto Testimoni History/")) {
    return imgStr;
  }
  return `Foto Testimoni History/${imgStr}`;
}

// ==========================================================================
// INITIALIZATION & REALTIME FIRESTORE LISTENERS
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initUI();
  setupRealtimeListeners();
});

function initUI() {
  // Render initial static data
  renderProducts(PRODUCTS_DATA);
  renderTestimonials(TESTIMONIALS_DATA);
  applySettings(SETTINGS_DATA);

  // Setup Nav & Interactions
  setupNavigation();
  setupFilterAndSearch();
  setupModalEvents();
  setupPaymentToggle();
}

function setupRealtimeListeners() {
  if (!db) {
    console.log("Firebase Firestore tidak aktif, menggunakan data default lokal.");
    return;
  }

  try {
    // 1. Listen to 'products' collection
    const productsRef = collection(db, "products");
    onSnapshot(productsRef, (snapshot) => {
      if (!snapshot.empty) {
        const loaded = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            ...data,
            // Normalize field names
            otr_price: Number(data.otr_price || data.priceCash || 0),
            name: data.name || "Honda",
            category: data.category || "Matic Series",
            variants: data.variants || data.colors || (data.imageUrl ? [{ colorName: "Standar", hex: "#cc1d24", image: data.imageUrl }] : []),
            images: data.images || (data.imageUrl ? [data.imageUrl] : []),
            installments: data.installments || (data.priceCredit ? [{ dp: Number(data.dp || 2000000), rates: { [String(data.tenor || 35)]: Number(data.priceCredit) } }] : [])
          });
        });

        if (loaded.length > 0) {
          PRODUCTS_DATA = loaded;
          const activeFilter = document.querySelector(".filter-btn.active");
          const category = activeFilter ? activeFilter.getAttribute("data-category") : "all";
          const searchVal = document.getElementById("js-search-input") ? document.getElementById("js-search-input").value : "";
          applyFiltersAndSearch(category, searchVal);
          console.log(`Realtime Firestore: ${loaded.length} produk dimuat.`);
        }
      }
    }, (error) => {
      console.warn("Firestore products realtime listener info:", error.message);
    });

    // 2. Listen to 'testimonials' collection
    const testiRef = collection(db, "testimonials");
    onSnapshot(testiRef, (snapshot) => {
      if (!snapshot.empty) {
        const loadedTesti = [];
        snapshot.forEach((docSnap) => {
          loadedTesti.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });
        if (loadedTesti.length > 0) {
          TESTIMONIALS_DATA = loadedTesti;
          renderTestimonials(TESTIMONIALS_DATA);
          console.log(`Realtime Firestore: ${loadedTesti.length} testimoni dimuat.`);
        }
      }
    }, (error) => {
      console.warn("Firestore testimonials realtime listener info:", error.message);
    });

    // 3. Listen to 'settings/general' document
    const settingsDocRef = doc(db, "settings", "general");
    onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        SETTINGS_DATA = { ...SETTINGS_DATA, ...docSnap.data() };
        applySettings(SETTINGS_DATA);
        console.log("Realtime Firestore: Pengaturan website diperbarui.");
      }
    }, (error) => {
      console.warn("Firestore settings realtime listener info:", error.message);
    });

  } catch (err) {
    console.warn("Realtime listener setup error:", err.message);
  }
}

// APPLY SETTINGS TO LANDING PAGE DOM
function applySettings(settings) {
  if (!settings) return;

  const cleanWa = (settings.whatsapp || "6283163895963").replace(/[^0-9]/g, "");

  // Update WhatsApp Buttons & Links
  const waLink = document.getElementById("js-whatsapp-link");
  if (waLink) {
    waLink.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Yusuf Selamat Motor Honda, saya ingin berkonsultasi mengenai promo dan pembelian sepeda motor Honda.")}`;
    waLink.textContent = settings.phone || `+${cleanWa}`;
  }

  // Update Email
  const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach(el => {
    if (settings.email) {
      el.href = `mailto:${settings.email}`;
      el.textContent = settings.email;
    }
  });

  // Update Address & Hours
  const contactTexts = document.querySelectorAll(".contact-item__text");
  if (contactTexts.length >= 2) {
    if (settings.address) contactTexts[0].textContent = settings.address;
    if (settings.hours) contactTexts[1].textContent = settings.hours;
  }

  // Update Social Links
  const socialLinks = document.querySelectorAll(".social-btn, .footer__social-icons a");
  socialLinks.forEach(link => {
    const aria = (link.getAttribute("aria-label") || "").toLowerCase();
    if (aria.includes("instagram") && settings.instagram) link.href = settings.instagram;
    if (aria.includes("tiktok") && settings.tiktok) link.href = settings.tiktok;
    if (aria.includes("facebook") && settings.facebook) link.href = settings.facebook;
  });

  // Update Map Iframe
  const mapIframe = document.getElementById("js-map-iframe");
  if (mapIframe && settings.mapsUrl) {
    mapIframe.src = settings.mapsUrl;
  }
}

// ==========================================================================
// NAVIGATION & CONTROLS
// ==========================================================================
function setupNavigation() {
  const menuToggle = document.getElementById("js-menu-toggle");
  const navMenu = document.getElementById("js-nav-menu");
  const line1 = document.getElementById("js-line-1");
  const line2 = document.getElementById("js-line-2");
  const line3 = document.getElementById("js-line-3");
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      const isActive = navMenu.classList.contains("active");
      if (isActive) {
        if (line1) { line1.setAttribute("x1", "5"); line1.setAttribute("y1", "5"); line1.setAttribute("x2", "19"); line1.setAttribute("y2", "19"); }
        if (line2) { line2.setAttribute("opacity", "0"); }
        if (line3) { line3.setAttribute("x1", "5"); line3.setAttribute("y1", "19"); line3.setAttribute("x2", "19"); line3.setAttribute("y2", "5"); }
      } else {
        if (line1) { line1.setAttribute("x1", "4"); line1.setAttribute("y1", "6"); line1.setAttribute("x2", "20"); line1.setAttribute("y2", "6"); }
        if (line2) { line2.setAttribute("opacity", "1"); }
        if (line3) { line3.setAttribute("x1", "4"); line3.setAttribute("y1", "18"); line3.setAttribute("x2", "20"); line3.setAttribute("y2", "18"); }
      }
    });
  }

  const navLinks = document.querySelectorAll(".header__nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      if (navMenu && navMenu.classList.contains("active")) {
        menuToggle.click();
      }
    });
  });
}

function setupFilterAndSearch() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("js-search-input");

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-category");
      applyFiltersAndSearch(category, searchInput ? searchInput.value : "");
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const activeFilter = document.querySelector(".filter-btn.active");
      const category = activeFilter ? activeFilter.getAttribute("data-category") : "all";
      applyFiltersAndSearch(category, searchInput.value);
    });
  }
}

// FILTER & SEARCH LOGIC
function applyFiltersAndSearch(category, searchStr) {
  const queryStr = (searchStr || "").toLowerCase().trim();
  
  const filtered = PRODUCTS_DATA.filter(p => {
    const pCategory = p.category || "";
    const pName = p.name || "";
    const matchesCategory = (category === "all") || (pCategory.toLowerCase() === category.toLowerCase());
    const matchesSearch = pName.toLowerCase().includes(queryStr) || pCategory.toLowerCase().includes(queryStr);
    return matchesCategory && matchesSearch;
  });
  
  renderProducts(filtered);
}

// ==========================================================================
// CATALOGUE RENDERING
// ==========================================================================
function renderProducts(productsList) {
  const grid = document.getElementById("js-products-grid");
  if (!grid) return;
  
  if (!productsList || productsList.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <h3>Motor Tidak Ditemukan</h3>
        <p>Silakan coba kata kunci pencarian atau pilih kategori lain.</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = productsList.map(p => {
    // Get minimum installment rate
    let installmentText = "Tersedia cicilan ringan";
    if (p.installments && p.installments.length > 0) {
      let minRate = Infinity;
      p.installments.forEach(inst => {
        if (inst.rates) {
          Object.values(inst.rates).forEach(rate => {
            const numRate = Number(rate);
            if (numRate > 0 && numRate < minRate) minRate = numRate;
          });
        }
      });
      if (minRate !== Infinity) {
        installmentText = `Cicilan mulai ${formatRupiah(minRate)}/bln`;
      }
    } else if (p.priceCredit) {
      installmentText = `Cicilan ${formatRupiah(p.priceCredit)}/bln`;
    }

    // Resolve main thumbnail
    let firstImg = "";
    if (p.variants && p.variants.length > 0 && p.variants[0].image) {
      firstImg = p.variants[0].image;
    } else if (p.images && p.images.length > 0) {
      firstImg = p.images[0];
    } else if (p.imageUrl) {
      firstImg = p.imageUrl;
    }
    const mainImgPath = resolveProductImage(p, firstImg);
    
    return `
      <article class="product-card">
        <div class="product-card__img-container">
          <span class="product-card__tag">${p.category || "Motor Honda"}</span>
          <img src="${mainImgPath}" alt="${p.name}" class="product-card__img" loading="lazy" onerror="this.src='tambahan tentang kami/WhatsApp Image 2026-07-03 at 18.30.10_cropped.jpeg'">
        </div>
        <div class="product-card__content">
          <h3 class="product-card__title">${p.name}</h3>
          <div class="product-card__price-row">
            <span class="product-card__price-cash">${formatRupiah(p.otr_price)} (OTR) <span class="badge-asuransi-card" title="Pembelian cash mendapatkan proteksi asuransi">🛡️ + Asuransi</span></span>
            <span class="product-card__price-installment">${installmentText}</span>
          </div>
          <button class="btn btn--outline product-card__btn" onclick="window.openProductModal('${p.id}')">Lihat Detail</button>
        </div>
      </article>
    `;
  }).join("");
}

// ==========================================================================
// TESTIMONIALS RENDERING
// ==========================================================================
function renderTestimonials(testiList) {
  const grid = document.getElementById("js-testimonials-grid");
  if (!grid) return;
  
  grid.innerHTML = (testiList || []).map(t => {
    let contentHtml = "";
    const rating = Number(t.rating) || 0;
    const name = t.name || "";
    const location = t.location || "";
    const text = t.text || "";
    const imgSrc = resolveTestimonialImage(t.image || t.imageUrl);
    
    if (rating > 0 && text) {
      const initials = (name || "Konsumen").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
      const starsHtml = Array(Math.min(5, Math.max(1, rating))).fill(
        `<svg class="testimonial-card__star-icon" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`
      ).join("");
      
      contentHtml = `
        <div class="testimonial-card__content">
          <div class="testimonial-card__stars">${starsHtml}</div>
          <p class="testimonial-card__text">"${text}"</p>
          <div class="testimonial-card__user">
            <div class="testimonial-card__avatar">${initials}</div>
            <div class="testimonial-card__user-info">
              <span class="testimonial-card__name">${name}</span>
              ${location ? `<span class="testimonial-card__loc" style="font-size: 11px; color: var(--text-muted); display: block;">${location}</span>` : ""}
            </div>
          </div>
        </div>
      `;
    } else {
      contentHtml = `
        <div class="testimonial-card__content testimonial-card__content--empty">
          <span class="testimonial-card__caption">${name ? `${name} - ` : ""}Dokumentasi Serah Terima Unit</span>
        </div>
      `;
    }

    return `
      <div class="testimonial-card">
        <div class="testimonial-card__image-container">
          <img src="${imgSrc}" alt="Dokumentasi Serah Terima" class="testimonial-card__img" loading="lazy" onerror="this.src='Foto Testimoni History/WhatsApp Image 2026-07-03 at 18.36.26.jpeg'">
        </div>
        ${contentHtml}
      </div>
    `;
  }).join("");
}

// ==========================================================================
// MODAL & SIMULATOR
// ==========================================================================
function setupModalEvents() {
  const modalClose = document.getElementById("js-modal-close");
  const modalOverlay = document.getElementById("js-modal");
  
  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  const orderBtn = document.getElementById("js-order-btn");
  if (orderBtn) {
    orderBtn.addEventListener("click", generateWhatsAppLink);
  }
}

function setupPaymentToggle() {
  const toggleCash = document.getElementById("js-toggle-cash");
  const toggleCredit = document.getElementById("js-toggle-credit");
  
  if (toggleCash && toggleCredit) {
    toggleCash.addEventListener("click", () => setPaymentMode("cash"));
    toggleCredit.addEventListener("click", () => setPaymentMode("cicilan"));
  }

  const selectDp = document.getElementById("js-select-dp");
  if (selectDp) {
    selectDp.addEventListener("change", (e) => {
      currentDpValue = parseInt(e.target.value);
      renderTenors();
      updateInstallmentRate();
    });
  }
}

// GLOBAL HANDLER FOR OPENING PRODUCT MODAL
window.openProductModal = function(productId) {
  const product = PRODUCTS_DATA.find(p => String(p.id) === String(productId));
  if (!product) return;
  
  currentProduct = product;
  currentVariantIndex = 0;
  currentPaymentMode = "cash";
  
  // Set text elements
  const elCategory = document.getElementById("js-modal-category");
  const elTitle = document.getElementById("js-modal-title");
  const elCashPrice = document.getElementById("js-modal-cash-price");
  const elDesc = document.getElementById("js-modal-desc");

  if (elCategory) elCategory.textContent = product.category || "Motor Honda";
  if (elTitle) elTitle.textContent = product.name;
  if (elCashPrice) elCashPrice.textContent = formatRupiah(product.otr_price);
  
  // Dynamic description
  if (elDesc) {
    if (product.description) {
      elDesc.textContent = product.description;
    } else {
      let descText = "Sepeda motor Honda tangguh dan bertenaga dengan efisiensi bahan bakar terbaik di kelasnya.";
      const cat = (product.category || "").toLowerCase();
      if (cat.includes("beat")) descText = "Skutik andalan Honda yang lincah, irit bahan bakar, serta dibekali rangka eSAF terbaru untuk kenyamanan manuver harian.";
      else if (cat.includes("genio")) descText = "Skutik bergaya kasual dan fashionable yang sangat cocok untuk kawula muda, compact dan super irit.";
      else if (cat.includes("scoopy")) descText = "Ikon skutik unik dan klasik Honda dengan sentuhan fitur modern, Smart Key system, dan ban tubeless lebar.";
      else if (cat.includes("stylo")) descText = "Skutik premium fashionable 160cc berdesain retro modern yang bertenaga dengan mesin eSP+ 4-katup.";
      else if (cat.includes("vario")) descText = "Skutik sporty berperforma tinggi untuk kenyamanan dan ketangguhan berkendara harian Anda.";
      else if (cat.includes("pcx")) descText = "Kemewahan skutik premium besar dengan kenyamanan berkendara kelas atas dan fitur canggih.";
      else if (cat.includes("adv")) descText = "Skutik penjelajah jalanan bergaya gagah dengan suspensi tangguh dan ground clearance tinggi.";
      else if (cat.includes("sport")) descText = "Motor sport Honda dengan akselerasi responsif dan teknologi balap legendaris.";
      else if (cat.includes("bebek")) descText = "Motor bebek Honda terkenal legendaris, irit, bertenaga, dan berdaya tahan tinggi.";
      elDesc.textContent = descText;
    }
  }
  
  renderModalSwatches();
  updateModalMainImage();
  setPaymentMode("cash");
  populateDpSelect();
  
  const modal = document.getElementById("js-modal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
};

function closeModal() {
  const modal = document.getElementById("js-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// RENDER SWATCHES IN MODAL
function renderModalSwatches() {
  const swatchesContainer = document.getElementById("js-modal-swatches");
  if (!swatchesContainer || !currentProduct) return;
  
  const variants = currentProduct.variants || [];
  if (variants.length === 0) {
    swatchesContainer.innerHTML = `<span style="font-size: 13px; color: var(--text-muted);">Warna Standar</span>`;
    updateVariantName();
    return;
  }
  
  swatchesContainer.innerHTML = variants.map((v, idx) => {
    const colorHex = v.hex || "#cc1d24";
    const colorName = v.colorName || `Varian ${idx + 1}`;
    return `
      <button class="swatch-btn ${idx === currentVariantIndex ? "active" : ""}" 
              style="background-color: ${colorHex};" 
              title="${colorName}"
              onclick="window.selectVariant(${idx})"
              aria-label="${colorName}">
      </button>
    `;
  }).join("");
  
  updateVariantName();
}

window.selectVariant = function(variantIdx) {
  currentVariantIndex = variantIdx;
  
  const swatchBtns = document.querySelectorAll(".swatch-btn");
  swatchBtns.forEach((btn, idx) => {
    btn.classList.toggle("active", idx === variantIdx);
  });
  
  updateVariantName();
  updateModalMainImage();
  updateThumbnailSelection();
};

function updateVariantName() {
  const nameEl = document.getElementById("js-modal-active-variant-name");
  if (!nameEl || !currentProduct) return;
  
  const variants = currentProduct.variants || [];
  if (variants[currentVariantIndex]) {
    nameEl.textContent = variants[currentVariantIndex].colorName || "Varian Standar";
  } else {
    nameEl.textContent = "Varian Standar";
  }
}

function updateModalMainImage() {
  const mainImg = document.getElementById("js-modal-main-img");
  const thumbnailsContainer = document.getElementById("js-modal-thumbnails");
  
  if (!mainImg || !currentProduct) return;
  
  const variants = currentProduct.variants || [];
  const activeVariant = variants[currentVariantIndex];
  const activeImageFilename = activeVariant ? activeVariant.image : (currentProduct.imageUrl || (currentProduct.images && currentProduct.images[0]));
  
  const mainImgPath = resolveProductImage(currentProduct, activeImageFilename);
  mainImg.src = mainImgPath;
  mainImg.alt = `${currentProduct.name} - ${activeVariant ? activeVariant.colorName : "Honda"}`;
  
  // Render thumbnails
  if (thumbnailsContainer) {
    const imagesList = (variants.length > 0) ? variants.map(v => v.image).filter(Boolean) : (currentProduct.images || [activeImageFilename]);
    
    if (imagesList.length <= 1) {
      thumbnailsContainer.innerHTML = "";
    } else {
      thumbnailsContainer.innerHTML = imagesList.map((img, idx) => {
        const thumbPath = resolveProductImage(currentProduct, img);
        const isCurrent = (img === activeImageFilename);
        return `
          <button class="thumbnail-btn ${isCurrent ? "active" : ""}" 
                  onclick="window.selectVariantByImageName('${img}')"
                  aria-label="Lihat foto ${idx + 1}">
            <img src="${thumbPath}" alt="${currentProduct.name} thumbnail" onerror="this.src='tambahan tentang kami/WhatsApp Image 2026-07-03 at 18.30.10_cropped.jpeg'">
          </button>
        `;
      }).join("");
    }
  }
}

window.selectVariantByImageName = function(imgFilename) {
  if (!currentProduct || !currentProduct.variants) return;
  const variantIdx = currentProduct.variants.findIndex(v => v.image === imgFilename);
  if (variantIdx !== -1) {
    window.selectVariant(variantIdx);
  }
};

function updateThumbnailSelection() {
  if (!currentProduct || !currentProduct.variants) return;
  const activeImg = currentProduct.variants[currentVariantIndex] ? currentProduct.variants[currentVariantIndex].image : "";
  const thumbBtns = document.querySelectorAll(".thumbnail-btn");
  
  thumbBtns.forEach(btn => {
    const img = btn.querySelector("img");
    if (img) {
      const src = img.getAttribute("src");
      btn.classList.toggle("active", src && src.includes(activeImg));
    }
  });
}

function setPaymentMode(mode) {
  currentPaymentMode = mode;
  
  const toggleContainer = document.getElementById("js-payment-toggle-container");
  const toggleCash = document.getElementById("js-toggle-cash");
  const toggleCredit = document.getElementById("js-toggle-credit");
  const panelCash = document.getElementById("js-panel-cash");
  const panelCredit = document.getElementById("js-panel-credit");
  
  if (mode === "cash") {
    if (toggleContainer) toggleContainer.classList.remove("cicilan-active");
    if (toggleCash) toggleCash.classList.add("active");
    if (toggleCredit) toggleCredit.classList.remove("active");
    if (panelCash) panelCash.classList.add("active");
    if (panelCredit) panelCredit.classList.remove("active");
  } else {
    if (toggleContainer) toggleContainer.classList.add("cicilan-active");
    if (toggleCash) toggleCash.classList.remove("active");
    if (toggleCredit) toggleCredit.classList.add("active");
    if (panelCash) panelCash.classList.remove("active");
    if (panelCredit) panelCredit.classList.add("active");
    
    // Auto select DP and first tenor
    if (currentProduct) {
      const dpSelect = document.getElementById("js-select-dp");
      if (dpSelect && dpSelect.options.length > 0) {
        currentDpValue = parseInt(dpSelect.value);
        renderTenors();
        updateInstallmentRate();
      }
    }
  }
}

function populateDpSelect() {
  const dpSelect = document.getElementById("js-select-dp");
  if (!dpSelect || !currentProduct) return;
  
  dpSelect.innerHTML = "";
  
  if (!currentProduct.installments || currentProduct.installments.length === 0) {
    if (currentProduct.priceCredit) {
      // Simple credit mode
      const defaultDp = 2000000;
      const opt = document.createElement("option");
      opt.value = defaultDp;
      opt.textContent = `${formatRupiah(defaultDp)} (DP Rekomendasi)`;
      dpSelect.appendChild(opt);
      currentDpValue = defaultDp;
    } else {
      dpSelect.innerHTML = `<option value="0">Konsultasikan DP dengan Marketing</option>`;
      currentDpValue = 0;
    }
    return;
  }
  
  // Sort DP ascending
  const sorted = [...currentProduct.installments].sort((a, b) => (Number(a.dp) || 0) - (Number(b.dp) || 0));
  
  sorted.forEach(inst => {
    const opt = document.createElement("option");
    opt.value = inst.dp;
    opt.textContent = `${formatRupiah(inst.dp)}`;
    dpSelect.appendChild(opt);
  });
  
  currentDpValue = sorted[0].dp;
}

function renderTenors() {
  const tenorGrid = document.getElementById("js-tenor-grid");
  if (!tenorGrid || !currentProduct) return;
  
  tenorGrid.innerHTML = "";
  
  if (!currentProduct.installments || currentProduct.installments.length === 0) {
    const singleTenor = currentProduct.tenor || 35;
    tenorGrid.innerHTML = `
      <button class="tenor-btn active" onclick="window.selectTenor(${singleTenor})">${singleTenor}x</button>
    `;
    currentTenor = singleTenor;
    return;
  }
  
  const dpObj = currentProduct.installments.find(inst => Number(inst.dp) === Number(currentDpValue));
  if (!dpObj || !dpObj.rates) return;
  
  const tenors = Object.keys(dpObj.rates).map(Number).sort((a, b) => a - b);
  
  if (tenors.length === 0) {
    tenorGrid.innerHTML = `<div class="empty-state" style="padding: 10px;">Tenor tidak tersedia</div>`;
    return;
  }
  
  if (!currentTenor || !tenors.includes(currentTenor)) {
    currentTenor = tenors[tenors.length - 1]; // Default to longest tenor (usually 35x)
  }
  
  tenorGrid.innerHTML = tenors.map(tenor => {
    const isActive = (tenor === currentTenor);
    return `
      <button class="tenor-btn ${isActive ? "active" : ""}" 
              onclick="window.selectTenor(${tenor})">
        ${tenor}x
      </button>
    `;
  }).join("");
}

window.selectTenor = function(tenor) {
  currentTenor = tenor;
  
  const buttons = document.querySelectorAll(".tenor-btn");
  buttons.forEach(btn => {
    const text = btn.textContent.trim();
    btn.classList.toggle("active", text === `${tenor}x`);
  });
  
  updateInstallmentRate();
};

function updateInstallmentRate() {
  const rateEl = document.getElementById("js-modal-installment-rate");
  const summaryEl = document.getElementById("js-modal-installment-summary");
  
  if (!rateEl || !currentProduct) return;
  
  if (!currentProduct.installments || currentProduct.installments.length === 0) {
    if (currentProduct.priceCredit) {
      rateEl.textContent = `${formatRupiah(currentProduct.priceCredit)} / bln`;
      summaryEl.textContent = `Tenor ${currentProduct.tenor || 35} Bulan | Uang Muka DP Ringan`;
    } else {
      rateEl.textContent = "Konsultasi Marketing";
      summaryEl.textContent = "Hubungi marketing via WhatsApp untuk skema cicilan khusus";
    }
    return;
  }
  
  const dpObj = currentProduct.installments.find(inst => Number(inst.dp) === Number(currentDpValue));
  if (!dpObj || !dpObj.rates) return;
  
  const rate = dpObj.rates[String(currentTenor)];
  if (rate) {
    rateEl.textContent = `${formatRupiah(rate)} / bln`;
    summaryEl.textContent = `Tenor ${currentTenor} Bulan | Uang Muka ${formatRupiah(currentDpValue)}`;
  } else {
    rateEl.textContent = "-";
    summaryEl.textContent = "Data angsuran tidak tersedia.";
  }
}

// GENERATE DYNAMIC WHATSAPP LINK
function generateWhatsAppLink() {
  if (!currentProduct) return;
  
  const cleanWa = (SETTINGS_DATA.whatsapp || "6283163895963").replace(/[^0-9]/g, "");
  const variants = currentProduct.variants || [];
  const variantName = variants[currentVariantIndex] ? variants[currentVariantIndex].colorName : "Standar";
  
  let messageText = `Halo Yusuf Selamat Motor Honda, saya ingin menanyakan pemesanan unit sepeda motor Honda berikut:\n\n`;
  messageText += `*Detail Pesanan:*\n`;
  messageText += `• Motor: *${currentProduct.name}*\n`;
  messageText += `• Kategori: ${currentProduct.category || "Motor Honda"}\n`;
  messageText += `• Varian Warna: ${variantName}\n`;
  
  if (currentPaymentMode === "cash") {
    messageText += `• Metode Pembayaran: *CASH (TUNAI)*\n`;
    messageText += `• Total Harga OTR: *${formatRupiah(currentProduct.otr_price)}*\n`;
  } else {
    let monthlyRate = 0;
    if (currentProduct.installments && currentProduct.installments.length > 0) {
      const dpObj = currentProduct.installments.find(inst => Number(inst.dp) === Number(currentDpValue));
      if (dpObj && dpObj.rates) monthlyRate = dpObj.rates[String(currentTenor)] || 0;
    } else {
      monthlyRate = currentProduct.priceCredit || 0;
    }
    
    messageText += `• Metode Pembayaran: *KREDIT (CICILAN)*\n`;
    messageText += `• Uang Muka (DP): *${formatRupiah(currentDpValue || 2000000)}*\n`;
    messageText += `• Jangka Waktu (Tenor): *${currentTenor || 35} Bulan*\n`;
    messageText += `• Angsuran per Bulan: *${formatRupiah(monthlyRate)} / bulan*\n`;
  }
  
  messageText += `\nMohon info mengenai ketersediaan stok unit, syarat administrasi, dan promo diskon terbaru. Terima kasih!`;
  
  const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(messageText)}`;
  window.open(waUrl, "_blank");
}
