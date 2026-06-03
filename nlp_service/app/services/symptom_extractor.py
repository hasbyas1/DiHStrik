import json
from pathlib import Path
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from thefuzz import fuzz

DATA_DIR = Path(__file__).parent.parent / "data"

with open(DATA_DIR / "symptoms.json", encoding="utf-8") as f:
    SYMPTOMS = json.load(f)

# Initialize Stemmer
factory = StemmerFactory()
stemmer = factory.create_stemmer()

def extract_symptoms(text: str):

    text = text.lower()
    # Apply stemming to user input
    stemmed_text = stemmer.stem(text)

    matches = []

    for symptom in SYMPTOMS:

        best_score = 0

        for keyword in symptom["keywords"]:

            # Apply stemming to keyword for accurate matching
            stemmed_keyword = stemmer.stem(keyword.lower())

            # Check for exact substring match first
            if stemmed_keyword in stemmed_text:
                score = 0.95
                if len(stemmed_keyword.split()) == 1:
                    score = 0.80
                best_score = max(best_score, score)
            else:
                # Fuzzy matching as fallback
                # partial_ratio is good for checking if a word/phrase is inside a longer sentence
                fuzzy_score = fuzz.partial_ratio(stemmed_keyword, stemmed_text)
                if fuzzy_score >= 80: # Threshold for fuzzy match
                    # Reduce confidence slightly for fuzzy matches compared to exact matches
                    score = 0.85
                    if len(stemmed_keyword.split()) == 1:
                        score = 0.70
                    best_score = max(best_score, score)

        if best_score > 0:

            matches.append({
                "id": symptom["id"],
                "text": symptom["text"],
                "score": best_score
            })

    return matches