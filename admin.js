// ==========================================================================
// YUSUF SELAMAT MOTOR HONDA - ADMIN PANEL CONTROLLER
// Full Firebase Integration (Auth, Firestore, Realtime Sync, Seeder, CRUD)
// ==========================================================================

import { DEFAULT_PRODUCTS, DEFAULT_TESTIMONIALS, DEFAULT_SETTINGS } from "./default-data.js";
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch, 
  serverTimestamp,
  getActiveFirebaseConfig,
  saveCustomFirebaseConfig,
  isConfigured
} from "./firebase-config.js";

import { formatRupiah, resolveProductImage, resolveTestimonialImage } from "./script.js";

// ==========================================================================
// APPLICATION STATE
// ==========================================================================
let currentUser = null;
let productsList = [];
let testimonialsList = [];
let generalSettings = { ...DEFAULT_SETTINGS };

let currentDeleteTarget = null; // { type: 'product'|'testi', id: string, name: string }
let unsubscribeProducts = null;
let unsubscribeTestimonials = null;
let unsubscribeSettings = null;

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  setupAuthObserver();
  setupEventListeners();
  populateConfigForm();
});

// AUTH STATE OBSERVER
function setupAuthObserver() {
  if (!auth) {
    showToast("warning", "Konfigurasi Firebase", "Kredensial Firebase belum lengkap. Silakan atur di menu Konfigurasi.");
    showLoginView();
    return;
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      showAdminView(user);
      initRealtimeFirestore();
    } else {
      currentUser = null;
      cleanupListeners();
      showLoginView();
    }
  });
}

function showLoginView() {
  document.getElementById("view-login").style.display = "flex";
  document.getElementById("view-admin").style.display = "none";
}

function showAdminView(user) {
  document.getElementById("view-login").style.display = "none";
  document.getElementById("view-admin").style.display = "flex";

  const emailEl = document.getElementById("topbar-user-email");
  const avatarEl = document.getElementById("topbar-user-avatar");
  if (emailEl) emailEl.textContent = user.email || "Admin";
  if (avatarEl) avatarEl.textContent = (user.email ? user.email[0].toUpperCase() : "A");

  updateConnectionStatus(true);
}

function updateConnectionStatus(isOnline) {
  const pill = document.getElementById("topbar-status-pill");
  const text = document.getElementById("topbar-status-text");
  const statStatus = document.getElementById("stat-firebase-status");

  if (isOnline) {
    if (pill) { pill.className = "status-pill"; }
    if (text) { text.textContent = "Real-time Firestore"; }
    if (statStatus) { statStatus.textContent = "Terhubung"; statStatus.style.color = "var(--success)"; }
  } else {
    if (pill) { pill.className = "status-pill offline"; }
    if (text) { text.textContent = "Mode Offline / Standby"; }
    if (statStatus) { statStatus.textContent = "Offline"; statStatus.style.color = "var(--warning)"; }
  }
}

// REALTIME FIRESTORE LISTENERS FOR ADMIN
function initRealtimeFirestore() {
  if (!db) return;

  cleanupListeners();

  try {
    // 1. Products Listener
    const productsRef = collection(db, "products");
    unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
      const loaded = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loaded.push({
          id: docSnap.id,
          ...data,
          otr_price: Number(data.otr_price || data.priceCash || 0),
          name: data.name || "Honda",
          category: data.category || "Matic Series",
          variants: data.variants || data.colors || (data.imageUrl ? [{ colorName: "Standar", hex: "#cc1d24", image: data.imageUrl }] : []),
          installments: data.installments || (data.priceCredit ? [{ dp: Number(data.dp || 2000000), rates: { [String(data.tenor || 35)]: Number(data.priceCredit) } }] : [])
        });
      });

      productsList = loaded;
      renderProductsTable();
      updateDashboardStats();
    }, (err) => {
      console.warn("Firestore products snapshot error:", err);
      // Fallback to local default if empty or permission
      if (productsList.length === 0) {
        productsList = [...DEFAULT_PRODUCTS];
        renderProductsTable();
        updateDashboardStats();
      }
    });

    // 2. Testimonials Listener
    const testiRef = collection(db, "testimonials");
    unsubscribeTestimonials = onSnapshot(testiRef, (snapshot) => {
      const loaded = [];
      snapshot.forEach((docSnap) => {
        loaded.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      testimonialsList = loaded;
      renderTestimonialsGrid();
      updateDashboardStats();
    }, (err) => {
      console.warn("Firestore testimonials snapshot error:", err);
      if (testimonialsList.length === 0) {
        testimonialsList = [...DEFAULT_TESTIMONIALS];
        renderTestimonialsGrid();
        updateDashboardStats();
      }
    });

    // 3. Settings Listener
    const settingsRef = doc(db, "settings", "general");
    unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        generalSettings = { ...DEFAULT_SETTINGS, ...docSnap.data() };
        populateSettingsForm();
      }
    }, (err) => {
      console.warn("Firestore settings snapshot error:", err);
      populateSettingsForm();
    });

  } catch (err) {
    console.error("Gagal menghubungkan listener Firestore:", err);
  }
}

function cleanupListeners() {
  if (unsubscribeProducts) { unsubscribeProducts(); unsubscribeProducts = null; }
  if (unsubscribeTestimonials) { unsubscribeTestimonials(); unsubscribeTestimonials = null; }
  if (unsubscribeSettings) { unsubscribeSettings(); unsubscribeSettings = null; }
}

