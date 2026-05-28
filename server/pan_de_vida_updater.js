'use strict';

const { google } = require('googleapis');
const fetch = require('node-fetch');
const fs = require('fs');

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN FIREBASE
// ─────────────────────────────────────────────────────────────────────────────
const FIREBASE_API_KEY = 'AIzaSyDns9TUBRrrwIyyuVAizHmWsv9C3iX4neU';
const FIREBASE_DB_URL  = 'https://proyecto-musichris-350df-default-rtdb.us-central1.firebasedatabase.app';
const GMAIL_SOURCE     = 'devocional@vnpem.org.mx';

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Parsear JSON resistente (Base64, markdown, espacios)
// ─────────────────────────────────────────────────────────────────────────────
function safeParseJson(raw, name) {
    if (!raw) throw new Error(`Secreto ${name} está vacío o no configurado.`);
    let clean = raw.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    if (clean.startsWith('```'))     clean = clean.slice(3);
    if (clean.endsWith('```'))       clean = clean.slice(0, -3);
    clean = clean.trim();
    try {
        return JSON.parse(clean);
    } catch (_) {
        try {
            return JSON.parse(Buffer.from(clean, 'base64').toString('utf-8'));
        } catch (e) {
            throw new Error(`${name} no es JSON ni Base64 válido. Muestra: "${clean.substring(0, 40)}..."`);
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Fecha en español largo (ej: "21 de mayo de 2026")
// ─────────────────────────────────────────────────────────────────────────────
function getFechaEspanol() {
    const meses = [
        'enero','febrero','marzo','abril','mayo','junio',
        'julio','agosto','septiembre','octubre','noviembre','diciembre'
    ];
    const now = new Date();
    return `${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PASO 1: Leer Gmail — obtener correo de devocional@vnpem.org.mx
// ─────────────────────────────────────────────────────────────────────────────
async function leerGmail() {
    console.log(`\n📧 [GMAIL] Buscando correo de ${GMAIL_SOURCE}...`);

    // Cargar credenciales OAuth2
    const rawCreds = process.env.YOUTUBE_CREDENTIALS_JSON
        || (fs.existsSync('credentials.json') ? fs.readFileSync('credentials.json', 'utf8') : null);
    const credentials = safeParseJson(rawCreds, 'YOUTUBE_CREDENTIALS_JSON');
    const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Cargar token OAuth2
    const rawToken = process.env.YOUTUBE_TOKEN_JSON
        || (fs.existsSync('../token.json') ? fs.readFileSync('../token.json', 'utf8') : null);
    const tokenData = safeParseJson(rawToken, 'YOUTUBE_TOKEN_JSON');
    oAuth2Client.setCredentials(tokenData);

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Buscar los 3 correos más recientes del remitente
    const listRes = await gmail.users.messages.list({
        userId: 'me',
        q: `from:${GMAIL_SOURCE}`,
        maxResults: 3
    });

    if (!listRes.data.messages || listRes.data.messages.length === 0) {
        throw new Error(`No se encontraron correos de ${GMAIL_SOURCE}.`);
    }

    // Tomar el más reciente
    const messageId = listRes.data.messages[0].id;
    const msg = await gmail.users.messages.get({ userId: 'me', id: messageId });

    const headers  = msg.data.payload.headers;
    const subject  = headers.find(h => h.name === 'Subject')?.value || 'Devocional del Día';
    const ageHours = (Date.now() - parseInt(msg.data.internalDate)) / 3600000;

    console.log(`📨 Correo: "${subject}" (antigüedad: ${Math.round(ageHours)}h)`);

    // Extraer cuerpo del correo (preferimos texto plano)
    let body = '';
    const payload = msg.data.payload;

    if (payload.parts) {
        const plain = payload.parts.find(p => p.mimeType === 'text/plain');
        const html  = payload.parts.find(p => p.mimeType === 'text/html');
        const part  = plain || html || payload.parts[0];
        if (part?.body?.data) {
            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
    } else if (payload.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    if (!body) throw new Error('No se pudo extraer el cuerpo del correo.');
    console.log(`✅ [GMAIL] Contenido extraído (${body.length} caracteres).`);

    return { subject, body, ageHours };
}

// ─────────────────────────────────────────────────────────────────────────────
// PASO 2: Procesar con IA — extraer los 5 campos que espera la radio
// ─────────────────────────────────────────────────────────────────────────────
async function procesarConIA(subject, body) {
    console.log('\n🧠 [IA] Extrayendo campos del devocional para la radio...');

    const systemPrompt = `Eres el motor ministerial de MusiChris Studio Radio.
Recibes el contenido de un correo devocional diario del ministerio VNPEM y debes extraer exactamente 5 campos para mostrarlos en la sección "Pan de Vida Diario" de la radio.

RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO. SIN MARKDOWN, SIN EXPLICACIONES, SIN TEXTO ADICIONAL.
ASEGÚRATE DE QUE TODAS LAS CLAVES Y VALORES ESTÉN ENTRE COMILLAS DOBLES Y DE ESCAPAR COMILLAS INTERNAS.
NO INCLUYAS SALTOS DE LÍNEA LITERALES DENTRO DE LOS TEXTOS, USA ESPACIOS.

{
  "titulo": "Título inspirador y breve del devocional (máximo 60 caracteres)",
  "promesa_cita": "Referencia bíblica exacta (ej: Juan 3:16 o Salmo 23:1-2)",
  "promesa_texto": "El versículo o texto bíblico completo que aparece en el correo",
  "revelacion_rhema": "Reflexión espiritual profunda basada en el correo (máximo 300 caracteres, tono ministerial cálido)",
  "accion_diaria": "Una acción concreta y espiritual que el oyente puede hacer HOY (máximo 180 caracteres)"
}

REGLAS CRÍTICAS:
- Extrae la información DIRECTAMENTE del contenido del correo. Nunca inventes datos.
- Si hay un versículo explícito en el correo, cópialo exactamente en promesa_texto.
- Si hay reflexión explícita, resúmela manteniendo la esencia espiritual.
- La acción diaria debe ser práctica, alcanzable y espiritual.
- Todo en español ministerial, cálido y directo.
- NO incluyas el nombre "VNPEM" ni menciones que es un correo.`;

    const userPrompt = `ASUNTO DEL CORREO: ${subject}\n\nCONTENIDO:\n${body.substring(0, 3000)}`;

    const apis = [
        {
            name: 'CEREBRAS',
            key: process.env.CEREBRAS_API_KEY,
            url: 'https://api.cerebras.ai/v1/chat/completions',
            model: 'llama3.1-8b'
        },
        {
            name: 'DEEPINFRA',
            key: process.env.DEEPINFRA_API_KEY,
            url: 'https://api.deepinfra.com/v1/openai/chat/completions',
            model: 'meta-llama/Meta-Llama-3.1-8B-Instruct'
        },
        {
            name: 'DEEPSEEK',
            key: process.env.DEEPSEEK_API_KEY,
            url: 'https://api.deepseek.com/v1/chat/completions',
            model: 'deepseek-chat'
        }
    ];

    let devocional = null;

    for (const api of apis) {
        if (!api.key || devocional) continue;
        try {
            console.log(`🔄 [IA] Intentando con ${api.name}...`);
            const res = await fetch(api.url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${api.key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: api.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user',   content: userPrompt   }
                    ],
                    temperature: 0.3
                })
            });
            const data = await res.json();
            const rawContent = data.choices?.[0]?.message?.content;
            
            if (rawContent) {
                // Limpiar y parsear JSON dentro del try-catch para que si falla, pase a la siguiente IA
                let clean = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
                const start = clean.indexOf('{');
                const end   = clean.lastIndexOf('}');
                
                if (start === -1 || end === -1) {
                    throw new Error(`No se encontró un bloque JSON válido. Respuesta parcial: "${clean.substring(0, 50)}..."`);
                }
                
                let jsonString = clean.substring(start, end + 1);
                // Limpieza agresiva de JSON para errores comunes de LLMs
                jsonString = jsonString.replace(/[\n\r\t]/g, ' '); // Eliminar saltos de línea literales
                jsonString = jsonString.replace(/,\s*}/g, '}'); // Eliminar comas al final
                jsonString = jsonString.replace(/,\s*\]/g, ']'); // Eliminar comas en arrays (por si acaso)
                
                let parsed;
                try {
                    parsed = JSON.parse(jsonString);
                } catch (parseError) {
                    console.error(`[DEBUG IA] JSON Inválido: ${jsonString}`);
                    throw new Error(`JSON.parse falló: ${parseError.message}`);
                }
                
                // Validar campos requeridos
                const required = ['titulo', 'promesa_cita', 'promesa_texto', 'revelacion_rhema', 'accion_diaria'];
                const missing  = required.filter(k => !parsed[k]);
                
                if (missing.length > 0) {
                    throw new Error(`Faltan campos requeridos: ${missing.join(', ')}`);
                }

                devocional = parsed;
                console.log(`✅ [IA] Respuesta válida de ${api.name}.`);
                break;
            } else {
                throw new Error(`La API no devolvió contenido válido. Respuesta cruda: ${JSON.stringify(data)}`);
            }
        } catch (e) {
            console.warn(`⚠️ [IA] ${api.name} falló: ${e.message}`);
        }
    }

    if (!devocional) {
        throw new Error('Ningún proveedor de IA logró generar un JSON válido. Revisa los logs.');
    }

    // Agregar la fecha del día en formato español largo
    devocional.fecha = getFechaEspanol();

    console.log(`✅ [IA] Devocional estructurado: "${devocional.titulo}" — ${devocional.promesa_cita}`);
    return devocional;
}

// ─────────────────────────────────────────────────────────────────────────────
// PASO 3: Autenticar en Firebase y actualizar /daily_devotional
// ─────────────────────────────────────────────────────────────────────────────
async function escribirEnFirebase(devocional) {
    console.log('\n🔥 [FIREBASE] Autenticando...');

    const adminEmail    = process.env.FIREBASE_ADMIN_EMAIL;
    const adminPassword = process.env.FIREBASE_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        throw new Error('Faltan secretos FIREBASE_ADMIN_EMAIL o FIREBASE_ADMIN_PASSWORD en GitHub.');
    }

    // 1. Obtener ID Token mediante email/contraseña del admin
    const authRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: adminEmail,
                password: adminPassword,
                returnSecureToken: true
            })
        }
    );

    const authData = await authRes.json();
    if (!authData.idToken) {
        throw new Error(`Fallo de autenticación Firebase: ${JSON.stringify(authData.error || authData)}`);
    }
    console.log('✅ [FIREBASE] Autenticado como admin.');

    // 2. Escribir en /daily_devotional.json (PUT sobrescribe el nodo completo)
    const dbRes = await fetch(
        `${FIREBASE_DB_URL}/daily_devotional.json?auth=${authData.idToken}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(devocional)
        }
    );

    if (!dbRes.ok) {
        const errData = await dbRes.json();
        throw new Error(`Error al escribir en Firebase: ${JSON.stringify(errData)}`);
    }

    console.log(`🙌 [FIREBASE] ¡Pan de Vida publicado para el ${devocional.fecha}!`);
    console.log(`   📖 Título: "${devocional.titulo}"`);
    console.log(`   ✝️  Cita:   ${devocional.promesa_cita}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  🍞  PAN DE VIDA DIARIO — MusiChris Studio Radio         ║');
    console.log(`║  📅  ${getFechaEspanol().padEnd(52)}║`);
    console.log('╚══════════════════════════════════════════════════════════╝');

    try {
        const { subject, body } = await leerGmail();
        const devocional        = await procesarConIA(subject, body);
        await escribirEnFirebase(devocional);

        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║  ✅  MISIÓN CUMPLIDA — El Pan está en la mesa.           ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');
    } catch (err) {
        console.error(`\n❌  ERROR CRÍTICO: ${err.message}\n`);
        process.exit(1);
    }
}

main();
