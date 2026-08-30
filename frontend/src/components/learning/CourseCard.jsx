import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';

export const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const {
    id,
    code,
    title,
    subtitle,
    category,
    department,
    difficulty,
    instructor,
    thumbnail,
    totalXP,
    estimatedHours,
    enrolledCount,
    progress = 0,
    color = "#0055DA",
  } = course;

  return (
    <div
      onClick={() => navigate(`/courses/${id}`)}
      className="group bg-white border-2 border-brand-dark rounded-3xl overflow-hidden shadow-brutal hover:-translate-y-1.5 hover:shadow-brutal-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Thumbnail & Badges */}
      <div className="relative h-44 sm:h-48 overflow-hidden border-b-2 border-brand-dark bg-cream-100">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="bg-brand-dark text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-full border border-white/40 shadow-brutal-sm">
            {code}
          </span>
          <span className="bg-cream-50 text-brand-dark text-[11px] font-black uppercase px-2.5 py-1 rounded-full border border-brand-dark shadow-brutal-sm">
            {difficulty}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 bg-brand-gold text-brand-dark text-xs font-black px-3 py-1 rounded-xl border border-brand-dark shadow-brutal-sm flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 fill-brand-pink text-brand-pink" />
          <span>+{totalXP} XP</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-brand-blue mb-1">
            {department}
          </div>
          <h3 className="font-black text-lg sm:text-xl text-brand-dark group-hover:text-brand-blue transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-xs font-medium text-brand-dark/70 mt-1 line-clamp-2">
            {subtitle}
          </p>
        </div>

        {/* Metadata & Progress */}
        <div className="pt-3 border-t border-cream-200 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-brand-dark/70">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {estimatedHours}h
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {enrolledCount} enrolled
            </span>
          </div>

          {progress > 0 ? (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-black text-brand-dark">
                <span>Course Progress</span>
                <span className="text-brand-green">{progress}%</span>
              </div>
              <ProgressBar progress={progress} max={100} color="green" height="sm" />
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-black text-brand-dark/50">Not Started</span>
              <span className="text-xs font-black text-brand-blue flex items-center gap-0.5">
                Enroll Now <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ModuleAccordion = ({ module, courseId, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const navigate = useNavigate();

  const { id, title, description, duration, xp, lessons = [], quiz } = module;
  const completedLessons = lessons.filter(l => l.completed).length;

  return (
    <div className="bg-white border-2 border-brand-dark rounded-2xl shadow-brutal-sm overflow-hidden mb-4">
      {/* Accordion Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-cream-50 transition-colors select-none"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand-gold border-2 border-brand-dark flex items-center justify-center font-black text-sm shrink-0">
            {completedLessons === lessons.length ? "✓" : completedLessons}
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-base text-brand-dark truncate">{title}</h4>
            <p className="text-xs font-medium text-brand-dark/60 line-clamp-1 mt-0.5">
              {lessons.length} Lessons • {duration} • +{xp} XP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-black px-2.5 py-1 bg-cream-100 rounded-full border border-brand-dark">
            {completedLessons}/{lessons.length} Done
          </span>
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 pt-0 border-t border-cream-200 bg-cream-50/40 flex flex-col gap-2.5">
          <p className="text-xs font-medium text-brand-dark/70 my-2">{description}</p>

          <div className="flex flex-col gap-2">
            {lessons.map((l, index) => (
              <div
                key={l.id}
                onClick={() => navigate(`/lessons/${l.id}`)}
                className="flex items-center justify-between p-3 rounded-xl border border-brand-dark bg-white hover:bg-cream-100 cursor-pointer shadow-brutal-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border border-brand-dark flex items-center justify-center text-xs font-black ${
                      l.completed ? 'bg-brand-green text-brand-dark' : 'bg-cream-100 text-brand-dark/50'
                    }`}
                  >
                    {l.completed ? '✓' : index + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-brand-dark">{l.title}</h5>
                    <span className="text-[11px] text-brand-dark/60">{l.duration}</span>
                  </div>
                </div>

                <span className="text-xs font-black text-brand-pink flex items-center gap-0.5">
                  <Zap className="w-3 h-3 fill-brand-pink" /> +{l.xp} XP
                </span>
              </div>
            ))}

            {/* Module Quiz */}
            {quiz && (
              <div
                onClick={() => navigate(`/quizzes/${quiz.id}`)}
                className="flex items-center justify-between p-3.5 rounded-xl border-2 border-brand-dark bg-brand-gold/30 hover:bg-brand-gold/60 cursor-pointer shadow-brutal-sm transition-all mt-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-gold border border-brand-dark flex items-center justify-center text-sm shadow-brutal-sm">
                    🎯
                  </div>
                  <div>
                    <h5 className="font-black text-sm text-brand-dark">{quiz.title}</h5>
                    <span className="text-[11px] font-bold text-brand-dark/70">
                      {quiz.questionsCount} Questions • Pass {quiz.passScore}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-brand-dark bg-brand-gold px-2.5 py-1 rounded-lg border border-brand-dark">
                    +{quiz.xpReward} XP
                  </span>
                  <ChevronRight className="w-4 h-4 text-brand-dark" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
