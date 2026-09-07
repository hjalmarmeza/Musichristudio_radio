
document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('play-btn');
    const orbLoader = document.getElementById('orb-loader');
    const audioEl = document.getElementById('radio-audio');
    const playerCard = document.getElementById('main-player-card');
    
    if(playBtn && orbLoader && audioEl) {
        playBtn.addEventListener('click', () => {
            // Check if we are trying to play (if it doesn't have the playing class)
            if(!playerCard.classList.contains('playing')) {
                // Hide button, show orb
                playBtn.style.setProperty('display', 'none', 'important');
                orbLoader.style.setProperty('display', 'flex', 'important');
            }
        });
        
        audioEl.addEventListener('playing', () => {
            // Restore button
            orbLoader.style.setProperty('display', 'none', 'important');
            playBtn.style.setProperty('display', 'flex', 'important');
        });
        
        audioEl.addEventListener('pause', () => {
            orbLoader.style.setProperty('display', 'none', 'important');
            playBtn.style.setProperty('display', 'flex', 'important');
        });
        
        audioEl.addEventListener('error', () => {
            orbLoader.style.setProperty('display', 'none', 'important');
            playBtn.style.setProperty('display', 'flex', 'important');
        });
    }

    // === MEDIASESSION API (LOCK SCREEN) ===
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: 'MusiChris Radio (En Vivo)',
            artist: 'MusiChris Studio',
            album: 'Adoración 24/7',
            artwork: [
                { src: 'assets/cover.png', sizes: '512x512', type: 'image/png' }
            ]
        });
        
        // Conectar botones de la pantalla de bloqueo con nuestro botón de Play
        navigator.mediaSession.setActionHandler('play', () => { document.getElementById('play-btn').click(); });
        navigator.mediaSession.setActionHandler('pause', () => { document.getElementById('play-btn').click(); });
    }

    // === MATRIX / HACKER EFFECT FOR WIDGET TITLES ===
    const matrixLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#%&*";
    document.querySelectorAll('.widget-card').forEach(card => {
        const titleEl = card.querySelector('h3');
        if(!titleEl) return;
        
        const originalText = titleEl.innerText;
        titleEl.dataset.value = originalText;
        
        card.addEventListener('mouseenter', () => {
            let iterations = 0;
            clearInterval(titleEl.dataset.interval);
            
            titleEl.dataset.interval = setInterval(() => {
                titleEl.innerText = originalText.split("").map((letter, index) => {
                    // Si la letra original es un espacio, respetarlo
                    if (letter === " ") return " ";
                    
                    if(index < iterations) {
                        return originalText[index];
                    }
                    return matrixLetters[Math.floor(Math.random() * matrixLetters.length)];
                }).join("");
                
                if(iterations >= originalText.length) {
                    clearInterval(titleEl.dataset.interval);
                    titleEl.innerText = originalText; // Seguro
                }
                iterations += 1 / 2; // Velocidad de descifrado
            }, 30);
        });
    });

    // === SCROLL REVEAL & SPOTLIGHT FOR MISION/VISION ===
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.mv-block').forEach((block, index) => {
        // Scroll Reveal Setup
        block.classList.add('reveal');
        block.style.transitionDelay = `${index * 0.15}s`;
        observer.observe(block);

        // Spotlight Setup
        const spotlight = document.createElement('div');
        spotlight.className = 'spotlight';
        block.appendChild(spotlight);

        block.addEventListener('mousemove', (e) => {
            const rect = block.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            spotlight.style.left = `${x}px`;
            spotlight.style.top = `${y}px`;
        });
    });

    // === CINEMATIC PARALLAX BACKGROUND ===
    window.addEventListener('scroll', () => {
        // Calcular el porcentaje de scroll (0 al inicio, 1 al final)
        const scrollHeight = document.body.scrollHeight - window.innerHeight;
        let scrollPercent = 0;
        if(scrollHeight > 0) {
            scrollPercent = window.scrollY / scrollHeight;
        }
        
        // Evitar pasarse de los limites (bounce en Safari)
        scrollPercent = Math.max(0, Math.min(1, scrollPercent));
        
        // Mover la posicion del fondo del 0% (arriba) al 100% (abajo)
        document.body.style.setProperty('background-position', `center ${scrollPercent * 100}%`, 'important');
    });
});


