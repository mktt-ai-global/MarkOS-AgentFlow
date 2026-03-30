from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.core.config import get_settings

REPO_ROOT = Path(__file__).resolve().parents[3]


@dataclass(slots=True)
class StoredArtifact:
    path: str
    absolute_path: Path


class ArtifactStorageService:
    def __init__(self) -> None:
        settings = get_settings()
        self.base_dir = (
            settings.artifacts_dir
            if settings.artifacts_dir.is_absolute()
            else REPO_ROOT / settings.artifacts_dir
        )
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def write_text(self, task_id: str, filename: str, content: str) -> StoredArtifact:
        return self._write(task_id, filename, content)

    def write_json(self, task_id: str, filename: str, payload: Any) -> StoredArtifact:
        content = json.dumps(payload, ensure_ascii=False, indent=2)
        return self._write(task_id, filename, content)

    def _write(self, task_id: str, filename: str, content: str) -> StoredArtifact:
        task_dir = self.base_dir / task_id
        task_dir.mkdir(parents=True, exist_ok=True)
        absolute_path = task_dir / filename
        absolute_path.write_text(content, encoding="utf-8")

        try:
            stored_path = str(absolute_path.relative_to(REPO_ROOT))
        except ValueError:
            stored_path = str(absolute_path)

        return StoredArtifact(
            path=stored_path,
            absolute_path=absolute_path,
        )
