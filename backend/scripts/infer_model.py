import json
import sys
from pathlib import Path

from PIL import Image

try:
    import torch
    from transformers import AutoImageProcessor, AutoModelForImageClassification
except Exception as exc:
    print(json.dumps({"error": f"Dependencias no disponibles: {exc}"}))
    sys.exit(1)

REPO_NAME = "AurevinP/cervical-cytology-mobilevit-sipakmed"


def main() -> None:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No se recibió la ruta de la imagen"}))
        sys.exit(1)

    image_path = Path(sys.argv[1]).expanduser().resolve()
    if not image_path.exists():
        print(json.dumps({"error": f"No existe la imagen: {image_path}"}))
        sys.exit(1)

    processor = AutoImageProcessor.from_pretrained(REPO_NAME)
    model = AutoModelForImageClassification.from_pretrained(REPO_NAME)

    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits

    predicted_class = logits.argmax(-1).item()
    probabilities = torch.softmax(logits, dim=-1)[0]
    confidence = float(probabilities[predicted_class].item())
    label = model.config.id2label.get(predicted_class, str(predicted_class))

    print(
        json.dumps(
            {
                "result": label,
                "confidence": confidence,
                "predictedClass": predicted_class,
                "source": "transformers",
            }
        )
    )


if __name__ == "__main__":
    main()
