import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles, BookOpen } from 'lucide-react';
import { courseApi } from '../../services/courseApi';
import { CourseCard } from '../../components/learning/CourseCard';
import { Button } from '../../components/common/Button';

export const CoursesListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  useEffect(() => {
    const loadCourses = async () => {
      const data = await courseApi.getCourses();
      setCourses(data);
    };
    loadCourses();
  }, []);

  const categories = ['All', 'Computer Science', 'Artificial Intelligence', 'Algorithms'];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-cream-100 border border-brand-dark px-3 py-1 rounded-full text-xs font-black text-brand-dark mb-2">
            <BookOpen className="w-3.5 h-3.5" /> University Syllabus Modules
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            Course Catalog & Quests
          </h1>
          <p className="text-xs sm:text-sm font-medium text-brand-dark/70 mt-1">
            Enroll in structured, semester-aligned university courses and earn XP for every completed checkpoint.
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-4 sm:p-6 shadow-brutal flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black border-2 border-brand-dark transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand-blue text-white shadow-brutal-sm scale-105'
                  : 'bg-cream-100 text-brand-dark hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects..."
            className="w-full bg-cream-50 text-brand-dark text-xs font-medium border-2 border-brand-dark rounded-xl pl-10 pr-4 py-2 shadow-brutal-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-cream-100 border-2 border-dashed border-brand-dark/30 rounded-3xl">
          <span className="text-5xl">🔍</span>
          <h3 className="text-xl font-black text-brand-dark mt-3">No Courses Found</h3>
          <p className="text-xs font-medium text-brand-dark/60 mt-1">
            Try adjusting your search terms or selecting a different category.
          </p>
        </div>
      )}
    </div>
  );
};
