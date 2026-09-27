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
  Layers,
  ExternalLink,
  GraduationCap,
  Youtube,
  FileCode,
  Terminal,
  Compass
} from 'lucide-react';
import { courseApi } from '../../services/courseApi';
import { ModuleAccordion } from '../../components/learning/CourseCard';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';

export const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' | 'resources'
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, resList] = await Promise.all([
          courseApi.getCourseById(courseId),
          courseApi.getCourseResources(courseId),
        ]);

        if (!isMounted) return;
        if (data) {
          setCourse(data);
          setResources(resList || []);
          if ((data.progress && data.progress > 0) || data.isEnrolled) {
            setEnrolled(true);
          }
        } else {
          setError('Course details could not be found.');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading course:', err);
        setError('Failed to load course details. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadCourse();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className="text-center py-20 bg-white border-2 border-brand-dark rounded-3xl shadow-brutal max-w-xl mx-auto my-10 p-8">
        <div className="animate-spin text-4xl mb-3">🛡️</div>
        <p className="font-bold text-brand-dark text-base">Loading Course Syllabus & Verified Resources...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-16 bg-white border-3 border-brand-dark rounded-3xl shadow-brutal max-w-xl mx-auto my-10 p-6">
        <div className="text-5xl mb-3">⚠️</div>
        <h3 className="font-black text-brand-dark text-xl">Course Unavailable</h3>
        <p className="text-xs font-semibold text-brand-dark/70 mt-1 mb-6">
          {error || 'Unable to retrieve syllabus for this course.'}
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/courses')} icon={ArrowLeft}>
          Back to Course Catalog
        </Button>
      </div>
    );
  }

  const handleEnroll = async () => {
    try {
      await courseApi.enrollCourse(course.id);
      setEnrolled(true);
    } catch (e) {
      console.warn('Enrollment error:', e);
      setEnrolled(true);
    }
  };

  const modules = Array.isArray(course.modules) ? course.modules : [];
  const totalLessons = modules.reduce((acc, m) => acc + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0);
  const firstLessonId = modules[0]?.lessons?.[0]?.id;
  const instructor = course.instructor || {
    name: 'Academic Department Faculty',
    role: 'Course Coordinator',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Faculty&backgroundColor=0055DA',
  };

  const getResourceTypeBadge = (type) => {
    if (type.includes('NPTEL')) return { bg: 'bg-amber-100 text-amber-900 border-amber-500', icon: '🎓' };
    if (type.includes('YouTube')) return { bg: 'bg-rose-100 text-rose-900 border-rose-500', icon: '🎥' };
    if (type.includes('Doc')) return { bg: 'bg-blue-100 text-blue-900 border-blue-500', icon: '📚' };
    if (type.includes('Practice')) return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-500', icon: '💻' };
    return { bg: 'bg-purple-100 text-purple-900 border-purple-500', icon: '📝' };
  };

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
              {course.code || 'CS-301'}
            </span>
            <span className="bg-brand-gold text-brand-dark text-xs font-black uppercase px-3 py-1 rounded-full border border-brand-dark">
              {course.department || course.subject || 'Engineering'}
            </span>
            <span className="bg-cream-100 text-brand-dark text-xs font-black uppercase px-3 py-1 rounded-full border border-brand-dark">
              {course.semester || 'Semester 4'}
            </span>
            <span className="bg-cyan-100 text-brand-dark text-xs font-black uppercase px-3 py-1 rounded-full border border-brand-dark">
              {course.difficulty || 'Intermediate'}
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
                <img
                  src={instructor.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Faculty&backgroundColor=0055DA'}
                  alt={instructor.name || 'Instructor'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-black text-xs text-brand-dark">{instructor.name || 'Faculty Professor'}</h4>
                <p className="text-[11px] font-bold text-brand-dark/60">{instructor.role || 'Course Coordinator'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-brand-dark/70">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {course.estimatedHours || 16} Hours
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> {modules.length} Modules ({totalLessons || course.lessonCount || 0} Lessons)
              </span>
              <span className="flex items-center gap-1 text-brand-pink font-black">
                <Zap className="w-3.5 h-3.5 fill-brand-pink" /> +{course.totalXP || 450} XP
              </span>
            </div>
          </div>
        </div>

        {/* Action / Progress Box */}
        <div className="w-full lg:w-80 bg-cream-100 border-2 border-brand-dark rounded-2xl p-5 shadow-brutal flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs font-black">
            <span>Course Progress</span>
            <span className="text-brand-green">{course.progress || 0}%</span>
          </div>

          <ProgressBar progress={course.progress || 0} max={100} color="green" height="md" />

          {enrolled ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full font-black"
              onClick={() => {
                if (firstLessonId) {
                  navigate(`/lessons/${firstLessonId}`);
                } else if (modules.length > 0) {
                  navigate(`/lessons/les-1-1`);
                }
              }}
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

      {/* Tabs Switcher: Curriculum vs Recommended Resources */}
      <div className="flex items-center gap-3 border-b-2 border-cream-200 pb-2">
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm transition-all select-none cursor-pointer ${
            activeTab === 'curriculum'
              ? 'bg-brand-dark text-white shadow-brutal-sm'
              : 'bg-white text-brand-dark/70 hover:text-brand-dark border border-brand-dark/30'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curriculum & Modules ({modules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm transition-all select-none cursor-pointer ${
            activeTab === 'resources'
              ? 'bg-brand-gold text-brand-dark shadow-brutal-sm border-2 border-brand-dark'
              : 'bg-white text-brand-dark/70 hover:text-brand-dark border border-brand-dark/30'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Recommended Learning Resources ({resources.length})</span>
        </button>
      </div>

      {/* Tab 1: Curriculum & Modules */}
      {activeTab === 'curriculum' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-2xl text-brand-dark">Course Curriculum & Modules</h2>
            <span className="text-xs font-bold text-brand-dark/60">
              {modules.length} Checkpoint Modules
            </span>
          </div>

          {modules.length > 0 ? (
            <div className="flex flex-col gap-4">
              {modules.map((m, index) => (
                <ModuleAccordion
                  key={m.id || index}
                  module={m}
                  courseId={course.id}
                  defaultOpen={index === 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border-2 border-brand-dark rounded-2xl p-6 shadow-brutal">
              <span className="text-4xl block mb-2">📚</span>
              <h4 className="font-black text-base text-brand-dark">Curriculum Units in Preparation</h4>
              <p className="text-xs font-medium text-brand-dark/60 mt-1">
                Modules are currently being synced with your university syllabus.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Verified Real-World Learning Resources */}
      {activeTab === 'resources' && (
        <div className="flex flex-col gap-6">
          <div className="p-5 bg-cream-100 border-2 border-brand-dark rounded-3xl shadow-brutal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-lg text-brand-dark flex items-center gap-2">
                <span>🎓</span> Academic & Competitive Resource Hub
              </h3>
              <p className="text-xs font-medium text-brand-dark/75 mt-0.5 max-w-2xl">
                Verified external references for <span className="font-black">{course.title}</span>, curated from NPTEL IIT lectures, top YouTube playlists, official language docs, and competitive practice platforms.
              </p>
            </div>
            <span className="text-xs font-black bg-brand-gold px-3 py-1.5 rounded-xl border border-brand-dark shadow-brutal-sm shrink-0">
              Verified Links
            </span>
          </div>

          {resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((res) => {
                const badge = getResourceTypeBadge(res.type);
                return (
                  <div
                    key={res.id}
                    className="bg-white border-3 border-brand-dark rounded-3xl p-6 shadow-brutal flex flex-col justify-between gap-5 hover:translate-x-0.5 hover:-translate-y-0.5 transition-transform"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.icon} {res.type}
                        </span>
                        <span className="text-[11px] font-bold text-brand-dark/60">
                          {res.difficulty || 'All Levels'}
                        </span>
                      </div>

                      <h4 className="font-black text-lg text-brand-dark leading-snug">
                        {res.title}
                      </h4>

                      <div className="flex items-center gap-2 text-xs font-bold text-brand-blue">
                        <span>🏛️ {res.provider}</span>
                        {res.instructor && <span>• {res.instructor}</span>}
                      </div>

                      <p className="text-xs font-medium text-brand-dark/80 leading-relaxed">
                        {res.description}
                      </p>

                      {Array.isArray(res.topics) && res.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {res.topics.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-black uppercase bg-cream-50 text-brand-dark/70 border border-brand-dark/20 px-2 py-0.5 rounded-md"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t-2 border-cream-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-brand-dark/50">External Link</span>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-brand-blue text-white text-xs font-black px-4 py-2 rounded-xl border border-brand-dark shadow-brutal-sm hover:bg-brand-blue/90 cursor-pointer"
                      >
                        <span>Open Resource</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border-2 border-brand-dark rounded-2xl p-6 shadow-brutal">
              <span className="text-4xl block mb-2">🔍</span>
              <h4 className="font-black text-base text-brand-dark">No specific resources found</h4>
              <p className="text-xs font-medium text-brand-dark/60 mt-1">
                Resource packages are being indexed for this course topic.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
