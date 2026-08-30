"""
Progress endpoints: /api/v1/progress
"""

from fastapi import APIRouter
from sqlalchemy import func, select

from app.core.dependencies import CurrentUser, DBSession
from app.models.course import CourseEnrollment, Lesson, Module
from app.models.progress import UserProgress

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/lessons")
async def get_lesson_progress(current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(UserProgress)
        .where(
            UserProgress.user_id == current_user.id,
            UserProgress.is_completed == True,  # noqa: E712
        )
        .order_by(UserProgress.completed_at.desc())
    )
    items = result.scalars().all()
    return [
        {
            "lesson_id": str(p.lesson_id),
            "completed_at": p.completed_at,
            "time_spent_seconds": p.time_spent_seconds,
        }
        for p in items
    ]


@router.get("/courses")
async def get_course_progress_all(current_user: CurrentUser, db: DBSession):
    enroll_r = await db.execute(
        select(CourseEnrollment).where(CourseEnrollment.user_id == current_user.id)
    )
    enrollments = enroll_r.scalars().all()

    results = []
    for enrollment in enrollments:
        total_r = await db.execute(
            select(func.count(Lesson.id))
            .join(Module, Module.id == Lesson.module_id)
            .where(Module.course_id == enrollment.course_id)
        )
        total = int(total_r.scalar() or 0)

        completed_r = await db.execute(
            select(func.count(UserProgress.id))
            .join(Lesson, Lesson.id == UserProgress.lesson_id)
            .join(Module, Module.id == Lesson.module_id)
            .where(
                Module.course_id == enrollment.course_id,
                UserProgress.user_id == current_user.id,
                UserProgress.is_completed == True,  # noqa: E712
            )
        )
        completed = int(completed_r.scalar() or 0)

        results.append({
            "course_id": str(enrollment.course_id),
            "total_lessons": total,
            "completed_lessons": completed,
            "completion_percentage": (completed / total * 100) if total > 0 else 0.0,
            "enrolled_at": enrollment.enrolled_at,
        })

    return results
