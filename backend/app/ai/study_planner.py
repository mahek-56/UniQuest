"""
AI Study Planner — generate structured study plans using Gemini.
Supports:
1. Mode 1: Custom Date Range Plan (Start Date -> End Date)
2. Mode 2: Exam Preparation Plan (Countdown to Target Exam Date)
"""

from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai import gemini_client
from app.ai.prompts import (
    STUDY_PLAN_CUSTOM_RANGE_USER,
    STUDY_PLAN_EXAM_PREP_USER,
    STUDY_PLAN_SYSTEM,
)
from app.core.logging import get_logger
from app.models.study_plan import StudyPlan
from app.schemas.ai import StudyPlanRequest, StudyPlanResponse

logger = get_logger(__name__)


async def generate_study_plan(
    db: AsyncSession,
    user_id: UUID,
    payload: StudyPlanRequest,
) -> StudyPlanResponse:
    now = datetime.now(tz=timezone.utc)
    today_str = now.strftime("%Y-%m-%d")
    day_of_week = now.strftime("%A")

    mode = payload.effective_mode
    subjects = payload.effective_subjects or [
        "Database Management Systems", "Operating Systems", "Data Structures & Algorithms", "Computer Networks"
    ]
    colors = ['#0055DA', '#00C68D', '#FF0052', '#FFD400', '#76D2DB', '#8E75B2', '#36064D']

    if mode == "custom_range":
        start_date_str = payload.start_date or payload.startDate or today_str
        end_date_str = payload.end_date or payload.endDate or (now + timedelta(days=6)).strftime("%Y-%m-%d")

        try:
            start_dt = datetime.strptime(start_date_str, "%Y-%m-%d")
            end_dt = datetime.strptime(end_date_str, "%Y-%m-%d")
            if end_dt < start_dt:
                end_dt = start_dt + timedelta(days=6)
                end_date_str = end_dt.strftime("%Y-%m-%d")
        except Exception:
            start_dt = now
            end_dt = now + timedelta(days=6)
            start_date_str = start_dt.strftime("%Y-%m-%d")
            end_date_str = end_dt.strftime("%Y-%m-%d")

        num_days = max(1, min(30, (end_dt - start_dt).days + 1))

        prompt = STUDY_PLAN_CUSTOM_RANGE_USER.format(
            start_date=start_date_str,
            end_date=end_date_str,
            num_days=num_days,
            subjects=", ".join(subjects),
            daily_hours=payload.effective_daily_hours,
            goals=payload.goals or "Master semester curriculum units with daily problem solving.",
        )

        try:
            plan_data = await gemini_client.generate_json(
                prompt=prompt,
                system_instruction=STUDY_PLAN_SYSTEM,
            )
        except Exception as exc:
            logger.error("Custom range study plan generation failed", error=str(exc))
            # Fallback custom range timetable
            fallback_days = []
            for i in range(num_days):
                day_dt = start_dt + timedelta(days=i)
                subj = subjects[i % len(subjects)]
                fallback_days.append({
                    "date": day_dt.strftime("%Y-%m-%d"),
                    "dayName": f"{day_dt.strftime('%A')} ({day_dt.strftime('%b %d')})",
                    "focusSubject": subj,
                    "theme": f"Active Study & Practice: {subj}",
                    "color": colors[i % len(colors)],
                    "blocks": [
                        {
                            "time": "6:00 PM - 7:30 PM",
                            "task": f"Core Concept Mastery & Lab Exercises: {subj}",
                            "xp": 40,
                        },
                        {
                            "time": "8:00 PM - 9:00 PM",
                            "task": f"Problem Solving & Flashcard Revision: {subj}",
                            "xp": 30,
                        }
                    ]
                })

            plan_data = {
                "mode": "custom_range",
                "scheduleSummary": f"Custom study schedule from {start_date_str} to {end_date_str} ({num_days} days).",
                "weeklyGoalHours": round(payload.effective_daily_hours * min(7, num_days), 1),
                "days": fallback_days,
            }

    else:
        # Exam Prep Mode
        exam_date_str = payload.exam_date or payload.examDate or (now + timedelta(days=14)).strftime("%Y-%m-%d")
        try:
            exam_dt = datetime.strptime(exam_date_str, "%Y-%m-%d")
            days_until_exam = max(1, (exam_dt.date() - now.date()).days)
        except Exception:
            days_until_exam = 14
            exam_date_str = (now + timedelta(days=14)).strftime("%Y-%m-%d")

        prep_level = payload.preparation_level or payload.preparationLevel or "Intermediate Review"
        target_grade = payload.target_grade or payload.targetGrade or "A+"
        weak_topics = payload.weakFocus or (", ".join(payload.weak_topics) if payload.weak_topics else "Database Normalization, Deadlocks, Graph Traversal")

        prompt = STUDY_PLAN_EXAM_PREP_USER.format(
            today=today_str,
            day_of_week=day_of_week,
            exam_date=exam_date_str,
            days_until_exam=days_until_exam,
            subjects=", ".join(subjects),
            daily_hours=payload.effective_daily_hours,
            prep_level=prep_level,
            target_grade=target_grade,
            weak_topics=weak_topics,
        )

        try:
            plan_data = await gemini_client.generate_json(
                prompt=prompt,
                system_instruction=STUDY_PLAN_SYSTEM,
            )
        except Exception as exc:
            logger.error("Exam prep study plan generation failed", error=str(exc))
            # Fallback countdown plan
            plan_len = min(7, days_until_exam)
            fallback_days = []
            for i in range(plan_len):
                day_dt = now + timedelta(days=i)
                subj = subjects[i % len(subjects)]
                is_last_day = (i == plan_len - 1)
                fallback_days.append({
                    "date": day_dt.strftime("%Y-%m-%d"),
                    "dayName": f"{day_dt.strftime('%A')} ({day_dt.strftime('%b %d')})",
                    "focusSubject": subj,
                    "theme": "Final Mock Test & Formula Cheat Sheet" if is_last_day else f"Exam Prep & Weak Topic Drill: {subj}",
                    "color": colors[i % len(colors)],
                    "blocks": [
                        {
                            "time": "6:00 PM - 7:30 PM",
                            "task": f"High-Yield Exam Topics & Previous Questions: {subj}",
                            "xp": 40,
                        },
                        {
                            "time": "8:00 PM - 9:00 PM",
                            "task": f"Timed Practice Quiz & Weak Area Remediation: {subj}",
                            "xp": 30,
                        }
                    ]
                })

            plan_data = {
                "mode": "exam_prep",
                "scheduleSummary": f"Exam preparation countdown targeting Grade {target_grade} for exam on {exam_date_str} ({days_until_exam} days remaining).",
                "weeklyGoalHours": round(payload.effective_daily_hours * 6, 1),
                "days": fallback_days,
            }

    # Deactivate previous plans
    from sqlalchemy import update
    await db.execute(
        update(StudyPlan)
        .where(StudyPlan.user_id == user_id, StudyPlan.is_active == True)  # noqa: E712
        .values(is_active=False)
    )

    plan = StudyPlan(
        user_id=user_id,
        plan_data=plan_data,
        generated_at=now,
    )
    db.add(plan)
    await db.flush()

    return StudyPlanResponse(
        plan_id=plan.id,
        plan_data=plan_data,
        generated_at=plan.generated_at,
        expires_at=plan.expires_at,
    )
