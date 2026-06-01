import re

file_path = "/Users/hjalmarmeza/Downloads/Antigravity/Buscador_Servidor_Oracle/web_player/app.js"
with open(file_path, "r", encoding="utf-8") as f:
    js = f.read()

# Remove old News modal logic (lines 1921-1948 roughly)
news_logic_pattern = re.compile(r'const newsModal = document\.getElementById\("news-modal"\);.*?if \(closeNewsBtn && newsModal\) \{.*?\}\s*\}\s*', re.DOTALL)
js = news_logic_pattern.sub('', js)

# Remove old Earthquakes modal logic
earthquakes_logic_pattern = re.compile(r'const openEarthquakesBtn = document\.getElementById\("open-earthquakes-widget"\);.*?earthquakesModal\.classList\.remove\("active"\);\s*\}\s*\);.*?\}\s*', re.DOTALL)
js = earthquakes_logic_pattern.sub('', js)

# Now we need to append the new Intercession logic just before the NASA block (which starts with `// ✨ LOGICA: MARAVILLAS DE LA CREACIÓN (NASA)`)
intercession_logic = """
    // --- CENTRO DE INTERCESIÓN GLOBAL ---
    const btnIntercession = document.getElementById('open-intercession-widget');
    const modalIntercession = document.getElementById('intercession-modal');
    const closeIntercessionBtn = document.getElementById('close-intercession-btn');
    
    let newsLoadedFlag = false;
    let earthquakesLoadedFlag = false;

    if(btnIntercession) {
        btnIntercession.addEventListener('click', () => {
            modalIntercession.style.display = 'flex';
            if(!newsLoadedFlag) {
                fetchNews();
            }
        });
    }

    if(closeIntercessionBtn) {
        closeIntercessionBtn.addEventListener('click', () => {
            modalIntercession.style.display = 'none';
        });
    }

    // Tabs Intercesión
    const intercessionTabs = document.querySelectorAll('#intercession-modal .nasa-tab');
    const intercessionPanes = document.querySelectorAll('#intercession-modal .nasa-tab-pane');

    intercessionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            intercessionTabs.forEach(t => t.classList.remove('active'));
            intercessionPanes.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            const target = tab.getAttribute('data-tab');
            document.getElementById(target).classList.add('active');
            
            if(target === 'tab-earthquakes' && !earthquakesLoadedFlag) {
                fetchEarthquakes();
            }
        });
    });

"""

# Insert before NASA logic
js = js.replace('    // ✨ LOGICA: MARAVILLAS DE LA CREACIÓN (NASA)', intercession_logic + '    // ✨ LOGICA: MARAVILLAS DE LA CREACIÓN (NASA)')


with open(file_path, "w", encoding="utf-8") as f:
    f.write(js)

print("Fixed app.js logic")
