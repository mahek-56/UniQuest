"""
Quiz scoring and attempt submission logic.
"""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logging import get_logger
from app.models.quiz import Quiz, QuizAttempt
from app.models.user import User
from app.schemas.quiz import AttemptResultResponse, QuizAttemptRequest
from app.services import gamification_service as gs
from fastapi import HTTPException, status

logger = get_logger(__name__)


async def submit_quiz_attempt(
    db: AsyncSession,
    user: User,
    quiz_id: UUID,
    payload: QuizAttemptRequest,
) -> AttemptResultResponse:
    # Load quiz with questions
    result = await db.execute(
        select(Quiz)
        .where(Quiz.id == quiz_id)
        .options(selectinload(Quiz.questions))
    )
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    if not quiz.questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz has no questions",
        )

    # Score the attempt
    correct = 0
    question_results = []
    for question in quiz.questions:
        qid = str(question.id)
        user_ans = payload.answers.get(qid, "")
        is_correct = user_ans == question.correct_answer
        if is_correct:
            correct += 1
        question_results.append({
            "question_id": qid,
            "correct": is_correct,
            "your_answer": user_ans,
            "correct_answer": question.correct_answer,
            "explanation": question.explanation,
        })

    total = len(quiz.questions)
    score = (correct / total) * 100 if total else 0.0
    passed = score >= quiz.pass_score

    # Calculate rewards
    xp = gs.XP_VALUES["quiz_complete"]
    coins = gs.COIN_VALUES["quiz_complete"]
    if score >= 90:
        xp += gs.XP_VALUES["quiz_bonus_90"]
        coins += gs.COIN_VALUES["quiz_high_score"]
    elif score >= 80:
        xp += gs.XP_VALUES["quiz_bonus_80"]
        coins += gs.COIN_VALUES["quiz_high_score"]

    attempt = QuizAttempt(
        user_id=user.id,
        quiz_id=quiz_id,
        answers=payload.answers,
        score=score,
        correct_count=correct,
        total_questions=total,
        time_taken_seconds=payload.time_taken_seconds,
        passed=passed,
        completed_at=datetime.now(tz=timezone.utc),
        xp_earned=xp,
        coins_earned=coins,
    )
    db.add(attempt)
    await db.flush()

    # Award XP + coins
    await gs.award_xp(db, user, xp, "quiz_complete", f"Quiz: {quiz.title}")
    await gs.award_coins(db, user, coins, "quiz_complete", f"Quiz: {quiz.title}")

    # Advance quests
    from app.models.gamification import Quest as QuestModel
    completed_quests = await gs.advance_quests(db, user.id, "quiz_complete")
    for uq in completed_quests:
        quest_result = await db.execute(
            select(QuestModel).where(QuestModel.id == uq.quest_id)
        )
        quest = quest_result.scalar_one_or_none()
        if quest:
            await gs.award_xp(db, user, quest.xp_reward, "quest_complete", quest.title)
            await gs.award_coins(db, user, quest.coin_reward, "quest_complete", quest.title)

    # Check achievements
    await gs.check_and_unlock_achievements(db, user)

    logger.info(
        "Quiz attempt submitted",
        user_id=str(user.id),
        quiz_id=str(quiz_id),
        score=score,
    )

    return AttemptResultResponse(
        attempt_id=attempt.id,
        quiz_id=quiz_id,
        score=score,
        correct_count=correct,
        total_questions=total,
        passed=passed,
        xp_earned=xp,
        coins_earned=coins,
        completed_at=attempt.completed_at,
        question_results=question_results,
    )
