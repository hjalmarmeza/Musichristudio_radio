#!/bin/bash
# 🎙️ Script de Reinicio Seguro - MusiChris Studio
# Este script reinicia la radio vertical de forma segura sin apagar el script cazador de servidores.

echo "🔄 Reiniciando la Radio Vertical de forma segura..."

# 1. Apagar únicamente el proceso del script de transmisión
pkill -f stream_vertical_v4.py

# 2. Apagar únicamente los procesos de ffmpeg asociados
sudo pkill -9 ffmpeg

echo "✅ Transmisión detenida temporalmente."
echo "🔄 El script 'stream_vertical_v4.py' se autoreiniciará en 10 segundos con el nuevo catálogo."
echo "ℹ️  Cazador de Servidores Oracle sigue activo buscando 24/7. 🏹✨"
