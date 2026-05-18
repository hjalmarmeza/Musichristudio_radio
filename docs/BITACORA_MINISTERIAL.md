# 🕊️ Buscador de Servidor Oracle (Cazador Ministerial) 🛡️

## 🎯 Objetivo del Proyecto
Capturar de forma automatizada un servidor de **Alto Rendimiento (ARM Ampere)** en la región de Oracle Cloud **Santiago (Chile)** para alojar una estación de radio cristiana profesional de 24/7.

**Especificaciones del Objetivo:**
- **Tipo de Instancia:** `VM.Standard.A1.Flex` (Siempre Gratis / Always Free).
- **Recursos:** 4 OCPUs (Procesadores) y 24 GB de Memoria RAM.
- **Fin:** Alojar la infraestructura de **MusiChris Studio Radio**, garantizando potencia suficiente para streaming de audio de alta calidad y procesos de automatización sin costo.

---

## 🛰️ Estado Actual de la Misión
- **Estado:** 🎉 **CAPTURADO CON ÉXITO, PREPARADO Y OPERANDO** (Misión Cumplida)
- **Servidor ARM Capturado:** `161.153.197.23` (MusiChris-Radio-UHD)
- **Especificaciones Reales:** 4 OCPUs ARM Ampere, 24 GB de RAM, 45 GB de Almacenamiento SSD.
- **Preparación de Software:** 🟢 **Docker, Docker Compose, Firewall UFW y AzuraCast instalados y activos**.
- **Llave de Acceso Local:** `~/.ssh/id_rsa` (Verificada con éxito).
- **Comando de Conexión Rápido:**
  ```bash
  ssh -i "~/.ssh/id_rsa" ubuntu@161.153.197.23
  ```

---

## 📡 Hitos de Despliegue de la Radio (MusiChris Studio Radio)

### 1. Configuración de AzuraCast completada:
- **Streamers/DJs:** Grabación automática activada (formato MP3 de 192kbps alta fidelidad, con bajo impacto de almacenamiento ~86MB por hora), buffer de reconexión de 5 segundos.
- **Límites de Tráfico:** Slots y ancho de banda ilimitados (`0`).
- **Web Proxy para Radio:** Activado para enrutar transmisiones a través de puertos estándar HTTP (80/443), saltándose firewalls de oficinas, escuelas y universidades.
- **CORS Global:** Permitido para todos los orígenes (`*`), asegurando que el reproductor web pueda consultar el API sin restricciones.

### 2. Descarga Ultra-Rápida del Catálogo de Alabanzas (Cloudinary):
- Se escribió un script de descarga multiproceso concurrente en Python (`download_songs.py`) que procesó los listados y descargó los **170 audios ministeriales** de Cloudinary directo en la máquina ARM en Santiago de Chile.
- **Velocidad de Descarga:** ¡Completado en **16.51 segundos** a través del canal Oracle Cloud (100% de descargas exitosas, 0 fallos)!
- **Organización:** Las canciones se crearon y ordenaron automáticamente en **17 carpetas de Álbumes** distintas para una estructura de medios premium:
  - `A SUS PIES`
  - `CAMINOS DE LUZ`
  - `CUMBRE DE MAJESTAD`
  - `HERENCIA DE PAZ`
  - `INSPIRACIÓN`
  - `POR SUS LLAGAS`
  - `REFUGIO`
  - `REGRESO A TI`
  - `RESONANCIAS`
  - `ROCA Y ESCUDO`
  - `ROMPIENDO CADENAS`
  - `SANTUARIO`
  - `SENDAS`
  - `UN NACIMIENTO ESPERADO`
  - `VIENTOS NUEVOS`
  - `VISIONES DE GLORIA`
  - `VUELO DE VICTORIA`
- **Permisos de Docker:** Se aplicó recursivamente propiedad `1000:1000` (opc:opc) para garantizar lectura y escritura total en los contenedores de AzuraCast.

### 3. Integración en el Reproductor Web Premium:
- **Audio Stream Directo:** Enrutado a `http://161.153.197.23/listen/musichris_studio_radio/radio.mp3` aprovechando el Proxy Web integrado.
- **Metadatos en Tiempo Real:** Activación de API Now Playing en `app.js` apuntando a `http://161.153.197.23/api/nowplaying/musichris_studio_radio`. Muestra la carátula oficial, artista y título de la canción en tiempo real con refresco cada 15 segundos.

### 4. Empuje a GitHub Exitoso:
- Inicializado Git en `web_player` y enlazado a:
  ```
  https://github.com/hjalmarmeza/Musichristudio_radio.git
  ```
