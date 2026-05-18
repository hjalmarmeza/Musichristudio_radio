import os
import json
import urllib.request
import sys
import re

json_path = '/home/ubuntu/musichris_master_catalog.json'
dest_dir = '/home/ubuntu/instrumental_temp'

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

with open(json_path, 'r', encoding='utf-8') as f:
    catalog = json.load(f)

slow_bpm_songs = []
for song in catalog:
    bpm = song.get('bpm')
    if bpm is not None:
        try:
            bpm_val = int(bpm)
            if 50 <= bpm_val <= 70:
                slow_bpm_songs.append(song)
        except ValueError:
            pass

print(f"Found {len(slow_bpm_songs)} slow BPM tracks in the catalog.")

def sanitize_filename(name):
    # Keep only alphanumeric, spaces, underscores, and dashes
    name = re.sub(r'[^\w\s-]', '', name)
    # Replace spaces with underscores
    name = re.sub(r'\s+', '_', name)
    return name.strip('_')

success_count = 0
fail_count = 0

for i, song in enumerate(slow_bpm_songs):
    title = song.get('title', f'Song_{i+1}')
    audio_url = song.get('audio_url')
    if not audio_url:
        print(f"[{i+1}/{len(slow_bpm_songs)}] Skipping '{title}' - No audio URL")
        continue

    sanitized_title = sanitize_filename(title)
    filename = f"{sanitized_title}.mp3"
    filepath = os.path.join(dest_dir, filename)

    if os.path.exists(filepath):
        print(f"[{i+1}/{len(slow_bpm_songs)}] '{filename}' already exists, skipping download.")
        success_count += 1
        continue

    print(f"[{i+1}/{len(slow_bpm_songs)}] Downloading '{title}' from {audio_url}...")
    try:
        urllib.request.urlretrieve(audio_url, filepath)
        print(f"[{i+1}/{len(slow_bpm_songs)}] Successfully downloaded '{filename}'")
        success_count += 1
    except Exception as e:
        print(f"[{i+1}/{len(slow_bpm_songs)}] Error downloading '{title}': {e}")
        fail_count += 1

print(f"\nDownload finished: {success_count} succeeded, {fail_count} failed.")
