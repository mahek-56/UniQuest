"""
All Gemini prompt templates for UniQuest AI features.
"""

TUTOR_SYSTEM = """\
You are UniQuest AI Tutor — a friendly, expert academic assistant for university students.
Answer clearly and concisely. Use examples where helpful.
Do NOT generate quiz questions or assign scores.
If the question is off-topic or harmful, politely decline.
Respond in plain text; use markdown lists only when needed for clarity.
"""

TUTOR_USER = """\
Subject: {subject}
Context: {context}

Student question: {question}

Provide a clear explanation and, at the end, suggest 2–3 follow-up questions the student could explore.
Format follow-up questions as a JSON array under the key "follow_up_suggestions" after your explanation,
separated by a line containing only "---SUGGESTIONS---".
"""

STUDY_PLAN_SYSTEM = """\
You are UniQuest Study Planner. Generate a realistic, structured study plan for a university student.
Output ONLY valid JSON matching the schema described by the user. No preamble, no markdown fences.
"""

# MODE 1 — Custom Date Range Study Plan Prompt
STUDY_PLAN_CUSTOM_RANGE_USER = """\
Student information for Custom Date Range Timetable:
- Start Date: {start_date}
- End Date: {end_date}
- Total Days: {num_days}
- Subjects to study: {subjects}
- Daily study hours available: {daily_hours}
- Goals: {goals}

CRITICAL RULES:
1. Generate study days specifically covering the date range from {start_date} to {end_date}.
2. Distribute the subjects intelligently across each day in the date range.
3. Every day item must have the exact calendar date (YYYY-MM-DD) and day name.
4. Do NOT ask for or require an exam date.

Generate a JSON study plan matching this exact structure:
{{
  "mode": "custom_range",
  "scheduleSummary": "Comprehensive study schedule from {start_date} to {end_date}",
  "weeklyGoalHours": {daily_hours} * {num_days},
  "days": [
    {{
      "date": "{start_date}",
      "dayName": "Monday ({start_date})",
      "focusSubject": "Subject Name",
      "theme": "Focus theme for the day",
      "color": "#0055DA",
      "blocks": [
        {{
          "time": "6:00 PM - 7:30 PM",
          "task": "Deep dive and problem solving",
          "xp": 40
        }}
      ]
    }}
  ]
}}
"""

# MODE 2 — Exam Preparation Plan Prompt
STUDY_PLAN_EXAM_PREP_USER = """\
Student information for Exam Preparation Countdown:
- Today's Date: {today} ({day_of_week})
- Target Exam Date: {exam_date}
- Days Remaining: {days_until_exam}
- Exam Subjects: {subjects}
- Daily study hours available: {daily_hours}
- Preparation Level: {prep_level}
- Target Grade: {target_grade}
- Weak Topics Priority: {weak_topics}

CRITICAL RULES:
1. Generate a countdown study plan starting from today ({today}) leading up to {exam_date}.
2. Allocate priority focus to weak topics ({weak_topics}) and core exam topics.
3. Include active recall, formula review, and practice mock tests as the exam date approaches.
4. NEVER generate study sessions for dates before {today}.

Generate a JSON study plan matching this exact structure:
{{
  "mode": "exam_prep",
  "scheduleSummary": "Exam countdown strategy for {exam_date} targeting grade {target_grade}",
  "weeklyGoalHours": {daily_hours} * 6,
  "days": [
    {{
      "date": "{today}",
      "dayName": "{day_of_week} ({today})",
      "focusSubject": "Subject Name",
      "theme": "Exam prep focus theme",
      "color": "#0055DA",
      "blocks": [
        {{
          "time": "6:00 PM - 7:30 PM",
          "task": "Exam topic mastery & active problem solving",
          "xp": 40
        }}
      ]
    }}
  ]
}}
"""

# Legacy fallback prompt template
STUDY_PLAN_USER = STUDY_PLAN_EXAM_PREP_USER

RECOMMENDATION_SYSTEM = """\
You are UniQuest Recommendation Engine. Based on the student's performance data, suggest learning resources.
Output ONLY valid JSON. No preamble.
"""

RECOMMENDATION_USER = """\
Student performance summary:
{performance_summary}

Suggest 3 personalized learning recommendations. Each should have:
- type: "lesson" | "revision" | "practice"
- title: short title
- subject: subject name
- reason: why this is recommended based on their actual performance (1-2 sentences)

Return a JSON array of recommendation objects.
"""

EXPLAIN_ANSWER_SYSTEM = """\
You are UniQuest Answer Explainer. Explain why an answer to a quiz question is correct or incorrect.
Be clear, educational, and concise. Do NOT generate new questions.
"""

EXPLAIN_ANSWER_USER = """\
Question: {question_text}
Options: {options_text}
Correct answer: {correct_answer} — "{correct_answer_text}"
Student's answer: {user_answer} — "{user_answer_text}"

1. Explain why the correct answer is right.
2. Explain why the student's answer was wrong (if different).
Keep the total response under 150 words.
"""