- Subido el código completo, estilos premium, fuentes locales precargadas, imágenes e integración a la rama principal `main` de manera inmediata y limpia.

### 5. Configuración del Bloque "Instrumental de Paz" (3:00-5:00 AM y 7:00-10:00 AM):
- **Directorio del Servidor:** Creado `/media/INSTRUMENTAL DE PAZ` con permisos `1000:1000` (opc:opc) en el volumen persistente de Docker.
- **Base de Datos (MariaDB):** Insertada la playlist `Instrumental de Paz` (ID 2) tipo estándar con orden aleatorio (`Shuffled`) y reproducción continua.
- **Vinculación de Carpeta:** Mapeada la carpeta `INSTRUMENTAL DE PAZ` a la playlist ID 2.
- **Programación Horaria:** Insertados dos schedules exclusivos: madrugada (`180-300` mins) y mañana (`420-600` mins).
- **Despliegue Live:** Reiniciada la emisora AzuraCast en el contenedor Docker para aplicar y compilar el Liquidsoap config. La playlist ya está 100% activa.

### 6. Rotación 3D del Planeta Tierra (Sección Misión y Visión) [Completado]:
- **Imagen de Satélite Ultra-Realista:** Se generó y recortó un mapa equirectangular satelital de la Tierra en colores reales y 100% geográficamente preciso (`world_map_seamless_color.png`). Muestra la vegetación, océanos y nubes reales.
- **Atmósfera y Sombreado 3D:** Implementada una máscara circular (`border-radius: 50%`) y capas CSS para simular la cara oculta del planeta con gradientes de luz solar y un halo azul celeste atmosférico (`rgba(0, 242, 254, 0.45)`).
- **Aceleración por GPU:** Animación infinita mediante `transform: translateX` que fluye sin tirones a 60 FPS.

---

## 🔑 Datos Técnicos y Credenciales
*(Copiados aquí para referencia inmediata en futuras sesiones)*

- **Región:** `sa-santiago-1`
- **Tenancy OCID:** `ocid1.tenancy.oc1..aaaaaaaacu26qeeudnyadm4efup4twkzruzxbgfc44nheh7hs65xf3op2gma`
- **User OCID:** `ocid1.user.oc1..aaaaaaaalmmskj77acbizcbvvfmbabixvrd6hkts5dded7bnxf4wlgvcacka`
- **Fingerprint API:** `1f:8c:f4:49:38:b1:8b:95:f2:67:a4:08:6a:47:12:61`
- **VCN (Red):** `ocid1.vcn.oc1.sa-santiago-1.amaaaaaam7ktwziapg2x5fowoetui65bv24cg3k3t5e2sisuykhgzfgpwz7q`
- **Subnet:** `ocid1.subnet.oc1.sa-santiago-1.aaaaaaaaukrb53mpscb5j3zplpzh2jkxmz56a2p6vxsaa23juwhz2hhntllq`
- **Imagen OS:** Ubuntu 22.04 aarch64.

### 📂 Archivos en esta carpeta:
1. `grabber_backup.py`: Copia del script que estuvo cazando en la nube.
2. `oracle_api_key.pem`: La llave privada para conectar con la API de Oracle.
3. `oci_config_backup`: Configuración técnica necesaria para el comando `oci`.
4. [web_player/](file:///Users/hjalmarmeza/Downloads/Antigravity/Buscador_Servidor_Oracle/web_player): Directorio con el sitio del reproductor.

---

## ⚠️ Operaciones y Mantenimiento Seguro
Para evitar apagar accidentalmente este Cazador de Servidores mientras realizas tareas en la **Radio Vertical** (`129.151.108.251`), sigue estas reglas de comandos:

### ❌ Comando Prohibido:
- **NUNCA ejecutes:** `sudo pkill -9 python3` (Matará el script de la radio y también este cazador).

### 🟢 Comandos de Control Seguro:
* **Reiniciar solo la Radio Vertical (Sin apagar el cazador):**
  ```bash
  pkill -f stream_vertical_v4.py
  ```
* **Ver si el cazador está activo en segundo plano:**
  ```bash
  ps aux | grep grabber.py
  ```
* **Monitorear los intentos del cazador en tiempo real:**
  ```bash
  tail -f /home/ubuntu/grabber.log
  ```

---
**Nota para Antigravity:** "Este es un proyecto de alta prioridad para MusiChris Studio. Todo debe mantenerse dentro del tier **Always Free** de Oracle para evitar costos."
