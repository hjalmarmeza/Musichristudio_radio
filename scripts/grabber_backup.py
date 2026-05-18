import oci
import time
import requests
import json
import os

# --- Configuración Maestra ---
GREEN_API_ID = "7107620145"
GREEN_API_TOKEN = "095991da2b9e4758981c08a6261a331f1a81f364b4b846e5ad"
TARGET_PHONE = "34634655522"

# --- Parámetros de Oracle (Santiago) ---
AD_NAME = "Scik:SA-SANTIAGO-1-AD-1"
COMPARTMENT_ID = "ocid1.tenancy.oc1..aaaaaaaacu26qeeudnyadm4efup4twkzruzxbgfc44nheh7hs65xf3op2gma"
SUBNET_ID = "ocid1.subnet.oc1.sa-santiago-1.aaaaaaaaukrb53mpscb5j3zplpzh2jkxmz56a2p6vxsaa23juwhz2hhntllq"
IMAGE_ID = "ocid1.image.oc1.sa-santiago-1.aaaaaaaai5ja32pjngtc7qay4zz4cuhusti5wggho3nkkttm2j22z6dx7lya"
SHAPE = "VM.Standard.A1.Flex"
OCPUS = 4.0
MEMORY_GB = 24.0

def send_whatsapp(message):
    url = f"https://api.green-api.com/waInstance{GREEN_API_ID}/sendMessage/{GREEN_API_TOKEN}"
    payload = {"chatId": f"{TARGET_PHONE}@c.us", "message": message}
    try:
        requests.post(url, json=payload, timeout=10)
    except:
        pass

def launch_instance(compute_client, ssh_public_key):
    instance_details = oci.core.models.LaunchInstanceDetails(
        display_name="MusiChris-Radio-UHD",
        compartment_id=COMPARTMENT_ID,
        availability_domain=AD_NAME,
        shape=SHAPE,
        shape_config=oci.core.models.LaunchInstanceShapeConfigDetails(
            ocpus=OCPUS,
            memory_in_gbs=MEMORY_GB
        ),
        source_details=oci.core.models.InstanceSourceViaImageDetails(
            image_id=IMAGE_ID
        ),
        create_vnic_details=oci.core.models.CreateVnicDetails(
            subnet_id=SUBNET_ID,
            assign_public_ip=True
        ),
        metadata={
            "ssh_authorized_keys": ssh_public_key
        }
    )
    
    try:
        response = compute_client.launch_instance(instance_details)
        return response.data
    except oci.exceptions.ServiceError as e:
        if e.status == 500 or "Out of capacity" in e.message:
            return "CAPACITY_LIMIT"
        else:
            print(f"❌ Error OCI: {e.message}")
            return None

def main():
    print("🚀 Iniciando el Cazador de Instancias MusiChris...", flush=True)
    config = oci.config.from_file()
    compute_client = oci.core.ComputeClient(config)
    
    # Intentamos leer la llave SSH si existe, si no avisamos
    ssh_key_path = "/Users/hjalmarmeza/.ssh/id_rsa.pub"
    if not os.path.exists(ssh_key_path):
        print("⚠️ No se encontró llave SSH en ~/.ssh/id_rsa.pub. Usaremos una temporal.", flush=True)
        return

    with open(ssh_key_path, "r") as f:
        ssh_public_key = f.read().strip()

    attempts = 0
    while True:
        attempts += 1
        print(f"📡 Intento #{attempts} | Buscando capacidad en Santiago...", flush=True)
        
        result = launch_instance(compute_client, ssh_public_key)
        
        if isinstance(result, oci.core.models.Instance):
            msg = f"¡VICTORIA! 🚀\nEl servidor ARM de 24GB para MusiChris Radio ha sido capturado.\n\nNombre: {result.display_name}\nID: {result.id}\n\nRevisa tu consola de Oracle ahora mismo. 🕊️✨"
            print(msg, flush=True)
            send_whatsapp(msg)
            break
        elif result == "CAPACITY_LIMIT":
            time.sleep(60)
        else:
            print("⚠️ Error inesperado. Reintentando en 5 minutos...", flush=True)
            time.sleep(300)

if __name__ == "__main__":
    main()
