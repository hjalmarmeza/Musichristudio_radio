import re

file_path = "/Users/hjalmarmeza/Downloads/Antigravity/Buscador_Servidor_Oracle/web_player/index.html"

with open(file_path, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Remove weather bar
weather_regex = re.compile(r'<!-- ESTRATÉGICO: BARRA DE CLIMA SILENCIOSA -->\s*<div class="weather-strategic-wrapper">.*?</div>\s*</div>', re.DOTALL)
html = weather_regex.sub('', html)

# 2. Extract and move Postcard section
postcard_regex = re.compile(r'(<!-- SECTION 2: CREADOR DE POSTALES DE FE \(INTERACTIVE WIDGET\) -->\s*<section class="postcard-section" id="postales">.*?</section>)', re.DOTALL)
postcard_match = postcard_regex.search(html)

if postcard_match:
    postcard_html = postcard_match.group(1)
    # Remove from original location
    html = html.replace(postcard_html, '')
    
    # Find end of widgets section and insert there
    widgets_end_regex = re.compile(r'(<!-- 🌟 INTERACTIVE SPIRITUAL EDIFICATION WIDGETS -->\s*<section class="widgets-section" id="edificacion">.*?</section>)', re.DOTALL)
    widgets_match = widgets_end_regex.search(html)
    
    if widgets_match:
        widgets_html = widgets_match.group(1)
        # We append postcard_html after widgets_html
        new_widgets_html = widgets_html + "\n\n        " + postcard_html
        html = html.replace(widgets_html, new_widgets_html)

# 3. Combine Widget 6 and Widget 7 into Intercession Global
widgets_to_remove = re.compile(r'<!-- Widget 6: Radar de Actualidad Global -->\s*<div class="widget-card news-widget".*?</div>\s*</div>\s*<!-- Widget 7: Radar de Intercesión \(Sismos\) -->\s*<div class="widget-card earthquakes-widget".*?</div>\s*</div>', re.DOTALL)

intercession_widget = """<!-- Widget 6: Centro de Intercesión Global -->
                    <div class="widget-card intercession-widget" id="open-intercession-widget">
                        <div class="widget-glow intercession-glow"></div>
                        <div class="widget-content">
                            <div class="widget-icon-box intercession-icon">
                                <i class="fa-solid fa-earth-americas"></i>
                                <span class="live-pulse pulse-red"></span>
                            </div>
                            <h3>Intercesión Global</h3>
                            <p>Mantente informado sobre actualidad cristiana y únete en clamor por crisis globales y sismos.</p>
                            <button class="widget-btn intercession-btn">
                                <i class="fa-solid fa-hands-praying"></i> Abrir Centro
                            </button>
                        </div>
                    </div>"""

html = widgets_to_remove.sub(intercession_widget, html)

# 4. Remove old modals (news and earthquakes)
old_modals_regex = re.compile(r'<!-- CHRISTIAN NEWS MODAL -->.*?<!-- EARTHQUAKES MODAL -->.*?</div>\s*</div>\s*</div>', re.DOTALL)

intercession_modal = """<!-- INTERCESSION GLOBAL MODAL -->
    <div class="nasa-modal-overlay" id="intercession-modal">
        <button class="close-nasa-btn" id="close-intercession-btn">&times;</button>
        <div class="nasa-modal-content">
            
            <div class="nasa-tabs-header">
                <button class="nasa-tab active" data-tab="tab-news">🌍 Actualidad Cristiana</button>
                <button class="nasa-tab" data-tab="tab-earthquakes">🚨 Alertas de Sismos</button>
            </div>

            <!-- Tab 1: Noticias -->
            <div class="nasa-tab-pane active" id="tab-news">
                <div class="news-modal-body" style="padding:20px; overflow-y:auto; height:100%;">
                    <div class="news-loading-indicator" id="news-loader">
                        <i class="fa-solid fa-circle-notch fa-spin"></i>
                        <p>Rastreando el acontecer global...</p>
                    </div>
                    <div class="news-grid-container" id="news-grid-container" style="display: none;"></div>
                </div>
            </div>

            <!-- Tab 2: Sismos -->
            <div class="nasa-tab-pane" id="tab-earthquakes">
                <div class="earthquakes-modal-body" style="padding:20px; overflow-y:auto; height:100%;">
                    <div class="earthquakes-loading-indicator" id="earthquakes-loader">
                        <i class="fa-solid fa-satellite-dish fa-spin" style="color:#ff4b4b;"></i>
                        <p>Rastreando alertas globales de la NASA/USGS...</p>
                    </div>
                    <div class="earthquakes-container" id="earthquakes-container" style="display: none;"></div>
                </div>
            </div>

        </div>
    </div>"""

html = old_modals_regex.sub(intercession_modal, html)

# Rename ID nasa-wonders-modal class from .nasa-modal-overlay to something generic since intercession uses it
# Wait, let's keep the classes as they are because I am reusing .nasa-modal-content which has all the CSS.

with open(file_path, "w", encoding="utf-8") as f:
    f.write(html)

print("HTML Refactoring Complete")
