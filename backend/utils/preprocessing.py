from pathlib import Path
from typing import Tuple

from PIL import Image
from torchvision import transforms

INPUT_SIZE = 256
MEAN = (0.0, 0.0, 0.0)
STD = (1.0, 1.0, 1.0)


def build_transform(input_size: int = INPUT_SIZE) -> transforms.Compose:
    return transforms.Compose(
        [
            transforms.Resize(int(input_size * 1.1)),
            transforms.CenterCrop(input_size),
            transforms.ToTensor(),
            transforms.Normalize(MEAN, STD),
        ]
    )


def preprocess_image(image_path: str | Path, input_size: int = INPUT_SIZE) -> Image.Image:
    image = Image.open(image_path).convert("RGB")
    transform = build_transform(input_size)
    return transform(image)


def preprocess_image_tensor(image_path: str | Path, input_size: int = INPUT_SIZE) -> Tuple[Image.Image, int]:
    image = Image.open(image_path).convert("RGB")
    transform = build_transform(input_size)
    return transform(image), input_size
