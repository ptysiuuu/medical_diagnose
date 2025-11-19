from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .model import EDUCATIONAL_DISCLAIMER, advisor
from .schemas import DiagnosisResponse, DiseasePrediction, SymptomInput

app = FastAPI(title="Medical Diagnosis AI")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/diagnose", response_model=DiagnosisResponse)
async def diagnose(input_data: SymptomInput):
    try:
        advice = advisor.advise(input_data.text, top_k=input_data.top_k)
        predictions = [
            DiseasePrediction(
                disease=item["disease"],
                confidence=item["similarity"],
                description=item["description"],
                precautions=item["precautions"],
            )
            for item in advice
        ]
        return DiagnosisResponse(disclaimer=EDUCATIONAL_DISCLAIMER, predictions=predictions)
    except Exception as exc:  # pragma: no cover - surface errors cleanly to client
        raise HTTPException(status_code=500, detail=str(exc))

@app.get("/")
async def root():
    return {"message": "Medical Diagnosis AI API is running", "disclaimer": EDUCATIONAL_DISCLAIMER}
