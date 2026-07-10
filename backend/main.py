from fastapi import FastAPI
from routes.prediction import router as prediction_router

app = FastAPI(title="CervixAI Inference API")
app.include_router(prediction_router)


@app.get("/health")
def health():
    return {"status": "ok"}
