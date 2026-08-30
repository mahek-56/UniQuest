import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Users,
  Zap,
  Star,
  Award,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';
import { courseApi } from '../../services/courseApi';
import { ModuleAccordion } from '../../components/learning/CourseCard';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';

export const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      const data = await courseApi.getCourseById(courseId);
      setCourse(data);
      if (data?.progress > 0) setEnrolled(true);
    };
    loadCourse();
  }, [courseId]);

  if (!course) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin text-4xl mb-3">🛡️</div>
        <p className="font-bold text-brand-dark">Loading Course Syllabus...</p>
      </div>
    );
  }

  const handleEnroll = async () => {
    await courseApi.enrollCourse(course.id);
    setEnrolled(true);
  };

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-1.5 text-xs font-black text-brand-dark/70 hover:text-brand-dark cursor-pointer bg-cream-100 border border-brand-dark px-3 py-1.5 rounded-xl shadow-brutal-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </button>
      </div>

      {/* Course Hero Banner */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal-lg flex flex-col lg:flex-row gap-8 items-start justify-between">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-brand-dark text-white text-xs font-black uppercase px-3 py-1 rounded-full">
              {course.code}
            </span>
            <span className="bg-brand-gold text-brand-dark text-xs font-black uppercase px-3 py-1 rounded-full border border-brand-dark">
              {course.department}
            </span>
            <span className="bg-cream-100 text-brand-dark text-xs font-black uppercase px-3 py-1 rounded-full border border-brand-dark">
              {course.semester}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark tracking-tight">
            {course.title}
          </h1>

          <p className="text-sm sm:text-base font-medium text-brand-dark/80 max-w-2xl leading-relaxed">
            {course.description}
          </p>

          {/* Instructor & Meta */}
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-cream-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl border border-brand-dark bg-cream-200 overflow-hidden">
                <img src={course.instructor.avatar} alt={course.instructor.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-black text-xs text-brand-dark">{course.instructor.name}</h4>
                <p className="text-[11px] font-bold text-brand-dark/60">{course.instructor.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-brand-dark/70">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {course.estimatedHours} Hours
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> {course.modules.length} Modules ({totalLessons} Lessons)
              </span>
              <span className="flex items-center gap-1 text-brand-pink font-black">
                <Zap className="w-3.5 h-3.5 fill-brand-pink" /> +{course.totalXP} XP
              </span>
            </div>
          </div>
        </div>

        {/* Action / Progress Box */}
        <div className="w-full lg:w-80 bg-cream-100 border-2 border-brand-dark rounded-2xl p-5 shadow-brutal flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs font-black">
            <span>Course Progress</span>
            <span className="text-brand-green">{course.progress}%</span>
          </div>

          <ProgressBar progress={course.progress} max={100} color="green" height="md" />

          {enrolled ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full font-black"
              onClick={() => navigate(`/lessons/${course.modules[0].lessons[0].id}`)}
              icon={Sparkles}
            >
              Resume Course
            </Button>
          ) : (
            <Button
              variant="gold"
              size="lg"
              className="w-full font-black"
              onClick={handleEnroll}
            >
              Enroll & Start Quest
            </Button>
          )}

          <p className="text-[11px] font-semibold text-center text-brand-dark/60">
            Earn coins, unlock badges, and master this university curriculum.
          </p>
        </div>
      </div>

      {/* Modules & Syllabus Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-2xl text-brand-dark">Course Curriculum & Modules</h2>
          <span className="text-xs font-bold text-brand-dark/60">
            {course.modules.length} Checkpoint Modules
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {course.modules.map((m, index) => (
            <ModuleAccordion
              key={m.id}
              module={m}
              courseId={course.id}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
