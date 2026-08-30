"""
ML performance prediction: at_risk | average | strong
Uses a RandomForestClassifier trained on synthetic data.
The model is fit lazily on first use; in production you'd persist
the trained model with joblib and load it at startup.
"""

from __future__ import annotations

import threading
from typing import Literal

import numpy as np

from app.core.logging import get_logger

logger = get_logger(__name__)

PredictionLabel = Literal["at_risk", "average", "strong", "insufficient_data"]

FEATURE_COLUMNS = [
    "quiz_accuracy",
    "attempt_count",
    "avg_study_time_minutes",
    "lesson_completion_rate",
    "streak_days",
    "consistency_score",
    "recent_performance_trend",
]

MIN_DATA_POINTS = 5

_model = None
_lock = threading.Lock()


def _build_synthetic_training_data():
    """
    Build a small synthetic training set that encodes domain knowledge.
    Replace with real labelled data when available.
    """
    rng = np.random.default_rng(42)
    n = 300

    # at_risk: low accuracy, low activity
    at_risk = np.column_stack([
        rng.uniform(0, 0.4, n),    # quiz_accuracy
        rng.integers(1, 5, n),     # attempt_count
        rng.uniform(0, 15, n),     # avg_study_time_minutes
        rng.uniform(0, 0.3, n),    # lesson_completion_rate
        rng.integers(0, 3, n),     # streak_days
        rng.uniform(0, 0.2, n),    # consistency_score
        rng.uniform(-0.3, 0.1, n), # recent_performance_trend
    ])

    # average
    avg = np.column_stack([
        rng.uniform(0.4, 0.75, n),
        rng.integers(5, 15, n),
        rng.uniform(15, 45, n),
        rng.uniform(0.3, 0.7, n),
        rng.integers(2, 10, n),
        rng.uniform(0.2, 0.6, n),
        rng.uniform(-0.1, 0.2, n),
    ])

    # strong: high accuracy, high engagement
    strong = np.column_stack([
        rng.uniform(0.75, 1.0, n),
        rng.integers(10, 50, n),
        rng.uniform(30, 90, n),
        rng.uniform(0.7, 1.0, n),
        rng.integers(5, 30, n),
        rng.uniform(0.5, 1.0, n),
        rng.uniform(0.0, 0.4, n),
    ])

    X = np.vstack([at_risk, avg, strong])
    y = np.array(["at_risk"] * n + ["average"] * n + ["strong"] * n)
    return X, y


def _get_model():
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                from sklearn.ensemble import RandomForestClassifier
                from sklearn.preprocessing import StandardScaler
                from sklearn.pipeline import Pipeline

                X, y = _build_synthetic_training_data()
                pipe = Pipeline([
                    ("scaler", StandardScaler()),
                    ("clf", RandomForestClassifier(
                        n_estimators=100,
                        max_depth=8,
                        random_state=42,
                        class_weight="balanced",
                        n_jobs=1,
                    )),
                ])
                pipe.fit(X, y)
                _model = pipe
                logger.info("ML performance model trained on synthetic data")
    return _model


def predict_performance(features: dict) -> PredictionLabel:
    """
    Predict student performance category from the feature dict.
    Returns 'insufficient_data' if fewer than MIN_DATA_POINTS quiz attempts.
    """
    if features.get("_data_points", 0) < MIN_DATA_POINTS:
        return "insufficient_data"

    model = _get_model()
    X = np.array([[features.get(col, 0) for col in FEATURE_COLUMNS]])
    label: str = model.predict(X)[0]
    return label  # type: ignore[return-value]