document.addEventListener('DOMContentLoaded', () => {
    // Replace FontAwesome with Lucide in widgets
    document.querySelectorAll('.widget-card i.fa-solid').forEach(icon => {
        if(icon.classList.contains('fa-book-bible') || icon.classList.contains('fa-book-open')) {
            icon.outerHTML = '<i data-lucide="book-open" style="width:32px; height:32px; color:white;"></i>';
        } else if(icon.classList.contains('fa-image')) {
            icon.outerHTML = '<i data-lucide="image" style="width:32px; height:32px; color:white;"></i>';
        }
    });
    // Create icons
    if(window.lucide) { lucide.createIcons(); }

    // 3D Tilt Logic
    document.querySelectorAll('.widget-card').forEach(card => {
        const glare = document.createElement('div');
        glare.className = 'widget-glare';
        card.appendChild(glare);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            glare.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s';
        });
    });

    // === MEDIASESSION API (LOCK SCREEN) ===
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: 'MusiChris Radio (En Vivo)',
            artist: 'MusiChris Studio',
            album: 'Adoración 24/7',
            artwork: [
                { src: 'assets/cover.png', sizes: '512x512', type: 'image/png' }
            ]
        });
        
        // Conectar botones de la pantalla de bloqueo con nuestro botón de Play
        navigator.mediaSession.setActionHandler('play', () => { document.getElementById('play-btn').click(); });
        navigator.mediaSession.setActionHandler('pause', () => { document.getElementById('play-btn').click(); });
    }

    // === MATRIX / HACKER EFFECT FOR WIDGET TITLES ===
    const matrixLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#%&*";
    document.querySelectorAll('.widget-card').forEach(card => {
        const titleEl = card.querySelector('h3');
        if(!titleEl) return;
        
        const originalText = titleEl.innerText;
        titleEl.dataset.value = originalText;
        
        card.addEventListener('mouseenter', () => {
            let iterations = 0;
            clearInterval(titleEl.dataset.interval);
            
            titleEl.dataset.interval = setInterval(() => {
                titleEl.innerText = originalText.split("").map((letter, index) => {
                    // Si la letra original es un espacio, respetarlo
                    if (letter === " ") return " ";
                    
                    if(index < iterations) {
                        return originalText[index];
                    }
                    return matrixLetters[Math.floor(Math.random() * matrixLetters.length)];
                }).join("");
                
                if(iterations >= originalText.length) {
                    clearInterval(titleEl.dataset.interval);
                    titleEl.innerText = originalText; // Seguro
                }
                iterations += 1 / 2; // Velocidad de descifrado
            }, 30);
        });
    });

    // === SCROLL REVEAL & SPOTLIGHT FOR MISION/VISION ===
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.mv-block').forEach((block, index) => {
        // Scroll Reveal Setup
        block.classList.add('reveal');
        block.style.transitionDelay = `${index * 0.15}s`;
        observer.observe(block);

        // Spotlight Setup
        const spotlight = document.createElement('div');
        spotlight.className = 'spotlight';
        block.appendChild(spotlight);

        block.addEventListener('mousemove', (e) => {
            const rect = block.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            spotlight.style.left = `${x}px`;
            spotlight.style.top = `${y}px`;
        });
    });

    // === CINEMATIC PARALLAX BACKGROUND ===
    window.addEventListener('scroll', () => {
        // Calcular el porcentaje de scroll (0 al inicio, 1 al final)
        const scrollHeight = document.body.scrollHeight - window.innerHeight;
        let scrollPercent = 0;
        if(scrollHeight > 0) {
            scrollPercent = window.scrollY / scrollHeight;
        }
        
        // Evitar pasarse de los limites (bounce en Safari)
        scrollPercent = Math.max(0, Math.min(1, scrollPercent));
        
        // Mover la posicion del fondo del 0% (arriba) al 100% (abajo)
        document.body.style.setProperty('background-position', `center ${scrollPercent * 100}%`, 'important');
    });
});

