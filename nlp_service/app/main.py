from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import (
    AnalyzeRequest,
    AnalyzeResponse,
    DiagnosisRequest
)

from app.services.symptom_extractor import extract_symptoms
from app.services.diagnosis_service import get_diagnosis_info

app = FastAPI(
    title="Electrical Expert NLP Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "Electrical Expert NLP Service",
        "status": "running"
    }

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):

    symptoms = extract_symptoms(req.text)

    return {
        "normalized_text": req.text.lower(),
        "symptoms": symptoms
    }

@app.post("/diagnosis")
def diagnosis(req: DiagnosisRequest):

    diagnosis = get_diagnosis_info(req.diagnosis_id)

    if diagnosis is None:

        return {
            "error": "Diagnosis not found"
        }

    return {
        "diagnosis_id": req.diagnosis_id,
        "confidence": req.confidence,
        **diagnosis
    }