/* ==========================================================================
   ⚡ MusiChris Studio Radio - Master Dynamic & CMS Controller (Landing Page)
   ========================================================================== */

// 🔒 Firebase Auth SDK Imports (v11 ESM modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDns9TUBRrrwIyyuVAizHmWsv9C3iX4neU",
    authDomain: "proyecto-musichris-350df.firebaseapp.com",
    databaseURL: "https://proyecto-musichris-350df-default-rtdb.firebaseio.com",
    projectId: "proyecto-musichris-350df",
    storageBucket: "proyecto-musichris-350df.firebasestorage.app",
    messagingSenderId: "437162185012",
    appId: "1:437162185012:web:f4d6ccb0c01e2435c29561"
};

const firebaseApp = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(firebaseApp);




// 📱 Global Zoom Prevention (Safari/iOS & Chrome Mobile support)
document.addEventListener("touchstart", (e) => {
    if (e.touches.length > 1) {
        e.preventDefault(); // Prevent multi-touch pinch zoom
    }
}, { passive: false });

document.addEventListener("gesturestart", (e) => {
    e.preventDefault(); // Prevent iOS gesture zooming
});

document.addEventListener("DOMContentLoaded", () => {
    // 1. DOM Element Selectors
    const audio = document.getElementById("radio-audio");
    const playBtn = document.getElementById("play-btn");
    const playIcon = document.getElementById("play-icon");
    const muteBtn = document.getElementById("mute-btn");
    const volumeIcon = document.getElementById("volume-icon");
    const volumeSlider = document.getElementById("volume-slider");
    const playerCard = document.getElementById("main-player-card");
    const visualizer = document.getElementById("visualizer");
    const whatsappBtn = document.getElementById("whatsapp-btn");
    const phraseText = document.getElementById("phrase-text");
    const songCoverEl = document.getElementById("song-cover");
    const songTitleEl = document.getElementById("song-title");
    const songArtistEl = document.getElementById("song-artist");

    // Form Selectors
    const prayerForm = document.getElementById("prayer-form");
    const formSuccess = document.getElementById("form-success");

    // Navigation & Anchors
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section");

    // Dynamic Elements Containers
    const stripBg = document.getElementById("strip-bg");
    const stripTitle = document.getElementById("strip-title");
    const stripDesc = document.getElementById("strip-desc");
    const stripCta = document.getElementById("strip-cta");
    const scheduleGrid = document.getElementById("schedule-grid");

    // Admin Panel Selectors
    const adminTriggerBtn = document.getElementById("admin-trigger-btn");
    const adminModal = document.getElementById("admin-modal");
    
    // Close fullscreen video on clicking 'x' or outside the video
    const closeFullscreenBtn = document.getElementById("close-fullscreen-btn");
    const fullscreenOverlay = document.getElementById("fullscreen-video-modal");

    if (closeFullscreenBtn) closeFullscreenBtn.addEventListener("click", closeFullscreenVideo);
    if (fullscreenOverlay) {
        fullscreenOverlay.addEventListener("click", (e) => {
            if (e.target === fullscreenOverlay) closeFullscreenVideo();
        });
    }

    // Funcionalidad del botón de Zoom (Ajustar Pantalla)
    const zoomToggleBtn = document.getElementById("zoom-toggle-btn");
    if (zoomToggleBtn) {
        zoomToggleBtn.addEventListener("click", () => {
            const videoPlayer = document.getElementById("parable-video-player");
            const container = document.querySelector('.fullscreen-video-container');
            if (videoPlayer && container) {
                videoPlayer.classList.toggle("zoomed");
                container.classList.toggle("zoomed-container");
                if (videoPlayer.classList.contains("zoomed")) {
                    zoomToggleBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
                    // Scroll automático al centro de la imagen para que se vea el centro del video
                    setTimeout(() => {
                        container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
                    }, 50);
                } else {
                    zoomToggleBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
                }
            }
        });
    }

    // Escuchar la tecla "Escape" para salir del modal de video en escritorio
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const videoOverlay = document.getElementById("fullscreen-video-modal");
            if (videoOverlay && videoOverlay.classList.contains("active")) {
                closeFullscreenVideo();
            }
        }
    });

    const closeAdminBtn = document.getElementById("close-admin-btn");
    const adminLoginScreen = document.getElementById("admin-login-screen");
    const adminDashboardScreen = document.getElementById("admin-dashboard-screen");
    const adminEmailInput = document.getElementById("admin-email");
    const adminPasswordInput = document.getElementById("admin-password");
    const adminLoginBtn = document.getElementById("admin-login-btn");
    const loginError = document.getElementById("login-error");

    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabPanels = document.querySelectorAll(".tab-content-panel");

    const announcementsEditList = document.getElementById("announcements-edit-list");
    const scheduleEditList = document.getElementById("schedule-edit-list");
    const saveLocalBtn = document.getElementById("save-local-btn");
    const copyCodeBtn = document.getElementById("copy-code-btn");
    const exportJsonCode = document.getElementById("export-json-code");

    // Live Stream Target URL
    const streamUrl = "https://161-153-197-23.sslip.io/listen/musichris_studio_radio/radio.mp3"; 
    audio.src = streamUrl;

    // 🌐 Firebase Realtime Database REST Configuration
    const DATABASE_URL = "https://proyecto-musichris-350df-default-rtdb.us-central1.firebasedatabase.app/radio.json";

    // 📩 Private Inbox State Cache
    let privateMessages = {};
    let activeMessageFilter = "oracion";

    // 2. 🗄️ STATE MANAGEMENT (Announcements & Schedule)
    const DEFAULT_ANNOUNCEMENTS = [
        {
            title: "¡Gran Campaña de Oración Activa!",
            desc: "Escribe tu petición en el formulario inferior de nuestra web. Estaremos intercediendo en vivo y clamando por tu milagro en cada programa.",
            bgImage: "linear-gradient(135deg, #1a0533 0%, #3d0a6b 40%, #6b21a8 70%, #1a0533 100%)",
            btnText: "Pedir Oración 🙏",
            btnLink: "#peticiones"
        },
        {
            title: "Devocionales Diarios en YouTube",
            desc: "Acompaña cada día los nuevos videos de edificación ministerial de MusiChris Studio. Suscríbete y activa la campanita para no perderte nada.",
            bgImage: "linear-gradient(135deg, #0a0f2e 0%, #0d2b6b 40%, #1e40af 70%, #0a0f2e 100%)",
            btnText: "Ir al Canal 🎥",
            btnLink: "https://www.youtube.com/@Musichris_Studio"
        },
        {
            title: "Pide tu Alabanza Favorita por WhatsApp",
            desc: "Envíanos tu recomendación de canción o envíanos un audio con tu testimonio de bendición para transmitirlo en la señal radial en vivo.",
            bgImage: "linear-gradient(135deg, #0a1f0a 0%, #14532d 40%, #16a34a 70%, #0a1f0a 100%)",
            btnText: "Pedir Canción 🎵",
            btnLink: "https://wa.me/34634655522?text=%C2%A1Hola%20MusiChris%20Studio%20Radio!%20%F0%9F%95%8A%20Me%20gustar%C3%ADa%20pedir%20una%20canci%C3%B3n..."
        }
    ];

    const DEFAULT_SCHEDULE = [
        {
            time: "06:00 - 08:00",
            title: "Clamor de la Mañana",
            desc: "Comenzamos el día en oración y clamor. Entregando las primeras horas al Señor para guiar nuestros pasos."
        },
        {
            time: "08:00 - 12:00",
            title: "Devocionales Diarios",
            desc: "Estudio bíblico profundo, reflexiones cristianas prácticas y enseñanzas para alimentar la fe en familia."
        },
        {
            time: "12:00 - 18:00",
            title: "Adoración Continua",
            desc: "Una selección ininterrumpida de alabanzas que llenarán tu entorno de su presencia y ambiente de paz."
        },
        {
            time: "18:00 - 22:00",
            title: "Palabra de Renovación",
            desc: "Predicaciones inspiradoras y mensajes de esperanza para recargar fuerzas al final de la jornada."
        },
        {
            time: "22:00 - 06:00",
            title: "Instrumental de Paz",
            desc: "Melodías instrumentales suaves de adoración para un descanso reparador bajo la protección de Dios."
        }
    ];

    // Helper to sanitize announcement background image paths
    // Converts any broken/external URL into a safe CSS gradient fallback
    function sanitizeAnnouncements(list) {
        if (!Array.isArray(list)) return [];
        const GRADIENT_FALLBACKS = [
            "linear-gradient(135deg, #1a0533 0%, #3d0a6b 40%, #6b21a8 70%, #1a0533 100%)",
            "linear-gradient(135deg, #0a0f2e 0%, #0d2b6b 40%, #1e40af 70%, #0a0f2e 100%)",
            "linear-gradient(135deg, #0a1f0a 0%, #14532d 40%, #16a34a 70%, #0a1f0a 100%)"
        ];
        let fallbackIdx = 0;
        return list.map(item => {
            if (item && item.bgImage) {
                const img = item.bgImage.trim();
                // Replace any external URL (http/https) or broken short ID with a gradient
                if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("photo-")) {
                    item.bgImage = GRADIENT_FALLBACKS[fallbackIdx % GRADIENT_FALLBACKS.length];
                    fallbackIdx++;
                }
                // Pure CSS gradients and local 'assets/' paths are kept as-is
            }
            return item;
        });
    }

    // ─── CACHE VERSION BUSTING ────────────────────────────────────────────────
    // Increment this string whenever the data schema changes to force a fresh
    // localStorage load instead of serving corrupted/stale cached data.
    const CACHE_VERSION = "v4";
    const storedCacheVersion = localStorage.getItem("musichris_cache_version");
    if (storedCacheVersion !== CACHE_VERSION) {
        // Wipe stale data that may have broken shorthand URLs from older versions
        localStorage.removeItem("musichris_announcements");
        localStorage.removeItem("musichris_schedule");
        localStorage.setItem("musichris_cache_version", CACHE_VERSION);
        console.log(`🔄 Cache limpiado y actualizado a ${CACHE_VERSION}`);
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Load active state from localStorage or seed defaults
    let announcements = sanitizeAnnouncements(JSON.parse(localStorage.getItem("musichris_announcements")) || DEFAULT_ANNOUNCEMENTS);
    let schedule = JSON.parse(localStorage.getItem("musichris_schedule")) || DEFAULT_SCHEDULE;

    // Always persist clean, sanitized copies back to storage
    localStorage.setItem("musichris_announcements", JSON.stringify(announcements));
    localStorage.setItem("musichris_schedule", JSON.stringify(schedule));

    // Asynchronously fetch latest configurations from the Google Cloud Database in the background
    function fetchGlobalConfig() {
        fetch(DATABASE_URL)
            .then(res => {
                if (!res.ok) throw new Error("Acceso a base de datos inestable.");
                return res.json();
            })
            .then(data => {
                if (data) {
                    if (data.announcements && Array.isArray(data.announcements)) {
                        announcements = sanitizeAnnouncements(data.announcements);
                        localStorage.setItem("musichris_announcements", JSON.stringify(announcements));
                    }
                    if (data.schedule && Array.isArray(data.schedule)) {
                        schedule = data.schedule;
                        localStorage.setItem("musichris_schedule", JSON.stringify(schedule));
                    }
                    // Smooth hot-swap rendering in real-time
                    currentAnnounceIndex = 0;
                    startAnnouncementSlideshow();
                    renderPublicSchedule();
                }
            })
            .catch(err => {
                console.warn("⚠️ Usando cache local o defaults offline:", err.message);
            });
    }

    // Call fetch immediately
    fetchGlobalConfig();

    // 3. 🖼️ RENDER ANNOUNCEMENT BANNER STRIP & CROSSFADE ROTATION
    let currentAnnounceIndex = 0;
    let announceInterval = null;

    function renderActiveAnnouncement() {
        if (announcements.length === 0) return;
        
        const item = announcements[currentAnnounceIndex];

        // Apply smooth crossfade transition by fading out first
        stripTitle.style.opacity = 0;
        stripDesc.style.opacity = 0;
        stripCta.style.opacity = 0;
        stripBg.style.opacity = 0;

        setTimeout(() => {
            // Update resources — gradients are applied directly, URLs are wrapped in url()
            const bg = item.bgImage && item.bgImage.trim();
            if (bg && (bg.startsWith("linear-gradient") || bg.startsWith("radial-gradient"))) {
                stripBg.style.backgroundImage = bg;
            } else if (bg) {
                stripBg.style.backgroundImage = `url('${bg}')`;
            } else {
                stripBg.style.backgroundImage = "linear-gradient(135deg, #1a0533 0%, #6b21a8 100%)";
            }
            stripTitle.textContent = item.title;
            stripDesc.textContent = item.desc;
            
            stripCta.textContent = item.btnText;
            stripCta.href = item.btnLink;

            // Fade back in
            stripTitle.style.opacity = 1;
            stripDesc.style.opacity = 1;
            stripCta.style.opacity = 1;
            stripBg.style.opacity = 0.5; // Matches hover blend transparency in CSS
        }, 400);
    }

    function startAnnouncementSlideshow() {
        if (announceInterval) clearInterval(announceInterval);
        
        renderActiveAnnouncement();
        
        announceInterval = setInterval(() => {
            currentAnnounceIndex = (currentAnnounceIndex + 1) % announcements.length;
            renderActiveAnnouncement();
        }, 7000); // Crossfade slideshow every 7 seconds
    }

    // 4. 📅 RENDER PUBLIC PROGRAMMING GRID
    function renderPublicSchedule() {
        if (!scheduleGrid) return;
        
        scheduleGrid.innerHTML = ""; // Clear loader
        
        schedule.forEach(item => {
            const card = document.createElement("div");
            card.className = "schedule-card";
            
            card.innerHTML = `
                <div class="card-glow"></div>
                <div class="schedule-time">${item.time}</div>
                <h3 class="schedule-program-title">${item.title}</h3>
                <p class="schedule-desc">${item.desc}</p>
            `;
            scheduleGrid.appendChild(card);
        });
    }

    // 5. 🔑 ADMIN CONTROL BOARD LOGIC & FORMS
    function openAdminPanel() {
        adminModal.classList.add("show");
        adminPasswordInput.value = "";
        loginError.classList.remove("show");
        adminLoginScreen.style.display = "flex";
        adminDashboardScreen.classList.remove("show");
    }

    function closeAdminPanel() {
        adminModal.classList.remove("show");
    }

    function handleAdminLogin() {
        const email = adminEmailInput ? adminEmailInput.value.trim() : "";
        const password = adminPasswordInput ? adminPasswordInput.value : "";

        if (!email || !password) {
            loginError.classList.add("show");
            return;
        }

        adminLoginBtn.disabled = true;
        adminLoginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                // onAuthStateChanged will handle opening the dashboard
            })
            .catch(() => {
                loginError.classList.add("show");
                adminLoginBtn.disabled = false;
                adminLoginBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Acceder al Panel';
            });
    }

    // Auth State Observer: auto-restore session or show login
    onAuthStateChanged(auth, (user) => {
        if (user && user.uid === "7zo6o1g0IFNF81GbVNvl3BIRC9t1") {
            // Valid admin — open dashboard directly
            adminLoginScreen.style.display = "none";
            adminDashboardScreen.classList.add("show");
            renderAdminAnnouncementsEditor();
            renderAdminScheduleEditor();
            fetchPrivateMessages();
            generateExportCode();
        } else if (adminDashboardScreen.classList.contains("show")) {
            // Session expired — go back to login
            adminDashboardScreen.classList.remove("show");
            adminLoginScreen.style.display = "flex";
        }
    });

    // Handle editing tabs
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            tabPanels.forEach(p => p.classList.remove("active"));
            
            btn.classList.add("active");
            const targetId = btn.getAttribute("data-tab");
            document.getElementById(targetId).classList.add("active");
            
            if (targetId === "tab-export") {
                generateExportCode();
            } else if (targetId === "tab-mensajes") {
                fetchPrivateMessages(); // 🔄 Refrescar bandeja al abrir la pestaña
            }
        });
    });

    // Handle message sub-tabs filtering
    const subtabBtns = document.querySelectorAll(".subtab-btn");

    subtabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            subtabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            activeMessageFilter = btn.getAttribute("data-filter");
            renderPrivateMessages(activeMessageFilter);
        });
    });

    // 🛠️ Render Announcements Editor Inputs
    function renderAdminAnnouncementsEditor() {
        announcementsEditList.innerHTML = "";
        
        announcements.forEach((item, index) => {
            const block = document.createElement("div");
            block.className = "admin-edit-item";
            block.innerHTML = `
                <div class="admin-item-header">Anuncio #${index + 1}</div>
                <div class="form-group">
                    <label>Título del Anuncio</label>
                    <input type="text" class="edit-ann-title" data-index="${index}" value="${item.title}" required>
                </div>
                <div class="form-group">
                    <label>Descripción / Texto Corto</label>
                    <textarea class="edit-ann-desc" data-index="${index}" rows="2" required>${item.desc}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Texto del Botón</label>
                        <input type="text" class="edit-ann-btn-text" data-index="${index}" value="${item.btnText}" required>
                    </div>
                    <div class="form-group">
                        <label>Enlace del Botón</label>
                        <input type="text" class="edit-ann-btn-link" data-index="${index}" value="${item.btnLink}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>URL de Imagen de Fondo (Separada)</label>
                    <input type="text" class="edit-ann-bg" data-index="${index}" value="${item.bgImage}" required>
                </div>
            `;
            announcementsEditList.appendChild(block);
        });
    }

    // 🛠️ Render Schedule Editor Inputs
    function renderAdminScheduleEditor() {
        if (!scheduleEditList) return;
        scheduleEditList.innerHTML = "";
        
        schedule.forEach((item, index) => {
            const block = document.createElement("div");
            block.className = "admin-edit-item";
            block.innerHTML = `
                <div class="admin-item-header">Programa #${index + 1}</div>
                <div class="form-row">
                    <div class="form-group" style="flex: 0.8;">
                        <label>Horario</label>
                        <input type="text" class="edit-sch-time" data-index="${index}" value="${item.time}" required>
                    </div>
                    <div class="form-group" style="flex: 1.2;">
                        <label>Título del Programa</label>
                        <input type="text" class="edit-sch-title" data-index="${index}" value="${item.title}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Breve Descripción</label>
                    <textarea class="edit-sch-desc" data-index="${index}" rows="2" required>${item.desc}</textarea>
                </div>
            `;
            scheduleEditList.appendChild(block);
        });
    }

    // 💾 Save Admin Changes to Firebase Realtime Database & Local Cache
    function saveAdminChanges() {
        saveLocalBtn.disabled = true;
        const originalBtnHtml = saveLocalBtn.innerHTML;
        saveLocalBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando en Nube...';

        // 1. Gather Edited Announcements
        const editedAnnouncements = [];
        const annTitles = document.querySelectorAll(".edit-ann-title");
        const annDescs = document.querySelectorAll(".edit-ann-desc");
        const annBtnTexts = document.querySelectorAll(".edit-ann-btn-text");
        const annBtnLinks = document.querySelectorAll(".edit-ann-btn-link");
        const annBgs = document.querySelectorAll(".edit-ann-bg");

        for (let i = 0; i < annTitles.length; i++) {
            editedAnnouncements.push({
                title: annTitles[i].value,
                desc: annDescs[i].value,
                btnText: annBtnTexts[i].value,
                btnLink: annBtnLinks[i].value,
                bgImage: annBgs[i].value
            });
        }

        // 2. Gather Edited Schedule
        let editedSchedule = [...schedule];
        const schTimes = document.querySelectorAll(".edit-sch-time");
        const schTitles = document.querySelectorAll(".edit-sch-title");
        const schDescs = document.querySelectorAll(".edit-sch-desc");

        if (schTimes.length > 0) {
            editedSchedule = [];
            for (let i = 0; i < schTimes.length; i++) {
                editedSchedule.push({
                    time: schTimes[i].value,
                    title: schTitles[i].value,
                    desc: schDescs[i].value
                });
            }
        }

        // 3. Save State & Sync to Firebase
        const payload = {
            password: "25863206",
            announcements: editedAnnouncements,
            schedule: editedSchedule
        };

        fetch(DATABASE_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error("Acceso denegado o fallo de conexión.");
            return res.json();
        })
        .then(data => {
            announcements = editedAnnouncements;
            schedule = editedSchedule;

            localStorage.setItem("musichris_announcements", JSON.stringify(announcements));
            localStorage.setItem("musichris_schedule", JSON.stringify(schedule));

            // Re-render
            currentAnnounceIndex = 0;
            startAnnouncementSlideshow();
            renderPublicSchedule();
            generateExportCode();

            alert("✨ ¡Configuración guardada en la base de datos de Google con éxito! Los cambios ya son visibles al instante en todo el mundo.");
        })
        .catch(err => {
            console.error(err);
            alert("❌ Error al guardar en la base de datos global de Google: " + err.message + "\n\nSe ha guardado localmente como respaldo en este navegador.");
            
            // Fallback: save locally
            announcements = editedAnnouncements;
            schedule = editedSchedule;
            localStorage.setItem("musichris_announcements", JSON.stringify(announcements));
            localStorage.setItem("musichris_schedule", JSON.stringify(schedule));
            
            currentAnnounceIndex = 0;
            startAnnouncementSlideshow();
            renderPublicSchedule();
            generateExportCode();
        })
        .finally(() => {
            saveLocalBtn.disabled = false;
            saveLocalBtn.innerHTML = originalBtnHtml;
        });
    }

    // 📤 Generate JSON Export String for easy copy-pasting
    function generateExportCode() {
        const fullConfig = {
            announcements: announcements,
            schedule: schedule
        };
        exportJsonCode.value = JSON.stringify(fullConfig, null, 4);
    }

    function copyExportCodeToClipboard() {
        exportJsonCode.select();
        document.execCommand("copy");
        alert("📋 ¡Código de configuración copiado al portapapeles! Puedes enviarme este código o guardarlo directamente en tu configuración de GitHub para hacerlo definitivo.");
    }

    // 📩 PRIVATE MESSAGES SYSTEM (Serverless Inbox Engine)
    function escapeHTML(str) {
        if (!str) return "";
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    async function fetchPrivateMessages() {
        const inboxMessagesList = document.getElementById("inbox-messages-list");
        if (inboxMessagesList) {
            inboxMessagesList.innerHTML = '<div class="inbox-empty-state"><i class="fa-solid fa-circle-notch fa-spin"></i> Sincronizando bandeja de entrada...</div>';
        }

        const user = auth.currentUser;
        if (!user) {
            if (inboxMessagesList) {
                inboxMessagesList.innerHTML = `<div class="inbox-empty-state"><i class="fa-solid fa-circle-exclamation" style="color: #ff4b4b;"></i> Acceso denegado: No has iniciado sesión.</div>`;
            }
            return;
        }

        try {
            const token = await user.getIdToken();
            const res = await fetch(`https://proyecto-musichris-350df-default-rtdb.us-central1.firebasedatabase.app/private_messages.json?auth=${token}`);
            if (!res.ok) throw new Error("No se pudo conectar a la base de datos.");
            const data = await res.json();
            privateMessages = data || {};
            renderPrivateMessages(activeMessageFilter);
        } catch (err) {
            console.error("Error al obtener mensajes privados:", err);
            if (inboxMessagesList) {
                inboxMessagesList.innerHTML = `<div class="inbox-empty-state"><i class="fa-solid fa-circle-exclamation" style="color: #ff4b4b;"></i> Error al cargar mensajes: ${err.message}</div>`;
            }
        }
    }

    function renderPrivateMessages(filterType = "oracion") {
        const inboxMessagesList = document.getElementById("inbox-messages-list");
        if (!inboxMessagesList) return;

        inboxMessagesList.innerHTML = "";

        // Convert the messages object into an array with IDs and sort by timestamp descending
        const messageArray = Object.entries(privateMessages)
            .map(([id, val]) => ({ id, ...val }))
            .filter(msg => msg.type === filterType)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (messageArray.length === 0) {
            let emptyText = "No hay peticiones de oración en este momento.";
            let emptyIcon = "fa-hands-praying";
            if (filterType === "testimonio") {
                emptyText = "No hay testimonios registrados en este momento.";
                emptyIcon = "fa-dove";
            } else if (filterType === "contacto") {
                emptyText = "No hay sugerencias o mensajes en este momento.";
                emptyIcon = "fa-envelope-open";
            }
            
            inboxMessagesList.innerHTML = `
                <div class="inbox-empty-state">
                    <i class="fa-solid ${emptyIcon}"></i>
                    <p>${emptyText}</p>
                </div>
            `;
            return;
        }

        messageArray.forEach(msg => {
            const card = document.createElement("div");
            card.className = "inbox-card";
            
            // Format timestamp nicely
            const dateStr = msg.timestamp ? new Date(msg.timestamp).toLocaleString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }) : "Fecha no especificada";

            card.innerHTML = `
                <div class="inbox-card-header">
                    <div class="inbox-card-meta">
                        <span class="inbox-sender-name">${escapeHTML(msg.name)}</span>
                        <span class="inbox-sender-email">${escapeHTML(msg.email)}</span>
                    </div>
                    <span class="inbox-card-date">${dateStr}</span>
                </div>
                <div class="inbox-card-body">${escapeHTML(msg.message)}</div>
                <div class="inbox-card-actions">
                    <a href="mailto:${encodeURIComponent(msg.email)}?subject=${encodeURIComponent('Re: Mensaje en MusiChris Studio Radio')}" class="inbox-btn inbox-btn-reply">
                        <i class="fa-solid fa-reply"></i> Responder
                    </a>
                    <button class="inbox-btn inbox-btn-delete" data-id="${msg.id}">
                        <i class="fa-solid fa-trash-can"></i> Eliminar
                    </button>
                </div>
            `;
            
            inboxMessagesList.appendChild(card);
        });

        // Bind delete buttons
        const deleteButtons = inboxMessagesList.querySelectorAll(".inbox-btn-delete");
        deleteButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const messageId = btn.getAttribute("data-id");
                deletePrivateMessage(messageId, btn);
            });
        });
    }

    async function deletePrivateMessage(messageId, btn) {
        if (!messageId) return;

        const originalBtnHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        const user = auth.currentUser;
        if (!user) {
            alert("No has iniciado sesión como administrador.");
            btn.disabled = false;
            btn.innerHTML = originalBtnHtml;
            return;
        }

        try {
            const token = await user.getIdToken();
            const res = await fetch(`https://proyecto-musichris-350df-default-rtdb.us-central1.firebasedatabase.app/private_messages/${messageId}.json?auth=${token}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("No se pudo eliminar el mensaje.");
            await res.json();
            
            // Delete from local cache
            delete privateMessages[messageId];
            
            // Highlight card and fade out dynamically for premium micro-interaction feel
            const card = btn.closest(".inbox-card");
            if (card) {
                card.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
                card.style.transform = "scale(0.95)";
                card.style.opacity = "0";
                setTimeout(() => {
                    card.remove();
                    // If no more items in current filter, re-render empty state
                    if (Object.keys(privateMessages).filter(k => privateMessages[k].type === activeMessageFilter).length === 0) {
                        renderPrivateMessages(activeMessageFilter);
                    }
                }, 400);
            } else {
                renderPrivateMessages(activeMessageFilter);
            }
        } catch (err) {
            console.error("Error al eliminar mensaje:", err);
            alert("Error al intentar eliminar: " + err.message);
            btn.disabled = false;
            btn.innerHTML = originalBtnHtml;
        }
    }

    // 6. 📻 ORIGINAL STREAM CONTROLLER LOGIC (Web Audio & Verses)
    let isPlaying = false;
    let lastVolume = 80;
    let isMuted = false;
    
    // Web Audio API State Variables
    let audioContext = null;
    let analyser = null;
    let source = null;
    let isContextInitialized = false;

    function togglePlay() {
        if (!isPlaying) {
            audio.load();
            audio.play()
                .then(() => {
                    isPlaying = true;
                    playerCard.classList.add("playing");
                    playIcon.className = "fa-solid fa-pause";
                    playBtn.style.paddingLeft = "0px";
                    startRealVisualizer();
                })
                .catch(error => {
                    console.error("❌ Falló la reproducción:", error);
                    alert("No se pudo conectar con la señal de la radio. Por favor, intenta de nuevo.");
                });
        } else {
            audio.pause();
            isPlaying = false;
            playerCard.classList.remove("playing");
            playIcon.className = "fa-solid fa-play";
            playBtn.style.paddingLeft = "5px";
        }
    }

    function initAudioContext() {
        if (isContextInitialized) return;
        
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 64; 
            
            source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            isContextInitialized = true;
        } catch (e) {
            console.warn("⚠️ Web Audio API no es compatible:", e);
        }
    }

    function startRealVisualizer() {
        initAudioContext();
        
        if (audioContext && audioContext.state === "suspended") {
            audioContext.resume();
        }
        
        if (!isContextInitialized) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const bars = visualizer.querySelectorAll(".bar");

        function draw() {
            if (!isPlaying) {
                bars.forEach(bar => bar.style.height = "4px");
                return;
            }

            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            for (let i = 0; i < bars.length; i++) {
                const freqIndex = Math.floor(i * 1.5) + 1;
                const freqValue = dataArray[freqIndex] || 0;
                const barHeight = Math.max(4, (freqValue / 255) * 48 + 4);
                bars[i].style.height = `${barHeight}px`;
            }
        }

        draw();
    }

    // Infinite Scripture Carousel
    const phrases = [
        "Todo lo puedo en Cristo que me fortalece. — Filipenses 4:13",
        "El Señor es mi pastor, nada me faltará. — Salmo 23:1",
        "Jehová es mi luz y mi salvación; ¿de quién temeré? — Salmo 27:1",
        "Lámpara es a mis pies tu palabra, y lumbrera a mi camino. — Salmo 119:105",
        "Clama a mí, y yo te responderé. — Jeremías 33:3",
        "El amor nunca deja de ser. — 1 Corintios 13:8",
        "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios. — Isaías 41:10",
        "La paz de Dios, que sobrepasa todo entendimiento, guardará sus corazones. — Filipenses 4:7"
    ];

    let currentPhraseIndex = 0;

    function rotatePhrases() {
        if (!phraseText) return;
        
        phraseText.style.opacity = 0;
        
        setTimeout(() => {
            currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
            phraseText.textContent = phrases[currentPhraseIndex];
            phraseText.style.opacity = 1;
        }, 500);
    }

    setInterval(rotatePhrases, 7000);

    // Volume Slider & Mute Controls
    function handleVolumeChange() {
        const volumeVal = volumeSlider.value;
        audio.volume = volumeVal / 100;
        
        if (volumeVal == 0) {
            volumeIcon.className = "fa-solid fa-volume-xmark";
            isMuted = true;
        } else if (volumeVal < 40) {
            volumeIcon.className = "fa-solid fa-volume-low";
            isMuted = false;
        } else {
            volumeIcon.className = "fa-solid fa-volume-high";
            isMuted = false;
        }
        
        if (volumeVal > 0) {
            lastVolume = volumeVal;
        }
    }

    function toggleMute() {
        if (!isMuted) {
            lastVolume = volumeSlider.value > 0 ? volumeSlider.value : 80;
            volumeSlider.value = 0;
            audio.volume = 0;
            volumeIcon.className = "fa-solid fa-volume-xmark";
            isMuted = true;
        } else {
            volumeSlider.value = lastVolume;
            audio.volume = lastVolume / 100;
            volumeIcon.className = lastVolume < 40 ? "fa-solid fa-volume-low" : "fa-solid fa-volume-high";
            isMuted = false;
        }
    }

    function openWhatsAppRequest() {
        const targetPhone = "34634655522";
        const baseMessage = "¡Hola MusiChris Studio Radio! 🕊️ Me gustaría pedir una canción para escucharla en la señal de bendición: ";
        const encodedMsg = encodeURIComponent(baseMessage);
        const waUrl = `https://wa.me/${targetPhone}?text=${encodedMsg}`;
        window.open(waUrl, "_blank");
    }

    // Prayer & Testimony Form
    if (prayerForm) {
        prayerForm.addEventListener("submit", (e) => {
            e.preventDefault(); 
            
            const nameInput = document.getElementById("form-name");
            const emailInput = document.getElementById("form-email");
            const typeSelect = document.getElementById("form-type");
            const messageTextarea = document.getElementById("form-message");
            
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const type = typeSelect.value;
            const message = messageTextarea.value.trim();
            
            if (!name || !email || !message) {
                alert("Por favor completa todos los campos del formulario.");
                return;
            }
            
            const submitBtn = prayerForm.querySelector(".submit-btn");
            const originalBtnHtml = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Enviando...`;
            
            fetch("https://proyecto-musichris-350df-default-rtdb.us-central1.firebasedatabase.app/private_messages.json", {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    email: email,
                    type: type,
                    message: message,
                    timestamp: Date.now()
                })
            })
            .then(res => {
                if (!res.ok) throw new Error("Error en la conexión con el servidor.");
                return res.json();
            })
            .then(() => {
                // Personalizar mensaje de éxito según el tipo de mensaje
                const successSpan = formSuccess.querySelector("span");
                if (successSpan) {
                    if (type === "oracion") {
                        successSpan.textContent = "¡Petición recibida! Estaremos orando por ti. ¡Bendiciones!";
                    } else if (type === "testimonio") {
                        successSpan.textContent = "¡Testimonio recibido! Gracias por compartir tu victoria. ¡Gloria a Dios!";
                    } else {
                        successSpan.textContent = "¡Mensaje recibido! Nos pondremos en contacto pronto. ¡Bendiciones!";
                    }
                }
                
                formSuccess.classList.add("show");
                prayerForm.reset();
                
                setTimeout(() => {
                    formSuccess.classList.remove("show");
                }, 6000);
            })
            .catch(err => {
                console.error("Error al enviar mensaje privado:", err);
                alert("Hubo un problema al enviar tu mensaje. Por favor, inténtalo nuevamente.");
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            });
        });
    }

    // 🚀 Performance Optimization: Cache section offsets to avoid scroll layout thrashing
    let cachedSectionOffsets = [];
    function cacheSectionOffsets() {
        cachedSectionOffsets = Array.from(sections)
            .filter(section => section.getAttribute("id")) // Solo espiar secciones que tengan un ID de navegación válido
            .map(section => {
                const id = section.getAttribute("id");
                return {
                    id: id,
                    top: section.getBoundingClientRect().top + window.pageYOffset
                };
            });
    }
    
    // Initial cache and update on window resize
    cacheSectionOffsets();
    window.addEventListener("resize", cacheSectionOffsets);
    window.addEventListener("load", cacheSectionOffsets);

    // Navigation Scroll Spy
    window.addEventListener("scroll", () => {
        let currentSectionId = "";
        const scrollY = window.scrollY || window.pageYOffset;
        
        for (let i = 0; i < cachedSectionOffsets.length; i++) {
            if (scrollY >= (cachedSectionOffsets[i].top - 180)) {
                currentSectionId = cachedSectionOffsets[i].id;
            }
        }

        navLinks.forEach(link => {
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    });

    // 🚀 Custom Ultra-Fast Smooth Scroll for Navigation Links
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const targetId = link.getAttribute("href");
            if (targetId && targetId.startsWith("#")) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const header = document.querySelector(".main-header");
                    const headerHeight = header ? header.offsetHeight : 80;
                    const targetPosition = (targetElement.getBoundingClientRect().top + window.pageYOffset) - headerHeight + 5;
                    
                    // Temporarily disable native smooth scroll to avoid lag or conflicts
                    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
                    document.documentElement.style.scrollBehavior = "auto";
                    
                    // High-performance smooth scroll (Snappy 350ms duration)
                    const startY = window.scrollY || window.pageYOffset;
                    const difference = targetPosition - startY;
                    const startTime = performance.now();
                    const duration = 350; // milliseconds

                    function step(timestamp) {
                        const progress = timestamp - startTime;
                        const percentage = Math.min(progress / duration, 1);
                        
                        // Cubic ease-out curve (fast initial speed, silky smooth deceleration)
                        const easeOutCubic = 1 - Math.pow(1 - percentage, 3);

                        window.scrollTo(0, startY + difference * easeOutCubic);

                        if (progress < duration) {
                            window.requestAnimationFrame(step);
                        } else {
                            // Restore native scroll behavior
                            document.documentElement.style.scrollBehavior = originalScrollBehavior;
                            // Cleanly update URL without layout jumping
                            history.pushState(null, null, targetId);
                        }
                    }

                    window.requestAnimationFrame(step);
                }
            }
        });
    });

    // 6.6. 🎙️ AZURACAST LIVE METADATA INTEGRATION
    const AZURACAST_CONFIG = {
        enabled: true, // Habilitado para la señal oficial de Oracle Cloud
        apiUrl: "https://161-153-197-23.sslip.io/api/nowplaying/musichris_studio_radio", // URL de la API Now Playing de AzuraCast
        pollIntervalMs: 15000 // Frecuencia de actualización (15 segundos)
    };

    let azuracastInterval = null;

    function fetchAzuraCastMetadata() {
        if (!AZURACAST_CONFIG.enabled) return;

        fetch(AZURACAST_CONFIG.apiUrl)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then(data => {
                if (data && data.now_playing) {
                    const song = data.now_playing.song;
                    if (songTitleEl && song.title) {
                        songTitleEl.textContent = song.title;
                    }
                    if (songArtistEl && song.artist) {
                        songArtistEl.textContent = song.artist;
                    }
                    if (songCoverEl && song.art) {
                        songCoverEl.src = song.art;
                    }
                }
            })
            .catch(() => {
                // Silencioso: esperado en localhost por CORS.
                // Funciona correctamente en producción (Firebase Hosting).
            });
    }

    function startAzuraCastMetadataPolling() {
        if (!AZURACAST_CONFIG.enabled) return;
        
        fetchAzuraCastMetadata(); // Primer llamado inmediato
        
        azuracastInterval = setInterval(fetchAzuraCastMetadata, AZURACAST_CONFIG.pollIntervalMs);
    }

    // 7. BIND INTERACTIVE LISTENERS & INITIAL BOOT
    playBtn.addEventListener("click", togglePlay);
    muteBtn.addEventListener("click", toggleMute);
    volumeSlider.addEventListener("input", handleVolumeChange);
    whatsappBtn.addEventListener("click", openWhatsAppRequest);

    // Admin Bindings & Invisible Backdoor Engine
    adminTriggerBtn.addEventListener("click", openAdminPanel);
    closeAdminBtn.addEventListener("click", () => {
        closeAdminPanel();
        // Sign out from Firebase when closing panel
        signOut(auth).catch(() => {});
    });
    adminLoginBtn.addEventListener("click", handleAdminLogin);
    saveLocalBtn.addEventListener("click", saveAdminChanges);
    copyCodeBtn.addEventListener("click", copyExportCodeToClipboard);

    adminPasswordInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleAdminLogin();
    });
    if (adminEmailInput) {
        adminEmailInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") adminPasswordInput && adminPasswordInput.focus();
        });
    }

    // 🤫 Backdoor A: URL query parameters or URL hash check
    const urlParams = new URLSearchParams(window.location.search);
    const hasAdminQuery = urlParams.get("admin") === "true" || urlParams.get("edit") === "true";
    const hasAdminHash = window.location.hash === "#admin" || window.location.hash === "#edit";

    if (hasAdminQuery || hasAdminHash) {
        adminTriggerBtn.style.display = "flex";
        // Directly open the admin modal login for outstanding UX
        setTimeout(() => {
            openAdminPanel();
        }, 300);
    }

    // Dynamic Hash Listener to open the Admin Modal without forcing a page reload
    window.addEventListener("hashchange", () => {
        if (window.location.hash === "#admin" || window.location.hash === "#edit") {
            adminTriggerBtn.style.display = "flex";
            openAdminPanel();
        }
    });

    // 🤫 Backdoor B: 5-click Logo Easter Egg
    const logoArea = document.querySelector(".logo-area");
    let logoClickCount = 0;
    let logoClickTimer = null;

    if (logoArea) {
        logoArea.style.cursor = "pointer"; // Interactive cursor for admin
        logoArea.addEventListener("click", () => {
            logoClickCount++;
            
            if (logoClickTimer) clearTimeout(logoClickTimer);
            
            logoClickTimer = setTimeout(() => {
                logoClickCount = 0;
            }, 3000); // Reset after 3 seconds of inactivity
            
            if (logoClickCount >= 5) {
                logoClickCount = 0;
                clearTimeout(logoClickTimer);
                openAdminPanel(); // Pop up the credentials modal
            }
        });
    }

    // -------------------------------------------------------------
    // 🌟 LISTADO DE LIBROS DE LA BIBLIA (REINA VALERA 1960 API)
    // -------------------------------------------------------------
    const BIBLE_BOOKS = [
        { display: "Génesis", query: "genesis", chapters: 50 },
        { display: "Éxodo", query: "exodo", chapters: 40 },
        { display: "Levítico", query: "levitico", chapters: 27 },
        { display: "Números", query: "numeros", chapters: 36 },
        { display: "Deuteronomio", query: "deuteronomio", chapters: 34 },
        { display: "Josué", query: "josue", chapters: 24 },
        { display: "Jueces", query: "jueces", chapters: 21 },
        { display: "Rut", query: "rut", chapters: 4 },
        { display: "1 Samuel", query: "1-samuel", chapters: 31 },
        { display: "2 Samuel", query: "2-samuel", chapters: 24 },
        { display: "1 Reyes", query: "1-reyes", chapters: 22 },
        { display: "2 Reyes", query: "2-reyes", chapters: 25 },
        { display: "1 Crónicas", query: "1-cronicas", chapters: 29 },
        { display: "2 Crónicas", query: "2-cronicas", chapters: 36 },
        { display: "Esdras", query: "esdras", chapters: 10 },
        { display: "Nehemías", query: "nehemias", chapters: 13 },
        { display: "Ester", query: "ester", chapters: 10 },
        { display: "Job", query: "job", chapters: 42 },
        { display: "Salmos", query: "salmos", chapters: 150 },
        { display: "Proverbios", query: "proverbios", chapters: 31 },
        { display: "Eclesiastés", query: "eclesiastes", chapters: 12 },
        { display: "Cantares", query: "cantares", chapters: 8 },
        { display: "Isaías", query: "isaias", chapters: 66 },
        { display: "Jeremías", query: "jeremias", chapters: 52 },
        { display: "Lamentaciones", query: "lamentaciones", chapters: 5 },
        { display: "Ezequiel", query: "ezequiel", chapters: 48 },
        { display: "Daniel", query: "daniel", chapters: 12 },
        { display: "Oseas", query: "oseas", chapters: 14 },
        { display: "Joel", query: "joel", chapters: 3 },
        { display: "Amós", query: "amos", chapters: 9 },
        { display: "Abdías", query: "abdias", chapters: 1 },
        { display: "Jonás", query: "jonas", chapters: 4 },
        { display: "Miqueas", query: "miqueas", chapters: 7 },
        { display: "Nahúm", query: "nahum", chapters: 3 },
        { display: "Habacuc", query: "habacuc", chapters: 3 },
        { display: "Sofonías", query: "sofonias", chapters: 3 },
        { display: "Hageo", query: "hageo", chapters: 2 },
        { display: "Zacarías", query: "zacarias", chapters: 14 },
        { display: "Malaquías", query: "malaquias", chapters: 4 },
        { display: "Mateo", query: "mateo", chapters: 28 },
        { display: "Marcos", query: "marcos", chapters: 16 },
        { display: "Lucas", query: "lucas", chapters: 24 },
        { display: "Juan", query: "juan", chapters: 21 },
        { display: "Hechos", query: "hechos", chapters: 28 },
        { display: "Romanos", query: "romanos", chapters: 16 },
        { display: "1 Corintios", query: "1-corintios", chapters: 16 },
        { display: "2 Corintios", query: "2-corintios", chapters: 13 },
        { display: "Gálatas", query: "galatas", chapters: 6 },
        { display: "Efesios", query: "efesios", chapters: 6 },
        { display: "Filipenses", query: "filipenses", chapters: 4 },
        { display: "Colosenses", query: "colosenses", chapters: 4 },
        { display: "1 Tesalonicenses", query: "1-tesalonicenses", chapters: 5 },
        { display: "2 Tesalonicenses", query: "2-tesalonicenses", chapters: 3 },
        { display: "1 Timoteo", query: "1-timoteo", chapters: 6 },
        { display: "2 Timoteo", query: "2-timoteo", chapters: 4 },
        { display: "Tito", query: "tito", chapters: 3 },
        { display: "Filemón", query: "filemon", chapters: 1 },
        { display: "Hebreos", query: "hebreos", chapters: 13 },
        { display: "Santiago", query: "santiago", chapters: 5 },
        { display: "1 Pedro", query: "1-pedro", chapters: 5 },
        { display: "2 Pedro", query: "2-pedro", chapters: 3 },
        { display: "1 Juan", query: "1-juan", chapters: 5 },
        { display: "2 Juan", query: "2-juan", chapters: 1 },
        { display: "3 Juan", query: "3-juan", chapters: 1 },
        { display: "Judas", query: "judas", chapters: 1 },
        { display: "Apocalipsis", query: "apocalipsis", chapters: 22 }
    ];

    // -------------------------------------------------------------
    // 🌟 BIBLIA INTERACTIVA REINA VALERA 1960 ENGINE
    // -------------------------------------------------------------
    let currentBookIndex = 18; // Default: Salmos
    let currentChapter = 23;    // Default: Salmo 23

    function initInteractiveBible() {
        const bookSelect = document.getElementById("bible-book-select");
        const chapterSelect = document.getElementById("bible-chapter-select");
        
        if (!bookSelect || !chapterSelect) return;
        
        // Populate books selector
        bookSelect.innerHTML = "";
        BIBLE_BOOKS.forEach((book, index) => {
            const opt = document.createElement("option");
            opt.value = index;
            opt.textContent = book.display;
            bookSelect.appendChild(opt);
        });
        
        // Set initial values
        bookSelect.value = currentBookIndex;
        populateChapters();
        chapterSelect.value = currentChapter;
        
        // Setup change event for book
        bookSelect.addEventListener("change", (e) => {
            currentBookIndex = parseInt(e.target.value);
            currentChapter = 1;
            populateChapters();
            loadBibleChapter();
        });
        
        // Setup change event for chapter
        chapterSelect.addEventListener("change", (e) => {
            currentChapter = parseInt(e.target.value);
            loadBibleChapter();
        });

        // Setup change event for verse selection
        const verseSelect = document.getElementById("bible-verse-select");
        if (verseSelect) {
            verseSelect.addEventListener("change", () => {
                applyVerseFilter();
            });
        }
        
        // Setup arrow buttons navigation
        document.getElementById("bible-prev-btn").addEventListener("click", () => {
            if (currentChapter > 1) {
                currentChapter--;
                chapterSelect.value = currentChapter;
                loadBibleChapter();
            } else if (currentBookIndex > 0) {
                currentBookIndex--;
                bookSelect.value = currentBookIndex;
                populateChapters();
                currentChapter = BIBLE_BOOKS[currentBookIndex].chapters;
                chapterSelect.value = currentChapter;
                loadBibleChapter();
            }
        });
        
        document.getElementById("bible-next-btn").addEventListener("click", () => {
            const maxChapters = BIBLE_BOOKS[currentBookIndex].chapters;
            if (currentChapter < maxChapters) {
                currentChapter++;
                chapterSelect.value = currentChapter;
                loadBibleChapter();
            } else if (currentBookIndex < BIBLE_BOOKS.length - 1) {
                currentBookIndex++;
                bookSelect.value = currentBookIndex;
                populateChapters();
                currentChapter = 1;
                chapterSelect.value = currentChapter;
                loadBibleChapter();
            }
        });

        // Copy selection to clipboard (respecting single verse if selected)
        document.getElementById("copy-chapter-btn").addEventListener("click", () => {
            const contentArea = document.getElementById("bible-content-area");
            const selectedVerseVal = document.getElementById("bible-verse-select").value;
            if (!contentArea) return;
            
            const book = BIBLE_BOOKS[currentBookIndex];
            let formatted = "";
            
            if (selectedVerseVal === "all") {
                const text = contentArea.innerText;
                formatted = `📖 *${book.display} Capítulo ${currentChapter} (Reina Valera 1960)* 📖\n\n${text}\n\n📻 Escucha MusiChris Studio Radio: https://www.youtube.com/@Musichris_Studio`;
            } else {
                const targetNum = parseInt(selectedVerseVal);
                const verseEl = document.getElementById(`verse-item-${targetNum}`);
                // Remove verse number prefix from visual copy
                const verseText = verseEl ? verseEl.innerText.replace(new RegExp(`^${targetNum}\\s*`), "").trim() : "";
                formatted = `📖 *${book.display} ${currentChapter}:${targetNum} (Reina Valera 1960)* 📖\n\n"${verseText}"\n\n📻 Escucha MusiChris Studio Radio: https://www.youtube.com/@Musichris_Studio`;
            }
            
            navigator.clipboard.writeText(formatted).then(() => {
                alert("📋 ¡Selección copiada al portapapeles con éxito! Listo para bendecir.");
            });
        });

        // Share selection via WhatsApp (respecting single verse if selected)
        document.getElementById("share-chapter-btn").addEventListener("click", () => {
            const book = BIBLE_BOOKS[currentBookIndex];
            const selectedVerseVal = document.getElementById("bible-verse-select").value;
            let text = "";
            
            if (selectedVerseVal === "all") {
                text = `Te comparto la palabra de Dios de *${book.display} Capítulo ${currentChapter} (Reina Valera 1960)* 📖\n\nLee el capítulo completo en vivo ingresando aquí:\n👉 https://www.youtube.com/@Musichris_Studio`;
            } else {
                const targetNum = parseInt(selectedVerseVal);
                const verseEl = document.getElementById(`verse-item-${targetNum}`);
                const verseText = verseEl ? verseEl.innerText.replace(new RegExp(`^${targetNum}\\s*`), "").trim() : "";
                text = `Te comparto la palabra de Dios de *${book.display} ${currentChapter}:${targetNum} (Reina Valera 1960)* 📖\n\n"${verseText}"\n\nSintoniza MusiChris Studio Radio aquí:\n👉 https://www.youtube.com/@Musichris_Studio`;
            }
            
            const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
            window.open(url, "_blank");
        });
    }

    function populateChapters() {
        const chapterSelect = document.getElementById("bible-chapter-select");
        if (!chapterSelect) return;
        
        chapterSelect.innerHTML = "";
        const maxChapters = BIBLE_BOOKS[currentBookIndex].chapters;
        
        for (let i = 1; i <= maxChapters; i++) {
            const opt = document.createElement("option");
            opt.value = i;
            opt.textContent = `Capítulo ${i}`;
            chapterSelect.appendChild(opt);
        }
    }

    function applyVerseFilter() {
        const selectedVerseVal = document.getElementById("bible-verse-select").value;
        const verseItems = document.querySelectorAll(".bible-verse-item");
        const copyBtn = document.getElementById("copy-chapter-btn");
        const shareBtn = document.getElementById("share-chapter-btn");
        
        if (selectedVerseVal === "all") {
            if (copyBtn) copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copiar Capítulo`;
            if (shareBtn) shareBtn.innerHTML = `<i class="fa-brands fa-whatsapp"></i> Compartir`;
            
            verseItems.forEach(item => {
                item.classList.remove("highlighted");
                item.style.opacity = "1";
                item.style.transform = "scale(1)";
            });
        } else {
            if (copyBtn) copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copiar Versículo`;
            if (shareBtn) shareBtn.innerHTML = `<i class="fa-brands fa-whatsapp"></i> Compartir Versículo`;
            
            const targetNum = parseInt(selectedVerseVal);
            verseItems.forEach(item => {
                const itemNum = parseInt(item.id.replace("verse-item-", ""));
                if (itemNum === targetNum) {
                    item.classList.add("highlighted");
                    item.style.opacity = "1";
                    item.style.transform = "scale(1.02)";
                    item.scrollIntoView({ behavior: "smooth", block: "center" });
                } else {
                    item.classList.remove("highlighted");
                    item.style.opacity = "0.2";
                    item.style.transform = "scale(0.98)";
                }
            });
        }
    }

    function loadBibleChapter() {
        const loader = document.getElementById("bible-loader");
        const contentArea = document.getElementById("bible-content-area");
        const verseSelect = document.getElementById("bible-verse-select");
        
        if (!contentArea || !loader) return;
        
        loader.classList.add("active");
        
        const book = BIBLE_BOOKS[currentBookIndex];
        const url = `https://bible-api.deno.dev/api/read/rv1960/${book.query}/${currentChapter}`;
        
        fetch(url)
            .then(res => res.json())
            .then(data => {
                loader.classList.remove("active");
                
                if (data && data.vers) {
                    contentArea.innerHTML = "";
                    
                    // Reset and Populate Verse Selector
                    if (verseSelect) {
                        verseSelect.innerHTML = `<option value="all">Todos los versículos</option>`;
                        data.vers.forEach(verse => {
                            const opt = document.createElement("option");
                            opt.value = verse.number;
                            opt.textContent = `Versículo ${verse.number}`;
                            verseSelect.appendChild(opt);
                        });
                    }
                    
                    data.vers.forEach(verse => {
                        const verseDiv = document.createElement("div");
                        verseDiv.className = "bible-verse-item";
                        verseDiv.id = `verse-item-${verse.number}`;
                        verseDiv.innerHTML = `<span class="bible-verse-num">${verse.number}</span> ${verse.verse}`;
                        contentArea.appendChild(verseDiv);
                    });
                    
                    // Scroll to top of viewport
                    document.querySelector(".bible-reader-viewport").scrollTop = 0;
                    
                    // Apply any selected verse filter
                    applyVerseFilter();
                } else {
                    contentArea.innerHTML = `<p class="error-msg" style="text-align: center; padding: 20px;">⚠️ No se pudo cargar el capítulo. Inténtalo nuevamente.</p>`;
                }
            })
            .catch(err => {
                loader.classList.remove("active");
                contentArea.innerHTML = `<p class="error-msg" style="text-align: center; padding: 20px;">⚠️ Error de conexión al cargar la palabra sagrada.</p>`;
                console.error(err);
            });
    }

    // -------------------------------------------------------------
    // 🛐 MURO DE CLAMOR EN VIVO (FIREBASE REALTIME DB)
    // -------------------------------------------------------------
    function fetchPrayerWall() {
        // Pedimos solo los últimos 20 mensajes ordenados por timestamp
        const url = "https://proyecto-musichris-350df-default-rtdb.us-central1.firebasedatabase.app/prayers.json?orderBy=\"timestamp\"&limitToLast=20";
        fetch(url)
            .then(res => res.json())
            .then(data => {
                const prayersScroller = document.getElementById("prayers-scroller");
                if (!prayersScroller) return;

                prayersScroller.innerHTML = "";

                let items = [];
                if (data) {
                    // Los últimos 20, del más reciente al más antiguo
                    items = Object.values(data).reverse();
                }

                // Mensajes de muestra si la lista está vacía
                if (items.length === 0) {
                    items = [
                        { name: "MusiChris Studio", text: "Orando en cadena global de fe y bendición para todo el mundo." },
                        { name: "Hermano Pedro", text: "Clamando por restauración familiar y paz espiritual en cada hogar." },
                        { name: "Hermana María", text: "Dando gracias por un milagro financiero y provisión diaria." }
                    ];
                }

                // Duplicar para el efecto de scroll infinito
                const renderItems = [...items, ...items];

                renderItems.forEach(item => {
                    const el = document.createElement("div");
                    el.className = "scroll-item";
                    el.innerHTML = `✨ <span class="item-name">${item.name || "Anónimo"}:</span> ${item.text}`;
                    prayersScroller.appendChild(el);
                });
            })
            .catch(() => {
                // Silencioso en localhost: Firebase bloquea peticiones sin auth desde HTTP local.
                // En producción (HTTPS + Firebase Hosting) funciona correctamente.
                // Mostramos datos de muestra para no dejar el Muro vacío.
                const prayersScroller = document.getElementById('prayers-scroller');
                if (!prayersScroller || prayersScroller.children.length > 0) return;
                const fallback = [
                    { name: "MusiChris Studio", text: "Orando en cadena global de fe y bendición para todo el mundo." },
                    { name: "Hermano Pedro", text: "Clamando por restauración familiar y paz espiritual en cada hogar." },
                    { name: "Hermana María", text: "Dando gracias por un milagro financiero y provisión diaria." },
                    { name: "Comunidad", text: "Unidos en oración por las naciones y sus líderes. ¡Él reina!" }
                ];
                const renderItems = [...fallback, ...fallback];
                renderItems.forEach(item => {
                    const el = document.createElement('div');
                    el.className = 'scroll-item';
                    el.innerHTML = `✨ <span class="item-name">${item.name}:</span> ${item.text}`;
                    prayersScroller.appendChild(el);
                });
            });
    }

    // 🧹 Depurador automático: elimina los más antiguos si hay más de 20
    function purgePrayerWall() {
        const MAX_PRAYERS = 20;
        const DB_URL = "https://proyecto-musichris-350df-default-rtdb.us-central1.firebasedatabase.app/prayers.json?orderBy=\"timestamp\"";

        fetch(DB_URL)
            .then(res => res.json())
            .then(data => {
                if (!data) return;

                const entries = Object.entries(data); // [key, value]
                // Están ordenados del más antiguo al más reciente
                const totalCount = entries.length;

                if (totalCount <= MAX_PRAYERS) return; // Nada que depurar

                // Eliminar los más antiguos hasta quedarnos con solo 20
                const toDelete = entries.slice(0, totalCount - MAX_PRAYERS);

                toDelete.forEach(([key]) => {
                    fetch(`https://proyecto-musichris-350df-default-rtdb.us-central1.firebasedatabase.app/prayers/${key}.json`, {
                        method: "DELETE"
                    }).catch(err => console.warn("No se pudo depurar mensaje:", err));
                });

                console.log(`🧹 Clamor en Cadena: ${toDelete.length} mensaje(s) antiguo(s) depurado(s). Quedan ${MAX_PRAYERS}.`);
            })
            .catch(err => console.warn("Error al depurar el muro:", err));
    }

    // -------------------------------------------------------------
    // 🌾 PAN DE VIDA DIARIO (FIREBASE REALTIME DB)
    // -------------------------------------------------------------
    async function fetchDailyDevotional() {
        try {
            const res = await fetch("https://proyecto-musichris-350df-default-rtdb.us-central1.firebasedatabase.app/daily_devotional.json");
            const data = await res.json();
            
            if (data && data.titulo) {
                // Hay devocional, rellenar y activar
                document.getElementById("devotional-new-badge").style.display = "inline-block";
                document.getElementById("devotional-preview-text").textContent = `"${data.revelacion_rhema.substring(0, 80)}..."`;
                
                document.getElementById("devotional-date").textContent = data.fecha;
                document.getElementById("devotional-title").textContent = data.titulo;
                document.getElementById("devotional-verse-text").textContent = `"${data.promesa_texto}"`;
                document.getElementById("devotional-verse-ref").textContent = data.promesa_cita;
                document.getElementById("devotional-content").textContent = data.revelacion_rhema;
                document.getElementById("devotional-action").textContent = data.accion_diaria;
                
                // Add Share functionality for Devocional
                const shareBtn = document.getElementById("share-devotional-btn");
                if (shareBtn) {
                    shareBtn.onclick = () => {
                        const shareMsg = `🍞 *Pan de Vida Diario* 🍞\n\n*${data.promesa_cita}*\n"${data.promesa_texto}"\n\n🔥 *Revelación:* ${data.revelacion_rhema}\n\n📻 Edifica tu vida escuchando la radio cristiana en vivo 24/7:\n👉 https://www.youtube.com/@Musichris_Studio`;
                        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`;
                        window.open(url, "_blank");
                    };
                }
            } else {
                document.getElementById("devotional-preview-text").textContent = "No hay un nuevo mensaje de hoy. Regresa mañana para recibir alimento fresco.";
                document.getElementById("devotional-title").textContent = "Sin actualización de hoy";
            }
        } catch (error) {
            console.error("Error fetching daily devotional:", error);
            document.getElementById("devotional-preview-text").textContent = "No pudimos cargar la promesa de hoy. Intenta de nuevo más tarde.";
        }
    }

    function submitPrayerToWall() {
        const nameInput = document.getElementById("wall-name");
        const textInput = document.getElementById("wall-text");
        
        if (!nameInput || !textInput) return;
        
        const name = nameInput.value.trim() || "Anónimo";
        const text = textInput.value.trim();
        
        if (!text) {
            alert("Por favor ingresa una petición de oración.");
            return;
        }
        
        const submitBtn = document.getElementById("submit-wall-btn");
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Publicando...`;
        
        fetch("https://proyecto-musichris-350df-default-rtdb.us-central1.firebasedatabase.app/prayers.json", {
            method: "POST",
            body: JSON.stringify({
                name: name,
                text: text,
                timestamp: Date.now()
            })
        })
        .then(res => res.json())
        .then(() => {
            nameInput.value = "";
            textInput.value = "";

            // Close modal
            document.getElementById("prayer-wall-modal").classList.remove("active");

            // Show success status
            alert("🙏 ¡Petición publicada con éxito! Toda la comunidad estará intercediendo por ti.");

            // Refrescar y depurar automáticamente
            fetchPrayerWall();
            purgePrayerWall(); // 🧹 Elimina los más antiguos si hay más de 20
        })
        .catch(err => {
            console.error("Error submitting prayer:", err);
            alert("Hubo un problema al publicar. Inténtalo nuevamente.");
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-heart-pulse"></i> Publicar en el Muro`;
        });
    }

    // -------------------------------------------------------------
    // 🌍 CHRISTIAN NEWS RADAR LOGIC
    // -------------------------------------------------------------
    async function fetchChristianNews() {
        const gridContainer = document.getElementById("news-grid-container");
        const loader = document.getElementById("news-loader");
        if (!gridContainer || !loader) return;

        // Limpiar
        gridContainer.style.display = "none";
        gridContainer.innerHTML = "";
        loader.style.display = "flex";

        // Usar rss2json api proxy para Noticias Cristianas (con bypass de caché)
        const RSS_URL = "https://www.noticiascristianas.com/feed";
        const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}&_t=${Date.now()}`;

        try {
            const response = await fetch(API_URL, { cache: "no-store" });
            const data = await response.json();

            loader.style.display = "none";

            if (data.status === "ok" && data.items && data.items.length > 0) {
                // Tomar los primeros 6
                const items = data.items.slice(0, 6);

                items.forEach(item => {
                    // Extraer imagen si existe en enclosure o thumbnail
                    let imageUrl = "";
                    if (item.enclosure && item.enclosure.link) {
                        imageUrl = item.enclosure.link;
                    } else if (item.thumbnail) {
                        imageUrl = item.thumbnail;
                    } else {
                        // Regex extract from description HTML
                        const imgRegex = /<img[^>]+src="([^">]+)"/g;
                        const match = imgRegex.exec(item.description);
                        if (match) {
                            imageUrl = match[1];
                        }
                    }

                    // Fallback cristiano global si no hay imagen
                    if (!imageUrl) {
                        const fallbacks = [
                            "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=600",
                            "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=600"
                        ];
                        // Select one pseudo-randomly based on the title length so it stays consistent per article
                        const index = (item.title ? item.title.length : 0) % fallbacks.length;
                        imageUrl = fallbacks[index];
                    }

                    // Clean text from html
                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = item.description || "";
                    let cleanDesc = tempDiv.textContent || tempDiv.innerText || "";
                    cleanDesc = cleanDesc.substring(0, 120) + "...";

                    // Formatear Fecha
                    const pubDate = new Date(item.pubDate);
                    const formattedDate = pubDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

                    const cardHTML = `
                        <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-card">
                            <img src="${imageUrl}" alt="News Image" class="news-card-img" onerror="this.src='https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=600'">
                            <div class="news-card-content">
                                <div class="news-card-source">
                                    <span>NOTICIAS CRISTIANAS</span>
                                    <span>${formattedDate}</span>
                                </div>
                                <h4 class="news-card-title">${item.title}</h4>
                                <p class="news-card-desc">${cleanDesc}</p>
                                <div class="news-card-footer">
                                    Leer noticia completa <i class="fa-solid fa-arrow-right"></i>
                                </div>
                            </div>
                        </a>
                    `;
                    gridContainer.insertAdjacentHTML("beforeend", cardHTML);
                });

                gridContainer.style.display = "grid";
            } else {
                gridContainer.style.display = "flex";
                gridContainer.innerHTML = `<p style="color:white; text-align:center; width:100%;">No se encontraron noticias recientes en el radar.</p>`;
            }
        } catch (error) {
            console.error("Error fetching news:", error);
            loader.style.display = "none";
            gridContainer.style.display = "flex";
            gridContainer.innerHTML = `<p style="color:#ff6b6b; text-align:center; width:100%;">Error de conexión. No se pudo rastrear la actualidad global.</p>`;
        }
    }

    // -------------------------------------------------------------
    // 🛠️ BINDING EVENT LISTENERS FOR MODALS & ACTIONS
    // -------------------------------------------------------------
    function bindSpiritualWidgets() {
        // Modals Trigger Handlers
        const bibleModal = document.getElementById("bible-modal");
        const openBibleWidget = document.getElementById("open-bible-widget");
        const closeBibleBtn = document.getElementById("close-bible-btn");
        
        if (openBibleWidget && bibleModal) {
            openBibleWidget.addEventListener("click", (e) => {
                // Prevent if clicked internal elements
                if (e.target.tagName !== "BUTTON" && !e.target.closest("button")) {
                    bibleModal.classList.add("active");
                    loadBibleChapter();
                }
            });
            
            // Add listener on opening button directly
            const openBtn = openBibleWidget.querySelector(".widget-btn");
            if (openBtn) {
                openBtn.addEventListener("click", () => {
                    bibleModal.classList.add("active");
                    loadBibleChapter();
                });
            }
        }
        
        if (closeBibleBtn && bibleModal) {
            closeBibleBtn.addEventListener("click", () => {
                bibleModal.classList.remove("active");
            });
            
            // Close on clicking overlay
            bibleModal.addEventListener("click", (e) => {
                if (e.target === bibleModal) {
                    bibleModal.classList.remove("active");
                }
            });
        }
        
        const prayerWallModal = document.getElementById("prayer-wall-modal");
        const openPrayerWallBtn = document.getElementById("open-prayer-wall-btn");
        const closePrayerWallBtn = document.getElementById("close-prayer-wall-btn");
        const submitWallBtn = document.getElementById("submit-wall-btn");
        
        if (openPrayerWallBtn && prayerWallModal) {
            openPrayerWallBtn.addEventListener("click", () => {
                prayerWallModal.classList.add("active");
            });
        }
        
        if (closePrayerWallBtn && prayerWallModal) {
            closePrayerWallBtn.addEventListener("click", () => {
                prayerWallModal.classList.remove("active");
            });
            
            prayerWallModal.addEventListener("click", (e) => {
                if (e.target === prayerWallModal) {
                    prayerWallModal.classList.remove("active");
                }
            });
        }
        
        if (submitWallBtn) {
            submitWallBtn.addEventListener("click", submitPrayerToWall);
        }

        // Devotional Modal Triggers
        const devotionalModal = document.getElementById("devotional-modal");
        const openDevotionalWidget = document.getElementById("open-devotional-widget");
        const closeDevotionalBtn = document.getElementById("close-devotional-btn");

        if (openDevotionalWidget && devotionalModal) {
            openDevotionalWidget.addEventListener("click", (e) => {
                if (e.target.tagName !== "BUTTON" && !e.target.closest("button")) {
                    devotionalModal.classList.add("active");
                }
            });
            const openBtn = openDevotionalWidget.querySelector(".widget-btn");
            if (openBtn) {
                openBtn.addEventListener("click", () => {
                    devotionalModal.classList.add("active");
                });
            }
        }

        if (closeDevotionalBtn && devotionalModal) {
            closeDevotionalBtn.addEventListener("click", () => {
                devotionalModal.classList.remove("active");
            });
            devotionalModal.addEventListener("click", (e) => {
                if (e.target === devotionalModal) {
                    devotionalModal.classList.remove("active");
                }
            });
        }

        const parablesModal = document.getElementById("parables-modal");
        const openParablesWidget = document.getElementById("open-parables-widget");
        const closeParablesBtn = document.getElementById("close-parables-btn");

        if (openParablesWidget && parablesModal) {
            openParablesWidget.addEventListener("click", (e) => {
                if (e.target.tagName !== "BUTTON" && !e.target.closest("button")) {
                    parablesModal.classList.add("active");
                }
            });
            const openBtn = openParablesWidget.querySelector(".widget-btn");
            if (openBtn) {
                openBtn.addEventListener("click", () => {
                    parablesModal.classList.add("active");
                });
            }
        }

        if (closeParablesBtn && parablesModal) {
            closeParablesBtn.addEventListener("click", () => {
                parablesModal.classList.remove("active");
            });
            parablesModal.addEventListener("click", (e) => {
                if (e.target === parablesModal) {
                    parablesModal.classList.remove("active");
                }
            });
        }

        const podcastModal = document.getElementById("podcast-modal");
        const openPodcastWidget = document.getElementById("open-podcast-widget");
        const closePodcastBtn = document.getElementById("close-podcast-btn");

        if (openPodcastWidget && podcastModal) {
            openPodcastWidget.addEventListener("click", (e) => {
                if (e.target.tagName !== "BUTTON" && !e.target.closest("button")) {
                    podcastModal.classList.add("active");
                }
            });
            const openBtn = openPodcastWidget.querySelector(".widget-btn");
            if (openBtn) {
                openBtn.addEventListener("click", () => {
                    podcastModal.classList.add("active");
                });
            }
        }

        if (closePodcastBtn && podcastModal) {
            closePodcastBtn.addEventListener("click", () => {
                podcastModal.classList.remove("active");
            });
            podcastModal.addEventListener("click", (e) => {
                if (e.target === podcastModal) {
                    podcastModal.classList.remove("active");
                }
            });
        }
    }

    // 🎨 CREADOR DE POSTALES DE FE (INTERACTIVE CLIENT-SIDE WIDGET)
    function initPostcardCreator() {
        const previewCard = document.getElementById("postcard-preview-card");
        const videoBg = document.getElementById("postcard-video-bg");
        const textPreview = document.getElementById("postcard-text-preview");
        const bgThumbsGrid = document.getElementById("bg-thumbs-grid");
        const textarea = document.getElementById("postcard-textarea");
        const charCounter = document.getElementById("char-counter");
        const chipsContainer = document.getElementById("postcard-chips-container");
        const btnShare = document.getElementById("btn-share-postcard");
        const btnDownload = document.getElementById("btn-download-postcard");

        if (!previewCard || !videoBg || !textPreview || !bgThumbsGrid || !textarea) return;

        const POSTCARD_VIDEOS = [
            { id: 1, name: "Luz Celestial", src: "assets/videos/250709_medium.mp4", icon: "fa-solid fa-sun" },
            { id: 2, name: "Bosque Sagrado", src: "assets/videos/11957221_1080_1920_60fps.mp4", icon: "fa-solid fa-tree" },
            { id: 3, name: "Atardecer Divino", src: "assets/videos/13666742-uhd_1992_3542_30fps.mp4", icon: "fa-solid fa-water" },
            { id: 4, name: "Cielo Estrellado", src: "assets/videos/14744791_1080_1920_30fps.mp4", icon: "fa-solid fa-star" },
            { id: 5, name: "Agua de Vida", src: "assets/videos/199379-910162329_medium.mp4", icon: "fa-solid fa-droplet" },
            { id: 6, name: "Lluvia de Fe", src: "assets/videos/264472_medium.mp4", icon: "fa-solid fa-cloud-showers-heavy" },
            { id: 7, name: "Cosecha Santa", src: "assets/videos/312257_medium.mp4", icon: "fa-solid fa-wheat-awn" },
            { id: 8, name: "Nubes de Gloria", src: "assets/videos/6291877-hd_1080_1920_30fps.mp4", icon: "fa-solid fa-cloud" },
            { id: 9, name: "Alturas Divinas", src: "assets/videos/12386447_2160_3840_60fps.mp4", icon: "fa-solid fa-mountain" }
        ];

        const INSPIRATIONAL_PHRASES = [
            "\"El Señor es mi pastor; nada me faltará.\" — Salmo 23:1",
            "\"Todo lo puedo en Cristo que me fortalece.\" — Filipenses 4:13",
            "\"No temas, porque yo estoy contigo; no desmayes.\" — Isaías 41:10",
            "\"Tu gracia es suficiente para mí, pues mi poder se perfecciona en la debilidad.\" — 2 Corintios 12:9",
            "\"Jehová es mi luz y mi salvación; ¿de quién temeré?\" — Salmo 27:1",
            "\"Clama a mí, y yo te responderé, y te enseñaré cosas grandes.\" — Jeremías 33:3",
            "\"El Señor guardará tu salida y tu entrada desde ahora y para siempre.\" — Salmo 121:8",
            "\"Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal.\" — Jeremías 29:11",
            "\"Confía en el Señor con todo tu corazón, y no te apoyes en tu propia prudencia.\" — Proverbios 3:5",
            "\"El Señor es mi fuerza y mi escudo; en él confió mi corazón, y fui ayudado.\" — Salmo 28:7",
            "\"La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da.\" — Juan 14:27",
            "\"Deléitate asimismo en el Señor, y él te concederá las peticiones de tu corazón.\" — Salmo 37:4",
            "\"Aunque ande en valle de sombra de muerte, no temeré mal alguno.\" — Salmo 23:4",
            "\"Sean vuestras costumbres sin avaricia, contentos con lo que tenéis ahora.\" — Hebreos 13:5",
            "\"Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito.\" — Juan 3:16",
            "\"El amor es sufrido, es benigno; el amor no tiene envidia, el amor no es jactancioso.\" — 1 Corintios 13:4",
            "\"Mas los que esperan en el Señor tendrán nuevas fuerzas; levantarán alas como las águilas.\" — Isaías 40:31",
            "\"Buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.\" — Mateo 6:33",
            "\"Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios.\" — Filipenses 4:6",
            "\"El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.\" — Salmo 91:1",
            "\"Diré yo a Jehová: Esperanza mía, y castillo mío; mi Dios, en quien confiaré.\" — Salmo 91:2",
            "\"Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes.\" — Josué 1:9",
            "\"Acerquémonos, pues, confiadamente al trono de la gracia, para alcanzar misericordia.\" — Hebreos 4:16",
            "\"El Señor peleará por vosotros, y vosotros estaréis tranquilos.\" — Éxodo 14:14",
            "\"Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.\" — Romanos 8:28",
            "\"Si Dios es por nosotros, ¿quién contra nosotros?\" — Romanos 8:31",
            "\"Cristo en vosotros, la esperanza de gloria.\" — Colosenses 1:27",
            "\"Estad quietos, y conoced que yo soy Dios.\" — Salmo 46:10",
            "\"Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.\" — Juan 14:6",
            "\"Encomienda al Señor tu camino, confía en él, y él hará.\" — Salmo 37:5"
        ];

        let selectedVideo = POSTCARD_VIDEOS[0];

        // 1. Render Background Selector Thumbnails (3x3 grid con fotograma real)
        bgThumbsGrid.innerHTML = "";
        POSTCARD_VIDEOS.forEach((video, index) => {
            const thumb = document.createElement("button");
            thumb.className = `bg-thumb ${index === 0 ? "active" : ""}`;
            thumb.title = video.name;
            thumb.setAttribute("aria-label", video.name);

            // Usamos una miniatura JPG en lugar de cargar el video completo para ahorrar datos y evitar bloqueos
            const thumbUrl = video.src.replace('videos', 'thumbs').replace('.mp4', '.jpg');
            thumb.innerHTML = `
                <img 
                    class="bg-thumb-preview" 
                    src="${thumbUrl}" 
                    alt="${video.name}" 
                    loading="lazy" 
                />
                <div class="bg-thumb-label">${video.name}</div>
                <div class="bg-thumb-overlay"></div>
            `;

            thumb.addEventListener("click", () => {
                // Remove active class from all thumbs
                document.querySelectorAll(".bg-thumb").forEach(t => t.classList.remove("active"));
                // Add active to current
                thumb.classList.add("active");
                // Update playing video source
                selectedVideo = video;
                videoBg.src = video.src;
                videoBg.load();
                videoBg.play().catch(err => console.log("Video preview autoplay error:", err));
            });
            bgThumbsGrid.appendChild(thumb);
        });

        // Initialize first video preview
        videoBg.src = selectedVideo.src;
        videoBg.load();
        
        // Attempt initial play, handling browser autoplay restrictions silently
        const playInitialVideo = () => {
            videoBg.play()
                .then(() => {
                    // Played successfully, remove interaction listeners
                    document.removeEventListener("click", playInitialVideo);
                    document.removeEventListener("touchstart", playInitialVideo);
                })
                .catch(() => {
                    // Silent catch: suppress browser security warnings on initial load
                });
        };
        playInitialVideo();
        document.addEventListener("click", playInitialVideo);
        document.addEventListener("touchstart", playInitialVideo);

        // 2. Render Inspirational Chips with Shuffle function
        function renderInspirationalChips() {
            chipsContainer.innerHTML = "";
            
            // Extract 8 unique random verses
            const shuffled = [...INSPIRATIONAL_PHRASES].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 8);
            
            selected.forEach((phrase) => {
                const parts = phrase.split(" — ");
                const text = parts[0].replace(/\"/g, "");
                const ref = parts[1] || "Biblia";
                
                const chip = document.createElement("div");
                chip.className = "postcard-chip";
                chip.innerHTML = `<i class="fa-solid fa-book-bible" style="margin-right: 6px; color: var(--neon-cyan);"></i> ${ref}`;
                chip.title = `"${text}" — ${ref}`;
                
                chip.addEventListener("click", () => {
                    textarea.value = phrase;
                    updatePreviewText(phrase);
                });
                chipsContainer.appendChild(chip);
            });
            
            // Add custom Shuffle Action Chip
            const shuffleChip = document.createElement("div");
            shuffleChip.className = "postcard-chip shuffle-chip";
            shuffleChip.style.background = "rgba(0, 242, 254, 0.08)";
            shuffleChip.style.borderColor = "rgba(0, 242, 254, 0.3)";
            shuffleChip.style.color = "var(--neon-cyan)";
            shuffleChip.style.fontWeight = "600";
            shuffleChip.innerHTML = `<i class="fa-solid fa-arrows-rotate" style="margin-right: 6px; animation: spin 10s linear infinite;"></i> Cargar otros`;
            shuffleChip.title = "Cargar un juego diferente de 8 versículos de fe";
            
            shuffleChip.addEventListener("click", () => {
                renderInspirationalChips();
            });
            chipsContainer.appendChild(shuffleChip);
        }
        
        renderInspirationalChips();

        // 3. Setup textarea event listeners
        textarea.addEventListener("input", (e) => {
            const text = e.target.value;
            updatePreviewText(text);
        });

        function updatePreviewText(text) {
            const cleanText = text.trim() || "\"Escribe aquí tu mensaje de fe...\"";
            textPreview.innerText = cleanText;
            charCounter.innerText = text.length;
        }

        // Set default text
        textarea.value = INSPIRATIONAL_PHRASES[0];
        updatePreviewText(INSPIRATIONAL_PHRASES[0]);

        // Helper to draw video or image maintaining cover ratio (object-fit: cover for canvas)
        function drawImageCover(ctx, img, x, y, w, h) {
            const imgWidth = img.videoWidth || img.width;
            const imgHeight = img.videoHeight || img.height;
            
            if (!imgWidth || !imgHeight) {
                // Fallback background color if not fully loaded
                ctx.fillStyle = "#0c0614";
                ctx.fillRect(x, y, w, h);
                return;
            }

            const imgRatio = imgWidth / imgHeight;
            const canvasRatio = w / h;
            let sx, sy, sWidth, sHeight;

            if (imgRatio > canvasRatio) {
                sHeight = imgHeight;
                sWidth = imgHeight * canvasRatio;
                sx = (imgWidth - sWidth) / 2;
                sy = 0;
            } else {
                sWidth = imgWidth;
                sHeight = imgWidth / canvasRatio;
                sx = 0;
                sy = (imgHeight - sHeight) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
        }

        // Helper to generate the high-res off-screen canvas in vertical 9:16 aspect ratio
        function generateHighResCanvas() {
            const canvas = document.createElement("canvas");
            canvas.width = 1080;
            canvas.height = 1920;
            const ctx = canvas.getContext("2d");

            // Enable smoothing for crisp text and graphics
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            // 1. Paint Current Background Video Frame
            drawImageCover(ctx, videoBg, 0, 0, canvas.width, canvas.height);

            // 2. Draw Translucent Dark Gradient Overlay for optimal readability
            const overlayGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            overlayGrad.addColorStop(0, "rgba(0, 0, 0, 0.55)");
            overlayGrad.addColorStop(0.4, "rgba(0, 0, 0, 0.15)");
            overlayGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
            overlayGrad.addColorStop(1, "rgba(0, 0, 0, 0.85)");
            ctx.fillStyle = overlayGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 3. Top Watermark
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 2;
            ctx.font = "bold 30px 'Outfit', 'Segoe UI', sans-serif";
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.textAlign = "center";
            ctx.fillText("📻 MUSICHRIS STUDIO RADIO", canvas.width / 2, 180);

            // 4. Main Text rendering with auto wrap and auto font sizing
            const rawText = textarea.value.trim() || "\"Escribe aquí tu mensaje de fe...\"";
            
            // Adjust font size dynamically based on length of text
            let fontSize = 60;
            if (rawText.length < 50) fontSize = 72;
            else if (rawText.length > 120) fontSize = 48;

            ctx.font = `italic bold ${fontSize}px 'Outfit', 'Segoe UI', sans-serif`;
            ctx.fillStyle = "#ffffff";
            
            // Text shadow for high readability on any gradient background
            ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
            ctx.shadowBlur = 20;
            ctx.shadowOffsetY = 8;

            const maxWidth = canvas.width - 200;
            const words = rawText.split(" ");
            let lines = [];
            let currentLine = "";

            for (let n = 0; n < words.length; n++) {
                const testLine = currentLine + words[n] + " ";
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    lines.push(currentLine.trim());
                    currentLine = words[n] + " ";
                } else {
                    currentLine = testLine;
                }
            }
            lines.push(currentLine.trim());

            // Draw wrapped lines centered vertically
            const lineHeight = fontSize * 1.5;
            const totalHeight = lines.length * lineHeight;
            let startY = (canvas.height / 2) - (totalHeight / 2) + (lineHeight / 2);

            lines.forEach(line => {
                ctx.fillText(line, canvas.width / 2, startY);
                startY += lineHeight;
            });

            // 5. Bottom Watermark
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 2;
            ctx.font = "26px 'Outfit', 'Segoe UI', sans-serif";
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.fillText("🙏 Sintoniza una Radio cristiana creada para tus mejores momentos.", canvas.width / 2, canvas.height - 180);

            return canvas;
        }

        // 4. Download Action
        btnDownload.addEventListener("click", () => {
            const originalText = btnDownload.innerHTML;
            btnDownload.innerHTML = "<i class='fa-solid fa-circle-notch fa-spin'></i> Generando...";
            btnDownload.disabled = true;

            setTimeout(() => {
                try {
                    const canvas = generateHighResCanvas();
                    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
                    const link = document.createElement("a");
                    link.download = "MusiChris_Postal_de_Fe.jpg";
                    link.href = dataUrl;
                    link.click();
                } catch (err) {
                    console.error("Fallo al descargar la postal:", err);
                    alert("No pudimos autodescargar la imagen. Intenta en otro navegador.");
                } finally {
                    btnDownload.innerHTML = originalText;
                    btnDownload.disabled = false;
                }
            }, 300);
        });

        // 5. Share Action
        btnShare.addEventListener("click", () => {
            const originalText = btnShare.innerHTML;
            btnShare.innerHTML = "<i class='fa-solid fa-circle-notch fa-spin'></i> Preparando...";
            btnShare.disabled = true;

            setTimeout(() => {
                try {
                    const canvas = generateHighResCanvas();
                    canvas.toBlob((blob) => {
                        if (!blob) throw new Error("Fallo al convertir la postal en datos binarios.");
                        
                        const file = new File([blob], "Postal_de_Fe.jpg", { type: "image/jpeg" });
                        const shareText = "🕊️ Mira esta hermosa postal de fe que diseñé en MusiChris Studio Radio. Te invito a sintonizar la radio en vivo y edificar tu vida:\n\n👉 https://hjalmarmeza.github.io/Musichristudio_radio/";

                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            navigator.share({
                                files: [file],
                                title: "Postal de Fe - MusiChris",
                                text: shareText
                            }).catch(err => {
                                console.log("Compartido cancelado o fallido:", err);
                            });
                        } else {
                            // Fallback for sharing
                            const downloadLink = document.createElement("a");
                            downloadLink.download = "MusiChris_Postal_de_Fe.jpg";
                            downloadLink.href = URL.createObjectURL(blob);
                            downloadLink.click();

                            // Invite to share manually via WhatsApp
                            const encodedText = encodeURIComponent(shareText);
                            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
                            
                            setTimeout(() => {
                                if (confirm("¡Tu postal se ha descargado con éxito! ¿Te gustaría abrir WhatsApp para compartir la invitación con tus amigos y familiares?")) {
                                    window.open(whatsappUrl, "_blank");
                                }
                            }, 500);
                        }
                    }, "image/jpeg", 0.95);
                } catch (err) {
                    console.error("Fallo al compartir la postal:", err);
                    alert("Hubo un error al preparar el archivo para compartir.");
                } finally {
                    btnShare.innerHTML = originalText;
                    btnShare.disabled = false;
                }
            }, 300);
        });
    }

    // 🎬 PARABLES CATALOG & VIDEO PLAYER
    function initParablesCatalog() {
        const parablesGrid = document.getElementById("parables-grid");
        const loader = document.getElementById("parables-loader");
        if (!parablesGrid) return;

        // Fetch parables from Firebase
        const parablesUrl = "https://proyecto-musichris-350df-default-rtdb.us-central1.firebasedatabase.app/parables.json";
        fetch(parablesUrl)
            .then(res => res.json())
            .then(data => {
                if (loader) loader.style.display = "none";
                parablesGrid.style.display = "grid";
                parablesGrid.innerHTML = "";
                if (!data || Object.keys(data).length === 0) {
                    parablesGrid.innerHTML = "<div class='inbox-empty-state' style='grid-column: 1 / -1;'><i class='fa-solid fa-video-slash'></i><p>Aún no hay parábolas disponibles.</p></div>";
                    return;
                }

                // Render each parable
                Object.values(data).forEach(parable => {
                    // Formateo Premium del Título
                    let cleanTitle = parable.title.replace(/^(par\u00e1bola|parabola)\s+de\s+|^(par\u00e1bola|parabola)\s+/i, "");
                    cleanTitle = cleanTitle.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
                    
                    const item = document.createElement("div");
                    item.className = "parable-item";
                    item.dataset.orientation = parable.orientation || "unknown";
                    item.innerHTML = `
                        <div class="parable-thumb-container">
                            <img src="${parable.thumbnailUrl}" class="parable-thumb" alt="${cleanTitle}" loading="lazy">
                            <div class="parable-overlay-gradient"></div>
                            <i class="fa-solid fa-circle-play parable-play-icon"></i>
                        </div>
                        <div class="parable-info">
                            <h4 class="parable-title">${cleanTitle}</h4>
                        </div>
                    `;
                    item.addEventListener("click", () => {
                        openFullscreenVideo(parable.videoUrl, parable.title);
                    });
                    parablesGrid.appendChild(item);
                });
            })
            .catch(err => {
                console.error("Error loading parables:", err);
                parablesGrid.innerHTML = "<div class='inbox-empty-state' style='grid-column: 1 / -1;'><p>Error al cargar el catálogo de parábolas.</p></div>";
            });

        // Setup Fullscreen Video Player
        const videoOverlay = document.getElementById("fullscreen-video-modal");
        const videoPlayer = document.getElementById("parable-video-player");
        const videoTitle = document.getElementById("fullscreen-video-title");
        const closeVideoBtn = document.getElementById("close-video-btn");

        if (videoOverlay && videoPlayer && closeVideoBtn) {
            closeVideoBtn.addEventListener("click", closeFullscreenVideo);
            videoOverlay.addEventListener("click", (e) => {
                if (e.target === videoOverlay) {
                    closeFullscreenVideo();
                }
            });
        }
    }

    function openFullscreenVideo(url, title) {
        const videoOverlay = document.getElementById("fullscreen-video-modal");
        const videoPlayer = document.getElementById("parable-video-player");
        const videoTitle = document.getElementById("fullscreen-video-title");
        
        if (videoPlayer && videoOverlay) {
            videoPlayer.src = url;
            if (videoTitle) videoTitle.textContent = title;
            videoOverlay.classList.add("active");
            
            // Limpiar estados anteriores
            videoPlayer.classList.remove("zoomed", "rotated-landscape");
            const container = document.querySelector('.fullscreen-video-container');
            if(container) container.classList.remove("zoomed-container");
            let zoomBtn = document.getElementById("zoom-toggle-btn");
            if(zoomBtn) {
                zoomBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
            }

            // En lugar de forzar fullscreen en el <video> (lo cual abre el reproductor nativo en iOS y rompe el object-fit),
            // intentamos hacer fullscreen en el contenedor modal para navegadores de escritorio/android.
            // En iOS (iPhone), esto fallará silenciosamente y simplemente usará nuestro modal CSS de 100vw/100vh.
            try {
                if (videoOverlay.requestFullscreen) {
                    videoOverlay.requestFullscreen().catch(err => console.log("FS error:", err));
                } else if (videoOverlay.webkitRequestFullscreen) {
                    videoOverlay.webkitRequestFullscreen();
                } else if (videoOverlay.msRequestFullscreen) {
                    videoOverlay.msRequestFullscreen();
                }
            } catch (e) {
                console.log("Native fullscreen not supported on this device, using CSS modal.");
            }

            videoPlayer.play().catch(e => console.error("Autoplay preventd", e));
        }
    }

    function closeFullscreenVideo() {
        const videoOverlay = document.getElementById("fullscreen-video-modal");
        const videoPlayer = document.getElementById("parable-video-player");
        if (videoOverlay && videoPlayer) {
            videoOverlay.classList.remove("active");
            videoPlayer.pause();
            videoPlayer.src = "";
            
            // Salir de pantalla completa nativa si está activa
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(()=>{});
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        }
    }

    // Boot Up Rendering
    startAnnouncementSlideshow();
    renderPublicSchedule();
    audio.volume = volumeSlider.value / 100;
    
    // Iniciar integración de AzuraCast (si está activa)
    startAzuraCastMetadataPolling();

    // 🚀 INICIALIZACIÓN DE HERRAMIENTAS DE EDIFICACIÓN
    initInteractiveBible();
    fetchPrayerWall();
    fetchDailyDevotional();
    initPostcardCreator();
    initParablesCatalog();
    bindSpiritualWidgets();
    fetchChristianNews();

    // Actualización del Muro cada 30 segundos
    setInterval(fetchPrayerWall, 30000);
});

// 📱 Register Service Worker for PWA (Progressive Web App)
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./sw.js")
            .then((registration) => {
                console.log("[PWA] Service Worker registered successfully with scope:", registration.scope);
            })
            .catch((error) => {
                console.error("[PWA] Service Worker registration failed:", error);
            });
    });
}

/* ==========================================================================
   🎧 BASE DE DATOS DE PODCASTS Y LÓGICA DE PLAYLISTS
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    // === BASE DE DATOS DE SERIES ===
    const PODCAST_DB = [
        {
            id: "victoria",
            title: "Victoria sobre la Mente",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Victoria%20sobre%20la%20Mente/serie_victoria.jpg",
            episodes: [
                { title: "1. La Ansiedad", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Victoria%20sobre%20la%20Mente/1.%20La%20Ansiedad.mp3" },
                { title: "2. La Depresión", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Victoria%20sobre%20la%20Mente/2.%20La%20Depresio%CC%81n.mp3" },
                { title: "3. La Envidia", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Victoria%20sobre%20la%20Mente/3.%20La%20Envidia.mp3" },
                { title: "4. La Ira", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Victoria%20sobre%20la%20Mente/4.%20La%20Ira.mp3" },
                { title: "5. La Culpa", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Victoria%20sobre%20la%20Mente/5.%20La%20Culpa.mp3" },
                { title: "6. La Vergüenza", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Victoria%20sobre%20la%20Mente/6.%20La%20Verguenza.mp3" },
                { title: "7. El Resentimiento", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Victoria%20sobre%20la%20Mente/7.%20El%20Resentimiento.mp3" },
                { title: "8. El Orgullo", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Victoria%20sobre%20la%20Mente/8.%20El%20Orgullo.mp3" },
                { title: "9. La Inseguridad", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Victoria%20sobre%20la%20Mente/9.%20La%20Inseguridad.mp3" }
            ]
        },
        {
            id: "fe",
            title: "Fe en tiempos de crisis",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Fe%20en%20tiempos%20de%20crisis/serie_fe_crisis.jpg",
            episodes: [
                { title: "1. El Desierto", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Fe%20en%20tiempos%20de%20crisis/1.%20El%20Desierto.mp3" },
                { title: "2. El Silencio de Dios", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Fe%20en%20tiempos%20de%20crisis/2.%20El%20Silencio%20de%20Dios.mp3" },
                { title: "3. La Pérdida", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Fe%20en%20tiempos%20de%20crisis/3.%20La%20Pe%CC%81rdida.mp3" },
                { title: "4. El Fracaso", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Fe%20en%20tiempos%20de%20crisis/4.%20El%20Fracaso.mp3" },
                { title: "5. La Incertidumbre", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Fe%20en%20tiempos%20de%20crisis/5.%20La%20Incertidumbre.mp3" },
                { title: "6. La Espera", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Fe%20en%20tiempos%20de%20crisis/6.%20La%20Espera.mp3" },
                { title: "7. La Escasez", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Fe%20en%20tiempos%20de%20crisis/7.%20La%20Escacez.mp3" },
                { title: "8. La Oposición", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Fe%20en%20tiempos%20de%20crisis/8.%20La%20oposicio%CC%81n.mp3" },
                { title: "9. El Cansancio", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Fe%20en%20tiempos%20de%20crisis/9.%20El%20Cansancio.mp3" },
                { title: "10. La Traición", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Fe%20en%20tiempos%20de%20crisis/10.%20La%20traicio%CC%81n.mp3" }
            ]
        },
        {
            id: "sabiduria",
            title: "Sabiduría Práctica",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Sabiduria_Practica/portada.jpg",
            episodes: [
                { title: "1. FinanzasSaludables", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Sabiduria_Practica/1.Finanzas_Saludables.mp3" },
                { title: "2. Trabajo Diligente", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Sabiduria_Practica/2._Trabajo_Diligente.mp3" },
                { title: "3. Gestion del Tiempo", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Sabiduria_Practica/3._Gestion_del_Tiempo.mp3" },
                { title: "4. La Pereza", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Sabiduria_Practica/4._La_Pereza.mp3" },
                { title: "5. La Codicia", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Sabiduria_Practica/5._La_Codicia.mp3" },
                { title: "6. Toma de Decisiones", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Sabiduria_Practica/6._Toma_de_Decisiones.mp3" },
                { title: "7. Negocios Justos", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Sabiduria_Practica/7._Negocios_Justos.mp3" },
                { title: "8. Las Deudas", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Sabiduria_Practica/8._Las_Deudas.mp3" },
                { title: "9. Planificacion", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Sabiduria_Practica/9._Planificacion.mp3" },
                { title: "10. Prudencia", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Sabiduria_Practica/10._Prudencia.mp3" }
            ]
        },
        {
            id: "identidad",
            title: "Identidad y Crecimiento",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Identidad_y_Crecimiento/portada.jpg",
            episodes: [
                { title: "1. Nuevo Comienzo", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Identidad_y_Crecimiento/1._Nuevo_Comienzo.mp3" },
                { title: "2. Gracia Inmerecida", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Identidad_y_Crecimiento/2._Gracia_Inmerecida.mp3" },
                { title: "3. El Proposito", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Identidad_y_Crecimiento/3._El_Proposito.mp3" },
                { title: "4. Paternidad", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Identidad_y_Crecimiento/4._Paternidad.mp3" },
                { title: "5. Herencia Espiritual", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Identidad_y_Crecimiento/5._Herencia_Espiritual.mp3" },
                { title: "6. Integridad", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Identidad_y_Crecimiento/6._Integridad.mp3" },
                { title: "7. Disciplina", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Identidad_y_Crecimiento/7._Disciplina.mp3" },
                { title: "8. Santidad", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Identidad_y_Crecimiento/8._Santidad.mp3" },
                { title: "9. Fruto de la Fe", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Identidad_y_Crecimiento/9._Fruto_de_la_Fe.mp3" },
                { title: "10. Humildad", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Identidad_y_Crecimiento/10._Humildad.mp3" }
            ]
        },
        {
            id: "familia",
            title: "Familia y Comunidad",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Familia_y_Comunidad/portada.jpg",
            episodes: [
                { title: "1. El Matrimonio", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Familia_y_Comunidad/1._El_Matrimonio.mp3" },
                { title: "2. Crianza", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Familia_y_Comunidad/2._Crianza.mp3" },
                { title: "3. Amistad Verdadera", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Familia_y_Comunidad/3._Amistad_Verdadera.mp3" },
                { title: "4. Resolucion de Conflictos", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Familia_y_Comunidad/4._Resolucion_de_Conflictos.mp3" },
                { title: "5. El Poder de la Lengua", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Familia_y_Comunidad/5._El_Poder_de_la_Lengua.mp3" },
                { title: "6. El Servicio", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Familia_y_Comunidad/6._El_Servicio.mp3" },
                { title: "7. Malas Influencias", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Familia_y_Comunidad/7._Malas_Influencias.mp3" },
                { title: "8. Honrar a los Padres", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Familia_y_Comunidad/8._Honrar_a_los_Padres.mp3" },
                { title: "9. Generosidad", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Familia_y_Comunidad/9._Generosidad.mp3" },
                { title: "10. Amor al Projimo", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Familia_y_Comunidad/10._Amor_al_Projimo.mp3" }
            ]
        },
        {
            id: "intimidad",
            title: "Intimidad con Dios",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Intimidad_con_Dios/portada.jpg",
            episodes: [
                { title: "1. La Oracion", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Intimidad_con_Dios/1._La_Oracion.mp3" },
                { title: "2. Estudio Biblico", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Intimidad_con_Dios/2._Estudio_Biblico.mp3" },
                { title: "3. El Ayuno", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Intimidad_con_Dios/3._El_Ayuno.mp3" },
                { title: "4. La Adoracion", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Intimidad_con_Dios/4._La_Adoracion.mp3" },
                { title: "5. El Altar Familiar", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Intimidad_con_Dios/5._El_Altar_Familiar.mp3" },
                { title: "6. Meditacion Biblica", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Intimidad_con_Dios/6._Meditacion_Biblica.mp3" },
                { title: "7. Confesion", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Intimidad_con_Dios/7._Confesion.mp3" },
                { title: "8. Intercesion", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Intimidad_con_Dios/8._Intercesion.mp3" },
                { title: "9. Gratitud", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Intimidad_con_Dios/9._Gratitud.mp3" }
            ]
        },

        {
            id: "atributos_de_dios",
            title: "Atributos de Dios",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Atributos_de_Dios/portada.jpg",
            episodes: [
                { title: "1. Dios Proveedor", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Atributos_de_Dios/1._Dios_Proveedor.mp3" },
                { title: "2. Dios Sanador", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Atributos_de_Dios/2._Dios_Sanador.mp3" },
                { title: "3. Dios Pastor", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Atributos_de_Dios/3._Dios_Pastor.mp3" },
                { title: "4. La Fidelidad Inmutable", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Atributos_de_Dios/4._La_Fidelidad_Inmutable.mp3" },
                { title: "5. La Soberania", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Atributos_de_Dios/5._La_Soberania.mp3" },
                { title: "6. La Justicia Divina", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Atributos_de_Dios/6._La_Justicia_Divina.mp3" },
                { title: "7. El Dios de lo Imposible", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Atributos_de_Dios/7._El_Dios_de_lo_Imposible.mp3" },
                { title: "8. Dios Refugio", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Atributos_de_Dios/8._Dios_Refugio.mp3" },
                { title: "9. La Omnipresencia", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Atributos_de_Dios/9._La_Omnipresencia.mp3" },
                { title: "10. La Paciencia de Dios", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Atributos_de_Dios/10._La_Paciencia_de_Dios.mp3" }
            ]
        },
        {
            id: "caracter_y_liderazgo",
            title: "Caracter y Liderazgo",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caracter_y_Liderazgo/portada.jpg",
            episodes: [
                { title: "1. Vision Clara", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caracter_y_Liderazgo/1._Vision_Clara.mp3" },
                { title: "2. Valentia", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caracter_y_Liderazgo/2._Valentia.mp3" },
                { title: "3. Mansedumbre", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caracter_y_Liderazgo/3._Mansedumbre.mp3" },
                { title: "4. Rendicion de Cuentas", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caracter_y_Liderazgo/4._Rendicion_de_Cuentas.mp3" },
                { title: "5. Ejemplaridad", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caracter_y_Liderazgo/5._Ejemplaridad.mp3" },
                { title: "6. Sabiduria Directiva", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caracter_y_Liderazgo/6._Sabiduria_Directiva.mp3" },
                { title: "7. Coraje", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caracter_y_Liderazgo/7._Coraje.mp3" },
                { title: "8. Justicia Social", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caracter_y_Liderazgo/8._Justicia_Social.mp3" },
                { title: "9. Perseverancia", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caracter_y_Liderazgo/9._Perseverancia.mp3" },
                { title: "10. Legado", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caracter_y_Liderazgo/10._Legado.mp3" }
            ]
        },
        {
            id: "esperanza_y_eternidad",
            title: "Esperanza y Eternidad",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Esperanza_y_Eternidad/portada.jpg",
            episodes: [
                { title: "1. Ciudadanos del Cielo", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Esperanza_y_Eternidad/1._Ciudadanos_del_Cielo.mp3" },
                { title: "2. El Regreso del Rey", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Esperanza_y_Eternidad/2._El_Regreso_del_Rey.mp3" },
                { title: "3. Recompensa Eterna", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Esperanza_y_Eternidad/3._Recompensa_Eterna.mp3" },
                { title: "4. Victoria sobre la Muerte", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Esperanza_y_Eternidad/4._Victoria_sobre_la_Muerte.mp3" },
                { title: "5. Cielos y Tierra Nueva", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Esperanza_y_Eternidad/5._Cielos_y_Tierra_Nueva.mp3" },
                { title: "6. El Tribunal de Cristo", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Esperanza_y_Eternidad/6._El_Tribunal_de_Cristo.mp3" },
                { title: "7. El Gozo Inalterable", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Esperanza_y_Eternidad/7._El_Gozo_Inalterable.mp3" },
                { title: "8. Consolacion Final", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Esperanza_y_Eternidad/8._Consolacion_Final.mp3" },
                { title: "9. La Gran Comision", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Esperanza_y_Eternidad/9._La_Gran_Comision.mp3" },
                { title: "10. Maranatha", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Esperanza_y_Eternidad/10._Maranatha.mp3" }
            ]
        },
        {
            id: "guerra_espiritual",
            title: "Guerra Espiritual",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Guerra_Espiritual/portada.jpg",
            episodes: [
                { title: "1. La Duda", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Guerra_Espiritual/1._La_Duda.mp3" },
                { title: "2. El Temor", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Guerra_Espiritual/2._El_Temor.mp3" },
                { title: "3. La Tentacion", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Guerra_Espiritual/3._La_Tentacion.mp3" },
                { title: "4. Distracciones", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Guerra_Espiritual/4._Distracciones.mp3" },
                { title: "5. La Armadura de Dios", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Guerra_Espiritual/5._La_Armadura_de_Dios.mp3" },
                { title: "6. Orgullo Espiritual", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Guerra_Espiritual/6._Orgullo_Espiritual.mp3" },
                { title: "7. Doble Animo", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Guerra_Espiritual/7._Doble_Animo.mp3" },
                { title: "8. Falsas Doctrinas", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Guerra_Espiritual/8._Falsas_Doctrinas.mp3" },
                { title: "9. Murmuracion", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Guerra_Espiritual/9._Murmuracion.mp3" },
                { title: "10. Conformismo", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Guerra_Espiritual/10._Conformismo.mp3" }
            ]
        },

        {
            id: "alianzas_y_limites",
            title: "Alianzas y Limites",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Limites/portada.jpg",
            episodes: [
                { title: "1. El Lazo del Extrano", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Limites/1._El_Lazo_del_Extrano.mp3" },
                { title: "2. Union Desigual", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Limites/2._Union_Desigual.mp3" },
                { title: "3. Separar al Escarnecedor", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Limites/3._Separar_al_Escarnecedor.mp3" },
                { title: "4. Malas Conversaciones", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Limites/4._Malas_Conversaciones.mp3" },
                { title: "5. No Satures al Vecino", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Limites/5._No_Satures_al_Vecino.mp3" },
                { title: "6. El Amigo Verdadero", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Limites/6._El_Amigo_Verdadero.mp3" },
                { title: "7. Sabios Consejeros", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Limites/7._Sabios_Consejeros.mp3" },
                { title: "8. El Hombre de Discordia", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Limites/8._El_Hombre_de_Discordia.mp3" },
                { title: "9. Amor sin Fingimiento", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Limites/9._Amor_sin_Fingimiento.mp3" },
                { title: "10. Paz Colectiva", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Limites/10._Paz_Colectiva.mp3" }
            ]
        },
        {
            id: "alianzas_y_resguardo",
            title: "Alianzas y Resguardo",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Resguardo/portada.jpg",
            episodes: [
                { title: "1. El Yugo de Cuidado", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Resguardo/1._El_Yugo_de_Cuidado.mp3" },
                { title: "2. El Amigo de Crisis", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Resguardo/2._El_Amigo_de_Crisis.mp3" },
                { title: "3. Separar al Violento", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Resguardo/3._Separar_al_Violento.mp3" },
                { title: "4. Distancia del Necio", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Resguardo/4._Distancia_del_Necio.mp3" },
                { title: "5. Hierro que Pule", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Resguardo/5._Hierro_que_Pule.mp3" },
                { title: "6. El Lazo del Fiador", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Resguardo/6._El_Lazo_del_Fiador.mp3" },
                { title: "7. Multitud de Consejo", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Resguardo/7._Multitud_de_Consejo.mp3" },
                { title: "8. Unidad Sincera", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Resguardo/8._Unidad_Sincera.mp3" },
                { title: "9. Restaurar con Amor", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Resguardo/9._Restaurar_con_Amor.mp3" },
                { title: "10. Cuidar el Jardin Intimo", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Alianzas_y_Resguardo/10._Cuidar_el_Jardin_Intimo.mp3" }
            ]
        },
        {
            id: "armadura_y_defensa",
            title: "Armadura y Defensa",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armadura_y_Defensa/portada.jpg",
            episodes: [
                { title: "1. El Cinturon de la Verdad", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armadura_y_Defensa/1._El_Cinturon_de_la_Verdad.mp3" },
                { title: "2. La Coraza de Justicia", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armadura_y_Defensa/2._La_Coraza_de_Justicia.mp3" },
                { title: "3. El Escudo de la Fe", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armadura_y_Defensa/3._El_Escudo_de_la_Fe.mp3" },
                { title: "4. El Yelmo de la Salvacion", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armadura_y_Defensa/4._El_Yelmo_de_la_Salvacion.mp3" },
                { title: "5. La Espada del Espiritu", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armadura_y_Defensa/5._La_Espada_del_Espiritu.mp3" },
                { title: "6. Sometimiento y Resistencia", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armadura_y_Defensa/6._Sometimiento_y_Resistencia.mp3" },
                { title: "7. La Sangre del Pacto", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armadura_y_Defensa/7._La_Sangre_del_Pacto.mp3" },
                { title: "8. No Dar Lugar al Enemigo", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armadura_y_Defensa/8._No_Dar_Lugar_al_Enemigo.mp3" },
                { title: "9. Angeles Guardianes", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armadura_y_Defensa/9._Angeles_Guardianes.mp3" },
                { title: "10. El Triunfo de la Cruz", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armadura_y_Defensa/10._El_Triunfo_de_la_Cruz.mp3" }
            ]
        },
        {
            id: "armas_de_nuestra_milicia",
            title: "Armas de nuestra Milicia",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armas_de_nuestra_Milicia/portada.jpg",
            episodes: [
                { title: "1. La Oracion Ferviente", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armas_de_nuestra_Milicia/1._La_Oracion_Ferviente.mp3" },
                { title: "2. El Ayuno que Dios Escoge", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armas_de_nuestra_Milicia/2._El_Ayuno_que_Dios_Escoge.mp3" },
                { title: "3. La Palabra Escrita", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armas_de_nuestra_Milicia/3._La_Palabra_Escrita.mp3" },
                { title: "4. La Alabanza que Libera", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armas_de_nuestra_Milicia/4._La_Alabanza_que_Libera.mp3" },
                { title: "5. El Testimonio Publico", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armas_de_nuestra_Milicia/5._El_Testimonio_Publico.mp3" },
                { title: "6. El Nombre de Jesus", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armas_de_nuestra_Milicia/6._El_Nombre_de_Jesus.mp3" },
                { title: "7. La Unidad del Acuerdo", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armas_de_nuestra_Milicia/7._La_Unidad_del_Acuerdo.mp3" },
                { title: "8. El Silencio ante el Ataque", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armas_de_nuestra_Milicia/8._El_Silencio_ante_el_Ataque.mp3" },
                { title: "9. La Sangre del Cordero", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armas_de_nuestra_Milicia/9._La_Sangre_del_Cordero.mp3" },
                { title: "10. La Humillacion Sincera", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Armas_de_nuestra_Milicia/10._La_Humillacion_Sincera.mp3" }
            ]
        },
        {
            id: "caminos_de_la_providencia",
            title: "Caminos de la Providencia",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caminos_de_la_Providencia/portada.jpg",
            episodes: [
                { title: "1. El Pan Cotidiano", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caminos_de_la_Providencia/1._El_Pan_Cotidiano.mp3" },
                { title: "2. Cuervos Mensajeros", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caminos_de_la_Providencia/2._Cuervos_Mensajeros.mp3" },
                { title: "3. La Tinaja que no Escasea", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caminos_de_la_Providencia/3._La_Tinaja_que_no_Escasea.mp3" },
                { title: "4. Riquezas en la Roca", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caminos_de_la_Providencia/4._Riquezas_en_la_Roca.mp3" },
                { title: "5. Abrir las Ventanas", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caminos_de_la_Providencia/5._Abrir_las_Ventanas.mp3" },
                { title: "6. Multiplicacion de la Nada", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caminos_de_la_Providencia/6._Multiplicacion_de_la_Nada.mp3" },
                { title: "7. Vestido de Gloria", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caminos_de_la_Providencia/7._Vestido_de_Gloria.mp3" },
                { title: "8. El Alfoli Lleno", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caminos_de_la_Providencia/8._El_Alfoli_Lleno.mp3" },
                { title: "9. Recoger el Mana", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caminos_de_la_Providencia/9._Recoger_el_Mana.mp3" },
                { title: "10. Todo Satisfecho", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Caminos_de_la_Providencia/10._Todo_Satisfecho.mp3" }
            ]
        },
        {
            id: "ciudadanos_eternos",
            title: "Ciudadanos Eternos",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Ciudadanos_Eternos/portada.jpg",
            episodes: [
                { title: "1. Dar Cuenta de los Actos", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Ciudadanos_Eternos/1._Dar_Cuenta_de_los_Actos.mp3" },
                { title: "2. Probar la Obra", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Ciudadanos_Eternos/2._Probar_la_Obra.mp3" },
                { title: "3. Esperar la Ciudad", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Ciudadanos_Eternos/3._Esperar_la_Ciudad.mp3" },
                { title: "4. El Orden Nuevo", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Ciudadanos_Eternos/4._El_Orden_Nuevo.mp3" },
                { title: "5. El Galardon Pronto", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Ciudadanos_Eternos/5._El_Galardon_Pronto.mp3" },
                { title: "6. Fijar el Enfoque", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Ciudadanos_Eternos/6._Fijar_el_Enfoque.mp3" },
                { title: "7. Juicio del Justo", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Ciudadanos_Eternos/7._Juicio_del_Justo.mp3" },
                { title: "8. Lamparas Preparadas", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Ciudadanos_Eternos/8._Lamparas_Preparadas.mp3" },
                { title: "9. Lagrimas Secas", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Ciudadanos_Eternos/9._Lagrimas_Secas.mp3" },
                { title: "10. El Clamor Final", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Ciudadanos_Eternos/10._El_Clamor_Final.mp3" }
            ]
        },
        {
            id: "consciencia_de_eternidad",
            title: "Consciencia de Eternidad",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_de_Eternidad/portada.jpg",
            episodes: [
                { title: "1. El Tribunal del Rey", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_de_Eternidad/1._El_Tribunal_del_Rey.mp3" },
                { title: "2. Coronas Inmarcesibles", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_de_Eternidad/2._Coronas_Inmarcesibles.mp3" },
                { title: "3. Vivir como Extranjeros", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_de_Eternidad/3._Vivir_como_Extranjeros.mp3" },
                { title: "4. El Diseno Renovado", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_de_Eternidad/4._El_Diseno_Renovado.mp3" },
                { title: "5. El Regreso Inminente", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_de_Eternidad/5._El_Regreso_Inminente.mp3" },
                { title: "6. Invertir en lo Invisible", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_de_Eternidad/6._Invertir_en_lo_Invisible.mp3" },
                { title: "7. El Libro Abierto", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_de_Eternidad/7._El_Libro_Abierto.mp3" },
                { title: "8. Velar con Aceite", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_de_Eternidad/8._Velar_con_Aceite.mp3" },
                { title: "9. La Patria Deseada", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_de_Eternidad/9._La_Patria_Deseada.mp3" },
                { title: "10. Consumado Es", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_de_Eternidad/10._Consumado_Es.mp3" }
            ]
        },
        {
            id: "consciencia_del_fin",
            title: "Consciencia del Fin",
            date: "Serie Completa",
            cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_del_Fin/portada.jpg",
            episodes: [
                { title: "1. Cuenta Individual", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_del_Fin/1._Cuenta_Individual.mp3" },
                { title: "2. La Obra por el Fuego", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_del_Fin/2._La_Obra_por_el_Fuego.mp3" },
                { title: "3. Fundamento Eterno", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_del_Fin/3._Fundamento_Eterno.mp3" },
                { title: "4. Renovacion Absoluta", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_del_Fin/4._Renovacion_Absoluta.mp3" },
                { title: "5. Galardon en Mano", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_del_Fin/5._Galardon_en_Mano.mp3" },
                { title: "6. Enfoque de lo Alto", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_del_Fin/6._Enfoque_de_lo_Alto.mp3" },
                { title: "7. Libros Abiertos", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_del_Fin/7._Libros_Abiertos.mp3" },
                { title: "8. Aceite en la Vasija", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_del_Fin/8._Aceite_en_la_Vasija.mp3" },
                { title: "9. Enjugar el Llanto", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_del_Fin/9._Enjugar_el_Llanto.mp3" },
                { title: "10. Ven, Senor", file: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/axulgrybsluj/b/parabolas-bucket/o/podcasts/Consciencia_del_Fin/10._Ven%2C_Senor.mp3" }
            ]
        }
    ];

    // Variables de estado
    let currentSeriesIndex = -1;
    let currentTrackIndex = -1;
    let playbackRate = 1;

    // Elementos del DOM
    const podcastGrid = document.getElementById("podcast-grid");
    const podcastPlayerModal = document.getElementById("podcast-player-modal");
    const closePlayerBtn = document.getElementById("close-podcast-player-btn");
    const shareBtn = document.getElementById("share-podcast-btn");
    
    const coverImg = document.getElementById("podcast-cover-img");
    const trackTitle = document.getElementById("podcast-track-title");
    const trackDate = document.getElementById("podcast-track-date");
    
    const audio = document.getElementById("hidden-podcast-audio");
    const playBtn = document.getElementById("podcast-play-btn");
    const rewindBtn = document.getElementById("podcast-rewind-btn");
    const forwardBtn = document.getElementById("podcast-forward-btn");
    const speedBtn = document.getElementById("podcast-speed-btn");
    
    const progressBar = document.getElementById("podcast-progress-bar");
    const currentTimeEl = document.getElementById("podcast-current-time");
    const totalTimeEl = document.getElementById("podcast-total-time");
    const playlistContainer = document.getElementById("podcast-playlist-container");

    const mainRadioAudio = document.getElementById("radio-audio");
    const mainRadioPlayBtn = document.getElementById("play-btn");

    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // --- 1. RENDERIZAR CATÁLOGO (Las 2 Series) ---
    function renderCatalog() {
        if (!podcastGrid) return;
        podcastGrid.innerHTML = "";
        
        PODCAST_DB.forEach((series, index) => {
            const itemHtml = `
                <div class="podcast-item" data-series-index="${index}">
                    <div class="podcast-cover-container">
                        <img src="${series.cover}" alt="${series.title}" class="podcast-cover" loading="lazy">
                    </div>
                    <div class="podcast-info">
                        <h4 class="podcast-title">${series.title}</h4>
                        <p class="podcast-date">${series.episodes.length} episodios</p>
                    </div>
                </div>
            `;
            podcastGrid.innerHTML += itemHtml;
        });
    }

    // Iniciar renderizado
    renderCatalog();

    // --- 2. LOGICA PLAY / PAUSA Y ANTI-COLISIÓN ---
    function togglePlay(forcePlay = false) {
        if (audio.paused || forcePlay) {
            // ANTI-COLISIÓN
            if (mainRadioAudio && !mainRadioAudio.paused) {
                if (mainRadioPlayBtn) mainRadioPlayBtn.click();
                else mainRadioAudio.pause();
                console.log("Radio principal pausada automáticamente.");
            }

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Error al reproducir audio:", error);
                    alert("No se pudo cargar el audio. Verifica tu conexión o el archivo.");
                });
            }
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            playBtn.classList.add("is-playing");
        } else {
            audio.pause();
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            playBtn.classList.remove("is-playing");
        }
    }

    playBtn.addEventListener("click", () => togglePlay());

    // --- 3. ABRIR REPRODUCTOR Y CARGAR PLAYLIST ---
    document.addEventListener("click", (e) => {
        // Clic en toda la tarjeta de la serie
        const item = e.target.closest(".podcast-item");
        if (item) {
            const sIndex = parseInt(item.dataset.seriesIndex);
            openSeries(sIndex);
        }

        // Clic en un elemento de la playlist (episodio individual)
        const playlistItem = e.target.closest(".playlist-item");
        if (playlistItem) {
            const tIndex = parseInt(playlistItem.dataset.trackIndex);
            playTrack(tIndex);
        }
    });

    function openSeries(seriesIndex) {
        currentSeriesIndex = seriesIndex;
        const series = PODCAST_DB[seriesIndex];
        
        // Actualizar Cabecera del Reproductor
        coverImg.src = series.cover;
        
        // Limpiar y Generar Playlist
        playlistContainer.innerHTML = "";
        series.episodes.forEach((ep, index) => {
            const epHtml = `
                <div class="playlist-item" data-track-index="${index}">
                    <span class="playlist-item-index">${index + 1}</span>
                    <span class="playlist-item-title">${ep.title}</span>
                    <i class="fa-solid fa-chart-simple playlist-item-icon"></i>
                </div>
            `;
            playlistContainer.innerHTML += epHtml;
        });

        // Ocultar Modal de Catálogo y Mostrar Reproductor
        const podcastModal = document.getElementById("podcast-modal");
        if (podcastModal) podcastModal.classList.remove("active");
        podcastPlayerModal.classList.add("active");
        
        // Iniciar con el primer episodio pero SIN AUTOPLAY
        loadTrack(0);
    }

    function loadTrack(trackIndex) {
        const series = PODCAST_DB[currentSeriesIndex];
        if (trackIndex >= series.episodes.length) return; // Fin de la serie

        currentTrackIndex = trackIndex;
        const track = series.episodes[trackIndex];

        // Actualizar Info
        document.getElementById("podcast-series-subtitle").textContent = series.title.toUpperCase();
        trackTitle.textContent = track.title;

        // Cargar Audio
        audio.src = track.file;
        
        // Resaltar en Playlist
        const items = playlistContainer.querySelectorAll(".playlist-item");
        items.forEach(i => i.classList.remove("active"));
        items[trackIndex].classList.add("active");
        
        // Resetear barra visual
        progressBar.value = 0;
        currentTimeEl.textContent = "00:00";
    }

    function playTrack(trackIndex) {
        loadTrack(trackIndex);
        togglePlay(true);
    }

    // --- 4. CERRAR REPRODUCTOR (Y VOLVER AL CATÁLOGO) ---
    closePlayerBtn.addEventListener("click", () => {
        podcastPlayerModal.classList.remove("active");
        // Volver a mostrar el catálogo
        const podcastModal = document.getElementById("podcast-modal");
        if (podcastModal) podcastModal.classList.add("active");
    });

    // --- 5. ACTUALIZACIÓN DE TIEMPO Y BARRA ---
    audio.addEventListener("timeupdate", () => {
        if (!isNaN(audio.duration)) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressBar.value = percent;
            currentTimeEl.textContent = formatTime(audio.currentTime);
            totalTimeEl.textContent = formatTime(audio.duration);
        }
    });

    progressBar.addEventListener("input", (e) => {
        if (!isNaN(audio.duration)) {
            const time = (e.target.value / 100) * audio.duration;
            audio.currentTime = time;
        }
    });

    audio.addEventListener("loadedmetadata", () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });

    // --- 6. AUTOPLAY (Siguiente Track) ---
    audio.addEventListener("ended", () => {
        const series = PODCAST_DB[currentSeriesIndex];
        if (currentTrackIndex + 1 < series.episodes.length) {
            // Reproducir el siguiente automáticamente
            playTrack(currentTrackIndex + 1);
        } else {
            // Fin de toda la serie
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            playBtn.classList.remove("is-playing");
            progressBar.value = 0;
            currentTimeEl.textContent = "00:00";
        }
    });

    // --- 7. ADELANTAR / RETROCEDER 15s ---
    rewindBtn.addEventListener("click", () => {
        audio.currentTime = Math.max(0, audio.currentTime - 15);
    });

    forwardBtn.addEventListener("click", () => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 15);
    });

    // --- 8. CONTROL DE VELOCIDAD ---
    speedBtn.addEventListener("click", () => {
        if (playbackRate === 1) playbackRate = 1.25;
        else if (playbackRate === 1.25) playbackRate = 1.5;
        else if (playbackRate === 1.5) playbackRate = 2;
        else playbackRate = 1;

        audio.playbackRate = playbackRate;
        speedBtn.textContent = playbackRate + "x";
    });

    // --- 9. COMPARTIR (Web Share API) ---
    shareBtn.addEventListener("click", async () => {
        const titleText = trackTitle.textContent;
        const shareData = {
            title: 'MusiChris Studio Radio',
            text: `MusiChris Studio Radio | 🎧 Escucha este poderoso mensaje: "${titleText}" Encuentra paz y fortaleza para tu vida hoy | 👉 Escúchalo gratis aquí:`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                console.log('Mensaje compartido con éxito');
            } else {
                navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                alert("¡El enlace del mensaje ha sido copiado al portapapeles!");
            }
        } catch (err) {
            console.error('Error al compartir:', err);
        }
    });

    // Temporizador eliminado

    /* =========================================================
       🌍 WIDGET 7: ALERTAS DE INTERCESIÓN (SISMOS)
    ========================================================= */
    async function fetchEarthquakes() {
        earthquakesLoadedFlag = true;
        earthquakesLoader.style.display = "flex";
        earthquakesContainer.style.display = "none";
        earthquakesContainer.innerHTML = "";

        try {
            // USGS api: 4.5+ in the past day
            const res = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson");
            const data = await res.json();
            
            // Filtrar mayores a 5.0
            const strongQuakes = data.features.filter(q => q.properties.mag >= 5.0);

            if (strongQuakes.length === 0) {
                earthquakesContainer.innerHTML = `
                    <div style="text-align:center; padding: 30px; color: var(--text-muted);">
                        <i class="fa-solid fa-dove" style="font-size:3rem; color:#fff; margin-bottom:15px; opacity:0.8;"></i>
                        <h4 style="color:#fff; font-size:1.3rem;">La tierra descansa tranquila hoy</h4>
                        <p style="font-style:italic;">"Él hace cesar las guerras hasta los confines de la tierra" (Salmo 46:9)</p>
                    </div>
                `;
            } else {
                strongQuakes.forEach(quake => {
                    const place = quake.properties.place;
                    const mag = parseFloat(quake.properties.mag).toFixed(1);
                    const time = new Date(quake.properties.time).toLocaleString();

                    const card = document.createElement("div");
                    card.className = "earthquake-card";
                    card.innerHTML = `
                        <h4>🚨 Sismo en ${place}</h4>
                        <div class="earthquake-meta">
                            <span class="earthquake-mag"><i class="fa-solid fa-house-crack"></i> Mag: ${mag}</span>
                            <span><i class="fa-regular fa-clock"></i> ${time}</span>
                        </div>
                    `;
                    earthquakesContainer.appendChild(card);
                });
            }
        } catch (err) {
            console.error("Error fetching earthquakes:", err);
            earthquakesContainer.innerHTML = "<p style='color:red; text-align:center;'>Error al conectar con la base de datos sísmica global.</p>";
        }

        earthquakesLoader.style.display = "none";
        earthquakesContainer.style.display = "block";
    }

    /* =========================================================
       🌍 BARRA ESTRATÉGICA DE CLIMA SILENCIOSA
    ========================================================= */
    const weatherStrategicBar = document.getElementById("weather-strategic-bar");
    const wsbIcon = document.getElementById("wsb-icon");
    const wsbLocation = document.getElementById("wsb-location");
    const wsbTemp = document.getElementById("wsb-temp");
    const wsbVerse = document.getElementById("wsb-verse");

    if (weatherStrategicBar) {
        // Ejecutar inmediatamente al cargar para que sea silencioso
        weatherStrategicBar.style.display = "flex";
        autoLocateWeather();
    }

    async function autoLocateWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    try {
                        const revGeoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`);
                        const revGeoData = await revGeoRes.json();
                        let cityName = revGeoData.city || revGeoData.locality || "Tu Ubicación";
                        if (revGeoData.countryName) cityName += `, ${revGeoData.countryName}`;

                        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                        const weatherData = await weatherRes.json();
                        const current = weatherData.current_weather;

                        updateWeatherUI(cityName, current.temperature, current.weathercode);
                    } catch (error) {
                        fallbackWeather();
                    }
                },
                (error) => {
                    fallbackWeather();
                }
            );
        } else {
            fallbackWeather();
        }
    }

    async function fallbackWeather() {
        try {
            // Jerusalem Coordinates
            const lat = 31.7690;
            const lon = 35.2163;
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const weatherData = await weatherRes.json();
            const current = weatherData.current_weather;
            updateWeatherUI("Jerusalén, Israel", current.temperature, current.weathercode);
        } catch(e) {
            weatherStrategicBar.style.display = "none";
        }
    }

    function updateWeatherUI(city, temp, code) {
        wsbLocation.textContent = city;
        wsbTemp.textContent = `| ${Math.round(temp)}°C`;

        let iconClass = "fa-solid fa-sun";
        let verse = `"Mas a vosotros los que teméis mi nombre, nacerá el Sol de justicia" - Mal 4:2`;

        // Mapeo WMO (simplificado)
        if (code === 0 || code === 1) {
            iconClass = "fa-solid fa-sun";
            verse = `"El cielo resplandece de su gloria y la tierra está llena de su alabanza." - Hab 3:3`;
        } else if (code === 2 || code === 3 || code === 45 || code === 48) {
            iconClass = "fa-solid fa-cloud";
            verse = `"Aun en las nubes está tu fidelidad, oh Señor." - Salmo 36:5`;
            wsbIcon.style.color = "#a0aab2";
        } else if (code >= 51 && code <= 67) {
            iconClass = "fa-solid fa-cloud-showers-heavy";
            verse = `"Pide a Jehová lluvia... y Él dará aguaceros sobre los campos." - Zac 10:1`;
            wsbIcon.style.color = "#4ba3e3";
        } else if (code >= 71 && code <= 77) {
            iconClass = "fa-solid fa-snowflake";
            verse = `"Lávame, y seré más blanco que la nieve." - Salmo 51:7`;
            wsbIcon.style.color = "#ffffff";
        } else if (code >= 95) {
            iconClass = "fa-solid fa-cloud-bolt";
            verse = `"Cálmate... Y todo quedó tranquilo." - Marcos 4:39`;
            wsbIcon.style.color = "#ffd700";
        }

        wsbIcon.className = iconClass;
        wsbVerse.textContent = verse;
    }

});

