"""
Import all models here so SQLAlchemy metadata is populated
before create_all() or Alembic migration generation.
"""

from app.models.user import User, RefreshToken  # noqa: F401
from app.models.course import Course, Module, Lesson, CourseEnrollment  # noqa: F401
from app.models.quiz import Quiz, Question, QuizAttempt  # noqa: F401
from app.models.progress import UserProgress, StudySession  # noqa: F401
from app.models.gamification import (  # noqa: F401
    XPHistory,
    CoinTransaction,
    Streak,
    Achievement,
    UserAchievement,
    Quest,
    UserQuest,
    Reward,
    UserReward,
    LeaderboardSnapshot,
)
from app.models.recommendation import AIRecommendation  # noqa: F401
from app.models.revision import RevisionTopic  # noqa: F401
from app.models.study_plan import StudyPlan  # noqa: F401
from app.models.notification import Notification  # noqa: F401
