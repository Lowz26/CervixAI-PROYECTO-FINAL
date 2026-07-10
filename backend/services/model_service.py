import os
from pathlib import Path
from typing import Dict, List, Optional

import torch
import timm

from utils.preprocessing import build_transform

MODEL_PATH = Path(__file__).resolve().parents[1] / "mobilevit_s_sipakmed_stain_normalized.pth"
MODEL_ALTERNATIVES = [
    Path(__file__).resolve().parents[1] / "mobilevit_s_sipakmed_stain_normalized.pth",
    Path(__file__).resolve().parents[1] / "models" / "weights" / "mobilevit_s_sipakmed_stain_normalized.pth",
    Path(__file__).resolve().parents[1] / "models" / "mobilevit_s_sipakmed_stain_normalized.pth",
]


class MobileViTInferenceService:
    def __init__(self, model_path: Optional[Path] = None, device: Optional[str] = None):
        self.model_path = self._resolve_model_path(model_path)
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.classes: List[str] = []
        self.transform = build_transform()
        self._load_model()

    def _resolve_model_path(self, model_path: Optional[Path]) -> Path:
        if model_path is not None:
            return Path(model_path).resolve()

        for candidate in MODEL_ALTERNATIVES:
            if candidate.exists():
                return candidate.resolve()

        return MODEL_PATH.resolve()

    def _load_model(self) -> None:
        if not self.model_path.exists():
            raise FileNotFoundError(f"No se encontró el modelo en: {self.model_path}")

        checkpoint = torch.load(self.model_path, map_location=self.device)
        state_dict = checkpoint.get("model_state") if isinstance(checkpoint, dict) and "model_state" in checkpoint else checkpoint
        classes = checkpoint.get("classes") if isinstance(checkpoint, dict) and "classes" in checkpoint else None

        self.model = timm.create_model("mobilevit_s", pretrained=False, num_classes=5)
        self.model.load_state_dict(state_dict, strict=True)
        self.model.to(self.device)
        self.model.eval()

        if classes:
            self.classes = list(classes)
        else:
            self.classes = [f"class_{i}" for i in range(5)]

    @torch.no_grad()
    def predict(self, image_tensor: torch.Tensor) -> Dict[str, object]:
        if self.model is None:
            raise RuntimeError("El modelo no está cargado")

        image_tensor = image_tensor.to(self.device)
        logits = self.model(image_tensor.unsqueeze(0))
        probabilities = torch.softmax(logits, dim=1)[0]
        confidence, predicted_idx = torch.max(probabilities, dim=0)

        predicted_class = self.classes[int(predicted_idx.item())] if int(predicted_idx.item()) < len(self.classes) else str(int(predicted_idx.item()))
        return {
            "prediction": predicted_class,
            "confidence": float(confidence.item()),
        }


inference_service = MobileViTInferenceService()