/* =========================================================
   ✨ LOGICA: MARAVILLAS DE LA CREACIÓN (NASA)
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    const btnOpenNasa = document.getElementById('open-wonders-widget');
    const btnCloseNasa = document.getElementById('close-nasa-btn');
    const modalNasa = document.getElementById('nasa-wonders-modal');
    const nasaTabs = modalNasa ? modalNasa.querySelectorAll('.nasa-tab') : [];
    const nasaPanes = modalNasa ? modalNasa.querySelectorAll('.nasa-tab-pane') : [];

    // Elementos SDO
    const imgSdo = document.getElementById('nasa-sdo-img');
    const loaderSdo = document.getElementById('sdo-loading');

    // Elementos EPIC
    const imgEpic = document.getElementById('nasa-epic-img');
    const loaderEpic = document.getElementById('epic-loading');
    const titleEpic = document.getElementById('epic-title');

    // Elementos APOD
    const imgApod = document.getElementById('nasa-apod-img');
    const loaderApod = document.getElementById('apod-loading');
    const titleApod = document.getElementById('apod-title');
    const descApod = document.getElementById('apod-desc');

    let nasaLoaded = { sdo: false, epic: false, apod: false };

    if(btnOpenNasa && modalNasa && btnCloseNasa) {
        // Abrir Modal
        btnOpenNasa.addEventListener('click', () => {
            modalNasa.classList.add('active');
            if(!nasaLoaded.sdo) fetchSDO();
        });

        // Cerrar Modal
        btnCloseNasa.addEventListener('click', () => {
            modalNasa.classList.remove('active');
        });

        // Cerrar al hacer clic afuera
        modalNasa.addEventListener('click', (e) => {
            if(e.target === modalNasa) {
                modalNasa.classList.remove('active');
            }
        });
    }

    // Navegación de Pestañas
    nasaTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover activos
            nasaTabs.forEach(t => t.classList.remove('active'));
            nasaPanes.forEach(p => p.classList.remove('active'));
            
            // Activar seleccionado
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');

            // Cargar data si no ha sido cargada
            if(targetId === 'tab-epic' && !nasaLoaded.epic) fetchEPIC();
            if(targetId === 'tab-apod' && !nasaLoaded.apod) fetchAPOD();
        });
    });

    // Fetch SDO (Sol)
    function fetchSDO() {
        nasaLoaded.sdo = true;
        // Agregamos un timestamp para evadir caché, usando el formato de video MP4
        const sdoUrl = `https://sdo.gsfc.nasa.gov/assets/img/latest/mpeg/latest_512_0304.mp4?t=${new Date().getTime()}`;
        
        const vidSdo = document.getElementById('nasa-sdo-video');
        if(vidSdo) {
            vidSdo.onloadeddata = () => {
                loaderSdo.style.display = 'none';
                vidSdo.style.display = 'block';
                vidSdo.style.opacity = '1';
            };
            vidSdo.src = sdoUrl;
        }
    }

    // Fetch EPIC (Tierra)
    async function fetchEPIC() {
        nasaLoaded.epic = true;
        try {
            const res = await fetch('https://epic.gsfc.nasa.gov/api/natural');
            const data = await res.json();
            
            if(data && data.length > 0) {
                const latest = data[0];
                const imgName = latest.image;
                // Parsear fecha (YYYY-MM-DD HH:MM:SS) a partes
                const dateParts = latest.date.split(' ')[0].split('-');
                const year = dateParts[0];
                const month = dateParts[1];
                const day = dateParts[2];
                
                const imgUrl = `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/png/${imgName}.png`;
                
                imgEpic.onload = () => {
                    loaderEpic.style.display = 'none';
                    imgEpic.style.display = 'block';
                    imgEpic.style.opacity = '1';
                };
                imgEpic.src = imgUrl;
                titleEpic.innerText = `La Tierra (${latest.date.split(' ')[0]})`;
            } else {
                throw new Error("No data");
            }
        } catch(err) {
            console.error("EPIC Error:", err);
            loaderEpic.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> Error conectando con satélite EPIC.";
        }
    }

    // Helper para traducir textos usando la API gratuita de Google Translate
    async function translateToSpanish(text) {
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`);
            const json = await res.json();
            return json[0].map(item => item[0]).join('');
        } catch(e) {
            return text; // Fallback al texto original si falla la traducción
        }
    }

    // Fetch APOD (Cosmos) — con fallback silencioso para rate-limit
    async function fetchAPOD() {
        nasaLoaded.apod = true;

        const showFallback = () => {
            if(imgApod) {
                imgApod.onload = () => {
                    loaderApod.style.display = 'none';
                    imgApod.style.display = 'block';
                    imgApod.style.opacity = '1';
                };
                imgApod.src = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1200";
            }
            if(titleApod) titleApod.innerText = "La Grandeza del Universo";
            if(descApod) descApod.innerText = "\"Los cielos cuentan la gloria de Dios, y el firmamento anuncia la obra de sus manos.\" — Salmo 19:1";
        };

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&thumbs=True', { signal: controller.signal });
            clearTimeout(timeout);

            // Si hay rate-limit (429) o error del servidor (5xx), ir directo al fallback
            if (res.status === 429 || res.status === 503 || res.status === 500 || !res.ok) {
                showFallback();
                return;
            }

            const data = await res.json();

            if(data.url) {
                const imageUrl = (data.media_type === 'video') 
                    ? (data.thumbnail_url || "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1200") 
                    : data.url;
                
                    imgApod.onload = () => {
                        loaderApod.style.display = 'none';
                        imgApod.style.display = 'block';
                        imgApod.style.opacity = '1';
                    };
                    imgApod.onerror = () => {
                        // Si falla la imagen, cargar el fallback
                        imgApod.onerror = null; // evitar loop
                        imgApod.src = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1200";
                    };
                    
                    imgApod.src = imageUrl;
                }

                const translatedTitle = await translateToSpanish(data.title);
                const translatedDesc = await translateToSpanish(data.explanation);
                if(titleApod) titleApod.innerText = translatedTitle;
                if(descApod) descApod.innerText = translatedDesc;
            } else {
                showFallback();
            }
        } catch(err) {
            // Timeout o error de red — fallback silencioso
            showFallback();
        }
    }
});

/* =========================================================
   🌍 LOGICA: CENTRO DE INTERCESIÓN GLOBAL
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    const btnIntercession = document.getElementById('open-intercession-widget');
    const modalIntercession = document.getElementById('intercession-modal');
    const closeIntercessionBtn = document.getElementById('close-intercession-btn');

    let newsLoadedFlag = false;
    let earthquakesLoadedFlag = false;

    if (!btnIntercession || !modalIntercession) return;

    // Abrir modal al hacer clic en tarjeta o botón
    btnIntercession.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            modalIntercession.classList.add('active');
            if (!newsLoadedFlag) fetchNews();
        }
    });
    const openBtn = btnIntercession.querySelector('.widget-btn');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modalIntercession.classList.add('active');
            if (!newsLoadedFlag) fetchNews();
        });
    }

    // Cerrar modal
    if (closeIntercessionBtn) {
        closeIntercessionBtn.addEventListener('click', () => {
            modalIntercession.classList.remove('active');
        });
    }
    modalIntercession.addEventListener('click', (e) => {
        if (e.target === modalIntercession) {
            modalIntercession.classList.remove('active');
        }
    });

    // Tabs del modal de Intercesión
    const intercessionTabs = modalIntercession.querySelectorAll('.nasa-tab');
    const intercessionPanes = modalIntercession.querySelectorAll('.nasa-tab-pane');

    intercessionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            intercessionTabs.forEach(t => t.classList.remove('active'));
            intercessionPanes.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const target = tab.getAttribute('data-tab');
            const pane = document.getElementById(target);
            if (pane) pane.classList.add('active');

            // Lazy load: sismos solo cuando se abre esa pestaña
            if (target === 'tab-earthquakes' && !earthquakesLoadedFlag) {
                fetchEarthquakes();
            }
        });
    });

    // --- Helper: traducir texto al español ---
    async function translateES(text) {
        if (!text) return text;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=${encodeURIComponent(text)}`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            const json = await res.json();
            return json[0].map(item => item[0]).join('');
        } catch {
            return text; // si falla o tarda mucho, devolver original
        }
    }

    // --- Función fetchNews (lazy) con traducción al español ---
    async function fetchNews() {
        newsLoadedFlag = true;
        const loader = document.getElementById('news-loader');
        const grid = document.getElementById('news-grid-container');
        if (!loader || !grid) return;

        loader.style.display = 'flex';
        grid.style.display = 'none';

        const RSS_FEEDS = [
            'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.christianpost.com%2Frss%2F',
            'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.relevantmagazine.com%2Ffeed%2F',
            'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.christianitytoday.com%2Ffeed%2F'
        ];

        const FALLBACK_PHOTOS = [
            "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=600"
        ];

        let allItems = [];
        for (const feed of RSS_FEEDS) {
            try {
                const res = await fetch(feed);
                const data = await res.json();
                if (data.items && data.items.length > 0) {
                    allItems = allItems.concat(data.items.slice(0, 4));
                }
            } catch (e) { /* skip */ }
        }

        if (allItems.length === 0) {
            loader.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Sin conexión al radar.';
            return;
        }

        // Traducir todos los títulos y descripciones al español en paralelo
        const translated = await Promise.all(allItems.map(async (item, i) => {
            const rawDesc = item.description
                ? item.description.replace(/<[^>]*>/g, '').slice(0, 150)
                : '';
            const [title, desc] = await Promise.all([
                translateES(item.title),
                translateES(rawDesc)
            ]);
            let photo = item.thumbnail || item.enclosure?.link;
            if (photo && photo.startsWith('http')) {
                photo = `https://wsrv.nl/?url=${encodeURIComponent(photo)}`;
            } else {
                photo = FALLBACK_PHOTOS[i % FALLBACK_PHOTOS.length];
            }
            return { title, desc, photo, link: item.link, author: item.author };
        }));

        grid.innerHTML = translated.map(item => `
            <article class="news-card" onclick="window.open('${item.link}', '_blank')">
                ${item.photo ? `<div class="news-card-img" style="background-image: url('${item.photo}')"></div>` : ''}
                <div class="news-card-body">
                    <span class="news-source">${item.author || 'Fuente Global'}</span>
                    <h4 class="news-title">${item.title}</h4>
                    <p class="news-desc">${item.desc}...</p>
                </div>
            </article>`).join('');

        loader.style.display = 'none';
        grid.style.display = 'grid';
    }

    // --- Función fetchEarthquakes (lazy) ---
    async function fetchEarthquakes() {
        earthquakesLoadedFlag = true;
        const loader = document.getElementById('earthquakes-loader');
        const container = document.getElementById('earthquakes-container');
        if (!loader || !container) return;

        loader.style.display = 'flex';
        container.style.display = 'none';

        // Ya no necesitamos el proxy porque arreglamos el Service Worker
        const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(USGS_URL, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!res.ok) throw new Error('fetch failed');
            const data = await res.json();

            if (!data.features || data.features.length === 0) {
                loader.style.display = 'none';
                container.style.display = 'block';
                container.innerHTML = '<div style="text-align:center;padding:30px;color:#4ade80;"><i class="fa-solid fa-circle-check" style="font-size:2rem;"></i><p style="margin-top:10px;">Sin alertas significativas este mes. ¡Paz en la tierra!</p></div>';
                return;
            }

            // Filtrar estrictamente sismos 5.0+
            const filteredFeatures = data.features.filter(f => f.properties.mag !== null && f.properties.mag >= 5.0);

            if (filteredFeatures.length === 0) {
                loader.style.display = 'none';
                container.style.display = 'block';
                container.innerHTML = '<div style="text-align:center;padding:30px;color:#4ade80;"><i class="fa-solid fa-circle-check" style="font-size:2rem;"></i><p style="margin-top:10px;">Sin sismos mayores a 5.0 este mes. ¡Paz en la tierra!</p></div>';
                return;
            }

            const sorted = filteredFeatures.sort((a, b) => (b.properties.mag || 0) - (a.properties.mag || 0));

            // Traducir los lugares al español en paralelo
            const cards = await Promise.all(sorted.map(async f => {
                const p = f.properties;
                const mag = p.mag !== null ? p.mag : 0; // Prevenir error de null
                const color = mag >= 7 ? '#ff4b4b' : mag >= 5.5 ? '#ff9a3c' : '#facc15';
                const date = new Date(p.time).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                const place = await translateES(p.place || 'Ubicación desconocida');
                const alert = mag >= 7 ? '⚠️ ALERTA MAYOR' : mag >= 5.5 ? '🟠 Moderado' : '🟡 Leve';
                const magDisplay = p.mag !== null ? mag.toFixed(1) : 'Por determinar';
                const magFontSize = p.mag !== null ? '2rem' : '1.1rem';
                
                return `
                    <div class="earthquake-card" style="border-left: 4px solid ${color};">
                        <div class="eq-mag" style="color:${color}; font-size: ${magFontSize}; font-weight: 900;">${magDisplay}</div>
                        <div class="eq-info">
                            <strong>${place}</strong>
                            <span>${date} · ${alert}</span>
                        </div>
                        <div class="eq-prayer" title="Orar por esta región"><i class="fa-solid fa-hands-praying"></i></div>
                    </div>`;
            }));


            container.innerHTML = cards.join('');
            loader.style.display = 'none';
            container.style.display = 'block';

        } catch (err) {
            loader.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:#ff4b4b;font-size:1.5rem;"></i><p style="margin-top:8px;">Fallo de conexión: ${err.message || err}</p>`;
        }
    }
});

