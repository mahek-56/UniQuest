"""initial schema

Revision ID: 001_initial
Revises: 
Create Date: 2026-08-16 00:00:00.000000

This migration creates all UniQuest tables from scratch.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), nullable=False, server_default="student"),
        sa.Column("university", sa.String(255), nullable=True),
        sa.Column("department", sa.String(255), nullable=True),
        sa.Column("semester", sa.Integer, nullable=True),
        sa.Column("bio", sa.Text, nullable=True),
        sa.Column("avatar_url", sa.String(512), nullable=True),
        sa.Column("interests", sa.Text, nullable=True),
        sa.Column("learning_goals", sa.Text, nullable=True),
        sa.Column("preferred_study_time", sa.String(100), nullable=True),
        sa.Column("difficulty_preference", sa.String(50), server_default="medium"),
        sa.Column("onboarding_completed", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("daily_study_target_minutes", sa.Integer, nullable=False, server_default="30"),
        sa.Column("target_grade", sa.String(10), nullable=True),
        sa.Column("xp", sa.Integer, nullable=False, server_default="0"),
        sa.Column("level", sa.Integer, nullable=False, server_default="1"),
        sa.Column("coins", sa.Integer, nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("is_verified", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Refresh tokens
    op.create_table(
        "refresh_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("token_hash", sa.String(512), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Courses
    op.create_table(
        "courses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("subject", sa.String(100), nullable=False, index=True),
        sa.Column("difficulty", sa.String(50), nullable=False, server_default="medium"),
        sa.Column("thumbnail_url", sa.String(512), nullable=True),
        sa.Column("is_published", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Modules
    op.create_table(
        "modules",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("order_index", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Lessons
    op.create_table(
        "lessons",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("module_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("modules.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("content", sa.Text, nullable=True),
        sa.Column("video_url", sa.String(512), nullable=True),
        sa.Column("duration_minutes", sa.Integer, nullable=False, server_default="10"),
        sa.Column("order_index", sa.Integer, nullable=False, server_default="0"),
        sa.Column("xp_reward", sa.Integer, nullable=False, server_default="20"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Course enrollments
    op.create_table(
        "course_enrollments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("enrolled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("user_id", "course_id", name="uq_enrollment_user_course"),
    )

    # Quizzes
    op.create_table(
        "quizzes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("subject", sa.String(100), nullable=True, index=True),
        sa.Column("difficulty", sa.String(50), nullable=False, server_default="medium"),
        sa.Column("time_limit_minutes", sa.Integer, nullable=True),
        sa.Column("pass_score", sa.Float, nullable=False, server_default="60.0"),
        sa.Column("module_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("modules.id", ondelete="SET NULL"), nullable=True),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Questions
    op.create_table(
        "questions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("quiz_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("text", sa.Text, nullable=False),
        sa.Column("options", postgresql.JSONB, nullable=False),
        sa.Column("correct_answer", sa.String(10), nullable=False),
        sa.Column("explanation", sa.Text, nullable=True),
        sa.Column("order_index", sa.Integer, nullable=False, server_default="0"),
    )

    # Quiz attempts
    op.create_table(
        "quiz_attempts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("quiz_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("answers", postgresql.JSONB, nullable=False),
        sa.Column("score", sa.Float, nullable=False),
        sa.Column("correct_count", sa.Integer, nullable=False),
        sa.Column("total_questions", sa.Integer, nullable=False),
        sa.Column("time_taken_seconds", sa.Integer, nullable=True),
        sa.Column("passed", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("xp_earned", sa.Integer, nullable=False, server_default="0"),
        sa.Column("coins_earned", sa.Integer, nullable=False, server_default="0"),
    )

    # User progress
    op.create_table(
        "user_progress",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("is_completed", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_accessed", sa.DateTime(timezone=True), nullable=True),
        sa.Column("time_spent_seconds", sa.Integer, nullable=False, server_default="0"),
        sa.UniqueConstraint("user_id", "lesson_id", name="uq_progress_user_lesson"),
    )

    # Study sessions
    op.create_table(
        "study_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("duration_seconds", sa.Integer, nullable=True),
        sa.Column("xp_earned", sa.Integer, nullable=False, server_default="0"),
    )

    # XP history
    op.create_table(
        "xp_history",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("amount", sa.Integer, nullable=False),
        sa.Column("source", sa.String(100), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Coin transactions
    op.create_table(
        "coin_transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("amount", sa.Integer, nullable=False),
        sa.Column("transaction_type", sa.String(100), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Streaks
    op.create_table(
        "streaks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("current_streak", sa.Integer, nullable=False, server_default="0"),
        sa.Column("longest_streak", sa.Integer, nullable=False, server_default="0"),
        sa.Column("last_active_date", sa.Date, nullable=True),
        sa.UniqueConstraint("user_id", name="uq_streak_user"),
    )

    # Achievements
    op.create_table(
        "achievements",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("key", sa.String(100), unique=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("icon", sa.String(100), nullable=True),
        sa.Column("xp_reward", sa.Integer, nullable=False, server_default="0"),
        sa.Column("coin_reward", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # User achievements
    op.create_table(
        "user_achievements",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("achievement_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False),
        sa.Column("unlocked_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )

    # Quests
    op.create_table(
        "quests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("quest_type", sa.String(100), nullable=False, index=True),
        sa.Column("target_value", sa.Integer, nullable=False, server_default="1"),
        sa.Column("xp_reward", sa.Integer, nullable=False, server_default="25"),
        sa.Column("coin_reward", sa.Integer, nullable=False, server_default="10"),
        sa.Column("is_daily", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # User quests
    op.create_table(
        "user_quests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("quest_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("quests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("progress", sa.Integer, nullable=False, server_default="0"),
        sa.Column("completed", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("assigned_date", sa.Date, nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("user_id", "quest_id", "assigned_date", name="uq_user_quest_date"),
    )

    # Rewards
    op.create_table(
        "rewards",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("cost_coins", sa.Integer, nullable=False),
        sa.Column("icon", sa.String(100), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # User rewards
    op.create_table(
        "user_rewards",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("reward_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("rewards.id", ondelete="CASCADE"), nullable=False),
        sa.Column("redeemed_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Leaderboard snapshots
    op.create_table(
        "leaderboard_snapshots",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("period_type", sa.String(50), nullable=False),
        sa.Column("period_key", sa.String(50), nullable=False),
        sa.Column("xp", sa.Integer, nullable=False, server_default="0"),
        sa.Column("rank", sa.Integer, nullable=True),
        sa.Column("university", sa.String(255), nullable=True),
        sa.Column("department", sa.String(255), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("user_id", "period_type", "period_key", name="uq_leaderboard_entry"),
    )

    # Notifications
    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("notification_type", sa.String(100), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("message", sa.Text, nullable=False),
        sa.Column("is_read", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Revision topics
    op.create_table(
        "revision_topics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("topic", sa.String(255), nullable=False),
        sa.Column("subject", sa.String(100), nullable=False, index=True),
        sa.Column("difficulty", sa.String(50), nullable=False, server_default="medium"),
        sa.Column("performance_score", sa.Float, nullable=False, server_default="0.5"),
        sa.Column("interval_days", sa.Integer, nullable=False, server_default="1"),
        sa.Column("repetitions", sa.Integer, nullable=False, server_default="0"),
        sa.Column("ease_factor", sa.Float, nullable=False, server_default="2.5"),
        sa.Column("next_revision_date", sa.Date, nullable=False),
        sa.Column("last_revised_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("source_question_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("questions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # AI recommendations
    op.create_table(
        "ai_recommendations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("recommendation_type", sa.String(100), nullable=False),
        sa.Column("content", postgresql.JSONB, nullable=False),
        sa.Column("ai_explanation", sa.Text, nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Study plans
    op.create_table(
        "study_plans",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("plan_data", postgresql.JSONB, nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("study_plans")
    op.drop_table("ai_recommendations")
    op.drop_table("revision_topics")
    op.drop_table("notifications")
    op.drop_table("leaderboard_snapshots")
    op.drop_table("user_rewards")
    op.drop_table("rewards")
    op.drop_table("user_quests")
    op.drop_table("quests")
    op.drop_table("user_achievements")
    op.drop_table("achievements")
    op.drop_table("streaks")
    op.drop_table("coin_transactions")
    op.drop_table("xp_history")
    op.drop_table("study_sessions")
    op.drop_table("user_progress")
    op.drop_table("quiz_attempts")
    op.drop_table("questions")
    op.drop_table("quizzes")
    op.drop_table("course_enrollments")
    op.drop_table("lessons")
    op.drop_table("modules")
    op.drop_table("courses")
    op.drop_table("refresh_tokens")
    op.drop_table("users")