// ==========================================================================
// UI EVENT LISTENERS
// ==========================================================================
function setupEventListeners() {
  // Login Form
  const formLogin = document.getElementById("form-login");
  if (formLogin) {
    formLogin.addEventListener("submit", handleLoginSubmit);
  }

  // Toggle Password Visibility
  const togglePassBtn = document.getElementById("btn-toggle-password");
  if (togglePassBtn) {
    togglePassBtn.addEventListener("click", () => {
      const input = document.getElementById("login-password");
      if (input.type === "password") {
        input.type = "text";
      } else {
        input.type = "password";
      }
    });
  }

  // Logout Buttons
  const logoutBtn = document.getElementById("btn-sidebar-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Mobile Sidebar Toggle
  const sidebarToggle = document.getElementById("btn-toggle-sidebar");
  const sidebar = document.getElementById("app-sidebar");
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-open");
    });
  }

  // Navigation Tab Switching
  const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const tabId = item.getAttribute("data-tab");
      switchTab(tabId);
      if (sidebar && sidebar.classList.contains("mobile-open")) {
        sidebar.classList.remove("mobile-open");
      }
    });
  });

  // Product Filter & Search Controls
  const prodSearch = document.getElementById("admin-product-search");
  const prodCategory = document.getElementById("admin-product-filter-category");
  const prodSort = document.getElementById("admin-product-sort");

  if (prodSearch) prodSearch.addEventListener("input", renderProductsTable);
  if (prodCategory) prodCategory.addEventListener("change", renderProductsTable);
  if (prodSort) prodSort.addEventListener("change", renderProductsTable);

  // Product Modal Tabs
  const modalTabBtns = document.querySelectorAll(".modal-tab-btn");
  modalTabBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modalTabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-modaltab");
      document.querySelectorAll(".modal-tab-content").forEach(c => c.style.display = "none");
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.style.display = "block";
    });
  });

  // Variant Row Builder
  const addVariantBtn = document.getElementById("btn-add-variant-row");
  if (addVariantBtn) {
    addVariantBtn.addEventListener("click", () => addVariantRow());
  }

  // Save Product Button
  const saveProdBtn = document.getElementById("btn-save-product");
  if (saveProdBtn) {
    saveProdBtn.addEventListener("click", handleSaveProduct);
  }

  // Save Testimonial Button
  const saveTestiBtn = document.getElementById("btn-save-testi");
  if (saveTestiBtn) {
    saveTestiBtn.addEventListener("click", handleSaveTestimonial);
  }

  // Testimonial File Input Preview
  const testiFileInput = document.getElementById("testi-file-input");
  if (testiFileInput) {
    testiFileInput.addEventListener("change", handleTestiFileUpload);
  }

  // Save General Settings
  const formSettings = document.getElementById("form-general-settings");
  if (formSettings) {
    formSettings.addEventListener("submit", handleSaveSettings);
  }

  // Bulk Price Apply
  const applyBulkBtn = document.getElementById("btn-apply-bulk-price");
  if (applyBulkBtn) {
    applyBulkBtn.addEventListener("click", handleApplyBulkPrice);
  }

  // Execute Delete
  const execDeleteBtn = document.getElementById("btn-execute-delete");
  if (execDeleteBtn) {
    execDeleteBtn.addEventListener("click", handleExecuteDelete);
  }

  // 1-Click Migration / Seeder
  const startMigrationBtn = document.getElementById("btn-start-migration");
  if (startMigrationBtn) {
    startMigrationBtn.addEventListener("click", handleStartMigration);
  }

  // Export Backup JSON
  const exportBackupBtn = document.getElementById("btn-export-backup");
  if (exportBackupBtn) {
    exportBackupBtn.addEventListener("click", handleExportBackup);
  }

  // Firebase Config Form
  const formConfig = document.getElementById("form-firebase-config");
  if (formConfig) {
    formConfig.addEventListener("submit", handleSaveFirebaseConfig);
  }

  const resetConfigBtn = document.getElementById("btn-reset-default-config");
  if (resetConfigBtn) {
    resetConfigBtn.addEventListener("click", () => {
      localStorage.removeItem("ysm_firebase_config");
      showToast("info", "Konfigurasi Direset", "Konfigurasi dikembalikan ke standar bawaan.");
      populateConfigForm();
    });
  }

  // Forgot Password Trigger
  const forgotBtn = document.getElementById("btn-open-forgot");
  if (forgotBtn) {
    forgotBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("modal-forgot-password");
    });
  }

  const sendResetBtn = document.getElementById("btn-send-password-reset");
  if (sendResetBtn) {
    sendResetBtn.addEventListener("click", handleSendPasswordReset);
  }

  // Helper from login screen to open config
  const loginConfigBtn = document.getElementById("btn-login-open-config");
  if (loginConfigBtn) {
    loginConfigBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showAdminView({ email: "guest@yusufselamat.com" });
      switchTab("tab-config");
    });
  }
}

// ==========================================================================
// AUTHENTICATION LOGIC
// ==========================================================================
async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-password").value;
  const btn = document.getElementById("btn-submit-login");
  const btnText = document.getElementById("login-btn-text");
  const alertBox = document.getElementById("login-alert-container");

  alertBox.innerHTML = "";
  btn.disabled = true;
  btnText.textContent = "Memverifikasi...";

  try {
    if (!auth) {
      throw new Error("Firebase Auth belum diinisialisasi dengan konfigurasi valid.");
    }
    await signInWithEmailAndPassword(auth, email, pass);
    showToast("success", "Login Berhasil", "Selamat datang di Portal Admin Yusuf Selamat Motor Honda.");
  } catch (err) {
    console.error("Login error:", err);
    let errMsg = "Terjadi kesalahan saat login.";
    if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
      errMsg = "Email atau kata sandi tidak cocok. Pastikan akun admin sudah dibuat di Firebase Console.";
    } else if (err.code === "auth/invalid-email") {
      errMsg = "Format alamat email tidak valid.";
    } else if (err.code === "auth/too-many-requests") {
      errMsg = "Terlalu banyak percobaan gagal. Silakan coba kembali beberapa saat lagi.";
    } else {
      errMsg = err.message;
    }

    alertBox.innerHTML = `
      <div class="alert-banner alert-danger" style="margin-bottom: 16px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <div>${errMsg}</div>
      </div>
    `;
  } finally {
    btn.disabled = false;
    btnText.textContent = "Masuk ke Dashboard";
  }
}

