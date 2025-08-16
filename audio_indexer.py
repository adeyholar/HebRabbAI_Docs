import os
import json
import re
from loguru import logger

audio_root = r'D:\audio\tankh_audio_chp'
audio_map = {}

def extract_chapter(filename):
    match = re.search(r'_(\d+)', filename)
    return match.group(1) if match else '1'
    logger.debug(f"Extracted chapter from {filename}: {match.group(1) if match else '1'}")

try:
    for book_dir in os.listdir(audio_root):
        dir_path = os.path.join(audio_root, book_dir)
        if os.path.isdir(dir_path) and book_dir.startswith(tuple(str(i).zfill(2) for i in range(1, 41))):
            book_name = book_dir.split('_')[-1] if '_' in book_dir else book_dir
            audio_map[book_name] = {}
            mp3_files = [f for f in os.listdir(dir_path) if f.endswith('.mp3')]
            if len(mp3_files) == 1:
                audio_map[book_name]['1'] = os.path.join(dir_path, mp3_files[0])
                logger.info(f"Single-chapter book detected: {book_name}")
            else:
                for file in mp3_files:
                    chapter = extract_chapter(file)
                    audio_map[book_name][chapter] = os.path.join(dir_path, file)
    with open('audio_map.json', 'w', encoding='utf-8') as f:
        json.dump(audio_map, f, ensure_ascii=False, indent=4)
    logger.success("Audio map created: audio_map.json")
except Exception as e:
    logger.error(f"Error during indexing: {e}")

print("Audio map created: audio_map.json with variable format handling")