// ==========================================
// WIDGET 2: CREADOR DE POSTALES DE FE (MODAL)
// ==========================================
function initPostcardCreatorModal() {
    const openBtn = document.getElementById('open-postcard-widget');
    const modal = document.getElementById('postcard-modal');
    const closeBtn = document.getElementById('close-postcard-btn');
    const canvas = document.getElementById('postcard-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const textInput = document.getElementById('postcard-text');
    const fontSelect = document.getElementById('postcard-font');
    const alignBtns = document.querySelectorAll('.align-btn');
    const shareBtn = document.getElementById('share-postcard-btn');
    const downloadBtn = document.getElementById('download-postcard-btn');
    const bgsContainer = document.getElementById('postcard-bgs');

    if (!openBtn || !modal || !canvas) return;

    let currentBgImage = new Image();
    let currentAlign = 'left';

    const BACKGROUNDS = [
        'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1080&h=1080',
        'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1080&h=1080',
        'https://images.unsplash.com/photo-1444065707204-12decac917e8?auto=format&fit=crop&q=80&w=1080&h=1080',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1080&h=1080',
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=1080&h=1080'
    ];

    function initPostcard() {
        BACKGROUNDS.forEach((src, idx) => {
            const img = document.createElement('img');
            img.src = src;
            img.className = `bg-thumb ${idx === 0 ? 'active' : ''}`;
            img.onclick = () => {
                document.querySelectorAll('.bg-thumb').forEach(el => el.classList.remove('active'));
                img.classList.add('active');
                loadBackgroundImage(src);
            };
            bgsContainer.appendChild(img);
        });
        loadBackgroundImage(BACKGROUNDS[0]);
    }

    function loadBackgroundImage(url) {
        currentBgImage = new Image();
        currentBgImage.crossOrigin = "anonymous"; // Important for canvas export
        currentBgImage.onload = drawCanvas;
        currentBgImage.src = url;
    }

    function drawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (currentBgImage.complete && currentBgImage.naturalWidth > 0) {
            const scale = Math.max(canvas.width / currentBgImage.width, canvas.height / currentBgImage.height);
            const x = (canvas.width / 2) - (currentBgImage.width / 2) * scale;
            const y = (canvas.height / 2) - (currentBgImage.height / 2) * scale;
            ctx.drawImage(currentBgImage, x, y, currentBgImage.width * scale, currentBgImage.height * scale);
        } else {
            ctx.fillStyle = '#0d0f15';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const text = textInput.value;
        const font = fontSelect.value;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 60px "${font}", sans-serif`;
        ctx.textBaseline = 'middle';

        let alignX = canvas.width / 2;
        if (currentAlign === 'left') {
            ctx.textAlign = 'left';
            alignX = 100;
        } else if (currentAlign === 'right') {
            ctx.textAlign = 'right';
            alignX = canvas.width - 100;
        } else {
            ctx.textAlign = 'center';
            alignX = canvas.width / 2;
        }

        const paragraphs = text.split('\n');
        const lineHeight = 80;
        const allLines = [];

        paragraphs.forEach(paragraph => {
            if (paragraph.trim() === '') {
                allLines.push('');
                return;
            }
            let words = paragraph.split(' ');
            let line = '';
            for(let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                let metrics = ctx.measureText(testLine);
                let testWidth = metrics.width;
                if (testWidth > (canvas.width - 200) && n > 0) {
                    allLines.push(line.trim());
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            allLines.push(line.trim());
        });

        const totalTextHeight = allLines.length * lineHeight;
        let startY = (canvas.height - totalTextHeight) / 2 + (lineHeight / 2) - 40;

        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;

        allLines.forEach(line => {
            if (line !== '') {
                ctx.fillText(line, alignX, startY);
            }
            startY += lineHeight;
        });

        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Marca de Agua
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `300 24px "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Creado en Musichris Studio', canvas.width / 2, canvas.height - 50);
    }

    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
        if(bgsContainer.children.length === 0) initPostcard();
        setTimeout(drawCanvas, 100);
    });

    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    textInput.addEventListener('input', drawCanvas);
    fontSelect.addEventListener('change', () => {
        drawCanvas();
        // Asegurarse de redibujar cuando la fuente esté completamente cargada
        if (document.fonts) {
            document.fonts.ready.then(drawCanvas);
        }
    });

    alignBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            alignBtns.forEach(b => b.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentAlign = target.dataset.align;
            drawCanvas();
        });
    });

    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], 'postal-musichris.jpg', { type: 'image/jpeg' });
                
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'MusiChris Studio',
                            text: '¡Mira esta hermosa postal de fe que creé en MusiChris Studio!'
                        });
                    } catch (err) {
                        console.log('Error al compartir', err);
                    }
                } else {
                    alert('Tu navegador no soporta compartir directamente. Por favor, usa el botón de Guardar.');
                }
            }, 'image/jpeg', 0.9);
        });
    }

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'postal-musichris.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
    });
}

initPostcardCreatorModal();

