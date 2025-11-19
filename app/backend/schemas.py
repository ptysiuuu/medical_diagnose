from typing import List, Optional

from pydantic import BaseModel


class SymptomInput(BaseModel):
    text: str
    top_k: Optional[int] = None


class DiseasePrediction(BaseModel):
    disease: str
    confidence: float
    description: str
    precautions: List[str]


class DiagnosisResponse(BaseModel):
    disclaimer: str
    predictions: List[DiseasePrediction]
