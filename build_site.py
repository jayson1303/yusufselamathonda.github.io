import json
import os

json_path = r"D:\ajay\PROJECT YUSUF\products.json"
workspace_dir = r"D:\ajay\PROJECT YUSUF"

# Load the products JSON data
with open(json_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

# Helper function to generate variants with beautiful color names and hex values based on model name
def get_variants(folder, images):
    folder_upper = folder.upper()
    variants = []
    
    # Pre-defined colors for each series
    beat_colors = [
        {"colorName": "Funk Red Black", "hex": "#cc1d24"},
        {"colorName": "Hard Rock Black", "hex": "#1a1a1a"},
        {"colorName": "Dance White", "hex": "#ffffff"},
        {"colorName": "Garage Matte Black", "hex": "#2d2d2d"},
        {"colorName": "Deluxe Blue", "hex": "#1565c0"},
        {"colorName": "Deluxe Green", "hex": "#2e7d32"},
        {"colorName": "Deluxe Dark Silver", "hex": "#757575"},
        {"colorName": "Deluxe Black", "hex": "#121212"}
    ]
    
    beat_street_colors = [
        {"colorName": "Street Black", "hex": "#1c1c1c"},
        {"colorName": "Street Silver", "hex": "#b0bec5"},
        {"colorName": "Street Matte Blue", "hex": "#1e3d59"},
        {"colorName": "Street Matte Gray", "hex": "#5e6e7a"},
        {"colorName": "Street Matte Red", "hex": "#9e2a2b"},
        {"colorName": "Street Matte Yellow", "hex": "#ffd54f"}
    ]
    
    genio_colors = [
        {"colorName": "Radiant Red Black", "hex": "#cc1d24"},
        {"colorName": "Radiant Black", "hex": "#1a1a1a"},
        {"colorName": "Fabulous Matte Black", "hex": "#262626"},
        {"colorName": "Fabulous Matte Brown", "hex": "#5d4037"},
        {"colorName": "Radiant Blue Black", "hex": "#1e3d59"}
    ]
    
    scoopy_colors = [
        {"colorName": "Fashion Blue", "hex": "#1a73e8"},
        {"colorName": "Fashion Brown", "hex": "#795548"},
        {"colorName": "Fashion Red", "hex": "#d32f2f"},
        {"colorName": "Fashion Black", "hex": "#212121"},
        {"colorName": "Stylish Red", "hex": "#c2185b"},
        {"colorName": "Stylish Green", "hex": "#1b5e20"},
        {"colorName": "Prestige White", "hex": "#ffffff"},
        {"colorName": "Prestige Black", "hex": "#0a0a0a"}
    ]
    
    stylo_colors = [
        {"colorName": "Royal Matte Black", "hex": "#1f1f1f"},
        {"colorName": "Glam Beige", "hex": "#d7ccc8"},
        {"colorName": "Royal Matte White", "hex": "#eceff1"},
        {"colorName": "Glam Black", "hex": "#111111"},
        {"colorName": "Royal Matte Green", "hex": "#2e4a3f"}
    ]
    
    vario_colors = [
        {"colorName": "Active Black", "hex": "#1c1c1c"},
        {"colorName": "Sporty Red", "hex": "#d32f2f"},
        {"colorName": "Matte Blue", "hex": "#1a237e"},
        {"colorName": "Matte Silver", "hex": "#cfd8dc"},
        {"colorName": "Matte Black", "hex": "#263238"},
        {"colorName": "Active Matte Blue", "hex": "#0d47a1"},
        {"colorName": "Active Matte Black", "hex": "#212121"},
        {"colorName": "Active Matte Red", "hex": "#d32f2f"},
        {"colorName": "Nitro Matte Blue", "hex": "#0f2027"},
        {"colorName": "Nitro Matte Black", "hex": "#203a43"}
    ]
    
    # Pick list based on match
    color_pool = beat_colors
    if "BEAT STREET" in folder_upper:
        color_pool = beat_street_colors
    elif "BEAT" in folder_upper:
        color_pool = beat_colors
    elif "GENIO" in folder_upper:
        color_pool = genio_colors
    elif "SCOOPY" in folder_upper:
        color_pool = scoopy_colors
    elif "STYLO" in folder_upper:
        color_pool = stylo_colors
    elif "VARIO" in folder_upper:
        color_pool = vario_colors
        
    for i, img in enumerate(images):
        if i < len(color_pool):
            c_info = color_pool[i]
            variants.append({
                "colorName": c_info["colorName"],
                "hex": c_info["hex"],
                "image": img
            })
        else:
            variants.append({
                "colorName": f"Varian {i+1}",
                "hex": f"hsl({(i * 137.5) % 360:.0f}, 60%, 50%)",
                "image": img
            })
    return variants

# Update each product in the array with variants
for p in products:
    p["variants"] = get_variants(p["folder"], p["images"])

# Convert modified products database to clean JSON string
products_db_js = json.dumps(products, indent=2)

# --- index.html CONTENT ---
html_content = """<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YUSUF SELAMAT MOTOR HONDA - Katalog Resmi Promo Cash & Cicilan Murah</title>
    <meta name="description" content="Katalog resmi sepeda motor Honda terbaru di Yusuf Selamat Motor Honda. Dapatkan penawaran harga cash dan cicilan murah dengan DP ringan dan tenor hingga 35 bulan. Pesan mudah via WhatsApp.">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Separate CSS Link -->
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <!-- Header / Navbar -->
    <header class="header">
        <div class="header__container">
            <a href="#" class="header__logo">
                <svg class="header__logo-icon" viewBox="0 0 24 24" fill="currentColor">
                    <!-- Wing shape silhouette for clean minimalist aesthetic -->
                    <path d="M2.5,3.5 C5.5,3.5 12,5.5 18,10.5 C20.5,12.5 22,14.5 22,16.5 C22,18 20.5,19 18.5,19 C15,19 10.5,15.5 6,11 C4.5,9.5 3,7.5 2.5,3.5 M4,5.5 C4.5,8 6,10 7.5,11.5 C11.5,15.5 15.5,18 18.5,18 C19.5,18 20.5,17.5 20.5,16.5 C20.5,15 19.5,13.5 17,11.5 C12,7 6.5,5 4,5.5 Z" />
                    <path d="M3.5,7 C6,7 11.5,8.5 16,12.5 C18,14.2 19,15.8 19,17 C19,18 18,18.5 17,18.5 C14.2,18.5 10.5,15.8 6.8,12 C5.5,10.8 4.2,9.2 3.5,7 Z" opacity="0.8" />
                    <path d="M4.5,10.5 C6.5,10.5 10.5,11.8 13.8,14.8 C15.2,16.1 16,17.2 16,18 C16,18.6 15.2,19 14.5,19 C12.2,19 9.2,17 6.2,13.8 C5.2,12.8 4.7,11.8 4.5,10.5 Z" opacity="0.6" />
                </svg>
                <span class="header__logo-text">YUSUF SELAMAT<span class="header__logo-text--highlight"> MOTOR HONDA</span></span>
            </a>
            
            <nav class="header__nav" id="js-nav-menu">
                <ul class="header__nav-list">
                    <li><a href="#" class="header__nav-link active">Beranda</a></li>
                    <li><a href="#katalog" class="header__nav-link">Katalog</a></li>
                    <li><a href="#tentang" class="header__nav-link">Tentang Kami</a></li>
                    <li><a href="#testimoni" class="header__nav-link">Testimoni</a></li>
                    <li><a href="#kontak" class="header__nav-link">Kontak</a></li>
                </ul>
            </nav>
            
            <div class="header__actions">
                <a href="#kontak" class="header__cta-btn">Hubungi Kami</a>
                <button class="header__toggle" id="js-menu-toggle" aria-label="Toggle Menu">
                    <svg class="header__toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <line x1="4" y1="6" x2="20" y2="6" id="js-line-1"></line>
                        <line x1="4" y1="12" x2="20" y2="12" id="js-line-2"></line>
                        <line x1="4" y1="18" x2="20" y2="18" id="js-line-3"></line>
                    </svg>
                </button>
            </div>
        </div>
    </header>

    <!-- Hero Showcase Section -->
    <section class="hero">
        <div class="hero__container">
            <div class="hero__content">
                <span class="hero__tagline">DEALER PARTNER MOTOR HONDA</span>
                <h1 class="hero__title">Miliki Motor Impian Anda Hari Ini</h1>
                <p class="hero__desc">
                    Nikmati kemudahan pembelian secara Cash maupun Cicilan dengan suku bunga rendah, persyaratan mudah, dan proses pengajuan cepat yang siap dibantu hingga unit dikirim ke rumah Anda.
                </p>
                <div class="hero__ctas">
                    <a href="#katalog" class="btn btn--primary">Lihat Katalog</a>
                    <a href="#tentang" class="btn btn--outline">Pelajari Lebih Lanjut</a>
                </div>
            </div>
            
            <div class="hero__visual">
                <div class="hero__glow"></div>
                <!-- Featured Product: Stylo 160 or Vario 160 -->
                <img src="Foto Produk/ALL NEW STYLO CBS/WhatsApp Image 2026-07-02 at 11.09.38.jpeg" alt="Honda Stylo 160 Showcase" class="hero__img" onerror="this.src='Foto Produk/ALL NEW STYLO ABS/WhatsApp Image 2026-07-02 at 11.10.51.jpeg';">
                <div class="hero__badge">
                    <span class="hero__badge-label">Model Unggulan</span>
                    <span class="hero__badge-name">All New Stylo 160</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Tentang Kami & Mengapa Kami (Combined Section) -->
    <section class="about-why-us" id="tentang">
        <div class="about-why-us__container">
            <div class="section-header">
                <span class="section-tag">Yusuf Selamat Motor Honda</span>
                <h2 class="section-title">Tentang Kami</h2>
                <div class="section-divider"></div>
            </div>
            
            <div class="about-why-us__layout">
                <!-- Left Column: Gambar -->
                <div class="about-why-us__col-left">
                    <div class="about__image-wrapper">
                        <img src="tambahan tentang kami/WhatsApp Image 2026-07-03 at 18.30.10_cropped.jpeg" alt="Yusuf Selamat Motor Honda" class="about__img">
                    </div>
                </div>
                
                <!-- Right Column: Keunggulan Layanan -->
                <div class="about-why-us__col-right">
                    <div class="about-why-us__cards-stack">
                        <!-- Benefit Item 1 -->
                        <div class="benefit-card">
                            <div class="benefit-card__icon-wrapper">
                                <svg class="benefit-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                            </div>
                            <div class="benefit-card__content-text">
                                <h3 class="benefit-card__title">Proses Kilat & Mudah</h3>
                                <p class="benefit-card__desc">Persyaratan praktis, pengajuan cepat, data dijemput, dan unit motor langsung dikirim ke garasi Anda.</p>
                            </div>
                        </div>
                        
                        <!-- Benefit Item 2 -->
                        <div class="benefit-card">
                            <div class="benefit-card__icon-wrapper">
                                <svg class="benefit-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                                    <line x1="12" y1="18" x2="12" y2="18"></line>
                                    <line x1="2" y1="10" x2="22" y2="10"></line>
                                </svg>
                            </div>
                            <div class="benefit-card__content-text">
                                <h3 class="benefit-card__title">Uang Muka & Cicilan Ringan</h3>
                                <p class="benefit-card__desc">Pilihan uang muka (DP) murah serta suku bunga angsuran bersaing dengan berbagai pilihan tenor terbaik.</p>
                            </div>
                        </div>
                        
                        <!-- Benefit Item 3 -->
                        <div class="benefit-card">
                            <div class="benefit-card__icon-wrapper">
                                <svg class="benefit-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                </svg>
                            </div>
                            <div class="benefit-card__content-text">
                                <h3 class="benefit-card__title">Dealer & Garansi Resmi</h3>
                                <p class="benefit-card__desc">Jaminan unit motor 100% baru dan orisinal dilengkapi buku servis serta garansi mesin langsung dari Astra Honda Motor.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Product Catalogue Section -->
    <section class="catalogue" id="katalog">
        <div class="catalogue__container">
            <div class="section-header">
                <span class="section-tag">Pilih Motor Anda</span>
                <h2 class="section-title">Katalog Motor Honda Terbaru</h2>
                <div class="section-divider"></div>
            </div>
            
            <!-- Filter and Search Bar -->
            <div class="catalogue__controls">
                <div class="catalogue__filters-wrapper">
                    <div class="catalogue__filters" id="js-filters-container">
                        <button class="filter-btn active" data-category="all">Semua</button>
                        <button class="filter-btn" data-category="Beat Series">Beat Series</button>
                        <button class="filter-btn" data-category="Genio Series">Genio Series</button>
                        <button class="filter-btn" data-category="Scoopy Series">Scoopy Series</button>
                        <button class="filter-btn" data-category="Vario Series">Vario Series</button>
                        <button class="filter-btn" data-category="Stylo Series">Stylo Series</button>
                        <button class="filter-btn" data-category="PCX Series">PCX Series</button>
                        <button class="filter-btn" data-category="ADV Series">ADV Series</button>
                        <button class="filter-btn" data-category="Sport Series">Sport Series</button>
                        <button class="filter-btn" data-category="Bebek Series">Bebek Series</button>
                        <button class="filter-btn" data-category="Premium Series">Premium Series</button>
                    </div>
                </div>
                
                <div class="catalogue__search-box">
                    <svg class="catalogue__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="js-search-input" placeholder="Cari tipe motor Honda..." class="catalogue__search-input">
                </div>
            </div>
            
            <!-- Products Grid -->
            <div class="catalogue__grid" id="js-products-grid">
                <!-- Products will be dynamically generated by JS -->
                <div class="loading-state"> Memuat katalog produk... </div>
            </div>
        </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials" id="testimoni">
        <div class="testimonials__container">
            <div class="section-header">
                <span class="section-tag">Ulasan Pembeli & Dokumentasi</span>
                <h2 class="section-title">Ulasan dan Dokumentasi</h2>
                <div class="section-divider"></div>
            </div>
            
            <div class="testimonials__grid" id="js-testimonials-grid">
                <!-- Testimonials generated by JS -->
            </div>
        </div>
    </section>

    <!-- Contact & Map Section -->
    <section class="contact" id="kontak">
        <div class="contact__container">
            <div class="contact__info">
                <span class="section-tag">Hubungi Kami</span>
                <h2 class="contact__title">Kunjungi Showroom Kami atau Hubungi Kami</h2>
                <p class="contact__desc">
                    Layanan konsultasi skema simulasi cicilan gratis. Marketing kami siap melayani pemesanan online Anda kapan saja dengan respon yang ramah dan solutif.
                </p>
                
                <div class="contact__list">
                    <!-- WhatsApp -->
                    <div class="contact-item">
                        <div class="contact-item__icon-wrapper">
                            <svg class="contact-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                        </div>
                        <div class="contact-item__details">
                            <span class="contact-item__label">WhatsApp Chat Marketing</span>
                            <a href="#" class="contact-item__link" id="js-whatsapp-link" target="_blank">+62 831-6389-5963</a>
                        </div>
                    </div>
                    
                    <!-- Email -->
                    <div class="contact-item">
                        <div class="contact-item__icon-wrapper">
                            <svg class="contact-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </div>
                        <div class="contact-item__details">
                            <span class="contact-item__label">Email Kami</span>
                            <a href="mailto:info@yusufselamatmotorhonda.com" class="contact-item__link">info@yusufselamatmotorhonda.com</a>
                        </div>
                    </div>
                    
                    <!-- Alamat -->
                    <div class="contact-item">
                        <div class="contact-item__icon-wrapper">
                            <svg class="contact-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>
                        <div class="contact-item__details">
                            <span class="contact-item__label">Lokasi Showroom</span>
                            <span class="contact-item__text">Jl. Siliwangi No. 109, Pelabuhanratu, Kec. Pelabuhanratu, Kabupaten Sukabumi, Jawa Barat 43311</span>
                        </div>
                    </div>
                    
                    <!-- Jam Operasional -->
                    <div class="contact-item">
                        <div class="contact-item__icon-wrapper">
                            <svg class="contact-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <div class="contact-item__details">
                            <span class="contact-item__label">Jam Operasional</span>
                            <span class="contact-item__text">Senin - Sabtu: 08.00 - 17.00 | Minggu: Tutup</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact__map-wrapper">
                <!-- Google Maps Iframe styled clean and minimal -->
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.1776201526086!2d106.54578222403664!3d-6.988348168436355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e76c7d25d38fe7f%3A0x3ddb854a3cc1973b!2sDealer%20Selamat%20Motor%20Palabuhanratu!5e0!3m2!1sen!2sid!4v1783151669093!5m2!1sen!2sid" 
                        class="contact__map" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" id="js-map-iframe"></iframe>
            </div>
        </div>
    </section>

    <!-- Social Media Section -->
    <section class="socials">
        <div class="socials__container">
            <span class="socials__tag">Terhubung Dengan Kami</span>
            <h3 class="socials__title">Ikuti Akun Sosial Media Resmi Kami</h3>
            
            <div class="socials__grid">
                <!-- Instagram -->
                <a href="https://www.instagram.com/yusuf_selamatmotor?igsh=MWdxNW42YXBueXZpMA%3D%3D&utm_source=qr" target="_blank" class="social-btn" aria-label="Instagram">
                    <svg class="social-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span class="social-btn__name">Instagram</span>
                </a>
                
                <!-- TikTok -->
                <a href="https://www.tiktok.com/@yusufselamatmotor_plara?_r=1&_t=ZS-97iurYNtYv3" target="_blank" class="social-btn" aria-label="TikTok">
                    <svg class="social-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                    </svg>
                    <span class="social-btn__name">TikTok</span>
                </a>
                
                <!-- Facebook -->
                <a href="https://www.facebook.com/share/1EjKoUKHzs/?mibextid=wwXIfr" target="_blank" class="social-btn" aria-label="Facebook">
                    <svg class="social-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                    <span class="social-btn__name">Facebook</span>
                </a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer__container">
            <div class="footer__brand-col">
                <a href="#" class="footer__logo">
                    <svg class="footer__logo-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.5,3.5 C5.5,3.5 12,5.5 18,10.5 C20.5,12.5 22,14.5 22,16.5 C22,18 20.5,19 18.5,19 C15,19 10.5,15.5 6,11 C4.5,9.5 3,7.5 2.5,3.5 M4,5.5 C4.5,8 6,10 7.5,11.5 C11.5,15.5 15.5,18 18.5,18 C19.5,18 20.5,17.5 20.5,16.5 C20.5,15 19.5,13.5 17,11.5 C12,7 6.5,5 4,5.5 Z" />
                    </svg>
                    <span>YUSUF SELAMAT<span class="footer__logo-text--highlight"> MOTOR HONDA</span></span>
                </a>
                <p class="footer__desc">
                    Dealer Partner Resmi Motor Honda. Menyediakan berbagai model motor matic Honda terbaru dengan harga kompetitif, layanan cicilan terpercaya, dan jaminan purna jual berkualitas.
                </p>
            </div>
            
            <div class="footer__links-col">
                <h4 class="footer__title">Tautan Cepat</h4>
                <ul class="footer__links">
                    <li><a href="#">Beranda</a></li>
                    <li><a href="#katalog">Katalog Produk</a></li>
                    <li><a href="#tentang">Tentang Kami</a></li>
                    <li><a href="#testimoni">Ulasan Konsumen</a></li>
                    <li><a href="#kontak">Hubungi Kami</a></li>
                </ul>
            </div>
            
            <div class="footer__socials-col">
                <h4 class="footer__title">Sosial Media</h4>
                <div class="footer__social-icons">
                    <a href="https://www.instagram.com/yusuf_selamatmotor?igsh=MWdxNW42YXBueXZpMA%3D%3D&utm_source=qr" target="_blank" aria-label="Instagram">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                    <a href="https://www.tiktok.com/@yusufselamatmotor_plara?_r=1&_t=ZS-97iurYNtYv3" target="_blank" aria-label="TikTok">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                        </svg>
                    </a>
                    <a href="https://www.facebook.com/share/1EjKoUKHzs/?mibextid=wwXIfr" target="_blank" aria-label="Facebook">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
        
        <div class="footer__bottom">
            <div class="footer__bottom-container">
                <p class="footer__copyright">&copy; 2026 Yusuf Selamat Motor Honda. Hak Cipta Dilindungi Undang-Undang.</p>
                <p class="footer__note">Situs ini adalah katalog promosi mandiri dealer partner resmi motor Honda. Harga dan ketersediaan unit dapat berubah sewaktu-waktu.</p>
            </div>
        </div>
    </footer>

    <!-- Product Details Modal Overlay -->
    <div class="modal-overlay" id="js-modal">
        <div class="modal-card">
            <button class="modal-card__close-btn" id="js-modal-close" aria-label="Tutup Detail">
                <svg class="modal-card__close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            
            <div class="modal-card__body">
                <!-- Gallery Column -->
                <div class="modal-card__gallery">
                    <!-- Motor Gallery Container -->
                    <div id="js-modal-gallery-images" class="modal-gallery-images active">
                        <div class="modal-card__main-img-container">
                            <img src="" alt="" class="modal-card__main-img" id="js-modal-main-img">
                        </div>
                        <div class="modal-card__thumbnails" id="js-modal-thumbnails">
                            <!-- Thumbnail items will be dynamically generated -->
                        </div>
                    </div>
                    
                    <!-- Motor Name and Category (Moved here) -->
                    <div class="modal-card__brand-header" style="margin-top: 20px; border-top: 1px solid var(--border); padding-top: 16px; display: flex; flex-direction: column; align-items: flex-start;">
                        <span class="modal-card__category" id="js-modal-category" style="margin-bottom: 4px;">Beat Series</span>
                        <h2 class="modal-card__title" id="js-modal-title" style="margin-bottom: 0; font-size: 24px;">All New Beat CBS</h2>
                    </div>
                </div>
                
                <!-- Details/Configurator Column -->
                <div class="modal-card__details">
                    
                    <p class="modal-card__desc" id="js-modal-desc">
                        Sepeda motor matic handal dengan konsumsi bahan bakar yang sangat hemat, dibekali teknologi rangka eSAF terbaru untuk kenyamanan manuver yang maksimal.
                    </p>
                    
                    <!-- Color Swatches Selection -->
                    <div class="modal-card__section">
                        <span class="modal-card__section-label">Pilih Warna / Varian:</span>
                        <div class="variant-swatches" id="js-modal-swatches">
                            <!-- Swatches dynamically generated -->
                        </div>
                        <span class="variant-active-name" id="js-modal-active-variant-name">Funk Red Black</span>
                    </div>
                    
                    <!-- Payment Toggle (Cash vs Cicilan) -->
                    <div class="modal-card__section">
                        <span class="modal-card__section-label">Metode Pembayaran:</span>
                        <div class="payment-toggle" id="js-payment-toggle-container">
                            <div class="slider" id="js-payment-toggle-slider"></div>
                            <button type="button" class="active" id="js-toggle-cash">Harga Cash</button>
                            <button type="button" id="js-toggle-credit">Simulasi Kredit</button>
                        </div>
                    </div>
                    
                    <!-- Cash Details Panel -->
                    <div class="payment-panel active" id="js-panel-cash">
                        <div class="price-box">
                            <span class="price-box__label">Harga OTR Cash (Tunai)</span>
                            <span class="price-box__val" id="js-modal-cash-price">Rp 19.675.000</span>
                        </div>
                        <p class="payment-panel__note" style="margin-bottom: 12px;">Harga Cash sudah termasuk kepengurusan STNK dan BPKB plat wilayah setempat.</p>
                        <!-- Insurance Section in Cash Panel -->
                        <div class="cash-insurance-section" style="margin-top: 14px; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: #fdfdfd; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                            <h4 style="font-size: 13px; font-weight: 700; color: #cc1d24; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">
                                <span>🛡️</span> Proteksi Asuransi Cash (Gratis)
                            </h4>
                            <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 8px 0; line-height: 1.4;">
                                Pembelian tunai (Cash) otomatis mendapatkan perlindungan asuransi 12 bulan:
                            </p>
                            <ul style="list-style: none; padding: 0; margin: 0 0 10px 0; display: flex; flex-direction: column; gap: 5px; font-size: 10.5px; line-height: 1.35;">
                                <li style="display: flex; gap: 6px; align-items: flex-start;">
                                    <span style="color: #2e7d32; font-weight: bold;">✓</span>
                                    <span><strong>TLO (Total Loss Only):</strong> Ganti rugi kehilangan (pencurian/pembegalan) & kerusakan total ≥75%.</span>
                                </li>
                                <li style="display: flex; gap: 6px; align-items: flex-start;">
                                    <span style="color: #2e7d32; font-weight: bold;">✓</span>
                                    <span><strong>Kecelakaan Diri:</strong> Santunan finansial pengendara jika terjadi kecelakaan lalu lintas.</span>
                                </li>
                                <li style="display: flex; gap: 6px; align-items: flex-start;">
                                    <span style="color: #2e7d32; font-weight: bold;">✓</span>
                                    <span><strong>Klaim via Dealer:</strong> Proses klaim dibantu penuh oleh tim dealer kami secara cepat & mudah.</span>
                                </li>
                            </ul>
                            
                            <div style="border-top: 1px dashed var(--border); margin: 8px 0;"></div>
                            
                            <h5 style="font-size: 11px; font-weight: 700; color: var(--dark); margin: 0 0 6px 0; display: flex; align-items: center; gap: 4px;">
                                <span>📋</span> Daftar & Tarif Asuransi Cash:
                            </h5>
                            <!-- Scrollable rate list -->
                            <div class="insurance-rates-scroll" style="max-height: 140px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px; background: #f8f9fa;">
                                <!-- CUB -->
                                <div style="margin-bottom: 10px;">
                                    <div style="font-weight: 800; font-size: 9.5px; color: #0d6efd; text-transform: uppercase; border-bottom: 1px solid #0d6efd; padding-bottom: 2px; margin-bottom: 5px; letter-spacing: 0.02em;">CUB / BEBEK</div>
                                    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px; font-size: 10px;">
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>REVO FIT</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 600.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>SUPRA X 125 CW</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 750.000</span>
                                        </li>
                                    </ul>
                                </div>
                                <!-- MATIC -->
                                <div style="margin-bottom: 10px;">
                                    <div style="font-weight: 800; font-size: 9.5px; color: #0d6efd; text-transform: uppercase; border-bottom: 1px solid #0d6efd; padding-bottom: 2px; margin-bottom: 5px; letter-spacing: 0.02em;">MATIC</div>
                                    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px; font-size: 10px;">
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>BeAT SPORTY CBS</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 650.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>BeAT SPORTY DELUXE</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 700.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>BeAT STREET</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 700.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>GENIO CBS / ISS</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 700.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>SCOOPY Series</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 850.000 - 875.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>VARIO 125 Series</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 800.000 - 900.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>STYLO 160 CBS</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 1.000.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>STYLO 160 ABS</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 1.100.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>STYLO 160 ABS SE</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 1.150.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>PCX 160 CBS</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 950.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>PCX 160 ABS</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 1.050.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>ADV 160 CBS</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 1.100.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>ADV 160 ABS</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 1.250.000 - 1.350.000</span>
                                        </li>
                                    </ul>
                                </div>
                                <!-- SPORT -->
                                <div style="margin-bottom: 2px;">
                                    <div style="font-weight: 800; font-size: 9.5px; color: #0d6efd; text-transform: uppercase; border-bottom: 1px solid #0d6efd; padding-bottom: 2px; margin-bottom: 5px; letter-spacing: 0.02em;">SPORT & PREMIUM</div>
                                    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px; font-size: 10px;">
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>CB 150 VERZA</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 850.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>CB150R Series</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 1.200.000 - 1.300.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>CB150X Series</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 1.300.000 - 1.350.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>CRF 150</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 1.250.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>CBR150R Series</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 1.750.000 - 1.950.000</span>
                                        </li>
                                        <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dee2e6; padding-bottom: 2px;">
                                            <span>FORZA</span>
                                            <span style="font-weight: 700; color: #2e7d32;">Rp 3.500.000</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Credit Simulasi Panel -->
                    <div class="payment-panel" id="js-panel-credit">
                        <!-- Uang Muka Selector -->
                        <div class="form-group">
                            <label class="form-label" for="js-select-dp">Uang Muka (Down Payment):</label>
                            <div class="select-wrapper">
                                <select id="js-select-dp" class="select-input">
                                    <!-- Options generated dynamically -->
                                </select>
                            </div>
                        </div>
                        
                        <!-- Tenor / Jangka Waktu Grid -->
                        <div class="form-group">
                            <label class="form-label">Tenor & Angsuran per Bulan:</label>
                            <div class="tenor-grid" id="js-tenor-grid">
                                <!-- Tenor boxes generated dynamically -->
                            </div>
                        </div>
                        
                        <!-- Selected Summary Info -->
                        <div class="price-box">
                            <span class="price-box__label">Simulasi Angsuran per Bulan</span>
                            <span class="price-box__val" id="js-modal-installment-rate">Rp 885.000</span>
                            <span class="price-box__subtext" id="js-modal-installment-summary">Tenor 35 Bulan | Uang Muka Rp 2.000.000</span>
                        </div>
                    </div>
                    
                    <!-- Order CTA Button -->
                    <button class="btn btn--primary btn--large btn--icon-left modal-card__order-btn" id="js-order-btn">
                        <svg class="modal-card__btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        Hubungi via WhatsApp & Pesan Sekarang
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- JS Logic scripts -->
    <script src="script.js"></script>
</body>
</html>
"""

# --- style.css CONTENT ---
css_content = """/* CSS DESIGN SYSTEM - MINIMALIST MODERN ACCENT RED & WHITE */
:root {
    --primary: #e81c24; /* Honda Red */
    --primary-hover: #c41219;
    --primary-light: #fff5f5;
    --dark: #1f2937; /* Dark charcoal text */
    --text: #374151; /* Neutral dark gray body */
    --text-muted: #6b7280; /* Neutral light gray text */
    --bg-white: #ffffff;
    --bg-light: #fdfdfd;
    --bg-gray: #f4f4f5;
    --border: #e4e4e7;
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;
    --radius-full: 9999px;
    --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    --shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    --shadow-hover: 0 10px 30px rgba(232, 28, 36, 0.06);
    --max-width: 1200px;
}

/* CSS resets */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: var(--text);
    background-color: var(--bg-white);
    line-height: 1.6;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
}

a {
    color: inherit;
    text-decoration: none;
}

ul {
    list-style: none;
}

img {
    max-width: 100%;
    height: auto;
    display: block;
}

button, select {
    font-family: inherit;
}

/* Scrollbar Style */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
::-webkit-scrollbar-track {
    background: var(--bg-gray);
}
::-webkit-scrollbar-thumb {
    background: #d4d4d8;
    border-radius: var(--radius-full);
}
::-webkit-scrollbar-thumb:hover {
    background: #a1a1aa;
}

/* Reusable Components & Utilities */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 28px;
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition);
    border: none;
    outline: none;
    gap: 8px;
}

.btn--primary {
    background-color: var(--primary);
    color: var(--bg-white);
}

.btn--primary:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(232, 28, 36, 0.2);
}

.btn--outline {
    background-color: transparent;
    color: var(--dark);
    border: 1.5px solid var(--border);
}

.btn--outline:hover {
    background-color: var(--bg-gray);
    border-color: var(--dark);
    transform: translateY(-2px);
}

.btn--large {
    padding: 16px 36px;
    font-size: 16px;
    border-radius: var(--radius-md);
}

.btn--icon-left svg {
    width: 20px;
    height: 20px;
}

/* Section Header styling */
.section-header {
    text-align: center;
    margin-bottom: 48px;
}

.section-tag {
    display: inline-block;
    color: var(--primary);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 12px;
}

.section-title {
    font-size: 32px;
    font-weight: 800;
    color: var(--dark);
    letter-spacing: -0.02em;
}

.section-divider {
    width: 50px;
    height: 3px;
    background-color: var(--primary);
    margin: 16px auto 0;
    border-radius: var(--radius-full);
}

/* HEADER & NAVBAR */
.header {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    z-index: 100;
    transition: var(--transition);
}

.header__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 16px 24px;
}

.header__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 800;
    font-size: 20px;
    color: var(--dark);
    letter-spacing: -0.03em;
}

.header__logo-icon {
    width: 32px;
    height: 32px;
    color: var(--primary);
}

.header__logo-text--highlight {
    color: var(--primary);
    font-weight: 400;
}

.header__nav {
    display: flex;
}

.header__nav-list {
    display: flex;
    align-items: center;
    gap: 32px;
}

.header__nav-link {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted);
    transition: var(--transition);
    position: relative;
    padding: 8px 0;
}

.header__nav-link:hover,
.header__nav-link.active {
    color: var(--primary);
}

.header__nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--primary);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s ease;
}

.header__nav-link.active::after,
.header__nav-link:hover::after {
    transform: scaleX(1);
    transform-origin: left;
}

.header__actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.header__cta-btn {
    display: inline-block;
    background-color: var(--dark);
    color: var(--bg-white);
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 700;
    border-radius: var(--radius-md);
    transition: var(--transition);
}

.header__cta-btn:hover {
    background-color: var(--primary);
    transform: translateY(-1px);
}

.header__toggle {
    display: none;
    background: none;
    border: none;
    color: var(--dark);
    cursor: pointer;
    padding: 4px;
}

.header__toggle-icon {
    width: 24px;
    height: 24px;
}

/* HERO SHOWCASE */
.hero {
    background-image: linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url('background index atas/WhatsApp Image 2026-07-03 at 18.31.30.jpeg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    padding: 80px 24px;
    border-bottom: 1px solid var(--border);
    position: relative;
    overflow: hidden;
}

.hero__container {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 60px;
    align-items: center;
    max-width: var(--max-width);
    margin: 0 auto;
}

.hero__content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.hero__tagline {
    font-size: 13px;
    font-weight: 700;
    color: var(--primary);
    letter-spacing: 0.2em;
    margin-bottom: 16px;
    text-transform: uppercase;
}

.hero__title {
    font-size: 48px;
    font-weight: 800;
    line-height: 1.15;
    color: #ffffff;
    letter-spacing: -0.03em;
    margin-bottom: 24px;
}

.hero__desc {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.85);
    margin-bottom: 36px;
    max-width: 520px;
}

.hero__ctas {
    display: flex;
    gap: 16px;
}

.hero .btn--outline {
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.4);
}

.hero .btn--outline:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: #ffffff;
}

.hero__visual {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.hero__glow {
    position: absolute;
    width: 130%;
    height: 130%;
    background: radial-gradient(circle, rgba(232, 28, 36, 0.06) 0%, rgba(255, 255, 255, 0) 70%);
    z-index: 1;
}

.hero__img {
    position: relative;
    z-index: 2;
    max-height: 380px;
    object-fit: contain;
    filter: drop-shadow(0 20px 30px rgba(0,0,0,0.06));
    animation: float 6s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.hero__badge {
    position: absolute;
    bottom: 20px;
    left: 10px;
    background-color: var(--bg-white);
    padding: 12px 20px;
    border-radius: var(--radius-md);
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    z-index: 3;
}

.hero__badge-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.hero__badge-name {
    font-size: 14px;
    font-weight: 800;
    color: var(--dark);
    margin-top: 2px;
}

/* COMBINED ABOUT & WHY US SECTION */
.about-why-us {
    padding: 80px 24px;
    background-color: var(--bg-white);
    border-bottom: 1px solid var(--border);
}

.about-why-us__container {
    max-width: var(--max-width);
    margin: 0 auto;
}

.about-why-us__layout {
    display: flex;
    gap: 56px;
    align-items: stretch;
}

.about-why-us__col-left {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.about-why-us__col-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.about-why-us__cards-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* Redefine benefit-card for stacked horizontal layout */
.benefit-card {
    background-color: var(--bg-light);
    border: 1px solid var(--border);
    padding: 24px;
    border-radius: var(--radius-lg);
    transition: var(--transition);
    display: flex;
    gap: 20px;
    align-items: flex-start;
}

.benefit-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(232, 28, 36, 0.04);
    border-color: rgba(232, 28, 36, 0.2);
}

.benefit-card__icon-wrapper {
    background-color: var(--primary-light);
    color: var(--primary);
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    min-width: 48px;
}

.benefit-card__icon {
    width: 24px;
    height: 24px;
}

.benefit-card__content-text {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.benefit-card__title {
    font-size: 16px;
    font-weight: 700;
    color: var(--dark);
}

.benefit-card__desc {
    font-size: 13.5px;
    color: var(--text-muted);
    line-height: 1.5;
}

/* ABOUT CONTENT & IMAGE FOR RIGHT COLUMN */
.about__image-wrapper {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(232, 28, 36, 0.04);
    border: 4px solid var(--bg-white);
    margin-bottom: 0;
    width: 100%;
    max-width: 450px;
    aspect-ratio: 3 / 4;
    margin: 0 auto;
}

.about__img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition: var(--transition);
}

.about__img:hover {
    transform: scale(1.03);
}

.about__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.about__subtitle {
    font-size: 20px;
    font-weight: 700;
    color: var(--dark);
    line-height: 1.3;
}

.about__text {
    font-size: 14.5px;
    color: var(--text);
    line-height: 1.6;
}

.about__features {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
}

.about__feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--dark);
}

.about__feature-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    background-color: var(--primary-light);
    color: var(--primary);
    border-radius: var(--radius-full);
    font-size: 12px;
    font-weight: 800;
}

/* RESPONSIVE FOR COMBINED SECTION */
@media (max-width: 992px) {
    .about-why-us__layout {
        flex-direction: column;
        gap: 40px;
    }
    .about-why-us__col-left,
    .about-why-us__col-right {
        width: 100%;
    }
    .about__image-wrapper {
        aspect-ratio: 3 / 4;
        max-width: 400px;
        min-height: auto;
        height: auto;
        margin: 0 auto;
    }
}

.benefit-card__desc {
    font-size: 14px;
    color: var(--text-muted);
    line-height: 1.6;
}

/* CATALOGUE SECTION */
.catalogue {
    padding: 80px 24px;
    background-color: var(--bg-light);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
}

.catalogue__container {
    max-width: var(--max-width);
    margin: 0 auto;
}

.catalogue__controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;
    gap: 24px;
    flex-wrap: wrap;
}

.catalogue__filters-wrapper {
    flex: 1;
    overflow: hidden;
}

.catalogue__filters {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 6px;
    scrollbar-width: none; /* Firefox */
}

.catalogue__filters::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
}

.filter-btn {
    background: var(--bg-white);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 600;
    border-radius: var(--radius-full);
    cursor: pointer;
    white-space: nowrap;
    transition: var(--transition);
}

.filter-btn:hover {
    border-color: var(--dark);
    background-color: var(--bg-gray);
}

.filter-btn.active {
    background-color: var(--primary);
    color: var(--bg-white);
    border-color: var(--primary);
    box-shadow: 0 4px 10px rgba(232, 28, 36, 0.15);
}

.catalogue__search-box {
    position: relative;
    width: 320px;
}

.catalogue__search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: var(--text-muted);
    pointer-events: none;
}

.catalogue__search-input {
    width: 100%;
    background-color: var(--bg-white);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    padding: 12px 16px 12px 48px;
    font-size: 14px;
    color: var(--dark);
    outline: none;
    transition: var(--transition);
}

.catalogue__search-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(232, 28, 36, 0.08);
}

.catalogue__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    gap: 30px;
}

.loading-state,
.empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    font-size: 16px;
    color: var(--text-muted);
}

.empty-state-icon {
    width: 48px;
    height: 48px;
    color: var(--text-light);
    margin: 0 auto 16px;
}

/* PRODUCT CARD */
.product-card {
    background-color: var(--bg-white);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: var(--transition);
    display: flex;
    flex-direction: column;
}

.product-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-hover);
    border-color: rgba(232, 28, 36, 0.2);
}

.product-card__img-container {
    position: relative;
    background-color: var(--bg-gray);
    padding: 24px;
    height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.product-card__img {
    max-height: 160px;
    object-fit: contain;
    transition: transform 0.5s ease;
}

.product-card:hover .product-card__img {
    transform: scale(1.08);
}

.product-card__tag {
    position: absolute;
    top: 16px;
    left: 16px;
    background-color: var(--bg-white);
    color: var(--primary);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 6px 12px;
    border-radius: var(--radius-full);
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    border: 1px solid var(--border);
}

.product-card__content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    flex: 1;
}

.product-card__title {
    font-size: 18px;
    font-weight: 800;
    color: var(--dark);
    letter-spacing: -0.01em;
    margin-bottom: 8px;
}

.product-card__price-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 20px;
}

.product-card__price-cash {
    font-size: 16px;
    font-weight: 700;
    color: var(--primary);
}

.product-card__price-installment {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 500;
}

.product-card__btn {
    margin-top: auto;
    width: 100%;
    padding: 10px;
    font-size: 14px;
}

/* TESTIMONIALS SECTION */
.testimonials {
    padding: 80px 24px;
    background-color: var(--bg-white);
}

.testimonials__container {
    max-width: var(--max-width);
    margin: 0 auto;
}

.testimonials__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}

.testimonial-card {
    background-color: var(--bg-light);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: var(--transition);
}

.testimonial-card:hover {
    border-color: rgba(232, 28, 36, 0.2);
    box-shadow: var(--shadow);
    transform: translateY(-4px);
}

.testimonial-card__image-container {
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: var(--radius-md);
    margin-bottom: 8px;
}

.testimonial-card__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: var(--transition);
}

.testimonial-card__content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
}

.testimonial-card__content--empty {
    text-align: center;
    padding: 8px 0 4px;
    justify-content: center;
    align-items: center;
    display: flex;
}

.testimonial-card__caption {
    font-size: 13px;
    color: var(--text-muted);
    font-weight: 600;
}

@media (max-width: 992px) {
    .testimonials__grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 600px) {
    .testimonials__grid {
        grid-template-columns: 1fr;
    }
}

.testimonial-card__stars {
    display: flex;
    gap: 4px;
    color: #f59e0b; /* Amber star color */
}

.testimonial-card__star-icon {
    width: 16px;
    height: 16px;
    fill: currentColor;
}

.testimonial-card__text {
    font-size: 14px;
    color: var(--text);
    line-height: 1.6;
    font-style: italic;
}

.testimonial-card__user {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: auto;
}

.testimonial-card__avatar {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-full);
    background-color: var(--primary-light);
    color: var(--primary);
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid rgba(232, 28, 36, 0.1);
}

.testimonial-card__user-info {
    display: flex;
    flex-direction: column;
}

.testimonial-card__name {
    font-size: 14px;
    font-weight: 700;
    color: var(--dark);
}

.testimonial-card__location {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 500;
}

/* CONTACT & MAP SECTION */
.contact {
    padding: 80px 24px;
    background-color: var(--bg-light);
    border-top: 1px solid var(--border);
}

.contact__container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 50px;
    max-width: var(--max-width);
    margin: 0 auto;
    align-items: center;
}

.contact__info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.contact__title {
    font-size: 32px;
    font-weight: 800;
    color: var(--dark);
    margin-top: 8px;
    margin-bottom: 16px;
    letter-spacing: -0.02em;
}

.contact__desc {
    font-size: 15px;
    color: var(--text-muted);
    margin-bottom: 32px;
}

.contact__list {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
}

.contact-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
}

.contact-item__icon-wrapper {
    width: 44px;
    height: 44px;
    background-color: var(--bg-white);
    border: 1px solid var(--border);
    color: var(--primary);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.contact-item__icon {
    width: 20px;
    height: 20px;
}

.contact-item__details {
    display: flex;
    flex-direction: column;
}

.contact-item__label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
}

.contact-item__link {
    font-size: 16px;
    font-weight: 700;
    color: var(--dark);
    transition: var(--transition);
}

.contact-item__link:hover {
    color: var(--primary);
}

.contact-item__text {
    font-size: 15px;
    font-weight: 600;
    color: var(--dark);
}

.contact__map-wrapper {
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1.5px solid var(--border);
    box-shadow: var(--shadow);
    height: 380px;
}

.contact__map {
    width: 100%;
    height: 100%;
    border: none;
}

/* SOCIAL MEDIA SHOWCASE */
.socials {
    padding: 60px 24px;
    background-color: var(--bg-white);
    border-top: 1px solid var(--border);
    text-align: center;
}

.socials__container {
    max-width: var(--max-width);
    margin: 0 auto;
}

.socials__tag {
    font-size: 12px;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    display: block;
    margin-bottom: 8px;
}

.socials__title {
    font-size: 24px;
    font-weight: 800;
    color: var(--dark);
    margin-bottom: 32px;
}

.socials__grid {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: 1px solid var(--border);
    background-color: var(--bg-white);
    padding: 16px;
    border-radius: var(--radius-md);
    font-weight: 700;
    font-size: 14px;
    color: var(--dark);
    transition: var(--transition);
    min-width: 180px;
}

.social-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow);
}

.social-btn__icon {
    width: 20px;
    height: 20px;
}

/* FOOTER styling */
.footer {
    background-color: var(--dark);
    color: #e5e7eb;
    padding: 80px 24px 0;
    border-top: 1px solid #2d3748;
}

.footer__container {
    max-width: var(--max-width);
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: 60px;
    padding-bottom: 60px;
}

.footer__brand-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.footer__logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    font-size: 20px;
    color: var(--bg-white);
    margin-bottom: 20px;
}

.footer__logo-icon {
    width: 28px;
    height: 28px;
    color: var(--primary);
}

.footer__logo-text--highlight {
    color: var(--primary);
    font-weight: 400;
}

.footer__desc {
    font-size: 14px;
    color: #9ca3af;
    line-height: 1.6;
}

.footer__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--bg-white);
    margin-bottom: 24px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.footer__links {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.footer__links a {
    font-size: 14px;
    color: #9ca3af;
    transition: var(--transition);
}

.footer__links a:hover {
    color: var(--bg-white);
    padding-left: 4px;
}

.footer__social-icons {
    display: flex;
    gap: 12px;
}

.footer__social-icons a {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background-color: #2d3748;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
    border: 1px solid transparent;
}

.footer__social-icons a:hover {
    color: var(--bg-white);
    background-color: var(--primary);
    border-color: var(--primary);
}

.footer__social-icons svg {
    width: 18px;
    height: 18px;
}

.footer__bottom {
    border-top: 1px solid #2d3748;
    padding: 30px 24px;
    text-align: center;
}

.footer__bottom-container {
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.footer__copyright {
    font-size: 13px;
    color: #9ca3af;
}

.footer__note {
    font-size: 11px;
    color: #6b7280;
    line-height: 1.5;
}

/* PRODUCT DETAIL MODAL */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
    padding: 24px;
}

.modal-overlay.active {
    opacity: 1;
    pointer-events: auto;
}

.modal-card {
    background-color: var(--bg-white);
    width: 100%;
    max-width: 960px;
    max-height: calc(100vh - 48px);
    border-radius: var(--radius-lg);
    overflow: hidden;
    position: relative;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    border: 1px solid var(--border);
    transform: scale(0.95) translateY(20px);
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: flex;
    flex-direction: column;
}

.modal-overlay.active .modal-card {
    transform: scale(1) translateY(0);
}

.modal-card__close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full);
    background-color: var(--bg-white);
    border: 1px solid var(--border);
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: var(--transition);
}

.modal-card__close-btn:hover {
    color: var(--primary);
    border-color: var(--primary);
    transform: rotate(90deg);
}

.modal-card__close-icon {
    width: 18px;
    height: 18px;
}

.modal-card__body {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    height: 100%;
    overflow: hidden;
}

.modal-card__gallery {
    background-color: var(--bg-gray);
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 16px;
    border-right: 1px solid var(--border);
    overflow-y: auto;
}

/* Gallery/Insurance Tabs */
.modal-gallery-tabs {
    display: flex;
    width: 100%;
    background-color: var(--bg-white);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    margin-bottom: 8px;
}

.gallery-tab-btn {
    flex: 1;
    padding: 10px 16px;
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text-muted);
    background-color: var(--bg-gray);
    border: none;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    outline: none;
}

.gallery-tab-btn:hover {
    color: var(--primary);
    background-color: var(--primary-light);
}

.gallery-tab-btn.active {
    color: var(--primary);
    background-color: var(--bg-white);
    font-weight: 700;
}

.gallery-tab-btn.active svg {
    stroke: var(--primary);
    fill: none;
}

.modal-card__main-img-container {
    width: 100%;
    height: 380px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-card__main-img {
    max-height: 340px;
    object-fit: contain;
    filter: drop-shadow(0 15px 25px rgba(0,0,0,0.05));
    transition: transform 0.3s ease;
}

.modal-card__thumbnails {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
}

.thumbnail-btn {
    width: 60px;
    height: 60px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    background-color: var(--bg-white);
    padding: 4px;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
}

.thumbnail-btn img {
    max-height: 100%;
    object-fit: contain;
}

.thumbnail-btn:hover {
    border-color: var(--text-muted);
}

.thumbnail-btn.active {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(232, 28, 36, 0.08);
}

.modal-card__details {
    padding: 40px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.modal-card__category {
    font-size: 11px;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 6px;
}

.modal-card__title {
    font-size: 26px;
    font-weight: 800;
    color: var(--dark);
    letter-spacing: -0.02em;
    margin-bottom: 12px;
}

.modal-card__divider {
    width: 100%;
    height: 1px;
    background-color: var(--border);
    margin-bottom: 16px;
}

.modal-card__desc {
    font-size: 14px;
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 24px;
}

.modal-card__section {
    width: 100%;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.modal-card__section-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--dark);
    margin-bottom: 10px;
}

.variant-swatches {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 6px;
}

.swatch-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    border: 2px solid var(--bg-white);
    outline: 1.5px solid var(--border);
    cursor: pointer;
    transition: var(--transition);
    position: relative;
}

.swatch-btn:hover {
    outline-color: var(--dark);
}

.swatch-btn.active {
    outline-color: var(--primary);
    outline-width: 2px;
    transform: scale(1.05);
}

.variant-active-name {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 600;
}

/* Payment Switcher Slider styling */
.payment-toggle {
    display: flex;
    background: var(--bg-gray);
    border-radius: var(--radius-full);
    padding: 4px;
    position: relative;
    width: 100%;
    border: 1px solid var(--border);
}

.payment-toggle button {
    flex: 1;
    background: transparent;
    border: none;
    padding: 12px;
    font-weight: 700;
    font-size: 13px;
    color: var(--text-muted);
    cursor: pointer;
    z-index: 2;
    transition: var(--transition);
}

.payment-toggle button.active {
    color: var(--bg-white);
}

.payment-toggle .slider {
    position: absolute;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    top: 4px;
    left: 4px;
    background-color: var(--primary);
    border-radius: var(--radius-full);
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    z-index: 1;
}

.payment-toggle.cicilan-active .slider {
    transform: translateX(100%);
}

.payment-panel {
    display: none;
    width: 100%;
    margin-bottom: 24px;
}

.payment-panel.active {
    display: block;
}

.price-box {
    width: 100%;
    background-color: var(--primary-light);
    border: 1px dashed rgba(232, 28, 36, 0.3);
    padding: 18px 24px;
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 8px;
}

.price-box__label {
    font-size: 11px;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.price-box__val {
    font-size: 24px;
    font-weight: 800;
    color: var(--primary);
    margin-top: 4px;
}

.price-box__subtext {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 600;
    margin-top: 6px;
}

.payment-panel__note {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 10px;
}

.form-group {
    width: 100%;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.form-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--dark);
    margin-bottom: 8px;
}

.select-wrapper {
    position: relative;
    width: 100%;
}

.select-wrapper::after {
    content: '';
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid var(--text);
    pointer-events: none;
}

.select-input {
    width: 100%;
    background-color: var(--bg-white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--dark);
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: var(--transition);
}

.select-input:focus {
    border-color: var(--primary);
}

.tenor-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    width: 100%;
}

.tenor-btn {
    background-color: var(--bg-white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    padding: 10px 4px;
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    cursor: pointer;
    transition: var(--transition);
    text-align: center;
}

.tenor-btn:hover {
    border-color: var(--dark);
}

.tenor-btn.active {
    background-color: var(--dark);
    border-color: var(--dark);
    color: var(--bg-white);
}

.modal-card__order-btn {
    width: 100%;
    margin-top: auto;
}

/* RESPONSIVE BREAKPOINTS */
@media (max-width: 992px) {
    .hero__title {
        font-size: 38px;
    }
    .hero__desc {
        margin-bottom: 24px;
    }
    .benefits__grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .testimonials__grid {
        grid-template-columns: 1fr;
    }
    .contact__container {
        grid-template-columns: 1fr;
        gap: 40px;
    }
    .contact__map-wrapper {
        height: 320px;
    }
    .socials__grid {
        gap: 16px;
    }
    .footer__container {
        grid-template-columns: 1fr 1fr;
        gap: 40px;
    }
    .footer__brand-col {
        grid-column: 1 / -1;
    }
    .modal-card__body {
        grid-template-columns: 1.2fr 1fr;
    }
    .modal-card__gallery {
        padding: 24px;
    }
    .modal-card__details {
        padding: 24px;
    }
}

@media (max-width: 768px) {
    .header__nav {
        position: fixed;
        top: 72px;
        left: 0;
        width: 100%;
        height: calc(100vh - 72px);
        background-color: var(--bg-white);
        padding: 40px 24px;
        transform: translateX(-100%);
        transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        box-shadow: 0 15px 30px rgba(0,0,0,0.05);
    }
    .header__nav.active {
        transform: translateX(0);
    }
    .header__nav-list {
        flex-direction: column;
        align-items: flex-start;
        gap: 24px;
    }
    .header__nav-link {
        font-size: 18px;
    }
    .header__toggle {
        display: block;
    }
    .header__cta-btn {
        display: none;
    }
    .hero__container {
        grid-template-columns: 1fr;
        gap: 40px;
        text-align: center;
    }
    .hero__content {
        align-items: center;
    }
    .hero__ctas {
        justify-content: center;
        width: 100%;
    }
    .hero__img {
        max-height: 280px;
    }
    .benefits__grid {
        grid-template-columns: 1fr;
    }
    .catalogue__controls {
        flex-direction: column;
        align-items: stretch;
    }
    .catalogue__search-box {
        width: 100%;
    }
    .tenor-grid {
        grid-template-columns: repeat(5, 1fr);
    }
}

@media (max-width: 480px) {
    .hero__title {
        font-size: 32px;
    }
    .hero__desc {
        font-size: 14px;
    }
    .hero__ctas {
        flex-direction: column;
        gap: 12px;
        width: 100%;
    }
    .hero__ctas .btn {
        width: 100%;
    }
    .socials__grid {
        gap: 12px;
    }
    .footer__container {
        grid-template-columns: 1fr;
        gap: 30px;
    }
    .tenor-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    .modal-overlay {
        padding: 8px;
    }
    .modal-card {
        max-height: calc(100vh - 16px);
    }
    .modal-card__gallery {
        padding: 16px;
    }
    .modal-card__details {
        padding: 16px;
    }
    .modal-card__main-img-container {
        height: 240px;
    }
    .modal-card__main-img {
        max-height: 220px;
    }
    .modal-card__title {
        font-size: 18px;
    }
    .price-box__val {
        font-size: 18px;
    }
    .payment-toggle button {
        padding: 8px;
        font-size: 12px;
    }
}

/* MODAL GALLERY TOGGLE BETWEEN IMAGES & INSURANCE */
.modal-gallery-images,
.modal-insurance-list {
    display: none;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-gallery-images.active,
.modal-insurance-list.active {
    display: block;
    opacity: 1;
}

/* INSURANCE LIST CARD IN GALLERY */
.modal-insurance-list {
    padding: 10px;
}

.back-to-gallery-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 12px 16px;
    background-color: var(--bg-white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    font-size: 13.5px;
    font-weight: 700;
    color: var(--primary);
    cursor: pointer;
    margin-bottom: 16px;
    transition: var(--transition);
    gap: 8px;
    outline: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.back-to-gallery-btn:hover {
    background-color: var(--primary-light);
    border-color: rgba(232, 28, 36, 0.2);
    color: var(--primary);
}

.back-to-gallery-icon {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    transition: transform 0.2s ease;
}

.back-to-gallery-btn:hover .back-to-gallery-icon {
    transform: translateX(-4px);
}

.insurance-card {
    background-color: #ffffff;
    border: 2px solid #0d6efd;
    border-radius: var(--radius-lg);
    box-shadow: 0 10px 30px rgba(13, 110, 253, 0.05);
    overflow: hidden;
}

.insurance-card__header {
    background-color: #0d6efd;
    color: #ffffff;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
}

.insurance-card__icon-badge {
    font-size: 32px;
    background-color: rgba(255, 255, 255, 0.2);
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
}

.insurance-card__title {
    font-size: 18px;
    font-weight: 800;
    margin-bottom: 4px;
    letter-spacing: 0.02em;
}

.insurance-card__subtitle {
    font-size: 12px;
    opacity: 0.9;
}

.insurance-card__body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.insurance-card__intro {
    font-size: 13.5px;
    color: var(--text);
    line-height: 1.6;
}

.insurance-card__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.insurance-card__item {
    display: flex;
    gap: 14px;
    align-items: flex-start;
}

.insurance-card__item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    background-color: #e2f0fe;
    color: #0d6efd;
    border-radius: var(--radius-full);
    font-size: 12px;
    font-weight: 800;
    margin-top: 2px;
}

.insurance-card__item-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.insurance-card__item-text strong {
    font-size: 14px;
    color: var(--dark);
    font-weight: 700;
}

.insurance-card__item-text span {
    font-size: 12.5px;
    color: var(--text-muted);
    line-height: 1.5;
}

.insurance-card__footer {
    border-top: 1px solid var(--border);
    padding-top: 16px;
    margin-top: 8px;
}

.insurance-card__note {
    font-size: 11px;
    color: var(--text-muted);
    font-style: italic;
}

/* TESTIMONIAL GALLERY STYLING - MERGED INTO MAIN TESTIMONIALS */

.badge-asuransi-card {
    display: inline-flex;
    align-items: center;
    background-color: #e2f0fe;
    color: #0d6efd;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    margin-left: 6px;
    vertical-align: middle;
    letter-spacing: 0.02em;
    border: 1.5px solid #0d6efd;
}
"""

# Write HTML content to index.html in the workspace
with open(os.path.join(workspace_dir, "index.html"), "w", encoding="utf-8") as f:
    f.write(html_content)

print("Generated index.html successfully.")

# Write style.css content to style.css in the workspace
with open(os.path.join(workspace_dir, "style.css"), "w", encoding="utf-8") as f:
    f.write(css_content)

print("Generated style.css successfully.")

# --- script.js CONTENT ---
script_content = f"""// CONFIGURASI WHATSAPP
const WHATSAPP_NUMBER = "wa.me/6283163895963"; // Nomor WhatsApp marketing/dealer (tanpa simbol + atau spasi)

// DATABASE PRODUK DARI EXCEL (DINAMIS DARI BUILDER)
const PRODUCTS_DATA = {products_db_js};

// DATABASE TESTIMONI KONSUMEN (BEAUTIFUL BADGE DESIGN - NO EXTERNAL IMAGES)
const TESTIMONIALS_DATA = [
  {{
    image: "Foto Testimoni History/WhatsApp Image 2026-07-03 at 18.36.26.jpeg",
    name: "Sri Rahmawati",
    location: "Pelabuhan Ratu",
    text: "Proses cepat sekali! Beli Honda Stylo 160 lewat simulasi kredit di sini sangat dibantu. Sore kirim berkas persyaratan, besok siang motor sudah diantar ke rumah. Pelayanan salesnya ramah banget.",
    rating: 5
  }},
  {{
    image: "Foto Testimoni History/WhatsApp Image 2026-07-03 at 18.36.27 (1).jpeg",
    name: "Budi",
    location: "Citepus",
    text: "Awalnya ragu beli motor online, tapi marketingnya ramah dan fast response. Menjelaskan simulasi cicilan dan DP secara rinci tanpa ada biaya tersembunyi. Pengiriman STNK juga tepat waktu.",
    rating: 5
  }},
  {{
    image: "Foto Testimoni History/WhatsApp Image 2026-07-03 at 18.36.27 (2).jpeg",
    name: "Elis",
    location: "Cisolok",
    text: "Beli Honda Vario 160 CBS cash prosesnya gampang banget. Transfer setelah motor sampai rumah, sangat aman dan terpercaya. BPKB juga langsung diinfokan begitu selesai. Terima kasih!",
    rating: 5
  }},
  {{
    image: "Foto Testimoni History/WhatsApp Image 2026-07-03 at 18.36.27 (3).jpeg",
    name: "Dewi Lestari",
    location: "Pelabuhan Ratu",
    text: "Sangat puas dengan rincian simulasinya. Angka cicilan yang tertera di website ini sama persis dengan brosur dari dealer aslinya, transparan dan tidak berbelit-belit. Recomended!",
    rating: 5
  }},
  {{
    image: "Foto Testimoni History/WhatsApp Image 2026-07-03 at 18.36.27.jpeg",
    name: "",
    location: "",
    text: "",
    rating: 0
  }},
  {{
    image: "Foto Testimoni History/WhatsApp Image 2026-07-03 at 18.36.28 (1).jpeg",
    name: "",
    location: "",
    text: "",
    rating: 0
  }},
  {{
    image: "Foto Testimoni History/WhatsApp Image 2026-07-03 at 18.36.28 (2).jpeg",
    name: "",
    location: "",
    text: "",
    rating: 0
  }},
  {{
    image: "Foto Testimoni History/WhatsApp Image 2026-07-03 at 18.36.28.jpeg",
    name: "",
    location: "",
    text: "",
    rating: 0
  }},
  {{
    image: "Foto Testimoni History/WhatsApp Image 2026-07-03 at 18.36.29.jpeg",
    name: "",
    location: "",
    text: "",
    rating: 0
  }}
];

// STATE MANAGEMENT
let currentProduct = null;
let currentVariantIndex = 0;
let currentPaymentMode = "cash"; // "cash" atau "cicilan"
let currentDpValue = null;
let currentTenor = null;

// HELPER: Format rupiah
function formatRupiah(amount) {{
    return "Rp " + Math.round(amount).toLocaleString("id-ID");
}}

// DOM ELEMENTS & INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {{
    init();
}});

function init() {{
    // Render Katalog Awal
    renderProducts(PRODUCTS_DATA);
    
    // Render Testimoni
    renderTestimonials();

    // Setup Kontak Link Awal
    const waLink = document.getElementById("js-whatsapp-link");
    if (waLink) {{
        waLink.href = `https://wa.me/${{WHATSAPP_NUMBER}}?text=${{encodeURIComponent("Halo, saya ingin berkonsultasi mengenai motor Honda terbaru.")}}`;
    }}

    // Mobile Menu Toggle
    const menuToggle = document.getElementById("js-menu-toggle");
    const navMenu = document.getElementById("js-nav-menu");
    const line1 = document.getElementById("js-line-1");
    const line2 = document.getElementById("js-line-2");
    const line3 = document.getElementById("js-line-3");
    
    if (menuToggle && navMenu) {{
        menuToggle.addEventListener("click", () => {{
            navMenu.classList.toggle("active");
            
            // Hamburger Morphing Animation
            if (navMenu.classList.contains("active")) {{
                line1.setAttribute("x1", "5");
                line1.setAttribute("y1", "5");
                line1.setAttribute("x2", "19");
                line1.setAttribute("y2", "19");
                
                line2.setAttribute("opacity", "0");
                
                line3.setAttribute("x1", "5");
                line3.setAttribute("y1", "19");
                line3.setAttribute("x2", "19");
                line3.setAttribute("y2", "5");
            }} else {{
                line1.setAttribute("x1", "4");
                line1.setAttribute("y1", "6");
                line1.setAttribute("x2", "20");
                line1.setAttribute("y2", "6");
                
                line2.setAttribute("opacity", "1");
                
                line3.setAttribute("x1", "4");
                line3.setAttribute("y1", "18");
                line3.setAttribute("x2", "20");
                line3.setAttribute("y2", "18");
            }}
        }});
    }}

    // Close menu when clicking nav link
    const navLinks = document.querySelectorAll(".header__nav-link");
    navLinks.forEach(link => {{
        link.addEventListener("click", (e) => {{
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            
            if (navMenu.classList.contains("active")) {{
                menuToggle.click();
            }}
        }});
    }});

    // Category Filter Clicks
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(btn => {{
        btn.addEventListener("click", () => {{
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const category = btn.getAttribute("data-category");
            applyFiltersAndSearch(category, document.getElementById("js-search-input").value);
        }});
    }});

    // Search input typing
    const searchInput = document.getElementById("js-search-input");
    if (searchInput) {{
        searchInput.addEventListener("input", () => {{
            const activeFilter = document.querySelector(".filter-btn.active");
            const category = activeFilter ? activeFilter.getAttribute("data-category") : "all";
            applyFiltersAndSearch(category, searchInput.value);
        }});
    }}

    // Modal close events
    const modalClose = document.getElementById("js-modal-close");
    const modalOverlay = document.getElementById("js-modal");
    if (modalClose) {{
        modalClose.addEventListener("click", closeModal);
    }}
    if (modalOverlay) {{
        modalOverlay.addEventListener("click", (e) => {{
            if (e.target === modalOverlay) {{
                closeModal();
            }}
        }});
    }}

    // Payment Toggle Buttons
    const toggleCash = document.getElementById("js-toggle-cash");
    const toggleCredit = document.getElementById("js-toggle-credit");
    if (toggleCash && toggleCredit) {{
        toggleCash.addEventListener("click", () => setPaymentMode("cash"));
        toggleCredit.addEventListener("click", () => setPaymentMode("cicilan"));
    }}

    // Credit simulasi changes
    const selectDp = document.getElementById("js-select-dp");
    if (selectDp) {{
        selectDp.addEventListener("change", (e) => {{
            currentDpValue = parseInt(e.target.value);
            renderTenors();
            updateInstallmentRate();
        }});
    }}

    // Order CTA Button click
    const orderBtn = document.getElementById("js-order-btn");
    if (orderBtn) {{
        orderBtn.addEventListener("click", generateWhatsAppLink);
    }}
}}

// FILTER & SEARCH LOGIC
function applyFiltersAndSearch(category, searchStr) {{
    const query = searchStr.toLowerCase().trim();
    
    const filtered = PRODUCTS_DATA.filter(p => {{
        const matchesCategory = (category === "all") || (p.category === category);
        const matchesSearch = p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    }});
    
    renderProducts(filtered);
}}

// RENDER PRODUCTS IN CATALOGUE GRID
function renderProducts(productsList) {{
    const grid = document.getElementById("js-products-grid");
    if (!grid) return;
    
    if (productsList.length === 0) {{
        grid.innerHTML = `
            <div class="empty-state">
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <h3>Motor Tidak Ditemukan</h3>
                <p>Silakan coba kata kunci pencarian atau kategori lain.</p>
            </div>
        `;
        return;
    }}
    
    grid.innerHTML = productsList.map(p => {{
        // Get lowest monthly rate to show "Cicilan mulai dari..."
        let installmentText = "";
        if (p.installments && p.installments.length > 0) {{
            // Collect all rates from all DPs and find minimum
            let minRate = Infinity;
            p.installments.forEach(inst => {{
                Object.values(inst.rates).forEach(rate => {{
                    if (rate < minRate) minRate = rate;
                }});
            }});
            if (minRate !== Infinity) {{
                installmentText = `Cicilan mulai ${{formatRupiah(minRate)}}/bln`;
            }}
        }} else {{
            installmentText = "Tersedia cicilan ringan";
        }}

        // Main photo path
        const mainImgPath = `Foto Produk/${{p.folder}}/${{p.images[0]}}`;
        
        return `
            <article class="product-card">
                <div class="product-card__img-container">
                    <span class="product-card__tag">${{p.category}}</span>
                    <img src="${{mainImgPath}}" alt="${{p.name}}" class="product-card__img" loading="lazy">
                </div>
                <div class="product-card__content">
                    <h3 class="product-card__title">${{p.name}}</h3>
                    <div class="product-card__price-row">
                        <span class="product-card__price-cash">${{formatRupiah(p.otr_price)}} (OTR) <span class="badge-asuransi-card" title="Pembelian cash mendapatkan proteksi asuransi">🛡️ + Asuransi</span></span>
                        <span class="product-card__price-installment">${{installmentText}}</span>
                    </div>
                    <button class="btn btn--outline product-card__btn" onclick="openModal('${{p.id}}')">Lihat Detail</button>
                </div>
            </article>
        `;
    }}).join("");
}}

// RENDER TESTIMONIALS
function renderTestimonials() {{
    const grid = document.getElementById("js-testimonials-grid");
    if (!grid) return;
    
    grid.innerHTML = TESTIMONIALS_DATA.map(t => {{
        let contentHtml = "";
        
        if (t.rating > 0) {{
            const initials = t.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
            const starsHtml = Array(t.rating).fill(
                `<svg class="testimonial-card__star-icon" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`
            ).join("");
            
            contentHtml = `
                <div class="testimonial-card__content">
                    <div class="testimonial-card__stars">
                        ${{starsHtml}}
                    </div>
                    <p class="testimonial-card__text">"${{t.text}}"</p>
                    <div class="testimonial-card__user">
                        <div class="testimonial-card__avatar">${{initials}}</div>
                        <div class="testimonial-card__user-info">
                            <span class="testimonial-card__name">${{t.name}}</span>
                        </div>
                    </div>
                </div>
            `;
        }} else {{
            contentHtml = `
                <div class="testimonial-card__content testimonial-card__content--empty">
                    <span class="testimonial-card__caption">Dokumentasi Serah Terima</span>
                </div>
            `;
        }}

        return `
            <div class="testimonial-card">
                <div class="testimonial-card__image-container">
                    <img src="${{t.image}}" alt="Dokumentasi Serah Terima" class="testimonial-card__img" loading="lazy">
                </div>
                ${{contentHtml}}
            </div>
        `;
    }}).join("");
}}

// OPEN MODAL & CONFIGURE
function openModal(productId) {{
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    currentVariantIndex = 0;
    currentPaymentMode = "cash";
    
    // Set text elements
    document.getElementById("js-modal-category").textContent = product.category;
    document.getElementById("js-modal-title").textContent = product.name;
    document.getElementById("js-modal-cash-price").textContent = formatRupiah(product.otr_price);
    
    // Write dynamic description based on category
    let descText = "";
    if (product.category === "Beat Series") {{
        descText = "Skutik andalan Honda yang lincah, irit bahan bakar, serta dibekali rangka eSAF terbaru. Dilengkapi dengan bagasi yang luas dan teknologi ECO indicator untuk memaksimalkan efisiensi berkendara Anda.";
    }} else if (product.category === "Genio Series") {{
        descText = "Skutik bergaya kasual dan fashionable yang sangat cocok untuk kawula muda. Desain compact, konsumsi BBM super irit, didukung oleh mesin eSP generasi terbaru yang responsif.";
    }} else if (product.category === "Scoopy Series") {{
        descText = "Ikon skutik unik dan klasik Honda dengan sentuhan fitur modern masa kini. Memiliki console box luas dengan USB charger, Smart Key system, dan ban tubeless ukuran lebar yang sangat stabil.";
    }} else if (product.category === "Stylo Series") {{
        descText = "Skutik premium fashionable 160cc berdesain retro modern yang bertenaga. Mengusung mesin eSP+ 4-katup berpendingin cairan, lampu LED mewah, serta fitur instrumen digital canggih.";
    }} else if (product.category === "Vario Series") {{
        descText = "Skutik sporty berperforma tinggi untuk kenyamanan dan ketangguhan berkendara harian Anda. Dilengkapi dengan full digital panel meter, lampu LED agresif, serta bagasi super luas yang muat helm.";
    }}
    document.getElementById("js-modal-desc").textContent = descText;
    
    // Render Color Swatches
    renderModalSwatches();
    
    // Load Main Image
    updateModalMainImage();
    
    // Set Active Payment Mode
    setPaymentMode("cash");

    // Reset modal tab to gallery
    switchModalTab("gallery");
    
    // Populate DP select
    populateDpSelect();
    
    // Open Modal display
    const modal = document.getElementById("js-modal");
    if (modal) {{
        modal.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent body scroll
    }}
}}

function closeModal() {{
    const modal = document.getElementById("js-modal");
    if (modal) {{
        modal.classList.remove("active");
        document.body.style.overflow = ""; // Restore body scroll
    }}
}}

// RENDER SWATCHES IN MODAL
function renderModalSwatches() {{
    const swatchesContainer = document.getElementById("js-modal-swatches");
    if (!swatchesContainer || !currentProduct) return;
    
    swatchesContainer.innerHTML = currentProduct.variants.map((v, idx) => {{
        return `
            <button class="swatch-btn ${{idx === 0 ? "active" : ""}}" 
                    style="background-color: ${{v.hex}};" 
                    title="${{v.colorName}}"
                    onclick="selectVariant(${{idx}})"
                    aria-label="${{v.colorName}}">
            </button>
        `;
    }}).join("");
    
    updateVariantName();
}}

// SELECT VARIANT FROM SWATCH
window.selectVariant = function(variantIdx) {{
    currentVariantIndex = variantIdx;
    
    // Update active swatch class
    const swatchBtns = document.querySelectorAll(".swatch-btn");
    swatchBtns.forEach((btn, idx) => {{
        btn.classList.toggle("active", idx === variantIdx);
    }});
    
    updateVariantName();
    updateModalMainImage();
    updateThumbnailSelection();
}};

// UPDATE ACTIVE VARIANT NAME IN UI
function updateVariantName() {{
    const nameEl = document.getElementById("js-modal-active-variant-name");
    if (nameEl && currentProduct) {{
        nameEl.textContent = currentProduct.variants[currentVariantIndex].colorName;
    }}
}}

// UPDATE MODAL MAIN IMAGE AND THUMBNAILS
function updateModalMainImage() {{
    const mainImg = document.getElementById("js-modal-main-img");
    const thumbnailsContainer = document.getElementById("js-modal-thumbnails");
    
    if (!mainImg || !currentProduct) return;
    
    const activeImageFilename = currentProduct.variants[currentVariantIndex].image;
    const mainImgPath = `Foto Produk/${{currentProduct.folder}}/${{activeImageFilename}}`;
    
    mainImg.src = mainImgPath;
    mainImg.alt = `${{currentProduct.name}} - ${{currentProduct.variants[currentVariantIndex].colorName}}`;
    
    // Render thumbnails
    thumbnailsContainer.innerHTML = currentProduct.images.map((img, idx) => {{
        const isCurrent = (img === activeImageFilename);
        const thumbPath = `Foto Produk/${{currentProduct.folder}}/${{img}}`;
        return `
            <button class="thumbnail-btn ${{isCurrent ? "active" : ""}}" 
                    onclick="selectVariantByImageName('${{img}}')"
                    aria-label="Lihat foto ${{idx + 1}}">
                <img src="${{thumbPath}}" alt="${{currentProduct.name}} thumbnail">
            </button>
        `;
    }}).join("");
}}

window.selectVariantByImageName = function(imgFilename) {{
    if (!currentProduct) return;
    const variantIdx = currentProduct.variants.findIndex(v => v.image === imgFilename);
    if (variantIdx !== -1) {{
        selectVariant(variantIdx);
    }}
}};

function updateThumbnailSelection() {{
    if (!currentProduct) return;
    const activeImg = currentProduct.variants[currentVariantIndex].image;
    const thumbBtns = document.querySelectorAll(".thumbnail-btn");
    
    thumbBtns.forEach(btn => {{
        const img = btn.querySelector("img");
        if (img) {{
            const src = img.getAttribute("src");
            const filename = src.substring(src.lastIndexOf("/") + 1);
            btn.classList.toggle("active", filename === activeImg);
        }}
    }});
}}

// SET PAYMENT MODE AND UPDATE TABS
function setPaymentMode(mode) {{
    currentPaymentMode = mode;
    
    const toggleContainer = document.getElementById("js-payment-toggle-container");
    const toggleCash = document.getElementById("js-toggle-cash");
    const toggleCredit = document.getElementById("js-toggle-credit");
    
    const panelCash = document.getElementById("js-panel-cash");
    const panelCredit = document.getElementById("js-panel-credit");
    
    if (mode === "cash") {{
        toggleContainer.classList.remove("cicilan-active");
        toggleCash.classList.add("active");
        toggleCredit.classList.remove("active");
        
        panelCash.classList.add("active");
        panelCredit.classList.remove("active");
    }} else {{
        toggleContainer.classList.add("cicilan-active");
        toggleCash.classList.remove("active");
        toggleCredit.classList.add("active");
        
        panelCash.classList.remove("active");
        panelCredit.classList.add("active");
        
        // Auto default to lowest DP and first tenor
        if (currentProduct && currentProduct.installments && currentProduct.installments.length > 0) {{
            const dpSelect = document.getElementById("js-select-dp");
            if (dpSelect && dpSelect.options.length > 0) {{
                currentDpValue = parseInt(dpSelect.value);
                renderTenors();
                updateInstallmentRate();
            }}
        }}
    }}
}}

// SWITCH MODAL TABS BETWEEN MOTOR GALLERY AND INSURANCE
window.switchModalTab = function(tab) {{
    const btnGallery = document.getElementById("js-tab-gallery");
    const btnInsurance = document.getElementById("js-tab-insurance");
    const galleryImages = document.getElementById("js-modal-gallery-images");
    const insuranceList = document.getElementById("js-modal-insurance-list");
    
    if (tab === 'gallery') {{
        if (btnGallery) btnGallery.classList.add("active");
        if (btnInsurance) btnInsurance.classList.remove("active");
        if (galleryImages) {{
            galleryImages.classList.add("active");
            galleryImages.style.display = "block";
            galleryImages.style.opacity = "1";
        }}
        if (insuranceList) {{
            insuranceList.classList.remove("active");
            insuranceList.style.display = "none";
            insuranceList.style.opacity = "0";
        }}
    }} else if (tab === 'insurance') {{
        if (btnGallery) btnGallery.classList.remove("active");
        if (btnInsurance) btnInsurance.classList.add("active");
        if (galleryImages) {{
            galleryImages.classList.remove("active");
            galleryImages.style.display = "none";
            galleryImages.style.opacity = "0";
        }}
        if (insuranceList) {{
            insuranceList.classList.add("active");
            insuranceList.style.display = "block";
            insuranceList.style.opacity = "1";
        }}
    }}
}};

// POPULATE DP DROPDOWN SELECT
function populateDpSelect() {{
    const dpSelect = document.getElementById("js-select-dp");
    if (!dpSelect || !currentProduct) return;
    
    dpSelect.innerHTML = "";
    
    if (!currentProduct.installments || currentProduct.installments.length === 0) {{
        dpSelect.innerHTML = `<option value="0">Tidak tersedia paket cicilan</option>`;
        return;
    }}
    
    // Sort installments by DP value ascending
    currentProduct.installments.sort((a, b) => a.dp - b.dp);
    
    currentProduct.installments.forEach(inst => {{
        const opt = document.createElement("option");
        opt.value = inst.dp;
        opt.textContent = `${{formatRupiah(inst.dp)}}`;
        dpSelect.appendChild(opt);
    }});
    
    // Select first by default
    currentDpValue = currentProduct.installments[0].dp;
}}

// RENDER TENOR CARD TABS
function renderTenors() {{
    const tenorGrid = document.getElementById("js-tenor-grid");
    if (!tenorGrid || !currentProduct || !currentDpValue) return;
    
    tenorGrid.innerHTML = "";
    
    const dpObj = currentProduct.installments.find(inst => inst.dp === currentDpValue);
    if (!dpObj) return;
    
    // Get tenors and sort ascending numerically
    const tenors = Object.keys(dpObj.rates).map(Number).sort((a, b) => a - b);
    
    if (tenors.length === 0) {{
        tenorGrid.innerHTML = `<div class="empty-state">Tenor tidak tersedia</div>`;
        return;
    }}
    
    // Set default tenor to the longest (often lowest installment rate) or first available
    if (!currentTenor || !tenors.includes(currentTenor)) {{
        currentTenor = tenors[tenors.length - 1]; // Default to longest tenor
    }}
    
    tenorGrid.innerHTML = tenors.map(tenor => {{
        const isActive = (tenor === currentTenor);
        return `
            <button class="tenor-btn ${{isActive ? "active" : ""}}" 
                    onclick="selectTenor(${{tenor}})">
                ${{tenor}}x
            </button>
        `;
    }}).join("");
}}

window.selectTenor = function(tenor) {{
    currentTenor = tenor;
    
    const buttons = document.querySelectorAll(".tenor-btn");
    buttons.forEach(btn => {{
        const text = btn.textContent.trim();
        btn.classList.toggle("active", text === `${{tenor}}x`);
    }});
    
    updateInstallmentRate();
}};

// UPDATE SIMULATED RATE IN UI
function updateInstallmentRate() {{
    const rateEl = document.getElementById("js-modal-installment-rate");
    const summaryEl = document.getElementById("js-modal-installment-summary");
    
    if (!rateEl || !currentProduct || !currentDpValue || !currentTenor) return;
    
    const dpObj = currentProduct.installments.find(inst => inst.dp === currentDpValue);
    if (!dpObj) return;
    
    const rate = dpObj.rates[String(currentTenor)];
    if (rate) {{
        rateEl.textContent = `${{formatRupiah(rate)}} / bln`;
        summaryEl.textContent = `Tenor ${{currentTenor}} Bulan | Uang Muka ${{formatRupiah(currentDpValue)}}`;
    }} else {{
        rateEl.textContent = "-";
        summaryEl.textContent = "Data angsuran tidak tersedia.";
    }}
}}

// DYNAMIC WHATSAPP ORDER GENERATOR
function generateWhatsAppLink() {{
    if (!currentProduct) return;
    
    const variantName = currentProduct.variants[currentVariantIndex].colorName;
    let messageText = `Halo, saya ingin menanyakan pemesanan unit sepeda motor Honda berikut:\\n\\n`;
    
    messageText += `*Detail Pesanan:*\\n`;
    messageText += `• Motor: _${{currentProduct.name}} (Otr: ${{formatRupiah(currentProduct.otr_price)}})_\\n`;
    messageText += `• Varian Warna: _${{variantName}}_\\n`;
    
    if (currentPaymentMode === "cash") {{
        messageText += `• Metode Pembayaran: *CASH (TUNAI)*\\n`;
        messageText += `• Total Harga: *${{formatRupiah(currentProduct.otr_price)}}*\\n`;
    }} else {{
        const dpObj = currentProduct.installments.find(inst => inst.dp === currentDpValue);
        const monthlyRate = dpObj ? dpObj.rates[String(currentTenor)] : 0;
        
        messageText += `• Metode Pembayaran: *KREDIT (CICILAN)*\\n`;
        messageText += `• Uang Muka (DP): *${{formatRupiah(currentDpValue)}}*\\n`;
        messageText += `• Jangka Waktu (Tenor): *${{currentTenor}} Bulan*\\n`;
        messageText += `• Angsuran per Bulan: *${{formatRupiah(monthlyRate)}} / bulan*\\n`;
    }}
    
    messageText += `\\nMohon info mengenai ketersediaan stok, syarat administrasi, dan promo diskon terbaru. Terima kasih!`;
    
    const encodedText = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${{WHATSAPP_NUMBER}}?text=${{encodedText}}`;
    
    // Open in new tab
    window.open(waUrl, "_blank");
}}
"""

# Write script.js content to script.js in the workspace
with open(r"D:\ajay\PROJECT YUSUF\script.js", "w", encoding="utf-8") as f:
    f.write(script_content)

print("Generated script.js successfully.")
print("Site files build complete.")
