import os
import subprocess
import json
import urllib.request
import urllib.parse
from pathlib import Path

# Configuración
BASE_DIR = Path("/Users/hjalmarmeza/Downloads/Antigravity/Buscador_Servidor_Oracle")
VIDEO_DIR = BASE_DIR / "web_player" / "Parábolas e historias" # La ruta base donde buscar
OCI_CONFIG = BASE_DIR / "oci_config_backup"
BUCKET_NAME = "parabolas-bucket" # Bucket recién creado
NAMESPACE = "ax8w1zohqlyt" # namespace usado en otros scripts, ajusta si es necesario.
FIREBASE_URL = "https://proyecto-musichris-350df-default-rtdb.us-central1.firebasedatabase.app/parables.json?key=AIzaSyDns9TUBRrrwIyyuVAizHmWsv9C3iX4neU"

# Aseguramos que busque en el subdirectorio de Parábolas o recursivo
if not VIDEO_DIR.exists():
    # Intenta con caracteres combinados si falla la ruta literal
    VIDEO_DIR = BASE_DIR / "web_player" / "Parábolas e historias"

def get_namespace():
    try:
        res = subprocess.run(["oci", "os", "ns", "get", "--config-file", str(OCI_CONFIG)], capture_output=True, text=True, check=True)
        data = json.loads(res.stdout)
        return data["data"]
    except Exception as e:
        print(f"Error obteniendo namespace, usando default: {e}")
        return NAMESPACE

def extract_thumbnail(video_path, thumb_path):
    cmd = [
        "ffmpeg", "-y", "-i", str(video_path),
        "-vframes", "1", "-q:v", "2", str(thumb_path)
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return thumb_path.exists()

def upload_to_oracle(file_path, object_name):
    print(f"Subiendo {object_name} a Oracle Object Storage...")
    cmd = [
        "oci", "os", "object", "put",
        "--bucket-name", BUCKET_NAME,
        "--name", object_name,
        "--file", str(file_path),
        "--config-file", str(OCI_CONFIG),
        "--force"
    ]
    
    # Agregar content-type
    if object_name.endswith('.mp4'):
        cmd.extend(["--content-type", "video/mp4"])
    elif object_name.endswith('.mov'):
        cmd.extend(["--content-type", "video/quicktime"])
    elif object_name.endswith('.jpg'):
        cmd.extend(["--content-type", "image/jpeg"])

    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"✅ {object_name} subido exitosamente.")
        return True
    else:
        print(f"❌ Error al subir {object_name}: {res.stderr}")
        return False

def get_public_url(namespace, object_name):
    # La estructura de URL pública de Oracle
    # https://objectstorage.<region>.oraclecloud.com/n/<namespace>/b/<bucket>/o/<object_name>
    # Asumiendo region sa-santiago-1, ajusta si es otra.
    region = "sa-santiago-1"
    encoded_name = urllib.parse.quote(object_name)
    return f"https://objectstorage.{region}.oraclecloud.com/n/{namespace}/b/{BUCKET_NAME}/o/{encoded_name}"

def update_firebase(parables_data):
    req = urllib.request.Request(FIREBASE_URL, method="PUT")
    req.add_header("Content-Type", "application/json")
    data = json.dumps(parables_data).encode("utf-8")
    
    try:
        with urllib.request.urlopen(req, data=data) as response:
            if response.status == 200:
                print("✅ Base de datos de Firebase actualizada con éxito.")
            else:
                print(f"❌ Error al actualizar Firebase: {response.status}")
    except Exception as e:
        print(f"❌ Excepción al actualizar Firebase: {e}")

def main():
    print("Iniciando procesamiento de Parábolas e Historias...")
    namespace = get_namespace()
    print(f"Namespace OCI: {namespace}")

    parables_data = {}
    
    # Process videos (mp4 and mov) recursively
    video_files = list(VIDEO_DIR.rglob("*.mp4")) + list(VIDEO_DIR.rglob("*.mov"))
    if not video_files:
        print(f"No se encontraron videos MP4 o MOV en {VIDEO_DIR}")
        return

    for idx, video_path in enumerate(video_files):
        title = video_path.stem
        thumb_path = video_path.with_suffix('.jpg')
        
        object_name_video = f"parabolas/{video_path.name}"
        object_name_thumb = f"parabolas/{thumb_path.name}"
        
        print(f"\n--- Procesando: {title} ---")
        
        # 1. Extract thumbnail
        if not thumb_path.exists():
            print(f"Extrayendo miniatura...")
            extract_thumbnail(video_path, thumb_path)
            
        # 2. Upload Video
        upload_to_oracle(video_path, object_name_video)
        
        # 3. Upload Thumbnail
        upload_to_oracle(thumb_path, object_name_thumb)
        
        # 4. Add to data dictionary
        parable_id = f"parable_{idx+1}"
        parables_data[parable_id] = {
            "title": title,
            "videoUrl": get_public_url(namespace, object_name_video),
            "thumbnailUrl": get_public_url(namespace, object_name_thumb),
            "timestamp": {".sv": "timestamp"}
        }

    # 5. Update Firebase
    print("\nActualizando catálogo en Firebase...")
    update_firebase(parables_data)
    print("\n¡Proceso completado! 🎉")

if __name__ == "__main__":
    main()