async function handleLogout() {
  try {
    if (auth) {
      await signOut(auth);
    }
    showToast("info", "Keluar", "Sesi administrator telah diakhiri.");
  } catch (err) {
    console.error("Logout error:", err);
  }
}

async function handleSendPasswordReset() {
  const email = document.getElementById("forgot-email").value.trim();
  if (!email) {
    showToast("warning", "Email Diperlukan", "Masukkan alamat email Anda terlebih dahulu.");
    return;
  }

  try {
    if (!auth) throw new Error("Firebase Auth tidak tersedia");
    await sendPasswordResetEmail(auth, email);
    closeModal("modal-forgot-password");
    showToast("success", "Email Terkirim", `Tautan reset sandi telah dikirim ke ${email}.`);
  } catch (err) {
    showToast("danger", "Gagal Mengirim", err.message);
  }
}

// ==========================================================================
// TAB SWITCHING
// ==========================================================================
export function switchTab(tabId) {
  // Update sidebar active link
  document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
    item.classList.toggle("active", item.getAttribute("data-tab") === tabId);
  });

  // Update tab pane
  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.remove("active");
  });
  const targetPane = document.getElementById(tabId);
  if (targetPane) {
    targetPane.classList.add("active");
  }

  // Update topbar title
  const titleMap = {
    "tab-dashboard": "Ringkasan Dashboard",
    "tab-products": "Katalog Sepeda Motor",
    "tab-testimonials": "Testimoni & Dokumentasi",
    "tab-settings": "Pengaturan Informasi & Kontak",
    "tab-migration": "Migrasi & Cadangan Data",
    "tab-config": "Konfigurasi Firebase SDK"
  };
  const titleEl = document.getElementById("topbar-current-title");
  if (titleEl) titleEl.textContent = titleMap[tabId] || "Admin Portal";
}

// ==========================================================================
// DASHBOARD STATS
// ==========================================================================
function updateDashboardStats() {
  const statProducts = document.getElementById("stat-total-products");
  const statCategories = document.getElementById("stat-total-categories");
  const statTesti = document.getElementById("stat-total-testimonials");
  const badgeProd = document.getElementById("badge-products-count");
  const badgeTesti = document.getElementById("badge-testi-count");

  const totalProd = productsList.length;
  const categories = new Set(productsList.map(p => p.category).filter(Boolean));
  const totalTesti = testimonialsList.length;

  if (statProducts) statProducts.textContent = totalProd;
  if (statCategories) statCategories.textContent = categories.size || 10;
  if (statTesti) statTesti.textContent = totalTesti;
  if (badgeProd) badgeProd.textContent = totalProd;
  if (badgeTesti) badgeTesti.textContent = totalTesti;
}

