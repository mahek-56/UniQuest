"""
Course, Module, Lesson endpoints: /api/v1/courses, /modules, /lessons
"""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.core.dependencies import AdminUser, CurrentUser, DBSession
from app.models.course import Course, CourseEnrollment, Lesson, Module
from app.models.progress import UserProgress
from app.schemas.course import (
    CourseCreate,
    CourseDetailResponse,
    CourseProgressResponse,
    CourseResponse,
    CourseUpdate,
    EnrollResponse,
    LessonCreate,
    LessonResponse,
    LessonUpdate,
    ModuleCreate,
    ModuleResponse,
    ModuleUpdate,
)
from app.schemas.common import MessageResponse

courses_router = APIRouter(prefix="/courses", tags=["courses"])
modules_router = APIRouter(prefix="/modules", tags=["modules"])
lessons_router = APIRouter(prefix="/lessons", tags=["lessons"])


# ── Courses ───────────────────────────────────────────────────────────────────

@courses_router.get("/", response_model=list[CourseResponse])
async def list_courses(
    db: DBSession,
    subject: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    published_only: bool = Query(True),
):
    q = select(Course)
    if published_only:
        q = q.where(Course.is_published == True)  # noqa: E712
    if subject:
        q = q.where(Course.subject == subject)
    if difficulty:
        q = q.where(Course.difficulty == difficulty)
    result = await db.execute(q.order_by(Course.created_at.desc()))
    return result.scalars().all()


@courses_router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(payload: CourseCreate, current_user: AdminUser, db: DBSession):
    course = Course(**payload.model_dump(), created_by=current_user.id)
    db.add(course)
    await db.flush()
    return course


@courses_router.get("/{course_id}", response_model=CourseDetailResponse)
async def get_course(course_id: UUID, db: DBSession):
    result = await db.execute(
        select(Course).where(Course.id == course_id).options(selectinload(Course.modules))
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    module_count = len(course.modules)
    lesson_count_r = await db.execute(
        select(func.count(Lesson.id))
        .join(Module, Module.id == Lesson.module_id)
        .where(Module.course_id == course_id)
    )
    lesson_count = int(lesson_count_r.scalar() or 0)
    enroll_count_r = await db.execute(
        select(func.count(CourseEnrollment.id)).where(CourseEnrollment.course_id == course_id)
    )
    enroll_count = int(enroll_count_r.scalar() or 0)

    data = CourseDetailResponse(
        **CourseResponse.model_validate(course).model_dump(),
        module_count=module_count,
        lesson_count=lesson_count,
        enrolled_count=enroll_count,
    )
    return data


@courses_router.put("/{course_id}", response_model=CourseResponse)
async def update_course(course_id: UUID, payload: CourseUpdate, current_user: AdminUser, db: DBSession):
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(course, field, value)
    return course


@courses_router.get("/{course_id}/modules", response_model=list[ModuleResponse])
async def get_course_modules(course_id: UUID, db: DBSession):
    result = await db.execute(
        select(Module)
        .where(Module.course_id == course_id)
        .options(selectinload(Module.lessons))
        .order_by(Module.order_index)
    )
    return result.scalars().all()


@courses_router.post("/{course_id}/enroll", response_model=EnrollResponse)
async def enroll(course_id: UUID, current_user: CurrentUser, db: DBSession):
    # Check course exists
    cr = await db.execute(select(Course).where(Course.id == course_id))
    course = cr.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    # Check already enrolled
    er = await db.execute(
        select(CourseEnrollment).where(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.course_id == course_id,
        )
    )
    if er.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already enrolled")

    now = datetime.now(tz=timezone.utc)
    enrollment = CourseEnrollment(
        user_id=current_user.id, course_id=course_id, enrolled_at=now
    )
    db.add(enrollment)
    return EnrollResponse(message="Enrolled successfully", course_id=course_id, enrolled_at=now)


@courses_router.get("/{course_id}/progress", response_model=CourseProgressResponse)
async def get_course_progress(course_id: UUID, current_user: CurrentUser, db: DBSession):
    # Get enrollment
    er = await db.execute(
        select(CourseEnrollment).where(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.course_id == course_id,
        )
    )
    enrollment = er.scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not enrolled in this course")

    # Total lessons
    total_r = await db.execute(
        select(func.count(Lesson.id))
        .join(Module, Module.id == Lesson.module_id)
        .where(Module.course_id == course_id)
    )
    total = int(total_r.scalar() or 0)

    # Completed lessons
    completed_r = await db.execute(
        select(func.count(UserProgress.id))
        .join(Lesson, Lesson.id == UserProgress.lesson_id)
        .join(Module, Module.id == Lesson.module_id)
        .where(
            Module.course_id == course_id,
            UserProgress.user_id == current_user.id,
            UserProgress.is_completed == True,  # noqa: E712
        )
    )
    completed = int(completed_r.scalar() or 0)

    pct = (completed / total * 100) if total > 0 else 0.0
    return CourseProgressResponse(
        course_id=course_id,
        total_lessons=total,
        completed_lessons=completed,
        completion_percentage=pct,
        enrolled_at=enrollment.enrolled_at,
        completed_at=enrollment.completed_at,
    )


# ── Modules ───────────────────────────────────────────────────────────────────

@modules_router.post("/", response_model=ModuleResponse, status_code=status.HTTP_201_CREATED)
async def create_module(payload: ModuleCreate, current_user: AdminUser, db: DBSession):
    module = Module(**payload.model_dump())
    db.add(module)
    await db.flush()
    return module


@modules_router.get("/{module_id}", response_model=ModuleResponse)
async def get_module(module_id: UUID, db: DBSession):
    result = await db.execute(
        select(Module)
        .where(Module.id == module_id)
        .options(selectinload(Module.lessons))
    )
    module = result.scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    return module


@modules_router.put("/{module_id}", response_model=ModuleResponse)
async def update_module(module_id: UUID, payload: ModuleUpdate, current_user: AdminUser, db: DBSession):
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(module, field, value)
    return module


# ── Lessons ────────────────────────────────────────────────────────────────────

@lessons_router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(lesson_id: UUID, db: DBSession):
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    return lesson


@lessons_router.post("/{lesson_id}/start")
async def start_lesson(lesson_id: UUID, current_user: CurrentUser, db: DBSession):
    from app.services.lesson_service import start_lesson as svc_start
    session = await svc_start(db, current_user, lesson_id)
    return {"session_id": str(session.id), "started_at": session.started_at}


@lessons_router.post("/{lesson_id}/complete")
async def complete_lesson(lesson_id: UUID, session_id: UUID, current_user: CurrentUser, db: DBSession):
    from app.services.lesson_service import complete_lesson as svc_complete
    return await svc_complete(db, current_user, lesson_id, session_id)
