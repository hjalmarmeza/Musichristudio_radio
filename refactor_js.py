import re

file_path = "/Users/hjalmarmeza/Downloads/Antigravity/Buscador_Servidor_Oracle/web_player/app.js"

with open(file_path, "r", encoding="utf-8") as f:
    js = f.read()

# 1. Remove weather fetch
js = re.sub(r'fetchWeather\(\);', '', js)
js = re.sub(r'// --- ESTRATÉGICO: BARRA DE CLIMA SILENCIOSA ---.*?// --- FIN CLIMA ---', '', js, flags=re.DOTALL)

# 2. Modify NASA initialization (Lazy loading)
js = re.sub(r'fetchSDO\(\);\s*fetchEPIC\(\);\s*fetchAPOD\(\);', '', js)

# Modify NASA Modal open logic to fetch on demand
nasa_open_regex = re.compile(r'btnWonders\.addEventListener\(\'click\', \(\) => \{\s*modalNasa\.style\.display = \'flex\';\s*\}\);')

lazy_nasa_open = """btnWonders.addEventListener('click', () => {
        modalNasa.style.display = 'flex';
        // Lazy load SDO si no se ha cargado
        if(!nasaLoaded.sdo) {
            fetchSDO();
        }
    });"""

js = nasa_open_regex.sub(lazy_nasa_open, js)

# NASA Tabs lazy loading
nasa_tabs_regex = re.compile(r'tab\.classList\.add\(\'active\'\);\s*const target = tab\.getAttribute\(\'data-tab\'\);\s*document\.getElementById\(target\)\.classList\.add\(\'active\'\);')

lazy_nasa_tabs = """tab.classList.add('active');
            const target = tab.getAttribute('data-tab');
            document.getElementById(target).classList.add('active');
            
            // Lazy loading
            if(target === 'tab-epic' && !nasaLoaded.epic) fetchEPIC();
            if(target === 'tab-apod' && !nasaLoaded.apod) fetchAPOD();"""

js = nasa_tabs_regex.sub(lazy_nasa_tabs, js)


# 3. Intercession Modal Logic
# We need to replace the old News/Earthquakes modal open logic with the new one.
js = re.sub(r'const btnNews = document\.getElementById\(\'open-news-widget\'\);.*?btnNews\.addEventListener\(\'click\', \(\) => \{\s*modalNews\.style\.display = \'flex\';\s*\}\);', '', js, flags=re.DOTALL)
js = re.sub(r'const btnEarthquakes = document\.getElementById\(\'open-earthquakes-widget\'\);.*?btnEarthquakes\.addEventListener\(\'click\', \(\) => \{\s*modalEarthquakes\.style\.display = \'flex\';\s*\}\);', '', js, flags=re.DOTALL)

js = re.sub(r'fetchNews\(\);', '', js)
js = re.sub(r'fetchEarthquakes\(\);', '', js)

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

# Insert this logic somewhere around where the old news logic was, or at the end of the DOMContentLoaded block
js = js.replace('// --- MARAVILLAS DE LA CREACIÓN (NASA API) ---', intercession_logic + '\n\n    // --- MARAVILLAS DE LA CREACIÓN (NASA API) ---')

# Update fetchNews to set newsLoadedFlag = true
js = js.replace('async function fetchNews() {', 'async function fetchNews() {\n        newsLoadedFlag = true;')

# Update fetchEarthquakes to set earthquakesLoadedFlag = true
js = js.replace('async function fetchEarthquakes() {', 'async function fetchEarthquakes() {\n        earthquakesLoadedFlag = true;')


with open(file_path, "w", encoding="utf-8") as f:
    f.write(js)

print("JS Refactoring Complete")
