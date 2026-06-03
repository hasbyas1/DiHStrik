import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"

with open(DATA_DIR / "diagnoses.json", encoding="utf-8") as f:
    DIAGNOSES = json.load(f)

def get_diagnosis_info(diagnosis_id: str):

    return DIAGNOSES.get(diagnosis_id)