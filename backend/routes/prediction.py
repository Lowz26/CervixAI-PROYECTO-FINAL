from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from services.model_service import inference_service
from utils.preprocessing import build_transform

router = APIRouter()
transform = build_transform()

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No se recibió ningún archivo")

    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff")):
        raise HTTPException(status_code=400, detail="Solo se aceptan imágenes JPG, PNG, BMP o TIFF")

    try:
        contents = await file.read()
        import io
        from PIL import Image

        image = Image.open(io.BytesIO(contents)).convert("RGB")
        tensor = transform(image)
        result = inference_service.predict(tensor)
        return JSONResponse(status_code=200, content=result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
