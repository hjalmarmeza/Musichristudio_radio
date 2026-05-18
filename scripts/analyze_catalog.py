import json

catalog_path = '/Users/hjalmarmeza/Downloads/Antigravity/PROYECTOS_FINALIZADOS/Musichris_Atmos/data/musichris_master_catalog.json'

with open(catalog_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total songs in catalog: {len(data)}")

slow_bpm_songs = []
for song in data:
    bpm = song.get('bpm')
    if bpm is not None:
        try:
            bpm_val = int(bpm)
            if 50 <= bpm_val <= 70:
                slow_bpm_songs.append(song)
        except ValueError:
            pass

print(f"Total slow-BPM (50-70) songs: {len(slow_bpm_songs)}")
for i, song in enumerate(slow_bpm_songs):
    focus_val = song.get('focus') or ""
    print(f"{i+1}. Title: {song.get('title')} | BPM: {song.get('bpm')} | Focus: {focus_val[:60]}... | URL: {song.get('audio_url')}")
