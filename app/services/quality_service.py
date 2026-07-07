from __future__ import annotations

from dataclasses import dataclass


@dataclass
class QualityAssessment:
    meaning_preserved: bool
    drift_flag: bool
    drift_score: float


def normalize_drift_score(score: float) -> float:
    return max(0.0, min(1.0, score))
