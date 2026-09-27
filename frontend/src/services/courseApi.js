import { apiClient } from './api';
import { MOCK_COURSES } from '../data/mockCourses';
import { storage } from '../utils/storage';

const DEFAULT_INSTRUCTOR = {
  name: 'Faculty Instructor',
  role: 'Department Head',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Faculty&backgroundColor=0055DA',
  university: 'UniQuest Faculty',
};

const normalizeCourse = (raw, modules = [], progress = null) => {
  if (!raw) return null;

  const subjectName = raw.subject || 'Computer Science';
  const code = raw.code || `${subjectName.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'CS'}-301`;

  // Normalize modules if provided
  const normalizedModules = (modules || raw.modules || []).map((m, mIdx) => ({
    id: m.id || `mod-${mIdx + 1}`,
    title: m.title || `Module ${mIdx + 1}`,
    description: m.description || '',
    duration: m.duration || `${(m.lessons?.length || 1) * 15} mins`,
    xp: m.xp || (m.lessons?.length || 1) * 20,
    lessons: (m.lessons || []).map((l, lIdx) => ({
      id: l.id || `les-${mIdx + 1}-${lIdx + 1}`,
      title: l.title || `Lesson ${lIdx + 1}`,
      duration: l.duration || `${l.duration_minutes || 15} mins`,
      durationMinutes: l.duration_minutes || 15,
      xp: l.xp || l.xp_reward || 20,
      completed: l.completed || false,
      content: l.content || `# ${l.title || 'Lesson Content'}\n\nKey learning objectives and principles for this module.`,
    })),
    quiz: m.quiz || null,
  }));

  const totalLessonsFromMods = normalizedModules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const lessonCount = raw.lesson_count !== undefined ? raw.lesson_count : totalLessonsFromMods;
  const moduleCount = raw.module_count !== undefined ? raw.module_count : normalizedModules.length;
  const totalXP = raw.totalXP || raw.total_xp || (lessonCount > 0 ? lessonCount * 25 : 300);
  const estimatedHours = raw.estimatedHours || raw.estimated_hours || Math.max(4, Math.round(lessonCount * 1.5));
  const progressVal = progress?.completion_percentage !== undefined
    ? Math.round(progress.completion_percentage)
    : (raw.progress || 0);

  return {
    id: raw.id,
    code,
    title: raw.title,
    subtitle: raw.subtitle || `Comprehensive University Curriculum on ${subjectName}`,
    description: raw.description || `Master core university foundations of ${raw.title}.`,
    subject: subjectName,
    category: raw.category || subjectName,
    department: raw.department || 'Computer Engineering',
    semester: raw.semester || 'Semester 4',
    difficulty: raw.difficulty ? (raw.difficulty.charAt(0).toUpperCase() + raw.difficulty.slice(1)) : 'Intermediate',
    thumbnail: raw.thumbnail || raw.thumbnail_url || 'https://images.unsplash.com/photo-1516116211227-bbc13c74a367?w=800',
    color: raw.color || '#0055DA',
    accentColor: raw.accentColor || '#76D2DB',
    totalXP,
    totalCoins: raw.totalCoins || 120,
    estimatedHours,
    enrolledCount: raw.enrolled_count !== undefined ? raw.enrolled_count : (raw.enrolledCount || 850),
    progress: progressVal,
    instructor: raw.instructor || DEFAULT_INSTRUCTOR,
    modules: normalizedModules,
    moduleCount,
    lessonCount,
  };
};

