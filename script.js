// ==========================================================================
// YUSUF SELAMAT MOTOR HONDA - LANDING PAGE SCRIPT
// Real-time Firestore Integration with Offline Fallback
// ==========================================================================

import { DEFAULT_PRODUCTS, DEFAULT_TESTIMONIALS, DEFAULT_SETTINGS, DEFAULT_PROMOS } from "./default-data.js";
import { db, collection, doc, onSnapshot, query, orderBy } from "./firebase-config.js";

// RUNTIME STATE
let PRODUCTS_DATA = [...DEFAULT_PRODUCTS];
let TESTIMONIALS_DATA = [...DEFAULT_TESTIMONIALS];
let SETTINGS_DATA = { ...DEFAULT_SETTINGS };
let PROMOS_DATA = [...DEFAULT_PROMOS];

let currentProduct = null;
let currentVariantIndex = 0;
let isInsuranceSelected = false;
let currentDpValue = null;
let currentTenor = null;

// HELPER: Format rupiah
export function formatRupiah(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return "Rp 0";
  return "Rp " + Math.round(amount).toLocaleString("id-ID");
}

// HELPER: Resolve product image URL (Transparent PNG prioritized)
export function resolveProductImage(product, imageFileNameOrUrl) {
  if (!imageFileNameOrUrl) {
    if (product.imageUrl) return resolveProductImage(product, product.imageUrl);
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
  
  // Prefer transparent .png version if .jpeg/.jpg is passed
  let processedName = imageFileNameOrUrl;
  if (processedName.toLowerCase().endsWith(".jpeg") || processedName.toLowerCase().endsWith(".jpg")) {
    processedName = processedName.replace(/\.(jpeg|jpg|JPEG|JPG)$/i, ".png");
  }

  if (processedName.startsWith("Foto Produk/")) {
    return processedName;
  }
  if (product.folder) {
    return `Foto Produk/${product.folder}/${processedName}`;
  }
  return processedName;
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

// HELPER: Resolve promo image URL
export function resolvePromoImage(imgStr) {
  if (!imgStr) return "promo/WhatsApp Image 2026-08-31 at 17.04.24.jpeg";
  if (imgStr.startsWith("http://") || 
      imgStr.startsWith("https://") || 
      imgStr.startsWith("data:image/") ||
      imgStr.startsWith("blob:") ||
      imgStr.startsWith("promo/")) {
    return imgStr;
  }
  return `promo/${imgStr}`;
}

// HELPER: Get insurance rate per product category/model from official pricelist
export function getInsuranceRate(product) {
  if (!product) return 650000;
  if (product.insurance_price && Number(product.insurance_price) > 0) {
    return Number(product.insurance_price);
  }
  
  const name = (product.name || "").toUpperCase();
  const cat = (product.category || "").toUpperCase();
  
  // 1. CUB / BEBEK
  if (name.includes("REVO")) return 600000;
  if (name.includes("SUPRA")) return 750000;
  
  // 2. MATIC
  if (name.includes("BEAT")) {
    if (name.includes("DELUXE")) return 700000;
    if (name.includes("STREET")) return 700000;
    return 650000; // CBS
  }
  
  if (name.includes("GENIO")) return 700000;
  
  if (name.includes("SCOOPY")) {
    if (name.includes("STYLISH")) return 875000;
    if (name.includes("PRESTIGE") || name.includes("FASHION")) return 850000;
    return 850000;
  }
  
  if (name.includes("VARIO 125") || (name.includes("VARIO") && !name.includes("160") && !name.includes("EVO"))) {
    if (name.includes("ISS") || name.includes("STREET")) return 900000;
    return 800000; // CBS
  }
  
  if (name.includes("STYLO 160") || name.includes("STYLO")) {
    if (name.includes("ABS") && (name.includes("SE") || name.includes("SPECIAL"))) return 1150000;
    if (name.includes("ABS")) return 1100000;
    return 1000000; // CBS
  }
  
  if (name.includes("VARIO EVO") || name.includes("VARIO 160")) {
    if (name.includes("ABS")) return 1050000;
    if (name.includes("NITRO")) return 950000;
    return 950000; // CBS / Lama
  }
  
  if (name.includes("PCX 160") || name.includes("PCX")) {
    if (name.includes("R.SYNC") || name.includes("RSYNC")) return 1350000;
    if (name.includes("ABS")) return 1250000;
    return 1100000; // CBS
  }
  
  if (name.includes("ADV 160") || name.includes("ADV")) {
    if (name.includes("R.SYNC") || name.includes("RSYNC")) return 1350000;
    if (name.includes("ABS")) return 1300000;
    return 1200000; // CBS
  }
  
  // 3. SPORT
  if (name.includes("CB 150 VERZA") || name.includes("VERZA")) return 850000;
  if (name.includes("CB150R") || name.includes("CB 150 R")) return 1250000;
  if (name.includes("CB150X") || name.includes("CB 150 X")) return 1300000;
  if (name.includes("CRF")) return 1250000;
  if (name.includes("CBR")) return 1850000;
  if (name.includes("FORZA")) return 3500000;
  
  // 4. EV (Motor Listrik)
  if (name.includes("ICON-E") || name.includes("ICON")) return 900000;
  if (name.includes("CUV-E") || name.includes("CUV")) {
    if (name.includes("DUO") || name.includes("R.SYNC")) return 1950000;
    return 1750000;
  }
  
  // Category fallbacks
  if (cat.includes("BEBEK") || cat.includes("CUB")) return 650000;
  if (cat.includes("BEAT") || cat.includes("GENIO")) return 700000;
  if (cat.includes("SCOOPY")) return 850000;
  if (cat.includes("VARIO")) return 850000;
  if (cat.includes("STYLO")) return 1000000;
  if (cat.includes("PCX")) return 1100000;
  if (cat.includes("ADV")) return 1200000;
  if (cat.includes("SPORT")) return 1200000;
  if (cat.includes("PREMIUM") || cat.includes("EV")) return 1500000;
  
  return 700000;
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
  renderHeroCarousel(PROMOS_DATA);
  renderPromos(PROMOS_DATA);
  renderProducts(PRODUCTS_DATA);
  renderTestimonials(TESTIMONIALS_DATA);
  applySettings(SETTINGS_DATA);

  // Setup Nav & Interactions
  setupNavigation();
  setupFilterAndSearch();
  setupModalEvents();
  initTilt3D();
}

function setupRealtimeListeners() {
  if (!db) {
    console.log("Firebase Firestore tidak aktif, menggunakan data default lokal.");
    return;
  }

  try {
    // 1. Listen to 'promos' collection
    const promosRef = collection(db, "promos");
    onSnapshot(promosRef, (snapshot) => {
      if (!snapshot.empty) {
        const loadedPromos = [];
        snapshot.forEach((docSnap) => {
          loadedPromos.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });
        if (loadedPromos.length > 0) {
          PROMOS_DATA = loadedPromos.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
          renderHeroCarousel(PROMOS_DATA);
          renderPromos(PROMOS_DATA);
          console.log(`Realtime Firestore: ${loadedPromos.length} promo dimuat.`);
        }
      }
    }, (error) => {
      console.warn("Firestore promos realtime listener info:", error.message);
    });

    // 2. Listen to 'products' collection
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
            <span class="product-card__price-cash">${formatRupiah(p.otr_price)} (OTR) <span class="badge-asuransi-card" title="Tersedia opsi asuransi perlindungan"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> + Asuransi</span></span>
            <span class="product-card__price-installment">${installmentText}</span>
          </div>
          <button class="btn btn--outline product-card__btn" onclick="window.openProductModal('${p.id}')">Lihat Detail</button>
        </div>
      </article>
    `;
  }).join("");

  // Initialize interactive 3D Tilt for product card thumbnails
  initTilt3D();
}

// ==========================================================================
// HERO PROMO 3D COVERFLOW CAROUSEL
// ==========================================================================
let heroCurrentIndex = 0;
let heroAutoplayTimer = null;
let heroPromoItems = [];
let isHeroDragging = false;
let heroDragStartX = 0;
let heroDragDeltaX = 0;

export function renderHeroCarousel(promosList) {
  const stage = document.getElementById("js-hero-carousel-stage");
  const dotsContainer = document.getElementById("js-hero-dots");
  const prevBtn = document.getElementById("js-hero-prev");
  const nextBtn = document.getElementById("js-hero-next");
  const carouselEl = document.getElementById("js-hero-carousel");
  
  if (!stage) return;

  // Filter active promos
  let rawPromos = (promosList || []).filter(p => p.active !== false);
  
  // If rawPromos is empty, provide default promo banners
  if (rawPromos.length === 0) {
    rawPromos = [
      { id: "fallback-1", image: "promo/promo-banner.jpg", title: "Promo Motor Honda Terbaru" },
      { id: "fallback-2", image: "promo/promo-1.jpg", title: "Diskon Angsuran Spesial" },
      { id: "fallback-3", image: "promo/WhatsApp Image 2026-08-31 at 17.04.24.jpeg", title: "DP Super Ringan" }
    ];
  }

  // Ensure minimum 3 items for coverflow effect (repeat if fewer than 3)
  heroPromoItems = [...rawPromos];
  if (heroPromoItems.length === 1) {
    heroPromoItems = [
      { ...heroPromoItems[0], _key: "1" },
      { ...heroPromoItems[0], _key: "2" },
      { ...heroPromoItems[0], _key: "3" }
    ];
  } else if (heroPromoItems.length === 2) {
    heroPromoItems = [
      heroPromoItems[0],
      heroPromoItems[1],
      { ...heroPromoItems[0], _key: "copy1" },
      { ...heroPromoItems[1], _key: "copy2" }
    ];
  }

  if (heroCurrentIndex >= heroPromoItems.length) {
    heroCurrentIndex = 0;
  }

  // Render slides: purely images (no text / labels as requested)
  stage.innerHTML = heroPromoItems.map((item, idx) => {
    const imgSrc = resolvePromoImage(item.image);
    return `
      <div class="hero-carousel__slide" data-index="${idx}" onclick="window.handleHeroSlideClick(${idx})" title="Klik untuk fokus ke promo ini">
        <img src="${imgSrc}" alt="${item.title || "Promo Motor Honda"}" class="hero-carousel__img" loading="lazy" onerror="this.src='promo/WhatsApp Image 2026-08-31 at 17.04.24.jpeg'">
      </div>
    `;
  }).join("");

  // Render Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = heroPromoItems.map((_, idx) => `
      <button type="button" class="hero-carousel__dot ${idx === heroCurrentIndex ? "active" : ""}" 
              onclick="window.goToHeroSlide(${idx})" 
              aria-label="Pilih Banner Promo ${idx + 1}">
      </button>
    `).join("");
  }

  updateHeroCarouselPositions();
  setupHeroCarouselEvents(carouselEl, prevBtn, nextBtn);
  startHeroAutoplay();
}

function updateHeroCarouselPositions() {
  const slides = document.querySelectorAll(".hero-carousel__slide");
  const dots = document.querySelectorAll(".hero-carousel__dot");
  const total = heroPromoItems.length;
  if (total === 0 || slides.length === 0) return;

  slides.forEach((slide, idx) => {
    slide.classList.remove("is-center", "is-left", "is-right", "is-hidden-left", "is-hidden-right");
    
    // Calculate circular shortest distance
    let diff = (idx - heroCurrentIndex) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    if (diff === 0) {
      slide.classList.add("is-center");
    } else if (diff === -1 || (diff === total - 1 && total <= 2)) {
      slide.classList.add("is-left");
    } else if (diff === 1 || (diff === -(total - 1) && total <= 2)) {
      slide.classList.add("is-right");
    } else if (diff < -1) {
      slide.classList.add("is-hidden-left");
    } else {
      slide.classList.add("is-hidden-right");
    }
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle("active", idx === heroCurrentIndex);
  });
}

window.goToHeroSlide = function(index) {
  const total = heroPromoItems.length;
  if (total === 0) return;
  heroCurrentIndex = (index + total) % total;
  updateHeroCarouselPositions();
  restartHeroAutoplay();
};

window.nextHeroSlide = function() {
  window.goToHeroSlide(heroCurrentIndex + 1);
};

window.prevHeroSlide = function() {
  window.goToHeroSlide(heroCurrentIndex - 1);
};

window.handleHeroSlideClick = function(clickedIndex) {
  const total = heroPromoItems.length;
  if (total === 0) return;

  let diff = (clickedIndex - heroCurrentIndex) % total;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;

  if (diff === 0) {
    // Clicked center focused slide -> open lightbox if valid ID
    const promo = heroPromoItems[heroCurrentIndex];
    if (promo && promo.id && !promo.id.startsWith("fallback-")) {
      window.openPromoLightbox(promo.id);
    }
  } else {
    // Clicked side slide -> move to center smoothly
    window.goToHeroSlide(clickedIndex);
  }
};

let heroEventsBound = false;
function setupHeroCarouselEvents(carouselEl, prevBtn, nextBtn) {
  if (heroEventsBound || !carouselEl) return;
  heroEventsBound = true;

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.prevHeroSlide();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.nextHeroSlide();
    });
  }

  // Swipe / Drag Gestures (Touch & Mouse)
  const onDragStart = (clientX) => {
    isHeroDragging = true;
    heroDragStartX = clientX;
    heroDragDeltaX = 0;
    carouselEl.classList.add("is-dragging");
    pauseHeroAutoplay();
  };

  const onDragMove = (clientX) => {
    if (!isHeroDragging) return;
    heroDragDeltaX = clientX - heroDragStartX;
  };

  const onDragEnd = () => {
    if (!isHeroDragging) return;
    isHeroDragging = false;
    carouselEl.classList.remove("is-dragging");
    
    if (heroDragDeltaX < -35) {
      window.nextHeroSlide();
    } else if (heroDragDeltaX > 35) {
      window.prevHeroSlide();
    }
    startHeroAutoplay();
  };

  // Touch events
  carouselEl.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches.length === 1) {
      onDragStart(e.touches[0].clientX);
    }
  }, { passive: true });

  carouselEl.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches.length === 1) {
      onDragMove(e.touches[0].clientX);
    }
  }, { passive: true });

  carouselEl.addEventListener("touchend", onDragEnd);
  carouselEl.addEventListener("touchcancel", onDragEnd);

  // Mouse events
  carouselEl.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      onDragStart(e.clientX);
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (isHeroDragging) {
      onDragMove(e.clientX);
    }
  });

  window.addEventListener("mouseup", (e) => {
    if (isHeroDragging) {
      onDragEnd();
    }
  });

  carouselEl.addEventListener("mouseenter", pauseHeroAutoplay);
  carouselEl.addEventListener("mouseleave", () => {
    if (!isHeroDragging) startHeroAutoplay();
  });
}

function startHeroAutoplay() {
  if (heroAutoplayTimer) clearInterval(heroAutoplayTimer);
  heroAutoplayTimer = setInterval(() => {
    window.nextHeroSlide();
  }, 5000);
}

function pauseHeroAutoplay() {
  if (heroAutoplayTimer) {
    clearInterval(heroAutoplayTimer);
    heroAutoplayTimer = null;
  }
}

function restartHeroAutoplay() {
  pauseHeroAutoplay();
  startHeroAutoplay();
}

// ==========================================================================
// 3D INTERACTIVE TILT ENGINE (REQUESTANIMATIONFRAME OPTIMIZED)
// ==========================================================================
export function initTilt3D() {
  // 1. Primary: Modal Main Image 3D Tilt
  const modalContainer = document.querySelector(".modal-card__main-img-container");
  if (modalContainer) {
    setupTiltElement(modalContainer, {
      targetSelector: "#js-modal-main-img",
      maxTilt: 14,
      scale: 1.05,
      glare: true
    });
  }

  // 2. Secondary: Subtle Tilt on Catalog Cards
  const productCards = document.querySelectorAll(".product-card__img-container");
  productCards.forEach(container => {
    setupTiltElement(container, {
      targetSelector: ".product-card__img",
      maxTilt: 8,
      scale: 1.03,
      glare: false
    });
  });

  // 3. Mobile / Viewport Scroll-Into-View Subtle 3D Tilt-In
  setupScrollIntoViewTilt();
}

function setupTiltElement(container, options = {}) {
  if (!container || container._hasTilt) return;
  container._hasTilt = true;

  const targetSelector = options.targetSelector || "img";
  const target = container.querySelector(targetSelector);
  if (!target) return;

  const maxTilt = options.maxTilt || 12;
  const scale = options.scale || 1.04;
  const hasGlare = options.glare !== false;

  // Add glare element if requested
  let glareEl = container.querySelector(".tilt-glare");
  if (hasGlare && !glareEl) {
    glareEl = document.createElement("div");
    glareEl.className = "tilt-glare";
    container.appendChild(glareEl);
  }

  let mouseX = 0, mouseY = 0;
  let currentRotateX = 0, currentRotateY = 0, currentScale = 1;
  let targetRotateX = 0, targetRotateY = 0, targetScaleVal = 1;
  let isHovered = false;
  let rafId = null;

  const updateAnimation = () => {
    // Lerp smoothing (0.15 easing)
    currentRotateX += (targetRotateX - currentRotateX) * 0.15;
    currentRotateY += (targetRotateY - currentRotateY) * 0.15;
    currentScale += (targetScaleVal - currentScale) * 0.15;

    // Apply 3D Transform & Dynamic Drop Shadow following tilt direction
    const shadowX = -currentRotateY * 1.6;
    const shadowY = currentRotateX * 1.6 + 15;
    const shadowBlur = 18 + Math.abs(currentRotateX) + Math.abs(currentRotateY);
    
    target.style.transform = `perspective(1000px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) scale3d(${currentScale.toFixed(3)}, ${currentScale.toFixed(3)}, 1)`;
    target.style.filter = `drop-shadow(${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px rgba(0,0,0,0.16))`;

    if (glareEl) {
      if (isHovered) {
        const glarePercentX = (mouseX + 0.5) * 100;
        const glarePercentY = (mouseY + 0.5) * 100;
        glareEl.style.background = `radial-gradient(circle at ${glarePercentX.toFixed(1)}% ${glarePercentY.toFixed(1)}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)`;
        glareEl.style.opacity = "1";
      } else {
        glareEl.style.opacity = "0";
      }
    }

    // Continue loop if moving
    const isSettled = Math.abs(targetRotateX - currentRotateX) < 0.01 && 
                      Math.abs(targetRotateY - currentRotateY) < 0.01 && 
                      Math.abs(targetScaleVal - currentScale) < 0.005;

    if (!isSettled || isHovered) {
      rafId = requestAnimationFrame(updateAnimation);
    } else {
      rafId = null;
      if (!isHovered) {
        target.style.transform = "";
        target.style.filter = "";
      }
    }
  };

  const onMouseMove = (e) => {
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    mouseY = (e.clientY - rect.top) / rect.height - 0.5;

    targetRotateX = -mouseY * maxTilt * 2;
    targetRotateY = mouseX * maxTilt * 2;
    targetScaleVal = scale;
    isHovered = true;

    if (!rafId) {
      rafId = requestAnimationFrame(updateAnimation);
    }
  };

  const onMouseLeave = () => {
    isHovered = false;
    targetRotateX = 0;
    targetRotateY = 0;
    targetScaleVal = 1;
    if (!rafId) {
      rafId = requestAnimationFrame(updateAnimation);
    }
  };

  container.addEventListener("mousemove", onMouseMove);
  container.addEventListener("mouseleave", onMouseLeave);
}

// Mobile / Scroll Intersection Observer for subtle 3D Tilt-In
function setupScrollIntoViewTilt() {
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target.querySelector("img");
        if (img && !entry.target._hasAnimated) {
          entry.target._hasAnimated = true;
          img.animate([
            { transform: "perspective(800px) rotateY(-8deg) rotateX(4deg) scale(0.96)", filter: "drop-shadow(-8px 12px 14px rgba(0,0,0,0.15))" },
            { transform: "perspective(800px) rotateY(4deg) rotateX(-2deg) scale(1.02)", filter: "drop-shadow(6px 14px 18px rgba(0,0,0,0.12))" },
            { transform: "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.08))" }
          ], {
            duration: 800,
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
            fill: "forwards"
          });
        }
      }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll(".product-card__img-container").forEach(el => observer.observe(el));
}

// ==========================================================================
// PROMO SAAT INI RENDERING
// ==========================================================================
export function renderPromos(promosList) {
  const container = document.getElementById("js-promos-container");
  if (!container) return;

  const activePromos = (promosList || []).filter(p => p.active !== false);

  if (activePromos.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 40px 20px;">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3>Belum Ada Promo Aktif</h3>
        <p>Promo menarik akan segera hadir. Silakan hubungi marketing kami via WhatsApp untuk penawaran spesial!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="promos-grid">
      ${activePromos.map(p => {
        const imgSrc = resolvePromoImage(p.image);
        const title = p.title || "Promo Motor Honda Terbaru";
        const subtitle = p.subtitle || "Dapatkan kemudahan pembelian motor Honda impian Anda dengan promo menarik periode ini.";
        const tag = p.tag || "Spesial Periode Berjalan";
        const badge = p.badge || "DP Super Ringan";
        const ctaText = p.ctaText || "Klaim Promo WhatsApp";

        return `
          <div class="promo-card">
            <div class="promo-card__banner-wrapper" onclick="window.openPromoLightbox('${p.id}')" title="Klik untuk memperbesar brosur promo">
              <img src="${imgSrc}" alt="${title}" class="promo-card__banner-img" loading="lazy" onerror="this.src='promo/WhatsApp Image 2026-08-31 at 17.04.24.jpeg'">
              <div class="promo-card__zoom-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
                <span>Lihat Brosur</span>
              </div>
            </div>

            <div class="promo-card__body">
              <div>
                <div class="promo-card__header-tags">
                  <span class="promo-badge-tag">${tag}</span>
                  ${badge ? `<span class="promo-badge-sub">${badge}</span>` : ""}
                </div>

                <h3 class="promo-card__title">${title}</h3>
                <p class="promo-card__desc">${subtitle}</p>

                <div class="promo-card__features">
                  <div class="promo-card__feature-item">
                    <svg class="promo-card__feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Proses Cepat & Persyaratan Mudah (KTP + KK)</span>
                  </div>
                  <div class="promo-card__feature-item">
                    <svg class="promo-card__feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Pilihan DP Murah & Angsuran Paling Ringan</span>
                  </div>
                  <div class="promo-card__feature-item">
                    <svg class="promo-card__feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Kesempatan Hadiah Undian Umroh, Motor & Voucher</span>
                  </div>
                </div>
              </div>

              <div class="promo-card__actions">
                <button type="button" class="promo-card__btn-wa" onclick="window.claimPromoWA('${p.id}')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <span>${ctaText}</span>
                </button>
                <button type="button" class="promo-card__btn-view" onclick="window.openPromoLightbox('${p.id}')" title="Lihat Brosur Full">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>Detail</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// PROMO LIGHTBOX & WA HANDLERS
let currentActiveLightboxPromo = null;

window.openPromoLightbox = function(promoId) {
  const promo = PROMOS_DATA.find(p => String(p.id) === String(promoId));
  if (!promo) return;

  currentActiveLightboxPromo = promo;
  const modal = document.getElementById("modal-promo-lightbox");
  const imgEl = document.getElementById("js-promo-lightbox-img");

  if (modal && imgEl) {
    imgEl.src = resolvePromoImage(promo.image);
    imgEl.alt = promo.title || "Brosur Promo Motor Honda";
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
};

window.claimPromoWA = function(promoId) {
  const promo = PROMOS_DATA.find(p => String(p.id) === String(promoId)) || currentActiveLightboxPromo;
  const cleanWa = (SETTINGS_DATA.whatsapp || "6283163895963").replace(/[^0-9]/g, "");
  
  const promoTitle = promo ? promo.title : "Promo Terbaru";
  const msg = `Halo Yusuf Selamat Motor Honda, saya ingin menanyakan dan mengklaim *${promoTitle}* yang sedang berjalan. Mohon info syarat dan prosesnya. Terima kasih!`;
  
  const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, "_blank");
};

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
  // 1. Main Product Detail Modal
  const modalClose = document.getElementById("js-modal-close");
  const modalOverlay = document.getElementById("js-modal");
  
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // 2. Insurance Benefit Modal
  const insuranceModal = document.getElementById("modal-insurance-benefits");
  const btnOpenInsurance = document.getElementById("js-btn-insurance-benefit");
  const btnCloseInsurance = document.getElementById("js-close-insurance-modal");

  if (btnOpenInsurance) {
    btnOpenInsurance.addEventListener("click", (e) => {
      e.stopPropagation();
      if (insuranceModal) insuranceModal.classList.add("active");
    });
  }
  if (btnCloseInsurance && insuranceModal) {
    btnCloseInsurance.addEventListener("click", () => insuranceModal.classList.remove("active"));
    insuranceModal.addEventListener("click", (e) => {
      if (e.target === insuranceModal) insuranceModal.classList.remove("active");
    });
  }

  // 3. Promo Lightbox Modal
  const promoLightboxModal = document.getElementById("modal-promo-lightbox");
  const btnClosePromoLightbox = document.getElementById("js-close-promo-lightbox");
  const btnPromoLightboxOrder = document.getElementById("js-btn-promo-lightbox-order");

  if (btnClosePromoLightbox && promoLightboxModal) {
    btnClosePromoLightbox.addEventListener("click", () => {
      promoLightboxModal.classList.remove("active");
      document.body.style.overflow = "";
    });
    promoLightboxModal.addEventListener("click", (e) => {
      if (e.target === promoLightboxModal) {
        promoLightboxModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }
  if (btnPromoLightboxOrder) {
    btnPromoLightboxOrder.addEventListener("click", () => {
      window.claimPromoWA(currentActiveLightboxPromo ? currentActiveLightboxPromo.id : "");
    });
  }

  // 4. Insurance Checkbox Dynamic Cash Price Update
  const insuranceCheckbox = document.getElementById("js-insurance-checkbox");
  if (insuranceCheckbox) {
    insuranceCheckbox.addEventListener("change", (e) => {
      isInsuranceSelected = e.target.checked;
      updateCashPriceDisplay();
    });
  }

  // 5. DP Select for Credit Simulation
  const selectDp = document.getElementById("js-select-dp");
  if (selectDp) {
    selectDp.addEventListener("change", (e) => {
      currentDpValue = parseInt(e.target.value);
      renderTenors();
      updateInstallmentRate();
    });
  }

  // 6. Order CTA Button
  const orderBtn = document.getElementById("js-order-btn");
  if (orderBtn) {
    orderBtn.addEventListener("click", generateWhatsAppLink);
  }
}

// HELPER: Update Cash Price based on insurance checkbox
function updateCashPriceDisplay() {
  if (!currentProduct) return;
  const cashPriceEl = document.getElementById("js-modal-cash-price");
  const statusNote = document.getElementById("js-cash-status-note");
  const insRow = document.querySelector(".sim-insurance-row");
  const insNominal = getInsuranceRate(currentProduct);

  const finalCashPrice = isInsuranceSelected 
    ? (currentProduct.otr_price + insNominal) 
    : currentProduct.otr_price;

  if (cashPriceEl) {
    cashPriceEl.textContent = formatRupiah(finalCashPrice);
  }

  if (statusNote) {
    statusNote.textContent = isInsuranceSelected 
      ? "Harga OTR sudah termasuk opsi proteksi asuransi 1 tahun & pengurusan STNK/BPKB." 
      : "Harga OTR resmi plat Sukabumi & sekitarnya (Belum termasuk opsi asuransi).";
  }

  if (insRow) {
    insRow.classList.toggle("checked", isInsuranceSelected);
  }
}

// GLOBAL HANDLER FOR OPENING PRODUCT MODAL
window.openProductModal = function(productId) {
  const product = PRODUCTS_DATA.find(p => String(p.id) === String(productId));
  if (!product) return;
  
  currentProduct = product;
  currentVariantIndex = 0;
  isInsuranceSelected = false; // Reset insurance checkbox state on open
  
  // Set text elements
  const elCategory = document.getElementById("js-modal-category");
  const elTitle = document.getElementById("js-modal-title");
  const elDesc = document.getElementById("js-modal-desc");
  const elInsLabel = document.getElementById("js-insurance-label-text");
  const insCheckbox = document.getElementById("js-insurance-checkbox");

  if (elCategory) elCategory.textContent = product.category || "Motor Honda";
  if (elTitle) elTitle.textContent = product.name;
  
  // Dynamic insurance rate
  const insNominal = getInsuranceRate(product);
  if (elInsLabel) {
    elInsLabel.textContent = `Asuransi (+${formatRupiah(insNominal)})`;
  }
  if (insCheckbox) {
    insCheckbox.checked = false;
  }

  // Update initial cash price
  updateCashPriceDisplay();
  
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
  populateDpSelect();
  
  const modal = document.getElementById("js-modal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      initTilt3D();
    }, 50);
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

function populateDpSelect() {
  const dpSelect = document.getElementById("js-select-dp");
  if (!dpSelect || !currentProduct) return;
  
  dpSelect.innerHTML = "";
  
  if (!currentProduct.installments || currentProduct.installments.length === 0) {
    if (currentProduct.priceCredit) {
      // Simple credit mode
      const defaultDp = currentProduct.dp || 2000000;
      const opt = document.createElement("option");
      opt.value = defaultDp;
      opt.textContent = `${formatRupiah(defaultDp)} (DP Rekomendasi)`;
      dpSelect.appendChild(opt);
      currentDpValue = defaultDp;
    } else {
      dpSelect.innerHTML = `<option value="0">Konsultasikan DP dengan Marketing</option>`;
      currentDpValue = 0;
    }
    renderTenors();
    updateInstallmentRate();
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
  renderTenors();
  updateInstallmentRate();
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
  
  const insNominal = getInsuranceRate(currentProduct);
  const finalCashPrice = isInsuranceSelected ? (currentProduct.otr_price + insNominal) : currentProduct.otr_price;

  let messageText = `Halo Yusuf Selamat Motor Honda, saya tertarik dan ingin memesan unit sepeda motor Honda berikut:\n\n`;
  messageText += `*Detail Unit Pesanan:*\n`;
  messageText += `• Motor: *${currentProduct.name}*\n`;
  messageText += `• Kategori: ${currentProduct.category || "Motor Honda"}\n`;
  messageText += `• Varian Warna: ${variantName}\n\n`;
  
  messageText += `*Simulasi Harga:*\n`;
  messageText += `• Harga OTR Cash: *${formatRupiah(finalCashPrice)}*`;
  if (isInsuranceSelected) {
    messageText += ` _(Termasuk Opsi Asuransi 1 Tahun +${formatRupiah(insNominal)})_`;
  }
  messageText += `\n`;

  // Include credit calculation details
  if (currentDpValue !== null && currentTenor !== null) {
    let monthlyRate = 0;
    if (currentProduct.installments && currentProduct.installments.length > 0) {
      const dpObj = currentProduct.installments.find(inst => Number(inst.dp) === Number(currentDpValue));
      if (dpObj && dpObj.rates) monthlyRate = dpObj.rates[String(currentTenor)] || 0;
    } else {
      monthlyRate = currentProduct.priceCredit || 0;
    }

    messageText += `\n*Simulasi Cicilan Kredit:*\n`;
    messageText += `• Uang Muka (DP): ${formatRupiah(currentDpValue)}\n`;
    messageText += `• Jangka Waktu (Tenor): ${currentTenor} Bulan\n`;
    messageText += `• Estimasi Cicilan: *${formatRupiah(monthlyRate)} / bulan*\n`;
  }
  
  messageText += `\nMohon informasi ketersediaan unit, persyaratan data, dan proses pengirimannya. Terima kasih!`;
  
  const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(messageText)}`;
  window.open(waUrl, "_blank");
}