// ==========================================================================
// PRODUCT CRUD CONTROLLER
// ==========================================================================
function renderProductsTable() {
  const tbody = document.getElementById("admin-products-table-body");
  const searchInput = document.getElementById("admin-product-search");
  const catFilter = document.getElementById("admin-product-filter-category");
  const sortSelect = document.getElementById("admin-product-sort");
  const counterEl = document.getElementById("admin-product-counter");

  if (!tbody) return;

  const query = (searchInput ? searchInput.value : "").toLowerCase().trim();
  const selectedCat = catFilter ? catFilter.value : "all";
  const sortVal = sortSelect ? sortSelect.value : "name-asc";

  let filtered = productsList.filter(p => {
    const matchCat = (selectedCat === "all") || (p.category === selectedCat);
    const matchSearch = (p.name || "").toLowerCase().includes(query) || (p.category || "").toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortVal === "name-asc") return (a.name || "").localeCompare(b.name || "");
    if (sortVal === "price-asc") return (a.otr_price || 0) - (b.otr_price || 0);
    if (sortVal === "price-desc") return (b.otr_price || 0) - (a.otr_price || 0);
    return 0;
  });

  if (counterEl) counterEl.textContent = `Menampilkan ${filtered.length} dari ${productsList.length} produk`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 32px; height: 32px; color: var(--text-light);"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            <span style="font-weight: 600;">Tidak ada produk yang cocok dengan pencarian</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    let thumbImg = "";
    if (p.variants && p.variants.length > 0 && p.variants[0].image) {
      thumbImg = p.variants[0].image;
    } else if (p.images && p.images.length > 0) {
      thumbImg = p.images[0];
    } else if (p.imageUrl) {
      thumbImg = p.imageUrl;
    }
    const thumbPath = resolveProductImage(p, thumbImg);

    // Min installment text
    let minRateText = "-";
    if (p.installments && p.installments.length > 0) {
      let min = Infinity;
      p.installments.forEach(inst => {
        if (inst.rates) {
          Object.values(inst.rates).forEach(r => {
            const num = Number(r);
            if (num > 0 && num < min) min = num;
          });
        }
      });
      if (min !== Infinity) minRateText = `${formatRupiah(min)} /bln`;
    } else if (p.priceCredit) {
      minRateText = `${formatRupiah(p.priceCredit)} /bln`;
    }

    // Swatches preview
    const variants = p.variants || [];
    const swatchesHtml = variants.slice(0, 4).map(v => `
      <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${v.hex || '#cc1d24'}; border: 1px solid rgba(0,0,0,0.15);" title="${v.colorName || ''}"></span>
    `).join("");

    return `
      <tr>
        <td>
          <img src="${thumbPath}" alt="${p.name}" class="table-img" onerror="this.src='tambahan tentang kami/WhatsApp Image 2026-07-03 at 18.30.10_cropped.jpeg'">
        </td>
        <td>
          <div style="font-weight: 700; color: var(--dark); font-size: 13.5px;">${p.name}</div>
        </td>
        <td>
          <span class="badge badge-gray">${p.category || "Matic"}</span>
        </td>
        <td style="font-weight: 700; color: var(--primary);">
          ${formatRupiah(p.otr_price)}
        </td>
        <td style="color: var(--text-muted);">
          ${minRateText}
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 4px;">
            ${swatchesHtml}
            ${variants.length > 4 ? `<span style="font-size: 10.5px; color: var(--text-muted);">+${variants.length - 4}</span>` : ""}
            <span style="font-size: 11px; color: var(--text-muted); margin-left: 4px;">(${variants.length} warna)</span>
          </div>
        </td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            <button class="btn-icon edit" onclick="window.adminApp.openProductModal('edit', '${p.id}')" title="Edit Produk">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="btn-icon" onclick="window.adminApp.openProductModal('duplicate', '${p.id}')" title="Duplikat Produk">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
            <button class="btn-icon delete" onclick="window.adminApp.confirmDelete('product', '${p.id}', '${p.name}')" title="Hapus Produk">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

export function openProductModal(mode = "add", productId = null) {
  const modal = document.getElementById("modal-product");
  const titleEl = document.getElementById("modal-product-title");
  const formId = document.getElementById("prod-form-id");
  const nameInput = document.getElementById("prod-name");
  const catInput = document.getElementById("prod-category");
  const priceCashInput = document.getElementById("prod-price-cash");
  const descInput = document.getElementById("prod-desc");
  const priceCreditInput = document.getElementById("prod-price-credit");
  const tenorInput = document.getElementById("prod-tenor");
  const dpInput = document.getElementById("prod-dp");
  const variantsContainer = document.getElementById("variant-rows-container");

  // Reset Tab
  document.querySelectorAll(".modal-tab-btn").forEach((b, i) => b.classList.toggle("active", i === 0));
  document.querySelectorAll(".modal-tab-content").forEach((c, i) => c.style.display = i === 0 ? "block" : "none");

  variantsContainer.innerHTML = "";

  if (mode === "add") {
    titleEl.querySelector("span").textContent = "Tambah Produk Motor Baru";
    formId.value = "";
    nameInput.value = "";
    catInput.value = "Beat Series";
    priceCashInput.value = "";
    descInput.value = "";
    priceCreditInput.value = "";
    tenorInput.value = "35";
    dpInput.value = "2000000";

    // Add default initial variant row
    addVariantRow("Standar", "#cc1d24", "");
  } else {
    const p = productsList.find(item => String(item.id) === String(productId));
    if (!p) return;

    if (mode === "edit") {
      titleEl.querySelector("span").textContent = `Edit Motor: ${p.name}`;
      formId.value = p.id;
    } else {
      titleEl.querySelector("span").textContent = `Duplikat Motor: ${p.name}`;
      formId.value = "";
    }

    nameInput.value = (mode === "duplicate" ? `${p.name} (Salinan)` : p.name);
    catInput.value = p.category || "Beat Series";
    priceCashInput.value = p.otr_price || 0;
    descInput.value = p.description || "";

    // Min credit installment
    let minRate = "";
    let minTenor = "35";
    let minDp = "2000000";
    if (p.installments && p.installments.length > 0) {
      minDp = p.installments[0].dp || 2000000;
      if (p.installments[0].rates && p.installments[0].rates["35"]) {
        minRate = p.installments[0].rates["35"];
      } else if (p.installments[0].rates) {
        minRate = Object.values(p.installments[0].rates)[0];
      }
    } else if (p.priceCredit) {
      minRate = p.priceCredit;
      minTenor = p.tenor || "35";
      minDp = p.dp || 2000000;
    }

    priceCreditInput.value = minRate;
    tenorInput.value = minTenor;
    dpInput.value = minDp;

    // Populate variants
    const variants = p.variants || [];
    if (variants.length > 0) {
      variants.forEach(v => {
        addVariantRow(v.colorName || "Varian", v.hex || "#cc1d24", v.image || "");
      });
    } else {
      addVariantRow("Standar", "#cc1d24", p.imageUrl || "");
    }
  }

  openModal("modal-product");
}

function addVariantRow(name = "", hex = "#cc1d24", imageVal = "") {
  const container = document.getElementById("variant-rows-container");
  if (!container) return;

  const rowId = "vrow_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  const row = document.createElement("div");
  row.className = "variant-item-card";
  row.id = rowId;

  row.innerHTML = `
    <div>
      <label class="form-label" style="font-size: 11px;">Nama Warna</label>
      <input type="text" class="form-input no-icon v-name" placeholder="Contoh: Matte Black" value="${name}" style="padding: 7px 10px; font-size: 12.5px;" required>
    </div>
    <div>
      <label class="form-label" style="font-size: 11px;">Kode Warna</label>
      <div class="color-picker-group">
        <input type="color" class="color-input-preview v-hex-picker" value="${hex}">
        <input type="text" class="form-input no-icon v-hex-text" value="${hex}" style="padding: 7px 8px; font-size: 12px; width: 65px;">
      </div>
    </div>
    <div>
      <label class="form-label" style="font-size: 11px;">Upload Foto / Gambar</label>
      <div style="display: flex; gap: 8px; align-items: center;">
        <input type="file" class="v-file-input" accept="image/*" style="font-size: 11.5px; width: 140px;">
        <input type="text" class="form-input no-icon v-image-val" placeholder="Path/URL gambar" value="${imageVal}" style="padding: 7px 10px; font-size: 12px; flex: 1;">
      </div>
    </div>
    <div style="display: flex; align-items: flex-end;">
      <button type="button" class="btn-icon delete" onclick="document.getElementById('${rowId}').remove()" title="Hapus Varian" style="margin-bottom: 2px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
      </button>
    </div>
  `;

  // Color picker sync
  const picker = row.querySelector(".v-hex-picker");
  const hexText = row.querySelector(".v-hex-text");
  picker.addEventListener("input", (e) => { hexText.value = e.target.value; });
  hexText.addEventListener("input", (e) => { picker.value = e.target.value; });

  // File upload sync (compress to Base64)
  const fileInput = row.querySelector(".v-file-input");
  const imgValInput = row.querySelector(".v-image-val");
  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedBase64 = await compressImageFile(file, 800, 0.8);
        imgValInput.value = compressedBase64;
        showToast("info", "Foto Dimuat", `Foto untuk ${name || "varian"} berhasil disiapkan.`);
      } catch (err) {
        console.error("Image compression error:", err);
      }
    }
  });

  container.appendChild(row);
}

async function handleSaveProduct() {
  const formId = document.getElementById("prod-form-id").value;
  const name = document.getElementById("prod-name").value.trim();
  const category = document.getElementById("prod-category").value;
  const priceCash = Number(document.getElementById("prod-price-cash").value) || 0;
  const desc = document.getElementById("prod-desc").value.trim();
  const priceCredit = Number(document.getElementById("prod-price-credit").value) || 0;
  const tenor = Number(document.getElementById("prod-tenor").value) || 35;
  const dp = Number(document.getElementById("prod-dp").value) || 2000000;

  if (!name) {
    showToast("warning", "Nama Diperlukan", "Masukkan nama model sepeda motor.");
    return;
  }
  if (priceCash <= 0) {
    showToast("warning", "Harga Diperlukan", "Masukkan harga OTR Cash motor yang valid.");
    return;
  }

  // Collect Variants
  const variantRows = document.querySelectorAll("#variant-rows-container .variant-item-card");
  const variants = [];
  variantRows.forEach(row => {
    const vName = row.querySelector(".v-name").value.trim();
    const vHex = row.querySelector(".v-hex-picker").value;
    const vImg = row.querySelector(".v-image-val").value.trim();
    if (vName || vImg) {
      variants.push({
        colorName: vName || "Varian",
        hex: vHex || "#cc1d24",
        image: vImg || ""
      });
    }
  });

  if (variants.length === 0) {
    variants.push({
      colorName: "Standar",
      hex: "#cc1d24",
      image: ""
    });
  }

  // Construct Installment Structure
  const installments = [
    {
      dp: dp,
      rates: {
        [String(tenor)]: priceCredit || Math.round(priceCash * 0.045)
      }
    }
  ];

  const productData = {
    name,
    category,
    otr_price: priceCash,
    priceCash: priceCash,
    priceCredit: priceCredit,
    tenor: tenor,
    dp: dp,
    description: desc,
    variants: variants,
    colors: variants,
    images: variants.map(v => v.image).filter(Boolean),
    imageUrl: variants[0] ? variants[0].image : "",
    installments: installments,
    updatedAt: new Date().toISOString()
  };

  const saveBtn = document.getElementById("btn-save-product");
  saveBtn.disabled = true;

  try {
    if (db) {
      if (formId) {
        // Update existing
        await setDoc(doc(db, "products", formId), productData, { merge: true });
        showToast("success", "Produk Diperbarui", `${name} berhasil diperbarui di Firestore.`);
      } else {
        // Add new
        const docRef = await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp()
        });
        showToast("success", "Produk Ditambahkan", `${name} berhasil ditambahkan ke katalog.`);
      }
    } else {
      // Local fallback mode
      if (formId) {
        const idx = productsList.findIndex(p => p.id === formId);
        if (idx !== -1) productsList[idx] = { ...productsList[idx], ...productData };
      } else {
        productsList.unshift({ id: "prod-" + Date.now(), ...productData });
      }
      renderProductsTable();
      updateDashboardStats();
      showToast("info", "Tersimpan Lokal", "Produk disimpan di memori lokal (Firebase belum aktif).");
    }

    closeModal("modal-product");
  } catch (err) {
    console.error("Save product error:", err);
    showToast("danger", "Gagal Menyimpan", err.message);
  } finally {
    saveBtn.disabled = false;
  }
}

// ==========================================================================
// BULK PRICE UPDATE CONTROLLER
// ==========================================================================
export function openBulkPriceModal() {
  openModal("modal-bulk-price");
}

async function handleApplyBulkPrice() {
  const category = document.getElementById("bulk-category").value;
  const type = document.getElementById("bulk-type").value;
  const value = Number(document.getElementById("bulk-value").value);

  if (!value || value <= 0) {
    showToast("warning", "Nilai Tidak Valid", "Masukkan nominal atau persentase yang valid.");
    return;
  }

  const targets = productsList.filter(p => (category === "all") || (p.category === category));

  if (targets.length === 0) {
    showToast("warning", "Tidak Ada Produk", "Tidak ada produk dalam kategori yang dipilih.");
    return;
  }

  const applyBtn = document.getElementById("btn-apply-bulk-price");
  applyBtn.disabled = true;

  try {
    if (db) {
      const batch = writeBatch(db);
      let count = 0;

      targets.forEach(p => {
        let currentPrice = p.otr_price || 0;
        let newPrice = currentPrice;

        if (type === "nominal-plus") newPrice = currentPrice + value;
        else if (type === "nominal-minus") newPrice = Math.max(1000000, currentPrice - value);
        else if (type === "percent-plus") newPrice = Math.round(currentPrice * (1 + value / 100));
        else if (type === "percent-minus") newPrice = Math.round(currentPrice * (1 - value / 100));

        if (p.id) {
          const docRef = doc(db, "products", p.id);
          batch.update(docRef, {
            otr_price: newPrice,
            priceCash: newPrice,
            updatedAt: new Date().toISOString()
          });
          count++;
        }
      });

      await batch.commit();
      showToast("success", "Update Massal Berhasil", `${count} produk berhasil disesuaikan harganya.`);
    } else {
      // Local mode
      targets.forEach(p => {
        let currentPrice = p.otr_price || 0;
        if (type === "nominal-plus") p.otr_price = currentPrice + value;
        else if (type === "nominal-minus") p.otr_price = Math.max(1000000, currentPrice - value);
        else if (type === "percent-plus") p.otr_price = Math.round(currentPrice * (1 + value / 100));
        else if (type === "percent-minus") p.otr_price = Math.round(currentPrice * (1 - value / 100));
        p.priceCash = p.otr_price;
      });
      renderProductsTable();
      showToast("info", "Update Lokal Berhasil", `${targets.length} produk diperbarui secara lokal.`);
    }

    closeModal("modal-bulk-price");
  } catch (err) {
    console.error("Bulk price error:", err);
    showToast("danger", "Gagal Update Massal", err.message);
  } finally {
    applyBtn.disabled = false;
  }
}

// ==========================================================================
// TESTIMONIAL CRUD CONTROLLER
// ==========================================================================
function renderTestimonialsGrid() {
  const grid = document.getElementById("admin-testimonials-grid");
  if (!grid) return;

  if (testimonialsList.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        Belum ada testimoni. Klik tombol "+ Tambah Testimoni Baru" untuk menambahkan ulasan.
      </div>
    `;
    return;
  }

  grid.innerHTML = testimonialsList.map(t => {
    const imgSrc = resolveTestimonialImage(t.image || t.imageUrl);
    const rating = Number(t.rating) || 0;
    const stars = rating > 0 ? "★".repeat(rating) : "Dokumentasi";

    return `
      <div class="admin-testi-card">
        <div class="admin-testi-img-box">
          <img src="${imgSrc}" alt="${t.name || 'Dokumentasi'}" class="admin-testi-img" onerror="this.src='Foto Testimoni History/WhatsApp Image 2026-07-03 at 18.36.26.jpeg'">
          <span class="admin-testi-rating">${stars}</span>
        </div>
        <div class="admin-testi-body">
          <div class="admin-testi-name">${t.name || "Pelanggan Tanpa Nama"}</div>
          <div class="admin-testi-loc">${t.location || "Sukabumi"}</div>
          <div class="admin-testi-text">"${t.text || "Dokumentasi pengiriman unit motor Honda ke tempat konsumen."}"</div>
          <div class="admin-testi-footer">
            <button class="btn-icon edit" onclick="window.adminApp.openTestimonialModal('edit', '${t.id}')" title="Edit Testimoni">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="btn-icon delete" onclick="window.adminApp.confirmDelete('testi', '${t.id}', '${t.name || 'Testimoni'}')" title="Hapus Testimoni">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

export function openTestimonialModal(mode = "add", testiId = null) {
  const titleEl = document.getElementById("modal-testi-title");
  const formId = document.getElementById("testi-form-id");
  const nameInput = document.getElementById("testi-name");
  const locInput = document.getElementById("testi-location");
  const ratingInput = document.getElementById("testi-rating");
  const textInput = document.getElementById("testi-text");
  const imgDataInput = document.getElementById("testi-img-data");
  const previewBox = document.getElementById("testi-preview-box");
  const previewImg = document.getElementById("testi-preview-img");
  const fileInput = document.getElementById("testi-file-input");

  fileInput.value = "";

  if (mode === "add") {
    titleEl.querySelector("span").textContent = "Tambah Testimoni Baru";
    formId.value = "";
    nameInput.value = "";
    locInput.value = "Pelabuhan Ratu";
    ratingInput.value = "5";
    textInput.value = "";
    imgDataInput.value = "";
    previewBox.style.display = "none";
  } else {
    const t = testimonialsList.find(item => String(item.id) === String(testiId));
    if (!t) return;

    titleEl.querySelector("span").textContent = `Edit Testimoni: ${t.name || 'Konsumen'}`;
    formId.value = t.id;
    nameInput.value = t.name || "";
    locInput.value = t.location || "";
    ratingInput.value = String(t.rating !== undefined ? t.rating : 5);
    textInput.value = t.text || "";
    imgDataInput.value = t.image || t.imageUrl || "";

    if (imgDataInput.value) {
      previewImg.src = resolveTestimonialImage(imgDataInput.value);
      previewBox.style.display = "block";
    } else {
      previewBox.style.display = "none";
    }
  }

  openModal("modal-testi");
}

async function handleTestiFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const base64 = await compressImageFile(file, 800, 0.8);
    document.getElementById("testi-img-data").value = base64;
    const previewBox = document.getElementById("testi-preview-box");
    const previewImg = document.getElementById("testi-preview-img");
    previewImg.src = base64;
    previewBox.style.display = "block";
    showToast("info", "Foto Dimuat", "Foto serah terima berhasil dipilih.");
  } catch (err) {
    console.error("Testimonial image compression error:", err);
  }
}

async function handleSaveTestimonial() {
  const formId = document.getElementById("testi-form-id").value;
  const name = document.getElementById("testi-name").value.trim();
  const loc = document.getElementById("testi-location").value.trim();
  const rating = Number(document.getElementById("testi-rating").value);
  const text = document.getElementById("testi-text").value.trim();
  const imgData = document.getElementById("testi-img-data").value.trim();

  if (!name && !text && !imgData) {
    showToast("warning", "Data Kosong", "Isi nama, ulasan, atau pilih foto serah terima.");
    return;
  }

  const testiData = {
    name: name || "Konsumen",
    location: loc || "Pelabuhan Ratu",
    rating: rating,
    text: text,
    image: imgData || "Foto Testimoni History/WhatsApp Image 2026-07-03 at 18.36.26.jpeg",
    imageUrl: imgData || "Foto Testimoni History/WhatsApp Image 2026-07-03 at 18.36.26.jpeg",
    updatedAt: new Date().toISOString()
  };

  const saveBtn = document.getElementById("btn-save-testi");
  saveBtn.disabled = true;

  try {
    if (db) {
      if (formId) {
        await setDoc(doc(db, "testimonials", formId), testiData, { merge: true });
        showToast("success", "Testimoni Diperbarui", "Ulasan konsumen berhasil diperbarui.");
      } else {
        await addDoc(collection(db, "testimonials"), {
          ...testiData,
          createdAt: serverTimestamp()
        });
        showToast("success", "Testimoni Ditambahkan", "Ulasan konsumen berhasil disimpan ke Firestore.");
      }
    } else {
      if (formId) {
        const idx = testimonialsList.findIndex(t => t.id === formId);
        if (idx !== -1) testimonialsList[idx] = { ...testimonialsList[idx], ...testiData };
      } else {
        testimonialsList.unshift({ id: "testi-" + Date.now(), ...testiData });
      }
      renderTestimonialsGrid();
      updateDashboardStats();
      showToast("info", "Tersimpan Lokal", "Testimoni tersimpan di memori browser.");
    }

    closeModal("modal-testi");
  } catch (err) {
    console.error("Save testimonial error:", err);
    showToast("danger", "Gagal Menyimpan", err.message);
  } finally {
    saveBtn.disabled = false;
  }
}

// ==========================================================================
// DELETE CONFIRMATION CONTROLLER
// ==========================================================================
export function confirmDelete(type, id, name) {
  currentDeleteTarget = { type, id, name };
  const msgEl = document.getElementById("confirm-delete-message");
  if (msgEl) {
    msgEl.innerHTML = `Yakin ingin menghapus <strong>"${name}"</strong> dari katalog? Perubahan ini langsung tersimpan ke cloud.`;
  }
  openModal("modal-confirm-delete");
}

async function handleExecuteDelete() {
  if (!currentDeleteTarget) return;

  const { type, id, name } = currentDeleteTarget;
  const execBtn = document.getElementById("btn-execute-delete");
  execBtn.disabled = true;

  try {
    if (db) {
      const collectionName = (type === "product") ? "products" : "testimonials";
      await deleteDoc(doc(db, collectionName, id));
      showToast("success", "Berhasil Dihapus", `"${name}" telah dihapus dari Firestore.`);
    } else {
      if (type === "product") {
        productsList = productsList.filter(p => p.id !== id);
        renderProductsTable();
      } else {
        testimonialsList = testimonialsList.filter(t => t.id !== id);
        renderTestimonialsGrid();
      }
      updateDashboardStats();
      showToast("info", "Dihapus Lokal", `"${name}" telah dihapus secara lokal.`);
    }
    closeModal("modal-confirm-delete");
  } catch (err) {
    console.error("Delete error:", err);
    showToast("danger", "Gagal Menghapus", err.message);
  } finally {
    execBtn.disabled = false;
    currentDeleteTarget = null;
  }
}

// ==========================================================================
// GENERAL SETTINGS CONTROLLER
// ==========================================================================
function populateSettingsForm() {
  const wa = document.getElementById("setting-whatsapp");
  const phone = document.getElementById("setting-phone");
  const email = document.getElementById("setting-email");
  const address = document.getElementById("setting-address");
  const hours = document.getElementById("setting-hours");
  const maps = document.getElementById("setting-maps");
  const ig = document.getElementById("setting-instagram");
  const tiktok = document.getElementById("setting-tiktok");
  const fb = document.getElementById("setting-facebook");

  if (wa) wa.value = generalSettings.whatsapp || "";
  if (phone) phone.value = generalSettings.phone || "";
  if (email) email.value = generalSettings.email || "";
  if (address) address.value = generalSettings.address || "";
  if (hours) hours.value = generalSettings.hours || "";
  if (maps) maps.value = generalSettings.mapsUrl || "";
  if (ig) ig.value = generalSettings.instagram || "";
  if (tiktok) tiktok.value = generalSettings.tiktok || "";
  if (fb) fb.value = generalSettings.facebook || "";
}

async function handleSaveSettings(e) {
  e.preventDefault();

  const settingsData = {
    whatsapp: document.getElementById("setting-whatsapp").value.trim(),
    phone: document.getElementById("setting-phone").value.trim(),
    email: document.getElementById("setting-email").value.trim(),
    address: document.getElementById("setting-address").value.trim(),
    hours: document.getElementById("setting-hours").value.trim(),
    mapsUrl: document.getElementById("setting-maps").value.trim(),
    instagram: document.getElementById("setting-instagram").value.trim(),
    tiktok: document.getElementById("setting-tiktok").value.trim(),
    facebook: document.getElementById("setting-facebook").value.trim(),
    updatedAt: new Date().toISOString()
  };

  const saveBtn = document.getElementById("btn-save-settings");
  saveBtn.disabled = true;

  try {
    if (db) {
      await setDoc(doc(db, "settings", "general"), settingsData, { merge: true });
      showToast("success", "Pengaturan Disimpan", "Informasi kontak dan media sosial berhasil diperbarui di cloud.");
    } else {
      generalSettings = { ...generalSettings, ...settingsData };
      showToast("info", "Disimpan Lokal", "Pengaturan disimpan di memori browser.");
    }
  } catch (err) {
    console.error("Save settings error:", err);
    showToast("danger", "Gagal Menyimpan", err.message);
  } finally {
    saveBtn.disabled = false;
  }
}

// ==========================================================================
// 1-CLICK MIGRATION & SEEDER
// ==========================================================================
async function handleStartMigration() {
  const btn = document.getElementById("btn-start-migration");
  const progressBox = document.getElementById("migration-progress-box");
  const progressBar = document.getElementById("migration-progress-bar");
  const progressPercent = document.getElementById("migration-progress-percent");
  const progressStatus = document.getElementById("migration-progress-status");

  if (!db) {
    showToast("warning", "Firebase Belum Aktif", "Pastikan Firebase sudah terkonfigurasi sebelum migrasi data.");
    return;
  }

  btn.disabled = true;
  progressBox.style.display = "block";
  progressBar.style.width = "0%";
  progressPercent.textContent = "0%";
  progressStatus.textContent = "Menyiapkan migrasi 46 motor & 9 testimoni...";

  try {
    const totalItems = DEFAULT_PRODUCTS.length + DEFAULT_TESTIMONIALS.length + 1;
    let completed = 0;

    // 1. Migrate Products in Batches of 20
    const chunkSize = 20;
    for (let i = 0; i < DEFAULT_PRODUCTS.length; i += chunkSize) {
      const chunk = DEFAULT_PRODUCTS.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      chunk.forEach(p => {
        const docRef = doc(db, "products", p.id || ("prod-" + Math.random().toString(36).substring(2, 9)));
        batch.set(docRef, {
          ...p,
          priceCash: p.otr_price,
          priceCredit: (p.installments && p.installments[0] && p.installments[0].rates) ? p.installments[0].rates["35"] : 0,
          tenor: 35,
          createdAt: serverTimestamp(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });

      await batch.commit();
      completed += chunk.length;

      const pct = Math.round((completed / totalItems) * 100);
      progressBar.style.width = `${pct}%`;
      progressPercent.textContent = `${pct}%`;
      progressStatus.textContent = `Mengunggah produk ${completed} dari ${DEFAULT_PRODUCTS.length}...`;
    }

    // 2. Migrate Testimonials
    const testiBatch = writeBatch(db);
    DEFAULT_TESTIMONIALS.forEach((t, idx) => {
      const docRef = doc(db, "testimonials", t.id || `testi-${idx + 1}`);
      testiBatch.set(docRef, {
        ...t,
        createdAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    });
    await testiBatch.commit();
    completed += DEFAULT_TESTIMONIALS.length;

    // 3. Migrate Settings
    await setDoc(doc(db, "settings", "general"), {
      ...DEFAULT_SETTINGS,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    completed += 1;

    progressBar.style.width = "100%";
    progressPercent.textContent = "100%";
    progressStatus.textContent = "Migrasi 100% Selesai!";

    showToast("success", "Migrasi Sukses", "46 produk Honda dan 9 testimoni telah berhasil tersimpan di Firestore.");
  } catch (err) {
    console.error("Migration error:", err);
    progressStatus.textContent = "Terjadi kesalahan: " + err.message;
    showToast("danger", "Gagal Migrasi", err.message);
  } finally {
    btn.disabled = false;
  }
}

// EXPORT BACKUP JSON
function handleExportBackup() {
  const backupData = {
    exportDate: new Date().toISOString(),
    products: productsList,
    testimonials: testimonialsList,
    settings: generalSettings
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `Backup_YusufSelamatMotor_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast("success", "Cadangan Diunduh", "File JSON cadangan database berhasil disimpan.");
}

// ==========================================================================
// FIREBASE CONFIG CONTROLLER
// ==========================================================================
function populateConfigForm() {
  const cfg = getActiveFirebaseConfig();
  const apiKey = document.getElementById("cfg-apiKey");
  const projectId = document.getElementById("cfg-projectId");
  const authDomain = document.getElementById("cfg-authDomain");
  const storageBucket = document.getElementById("cfg-storageBucket");
  const appId = document.getElementById("cfg-appId");

  if (apiKey) apiKey.value = cfg.apiKey || "";
  if (projectId) projectId.value = cfg.projectId || "yusuf-selamat-motor";
  if (authDomain) authDomain.value = cfg.authDomain || "yusuf-selamat-motor.firebaseapp.com";
  if (storageBucket) storageBucket.value = cfg.storageBucket || "yusuf-selamat-motor.appspot.com";
  if (appId) appId.value = cfg.appId || "";
}

function handleSaveFirebaseConfig(e) {
  e.preventDefault();

  const newConfig = {
    apiKey: document.getElementById("cfg-apiKey").value.trim(),
    projectId: document.getElementById("cfg-projectId").value.trim(),
    authDomain: document.getElementById("cfg-authDomain").value.trim(),
    storageBucket: document.getElementById("cfg-storageBucket").value.trim(),
    appId: document.getElementById("cfg-appId").value.trim()
  };

  saveCustomFirebaseConfig(newConfig);
  showToast("success", "Konfigurasi Disimpan", "Halaman akan dimuat ulang untuk menghubungkan kredensial baru.");
  setTimeout(() => {
    window.location.reload();
  }, 1200);
}

// ==========================================================================
// MODAL & TOAST HELPERS
// ==========================================================================
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("active");
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
}

export function showToast(type = "info", title = "", message = "") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconSvg = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    danger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
  }[type] || "";

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// IMAGE COMPRESSION HELPER (Canvas to Base64)
function compressImageFile(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// EXPORT TO GLOBAL SCOPE FOR INLINE ONCLICK HANDLERS
window.adminApp = {
  switchTab,
  openProductModal,
  openBulkPriceModal,
  openTestimonialModal,
  confirmDelete,
  closeModal,
  showToast
};
