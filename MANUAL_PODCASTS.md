# Manual de Operaciones: Subida de Nuevos Podcasts

> [!NOTE]
> Este manual contiene las reglas de oro y el procedimiento estándar para añadir nuevas series de podcasts a MusiChris Studio Radio, garantizando que la plataforma se mantenga rápida, organizada y libre de errores.

## 1. Preparación y Optimización de Archivos

Antes de subir nada a la nube, los archivos deben estar estrictamente preparados.

### 🎧 Los Audios (MP3)
- Deben estar en formato `.mp3` estándar.
- Mantener nombres de archivo limpios. Evitar caracteres especiales extraños si es posible, aunque el sistema soporta URLs codificadas (ej. `1. El Desierto.mp3`).

### 🖼️ La Portada de la Serie (VITAL)
> [!CAUTION]
> NUNCA subas imágenes crudas de alta resolución generadas por IA (ej. PNGs de 3-5 MB). Esto saturará la aplicación móvil y consumirá excesivos datos.

- **Formato:** `.jpg` o `.webp` (No usar PNG a menos que requiera transparencia).
- **Resolución:** Recomendado **500x500 píxeles** (Totalmente cuadrado).
- **Peso:** El archivo final **NO debe pesar más de 100 KB** (idealmente alrededor de 50 KB).

---

## 2. Subida a Oracle Cloud Storage

Todo archivo multimedia debe alojarse en Oracle, nunca en GitHub.

1. Ingresa a tu panel de Oracle Cloud o utiliza la consola (CLI).
2. Entra al bucket `parabolas-bucket`.
3. Navega a la ruta principal: `podcasts/`
4. **Crea una nueva subcarpeta** con el nombre exacto de la serie (Ej. `podcasts/Los Viajes de Pablo/`).
5. Sube todos los `.mp3` y la portada optimizada `.jpg` dentro de esa carpeta.

---

## 3. Actualización de la Base de Datos (`app.js`)

Una vez que los archivos están en Oracle, debemos enseñarle al reproductor web dónde encontrarlos.

1. Abre el archivo `web_player/app.js` en el repositorio.
2. Localiza la sección superior donde dice `const PODCAST_DB = [ ... ];`.
3. Añade un nuevo bloque de serie al inicio o al final de la lista copiando esta estructura exacta:

```javascript
{
    id: "identificador-unico", // Sin espacios ni mayúsculas
    title: "Nombre Oficial de la Serie",
    date: "Serie Completa",
    cover: "https://objectstorage.sa-santiago-1.oraclecloud.com/n/TU_TENANT/b/parabolas-bucket/o/podcasts/Nombre_Carpeta/portada.jpg",
    episodes: [
        { 
            title: "1. Título del Episodio", 
            file: "https://objectstorage.sa-santiago-1.oraclecloud.com/.../1.mp3" 
        },
        { 
            title: "2. Título del Segundo Episodio", 
            file: "https://objectstorage.sa-santiago-1.oraclecloud.com/.../2.mp3" 
        }
        // ... añadir tantos episodios como existan
    ]
}
```

> [!IMPORTANT]
> - Asegúrate de que las URLs comiencen exactamente con `https://` y no tengan espacios rotos (los espacios en la URL deben verse como `%20`).
> - Cada bloque de serie debe estar separado por una coma `,`.

---

## 4. Despliegue en GitHub Pages

1. Guarda los cambios en `app.js`.
2. Realiza el *Commit* y *Push* hacia GitHub:
   ```bash
   git add app.js
   git commit -m "feat: Añadir nueva serie de podcast X"
   git push
   ```
3. Espera a que el círculo amarillo en GitHub cambie a un **check verde ✅** (normalmente toma de 1 a 3 minutos).
4. Ingresa a la web desde tu celular, fuerza una recarga (borrar caché) y verifica que la nueva serie aparezca y reproduzca correctamente.
