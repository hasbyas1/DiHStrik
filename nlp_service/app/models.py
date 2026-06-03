from pydantic import BaseModel
from typing import List

class AnalyzeRequest(BaseModel):
    text: str

class SymptomMatch(BaseModel):
    id: str
    text: str
    score: float

class AnalyzeResponse(BaseModel):
    normalized_text: str
    symptoms: List[SymptomMatch]

class DiagnosisRequest(BaseModel):
    diagnosis_id: str
    confidence: float