# Electrical Expert NLP Service

A small FastAPI service that extracts symptom IDs from user text and returns diagnosis metadata for an electrical expert system.

## What this service does

This service sits between the frontend and your Bayesian expert system.

It has two main jobs:

1. **NLP extraction**: read a user sentence and detect matching symptoms.
2. **Diagnosis enrichment**: return explanation and solution steps for a diagnosis ID.

The Bayesian confidence calculation is still handled by your existing JavaScript knowledge base.

---

## Project Structure

```text
nlp_service/
├── app/
│   ├── main.py
│   ├── models.py
│   ├── services/
│   │   ├── symptom_extractor.py
│   │   └── diagnosis_service.py
│   └── data/
│       ├── symptoms.json
│       └── diagnoses.json
├── requirements.txt
└── README.md
```

---

## Requirements

- Python 3.10+
- FastAPI
- Uvicorn

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Run the Service

From the project root:

```bash
uvicorn app.main:app --reload
```

The server will usually run at:

```text
http://127.0.0.1:8000
```

Interactive API docs are available at:

```text
http://127.0.0.1:8000/docs
```

---

## API Overview

This service exposes two main endpoints:

### 1) `POST /analyze`

Extract symptom matches from a user sentence.

#### Request body

```json
{
  "text": "Stop kontak saya panas dan ada bau hangus."
}
```

#### Response body

```json
{
  "normalized_text": "stop kontak saya panas dan ada bau hangus.",
  "symptoms": [
    {
      "id": "S02",
      "text": "Stop kontak/saklar panas",
      "score": 0.95
    },
    {
      "id": "S03",
      "text": "Peralatan listrik tercium bau hangus",
      "score": 0.95
    }
  ]
}
```

### 2) `POST /diagnosis`

Attach diagnosis details such as explanation and solution steps using a diagnosis ID.

#### Request body

```json
{
  "diagnosis_id": "H2",
  "confidence": 82.4
}
```

#### Response body

```json
{
  "diagnosis_id": "H2",
  "confidence": 82.4,
  "name": "Korsleting",
  "severity": "high",
  "explanation": "Terjadi hubungan pendek antar penghantar listrik.",
  "solutions": [
    "Matikan listrik utama.",
    "Cabut semua perangkat.",
    "Periksa kabel yang rusak.",
    "Hubungi teknisi listrik."
  ]
}
```

---

## Frontend API Flow

This is the recommended flow for the frontend team.

### Step 1: Send the user's sentence to the NLP service

The frontend receives free-form text from the user and sends it to `POST /analyze`.

#### Example

```js
const response = await fetch("http://127.0.0.1:8000/analyze", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    text: userInput
  })
});

const analysis = await response.json();
```

### Step 2: Extract symptom IDs from the NLP response

Use the returned symptom list to get the IDs.

```js
const symptomIds = analysis.symptoms.map((item) => item.id);
```

Example result:

```js
["S02", "S03"]
```

### Step 3: Send symptom IDs to the Bayesian engine

Your existing JavaScript knowledge base uses the symptom IDs to calculate diagnosis confidence.

```js
const bayesResults = calculateBayesianDiagnosis(symptomIds);
const topDiagnosis = bayesResults[0];
```

Example result:

```js
{
  id: "H2",
  name: "Korsleting",
  percentage: "82.40"
}
```

### Step 4: Request diagnosis explanation and solution steps

Use the diagnosis ID and confidence from the Bayesian output, then call `POST /diagnosis`.

```js
const diagnosisResponse = await fetch("http://127.0.0.1:8000/diagnosis", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    diagnosis_id: topDiagnosis.id,
    confidence: Number(topDiagnosis.percentage)
  })
});

const diagnosisDetails = await diagnosisResponse.json();
```

### Step 5: Show the final result on the frontend

Display:

- detected symptoms
- diagnosis name
- confidence value
- explanation
- solution steps

Example UI data:

```js
{
  diagnosis: "Korsleting",
  confidence: 82.4,
  explanation: "Terjadi hubungan pendek antar penghantar listrik.",
  solutions: [
    "Matikan listrik utama.",
    "Cabut semua perangkat.",
    "Periksa kabel yang rusak.",
    "Hubungi teknisi listrik."
  ]
}
```

---

## Suggested Frontend Data Flow

```text
User Input
   ↓
POST /analyze
   ↓
Return symptom IDs
   ↓
JavaScript Bayes function
   ↓
Return diagnosis confidence
   ↓
POST /diagnosis
   ↓
Return explanation + solutions
   ↓
Render result in UI
```

---

## Example Full Frontend Pseudocode

```js
async function diagnoseProblem(userInput) {
  // 1. NLP extraction
  const analysisRes = await fetch("http://127.0.0.1:8000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: userInput })
  });

  const analysis = await analysisRes.json();
  const symptomIds = analysis.symptoms.map((s) => s.id);

  // 2. Bayesian diagnosis
  const bayesResults = calculateBayesianDiagnosis(symptomIds);
  const topDiagnosis = bayesResults[0];

  // 3. Diagnosis enrichment
  const detailRes = await fetch("http://127.0.0.1:8000/diagnosis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      diagnosis_id: topDiagnosis.id,
      confidence: Number(topDiagnosis.percentage)
    })
  });

  const detail = await detailRes.json();

  return {
    symptoms: analysis.symptoms,
    diagnosis: detail
  };
}
```

---

## Notes for Frontend Developers

- `POST /analyze` is for text understanding.
- `POST /diagnosis` is for diagnosis metadata.
- The Python service does **not** calculate Bayes confidence.
- The JavaScript knowledge base remains the source of truth for confidence scoring.
- The diagnosis solution text should come from `diagnoses.json`.

---

## Expanding the Service

Later, you can replace the keyword matching logic with:

- spaCy
- sentence embeddings
- IndoBERT
- other NLP models

The frontend request format can stay the same even if the NLP engine changes.

---

## Example JSON Files

### symptoms.json

Each symptom should have:

- `id`
- `text`
- `keywords`

### diagnoses.json

Each diagnosis should have:

- `name`
- `explanation`
- `severity`
- `solutions`

---

## Common Troubleshooting

### 404 on API requests

Check that the service is running on the correct host and port.

### Empty symptom matches

Make sure the symptom keywords in `symptoms.json` match the user wording closely enough.

### CORS errors

If your frontend runs on a different port, enable CORS in FastAPI.

---

## Optional Next Step: Enable CORS

If needed, add CORS support in `main.py` so your frontend can call the service from another origin.

---

## License

Use freely for learning and experimentation.
