import { apiClient } from './api';
import { MOCK_COURSES } from '../data/mockCourses';
import { storage } from '../utils/storage';

export const courseApi = {
  getCourses: async () => {
    try {
      const response = await apiClient.get('/courses/');
      return response.data;
    } catch (e) {
      console.warn('getCourses fallback to mock:', e.message);
      return storage.get('courses_data', MOCK_COURSES);
    }
  },

  getCourseById: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
      return response.data;
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
      return response.data;
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
      // Normalize response: backend returns { message, xp_earned, already_completed }
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

  enrollCourse: async (courseId) => {
    try {
      const response = await apiClient.post(`/courses/${courseId}/enroll`);
      return { success: true, ...response.data };
    } catch (e) {
      // 409 means already enrolled — treat as success
      if (e.response?.status === 409) {
        return { success: true, courseId, alreadyEnrolled: true };
      }
      console.warn('enrollCourse fallback:', e.message);
      return { success: false, error: e.message };
    }
  },
};
