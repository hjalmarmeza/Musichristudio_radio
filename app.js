/* ==========================================================================
   ⚡ MusiChris Studio Radio - Master Dynamic & CMS Controller (Landing Page)
   ========================================================================== */

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
    const closeAdminBtn = document.getElementById("close-admin-btn");
    const adminLoginScreen = document.getElementById("admin-login-screen");
    const adminDashboardScreen = document.getElementById("admin-dashboard-screen");
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

    // 2. 🗄️ STATE MANAGEMENT (Announcements & Schedule)
    const DEFAULT_ANNOUNCEMENTS = [
        {
            title: "¡Gran Campaña de Oración Activa!",
            desc: "Escribe tu petición en el formulario inferior de nuestra web. Estaremos intercediendo en vivo y clamando por tu milagro en cada programa.",
            bgImage: "https://images.unsplash.com/photo-1544427928-c49cddeb9744?q=80&w=1200",
            btnText: "Pedir Oración 🙏",
            btnLink: "#peticiones"
        },
        {
            title: "Devocionales Diarios en YouTube",
            desc: "Acompaña cada día los nuevos videos de edificación ministerial de MusiChris Studio. Suscríbete y activa la campanita para no perderte nada.",
            bgImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=1200",
            btnText: "Ir al Canal 🎥",
            btnLink: "https://www.youtube.com/@MusiChrisStudio"
        },
        {
            title: "Pide tu Alabanza Favorita por WhatsApp",
            desc: "Envíanos tu recomendación de canción o envíanos un audio con tu testimonio de bendición para transmitirlo en la señal radial en vivo.",
            bgImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200",
            btnText: "Pedir Canción 🎵",
            btnLink: "https://wa.me/3 Spain target..."
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

    // Load active state from localStorage or seed defaults
    let announcements = JSON.parse(localStorage.getItem("musichris_announcements")) || DEFAULT_ANNOUNCEMENTS;
    let schedule = JSON.parse(localStorage.getItem("musichris_schedule")) || DEFAULT_SCHEDULE;

    // Seed back into storage if empty
    if (!localStorage.getItem("musichris_announcements")) {
        localStorage.setItem("musichris_announcements", JSON.stringify(DEFAULT_ANNOUNCEMENTS));
    }
    if (!localStorage.getItem("musichris_schedule")) {
        localStorage.setItem("musichris_schedule", JSON.stringify(DEFAULT_SCHEDULE));
    }

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
            // Update resources
            stripBg.style.backgroundImage = `url('${item.bgImage}')`;
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
        const password = adminPasswordInput.value;
        if (password === "25863206") {
            adminLoginScreen.style.display = "none";
            adminDashboardScreen.classList.add("show");
            
            // Render editing lists inside tabs
            renderAdminAnnouncementsEditor();
            renderAdminScheduleEditor();
            generateExportCode();
        } else {
            loginError.classList.add("show");
        }
    }

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
            }
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

    // 💾 Save Admin Changes to LocalStorage & Refresh
    function saveAdminChanges() {
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
        const editedSchedule = [];
        const schTimes = document.querySelectorAll(".edit-sch-time");
        const schTitles = document.querySelectorAll(".edit-sch-title");
        const schDescs = document.querySelectorAll(".edit-sch-desc");

        for (let i = 0; i < schTimes.length; i++) {
            editedSchedule.push({
                time: schTimes[i].value,
                title: schTitles[i].value,
                desc: schDescs[i].value
            });
        }

        // 3. Save State & Sync
        announcements = editedAnnouncements;
        schedule = editedSchedule;

        localStorage.setItem("musichris_announcements", JSON.stringify(announcements));
        localStorage.setItem("musichris_schedule", JSON.stringify(schedule));

        // Re-render
        currentAnnounceIndex = 0;
        startAnnouncementSlideshow();
        renderPublicSchedule();
        generateExportCode();

        alert("✨ ¡Configuración guardada en este navegador con éxito! Los cambios son visibles inmediatamente en las secciones correspondientes.");
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
                const freqValue = dataArray[i + 1] || 0;
                const barHeight = Math.max(4, (freqValue / 255) * 36 + 4);
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
            
            const name = document.getElementById("form-name").value;
            const email = document.getElementById("form-email").value;
            const type = document.getElementById("form-type").value;
            const message = document.getElementById("form-message").value;
            
            console.log("📝 Petición de Oración Recibida:", { name, email, type, message });
            
            formSuccess.classList.add("show");
            prayerForm.reset();
            
            setTimeout(() => {
                formSuccess.classList.remove("show");
            }, 6000);
        });
    }

    // Navigation Scroll Spy
    window.addEventListener("scroll", () => {
        let currentSectionId = "";
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 150)) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
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
            .catch(error => {
                console.warn("⚠️ Error al obtener metadatos de AzuraCast:", error);
                // Fail silently, keep current or default metadata
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
    closeAdminBtn.addEventListener("click", closeAdminPanel);
    adminLoginBtn.addEventListener("click", handleAdminLogin);
    saveLocalBtn.addEventListener("click", saveAdminChanges);
    copyCodeBtn.addEventListener("click", copyExportCodeToClipboard);

    adminPasswordInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleAdminLogin();
    });

    // 🤫 Backdoor A: URL query parameters check
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("admin") === "true" || urlParams.get("edit") === "true") {
        adminTriggerBtn.style.display = "flex";
    }

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

    // Boot Up Rendering
    startAnnouncementSlideshow();
    renderPublicSchedule();
    audio.volume = volumeSlider.value / 100;
    
    // Iniciar integración de AzuraCast (si está activa)
    startAzuraCastMetadataPolling();
});
