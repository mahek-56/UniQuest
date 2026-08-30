export const MOCK_ANALYTICS = {
  overview: {
    totalStudyHours: 42.5,
    studyTargetHours: 50,
    quizzesCompleted: 14,
    averageQuizAccuracy: 88,
    lessonsCompleted: 28,
    activeStreakDays: 7,
    totalXP: 1240,
    coinsEarned: 480
  },
  weeklyXP: [
    { day: "Mon", xp: 140, target: 100 },
    { day: "Tue", xp: 190, target: 100 },
    { day: "Wed", xp: 210, target: 100 },
    { day: "Thu", xp: 160, target: 100 },
    { day: "Fri", xp: 240, target: 100 },
    { day: "Sat", xp: 180, target: 100 },
    { day: "Sun", xp: 120, target: 100 }
  ],
  studyTimeBySubject: [
    { name: "DBMS", hours: 14.5, fill: "#0055DA" },
    { name: "Operating Systems", hours: 12.0, fill: "#FF0052" },
    { name: "Machine Learning", hours: 8.5, fill: "#00C68D" },
    { name: "Algorithms (DSA)", hours: 7.5, fill: "#FFD400" }
  ],
  subjectMasteryRadar: [
    { subject: "Relational DBs", score: 88, fullMark: 100 },
    { subject: "OS Concurrency", score: 75, fullMark: 100 },
    { subject: "Supervised ML", score: 82, fullMark: 100 },
    { subject: "Graph Algorithms", score: 92, fullMark: 100 },
    { subject: "Computer Networks", score: 65, fullMark: 100 }
  ],
  accuracyTrends: [
    { week: "W1", accuracy: 72 },
    { week: "W2", accuracy: 78 },
    { week: "W3", accuracy: 84 },
    { week: "W4", accuracy: 88 }
  ],
  strongTopics: [
    { topic: "Dijkstra & Graph Shortest Path", subject: "Algorithms", accuracy: 96, status: "Mastered" },
    { topic: "Relational Algebra & Selection", subject: "DBMS", accuracy: 94, status: "Mastered" },
    { topic: "Process States & PCB", subject: "OS", accuracy: 90, status: "Strong" }
  ],
  weakTopics: [
    { topic: "BCNF vs 3NF Decomposition", subject: "DBMS", accuracy: 58, status: "Needs Practice", action: "Revise 3NF rules and run practice quiz" },
    { topic: "Banker's Algorithm Safe State Checks", subject: "OS", accuracy: 62, status: "Needs Practice", action: "Ask AI Tutor for step-by-step matrix simulation" },
    { topic: "TCP Congestion Control (Reno/Tahoe)", subject: "Networks", accuracy: 65, status: "Needs Review", action: "Complete module lesson on transport protocols" }
  ],
  mlPrediction: {
    predictedCategory: "Strong", // "Strong" | "Average" | "At Risk"
    confidence: 0.88,
    classProbabilities: {
      Strong: 0.88,
      Average: 0.09,
      At_Risk: 0.03
    },
    riskScore: 12, // out of 100
    model: "RandomForestClassifier (v2.4)",
    factors: [
      { name: "Quiz Accuracy (88%)", impact: "Very Positive", weight: "+35%" },
      { name: "Consistent 7-day Streak", impact: "Very Positive", weight: "+28%" },
      { name: "Regular SM-2 Spaced Revisions", impact: "Positive", weight: "+20%" },
      { name: "Weakness in BCNF Decomposition", impact: "Needs Attention", weight: "-12%" }
    ],
    predictedSemesterGrade: "A / A+",
    summary: "High learning momentum with robust conceptual retention. Targeted review of BCNF and Banker's Algorithm will cement top 5% exam performance."
  }
};
