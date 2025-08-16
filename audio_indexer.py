import os
import json
import re
from loguru import logger

# Configure logger with file rotation for scalability
logger.add("audio_indexing.log", rotation="10 MB", level="DEBUG")

audio_root = r'D:\audio\tankh_audio_chp'
audio_map = {}

def extract_chapter(filename):
    """Extract chapter number with leading zeros; default to '1' for single-chapter."""
    match = re.search(r'_(\d+)', filename)
    if match:
        return match.group(1)  # Preserve leading zeros, e.g., '01'
    logger.warning(f"No chapter number found in {filename}; defaulting to '1'")
    return '1'

try:
    logger.info("Starting audio directory indexing")
    for book_dir in os.listdir(audio_root):
        dir_path = os.path.join(audio_root, book_dir)
        if os.path.isdir(dir_path) and book_dir.startswith(tuple(str(i).zfill(2) for i in range(1, 41))):
            book_name = book_dir.split('_')[-1] if '_' in book_dir else book_dir
            audio_map[book_name] = {}
            mp3_files = [f for f in os.listdir(dir_path) if f.endswith('.mp3')]
            logger.debug(f"Processing book: {book_name}, found {len(mp3_files)} MP3 files")
            if len(mp3_files) == 1:  # Single-chapter book
                chapter = extract_chapter(mp3_files[0])
                audio_map[book_name][chapter] = os.path.join(dir_path, mp3_files[0])
                logger.info(f"Single-chapter book detected: {book_name}, assigned to chapter {chapter}")
            else:  # Multi-chapter or special (e.g., Aramaic)
                for file in mp3_files:
                    chapter = extract_chapter(file)
                    audio_map[book_name][chapter] = os.path.join(dir_path, file)
                    logger.debug(f"Added chapter {chapter} for {book_name}: {file}")
    with open('audio_map.json', 'w', encoding='utf-8') as f:
        json.dump(audio_map, f, ensure_ascii=False, indent=4)
    logger.success("Audio map created: audio_map.json")
except Exception as e:
    logger.error(f"Indexing failed: {str(e)}")
    raise

def validate_audio_map(audio_map, tanakh_json_path=r'D:\AI\Projects\HEBREW-TRAINING-AI-AGENT\TANACH\book\hebrew_bible_with_nikkud.json'):
    logger.info("Validating audio_map.json")
    try:
        with open(tanakh_json_path, 'r', encoding='utf-8') as f:
            tanakh = json.load(f)
        
        # Mapping from audio directory names to JSON abbreviations
        book_mapping = {
            "Genesis": "Gen", "Exodus": "Exod", "Leviticus": "Lev", "Numbers": "Num",
            "Deuteronomy": "Deut", "Joshua": "Josh", "Judges": "Judg", "1Samuel": "1Sam",
            "2Samuel": "2Sam", "1Kings": "1Kgs", "2Kings": "2Kgs", "Isaiah": "Isa",
            "Jeremiah": "Jer", "Ezekiel": "Ezek", "Hosea": "Hos", "Joel": "Joel",
            "Amos": "Amos", "Obadiah": "Obad", "Jonah": "Jonah", "Micah": "Mic",
            "Nahum": "Nah", "Habakkuk": "Hab", "Zephaniah": "Zeph", "Haggai": "Hag",
            "Zechariah": "Zech", "Malachi": "Mal", "Psalms": "Ps", "Job": "Job",
            "Proverbs": "Prov", "Ruth": "Ruth", "SongofSongs": "Song", "Ecclesiastes": "Eccl",
            "Lamentations": "Lam", "Esther": "Esth", "Daniel": "Dan", "Ezra": "Ezra",
            "Nehemiah": "Neh", "1Chronicles": "1Chr", "2Chronicles": "2Chr",
            "Aramaic": "Aramaic"  # Placeholder; adjust if JSON includes Aramaic sections
        }

        for book_name, chapters in audio_map.items():
            json_key = book_mapping.get(book_name, book_name)  # Use mapped name or original if not found
            if json_key in tanakh:
                expected_chapters = len(tanakh[json_key])  # e.g., 50 for 'Gen'
                actual_chapters = len(chapters)
                if actual_chapters != expected_chapters:
                    logger.warning(f"Mismatch in {book_name}: Expected {expected_chapters} chapters, found {actual_chapters}")
                # Sort chapters numerically
                sorted_chapters = dict(sorted(chapters.items(), key=lambda x: int(x[0])))
                audio_map[book_name] = sorted_chapters
                logger.debug(f"Sorted chapters for {book_name}")
            else:
                logger.warning(f"Book {book_name} not found in Tanakh JSON under key {json_key}")

        # Rewrite sorted map
        with open('audio_map.json', 'w', encoding='utf-8') as f:
            json.dump(audio_map, f, ensure_ascii=False, indent=4)
        logger.success("Validation complete; audio_map.json updated with sorted chapters")
    except FileNotFoundError as e:
        logger.error(f"Validation failed: {str(e)}. Ensure tanakh_json_path is correct.")
    except Exception as e:
        logger.error(f"Validation error: {str(e)}")

# Call after indexing
validate_audio_map(audio_map)

print("Audio map created: audio_map.json with variable format handling")