export const courseApi = {
  getCourses: async () => {
    try {
      const response = await apiClient.get('/courses/');
      const backendCourses = response.data;
      if (Array.isArray(backendCourses) && backendCourses.length > 0) {
        return backendCourses.map(c => normalizeCourse(c));
      }
      return storage.get('courses_data', MOCK_COURSES);
    } catch (e) {
      console.warn('getCourses fallback to mock:', e.message);
      return storage.get('courses_data', MOCK_COURSES);
    }
  },

  getCourseById: async (courseId) => {
    try {
      // Parallel fetch course metadata, modules with lessons, and user progress
      const [courseRes, modulesRes, progressRes] = await Promise.allSettled([
        apiClient.get(`/courses/${courseId}`),
        apiClient.get(`/courses/${courseId}/modules`),
        apiClient.get(`/courses/${courseId}/progress`),
      ]);

      if (courseRes.status === 'fulfilled' && courseRes.value.data) {
        const rawCourse = courseRes.value.data;
        const modules = modulesRes.status === 'fulfilled' ? modulesRes.value.data : [];
        const progress = progressRes.status === 'fulfilled' ? progressRes.value.data : null;

        // If backend returned modules from /courses/{id}/modules, use them
        // If backend returned 0 modules, check if mock data has corresponding subject modules
        let resolvedModules = modules;
        if ((!resolvedModules || resolvedModules.length === 0) && rawCourse.title) {
          const mockMatch = MOCK_COURSES.find(
            mc => mc.id === courseId || mc.title.toLowerCase() === rawCourse.title.toLowerCase()
          );
          if (mockMatch && mockMatch.modules) {
            resolvedModules = mockMatch.modules;
          }
        }

        return normalizeCourse(rawCourse, resolvedModules, progress);
      }

      throw new Error('Course not found on backend');
    } catch (e) {
      console.warn('getCourseById fallback to mock:', e.message);
      const courses = storage.get('courses_data', MOCK_COURSES);
      return courses.find(c => c.id === courseId) || courses[0];
    }
  },

  getCourseModules: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/modules`);
      return response.data;
    } catch (e) {
      console.warn('getCourseModules fallback:', e.message);
      return [];
    }
  },

  getCourseProgress: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/progress`);
      return response.data;
    } catch (e) {
      return null;
    }
  },

  getLesson: async (lessonId) => {
    try {
      const response = await apiClient.get(`/lessons/${lessonId}`);
      const raw = response.data;
      if (raw) {
        // Find module/course metadata
        let courseTitle = 'Course Lesson';
        let courseId = '';
        let moduleTitle = 'Curriculum Module';

        if (raw.module_id) {
          try {
            const modRes = await apiClient.get(`/modules/${raw.module_id}`);
            if (modRes.data) {
              moduleTitle = modRes.data.title;
              courseId = modRes.data.course_id;
              if (courseId) {
                const cRes = await apiClient.get(`/courses/${courseId}`);
                if (cRes.data) courseTitle = cRes.data.title;
              }
            }
          } catch (_) {}
        }

        return {
          id: raw.id,
          title: raw.title,
          content: raw.content || `# ${raw.title}\n\nMaster the core concepts and principles of this lesson.`,
          duration: `${raw.duration_minutes || 15} mins`,
          durationMinutes: raw.duration_minutes || 15,
          xp: raw.xp_reward || 20,
          courseId: courseId || raw.course_id || '',
          courseTitle: courseTitle || raw.course_title || 'Course Lesson',
          moduleId: raw.module_id,
          moduleTitle: moduleTitle || 'Curriculum Module',
          completed: false,
        };
      }
      throw new Error('Lesson not found on backend');
    } catch (e) {
      console.warn('getLesson fallback to mock:', e.message);
      const courses = storage.get('courses_data', MOCK_COURSES);
      for (const c of courses) {
        for (const m of (c.modules || [])) {
          const lesson = (m.lessons || []).find(l => l.id === lessonId);
          if (lesson) {
            return {
              ...lesson,
              courseId: c.id,
              courseTitle: c.title,
              moduleId: m.id,
              moduleTitle: m.title,
            };
          }
        }
      }
      return null;
    }
  },

  startLesson: async (lessonId) => {
    try {
      const response = await apiClient.post(`/lessons/${lessonId}/start`);
      return response.data;
    } catch (e) {
      return { session_id: null };
    }
  },

  completeLesson: async (lessonId) => {
    try {
      const response = await apiClient.post(`/lessons/${lessonId}/complete`);
      const data = response.data;
      return {
        success: true,
        xpEarned: data.xp_earned ?? data.xpEarned ?? 20,
        alreadyCompleted: data.already_completed ?? false,
        lessonId,
      };
    } catch (e) {
      console.warn('completeLesson fallback:', e.message);
      return { success: true, xpEarned: 20, lessonId };
    }
  },

  getCourseResources: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/resources`);
      return response.data?.resources || [];
    } catch (e) {
      console.warn('getCourseResources fallback:', e.message);
      return [];
    }
  },

  searchResources: async (subject = '') => {
    try {
      const response = await apiClient.get(`/courses/resources/search?subject=${encodeURIComponent(subject)}`);
      return response.data || [];
    } catch (e) {
      return [];
    }
  },
};
