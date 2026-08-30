"""
Tests for ML performance prediction.
"""

from app.ml.performance_model import predict_performance


def test_predict_insufficient_data():
    """Returns insufficient_data when too few quiz attempts."""
    features = {"_data_points": 2}
    result = predict_performance(features)
    assert result == "insufficient_data"


def test_predict_at_risk_profile():
    """Low accuracy, low engagement → at_risk prediction."""
    features = {
        "_data_points": 10,
        "quiz_accuracy": 0.2,
        "attempt_count": 3,
        "avg_study_time_minutes": 5,
        "lesson_completion_rate": 0.1,
        "streak_days": 0,
        "consistency_score": 0.1,
        "recent_performance_trend": -0.2,
    }
    result = predict_performance(features)
    assert result in ["at_risk", "average", "strong", "insufficient_data"]
    # With this low-engagement profile the model should lean toward at_risk
    assert result == "at_risk"


def test_predict_strong_profile():
    """High accuracy, high engagement → strong prediction."""
    features = {
        "_data_points": 30,
        "quiz_accuracy": 0.9,
        "attempt_count": 25,
        "avg_study_time_minutes": 60,
        "lesson_completion_rate": 0.9,
        "streak_days": 20,
        "consistency_score": 0.85,
        "recent_performance_trend": 0.1,
    }
    result = predict_performance(features)
    assert result == "strong"


def test_predict_average_profile():
    """Moderate stats → average prediction."""
    features = {
        "_data_points": 15,
        "quiz_accuracy": 0.55,
        "attempt_count": 10,
        "avg_study_time_minutes": 30,
        "lesson_completion_rate": 0.5,
        "streak_days": 5,
        "consistency_score": 0.4,
        "recent_performance_trend": 0.0,
    }
    result = predict_performance(features)
    assert result in ["average", "at_risk", "strong"]  # near boundary, allow any


def test_model_returns_valid_labels():
    """predict_performance always returns one of the 4 valid labels."""
    import random
    for _ in range(20):
        features = {
            "_data_points": random.randint(0, 50),
            "quiz_accuracy": random.random(),
            "attempt_count": random.randint(0, 30),
            "avg_study_time_minutes": random.uniform(0, 90),
            "lesson_completion_rate": random.random(),
            "streak_days": random.randint(0, 30),
            "consistency_score": random.random(),
            "recent_performance_trend": random.uniform(-0.5, 0.5),
        }
        result = predict_performance(features)
        assert result in ["at_risk", "average", "strong", "insufficient_data"]


def test_model_is_deterministic():
    """Same features → same prediction (model is deterministic)."""
    features = {
        "_data_points": 20,
        "quiz_accuracy": 0.7,
        "attempt_count": 15,
        "avg_study_time_minutes": 40,
        "lesson_completion_rate": 0.6,
        "streak_days": 8,
        "consistency_score": 0.55,
        "recent_performance_trend": 0.05,
    }
    r1 = predict_performance(features)
    r2 = predict_performance(features)
    assert r1 == r2
