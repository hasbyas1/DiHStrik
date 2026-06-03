import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"

with open(DATA_DIR / "symptoms.json", encoding="utf-8") as f:
    SYMPTOMS = json.load(f)

def extract_symptoms(text: str):

    text = text.lower()

    matches = []

    for symptom in SYMPTOMS:

        best_score = 0

        for keyword in symptom["keywords"]:

            if keyword.lower() in text:

                score = 0.95

                if len(keyword.split()) == 1:
                    score = 0.80

                best_score = max(best_score, score)

        if best_score > 0:

            matches.append({
                "id": symptom["id"],
                "text": symptom["text"],
                "score": best_score
            })

    return matches