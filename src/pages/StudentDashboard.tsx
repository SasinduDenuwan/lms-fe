// StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Library,
  Clock,
  Flame,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Play,
  Download,
  Star,
  Menu,
  X,
  Home
} from 'lucide-react';
import { useAuth } from '../context/authContext';
import { getUserProfile } from '../services/students';
import { getCourseForStudentByUserID } from '../services/course';

const backgroundImages = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1600',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600'
];

interface Course {
  id: string;
  title: string;
  instructor: string;
  price: number;
  rating: number;
  students: number;
  duration: string;
  level: string;  
  category: string;
  image: string;
  description: string;
  objectives?: string[];
  requirements?: string[];
  lessons?: number;
  projects?: number;
  enrolledDate?: string;
  lastAccessed?: string;
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
  isLocked: boolean;
  resources?: {
    type: 'pdf' | 'zip' | 'doc';
    name: string;
    url: string;
    size: string;
  }[];
}

interface Resource {
  id: string;
  courseId: string;
  title: string;
  type: 'pdf' | 'video' | 'zip' | 'code' | 'document';
  category: string;
  size: string;
  uploadDate: string;
  course: string;
  downloadUrl: string;
  description: string;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'my-courses' | 'resources'>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isCoursePlayerOpen, setIsCoursePlayerOpen] = useState<boolean>(false);

  const [activeSidebar, setActiveSidebar] = useState<'lessons' | 'resources'>('lessons');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [currentBg, setCurrentBg] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    // Handle standard YouTube links
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    // Return original if it doesn't match (could be already an embed link or another provider)
    return url;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsVisible(true);
    // Fetch full profile data to ensure we have firstname/lastname
    getUserProfile().then(res => {
         if(res?.data) setProfile(res.data);
    }).catch(err => console.error("Failed to load profile", err));

    const token = localStorage.getItem('accessToken');
    let userId = user?._id;

    if (!userId && token) {
      try {
        const decoded: any = jwtDecode(token);
        userId = decoded.id || decoded._id || decoded.sub;
        console.log("Decoded User ID from token:", userId);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }

    console.log("DEBUG: Using User ID:", userId);

    if (userId) {
      console.log("DEBUG: Fetching courses for user:", userId);
      getCourseForStudentByUserID(userId).then(res => {
        console.log("DEBUG: API Response:", res);
        if (res?.data) {
          console.log("DEBUG: Raw Course Data:", res.data);
          const fetchedCourses = res.data.map((c: any) => ({
            id: c._id,
            title: c.title,
            instructor: c.instructor?.name || 'Unknown Instructor',
            price: c.price,
            rating: 5, // Default rating
            students: c.students,
            duration: `${c.duration} hours`,
            level: c.level.charAt(0).toUpperCase() + c.level.slice(1).toLowerCase(),
            category: c.category,
            image: c.image,
            description: c.description,
            enrolledDate: c.createdAt.split('T')[0],
            lastAccessed: c.updatedAt.split('T')[0],
            lessons: c.lessons,
            projects: 0
          }));
          console.log("DEBUG: Mapped Courses:", fetchedCourses);
          setEnrolledCourses(fetchedCourses);

          const fetchedLessons: Lesson[] = [];
          const fetchedResources: Resource[] = [];

          res.data.forEach((c: any) => {
             // Map videos to lessons
             if (c.videos) {
                c.videos.forEach((v: any) => {
                    fetchedLessons.push({
                        id: v._id,
                        courseId: c._id,
                        title: v.video_title,
                        duration: '00:00', // Backend doesn't provide video duration
                        videoUrl: v.video_url,
                        description: v.video_title,
                        isLocked: false // Assuming purchased courses have unlocked videos
                    });
                });
             }
             
             // Map resources
             if (c.resources) {
                 c.resources.forEach((r: any) => {
                     fetchedResources.push({
                         id: r._id,
                         courseId: c._id,
                         title: r.resource_title,
                         type: 'document', // Default type
                         category: c.category,
                         size: '',
                         uploadDate: r.createdAt.split('T')[0],
                         course: c.title,
                         downloadUrl: r.resource_url,
                         description: r.resource_title
                     });
                 });
             }
          });
          
          console.log("DEBUG: Mapped Lessons:", fetchedLessons);
          console.log("DEBUG: Mapped Resources:", fetchedResources);

          setLessons(fetchedLessons);
          setResources(fetchedResources);
        } else {
            console.log("DEBUG: No data in response or invalid structure", res);
        }
      }).catch(err => console.error("DEBUG: Failed to load courses", err));
    } else {
        console.log("DEBUG: User ID is missing, skipping fetch. User Object:", user);
    }
  }, [user]);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: <Home size={24} />, color: 'indigo' },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={24} />, color: 'teal' },
    { id: 'my-courses', label: 'My Courses', icon: <BookOpen size={24} />, color: 'blue' },
    { id: 'resources', label: 'Resources', icon: <Library size={24} />, color: 'purple' },
  ];

  const openCoursePlayer = (course: Course) => {
    setSelectedCourse(course);
    // Find lessons for this specific course
    const courseLessons = lessons.filter(l => l.courseId === course.id);
    const firstUnlockedLesson = courseLessons.find(lesson => !lesson.isLocked) || courseLessons[0];
    setCurrentLesson(firstUnlockedLesson || null);
    setIsCoursePlayerOpen(true);
  };



  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'video': return '🎬';
      case 'zip': return '📦';
      case 'code': return '💻';
      case 'document': return '📝';
      default: return '📎';
    }
  };



  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 to-blue-50 flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImages[currentBg]})` }}
          />
        </AnimatePresence>
        {/* Animated floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: isVisible ? [0.3, 0.6, 0.3] : 0,
                scale: isVisible ? [1, 1.2, 1] : 0,
                x: isVisible ? [0, 100, 0] : 0,
                y: isVisible ? [0, -50, 0] : 0,
              }}
              transition={{
                duration: 8 + item * 2,
                repeat: Infinity,
                delay: item * 0.5,
                ease: "easeInOut"
              }}
              className={`absolute w-${item % 2 === 0 ? '4' : '6'} h-${item % 2 === 0 ? '4' : '6'} rounded-full bg-linear-to-r from-teal-400 to-blue-400 opacity-30`}
              style={{
                left: `${(item * 15) % 100}%`,
                top: `${(item * 20) % 100}%`,
              }}
            />
          ))}
        </div>
      </div>

       {/* Sidebar Backdrop for Mobile */}
       <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Student Sidebar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-white/80 backdrop-blur-xl border-r border-white/20 flex flex-col w-80 transition-all duration-300 fixed h-full z-40 shadow-xl ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* User Profile */}
        <div className="p-6 border-b border-white/20 flex justify-between items-center">
            <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/profile')}>
                <div className="relative">
                    <div className="w-14 h-14 bg-linear-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {user?.firstname?.[0] || 'S'}{user?.lastname?.[0] || ''}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-400 rounded-full border-2 border-white"></div>
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 truncate text-lg">{profile?.firstname || user?.firstname || 'Student'} {profile?.lastname || user?.lastname || ''}</div>
                    <div className="text-sm text-teal-600 truncate">Student</div>
                </motion.div>
            </div>
             <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100/50 text-gray-600">
                <X size={24} />
            </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-6 space-y-3">
          {navigationItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                  if (item.id === 'home') {
                      navigate('/');
                  } else {
                      setActiveTab(item.id as any);
                  }
                  setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-semibold transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-white shadow-lg border border-white/50 text-gray-800'
                  : 'text-gray-600 hover:bg-white/50 hover:shadow-md'
              }`}
            >
              <span className="text-gray-600">{item.icon}</span>
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 text-left text-lg">
                  {item.label}
              </motion.span>
            </motion.button>
          ))}
        </nav>
        <div className="px-6 pb-2">
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  localStorage.removeItem('firstname');
                  localStorage.removeItem('userRole');
                  localStorage.removeItem('email');
                  navigate('/login');
              }}
              className="w-full flex items-center space-x-4 p-4 rounded-2xl font-semibold transition-all duration-300 text-red-500 hover:bg-red-50 hover:shadow-md"
            >
              <span className="text-gray-600"><LogOut size={24} /></span>
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 text-left text-lg">
                  Logout
              </motion.span>
            </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 transition-all duration-300 lg:ml-80 relative z-10 w-full">
        {/* Top Header */}
        <header className="bg-white/60 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-6">
             <div className="flex items-center space-x-4">
                 <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-white/50 text-gray-600 transition-colors">
                  <Menu size={28} />
               </button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-br from-teal-600 to-indigo-600 bg-clip-text text-transparent capitalize">
                    {activeTab.replace('-', ' ')}
                  </h1>
                  <p className="text-gray-500 text-lg mt-2 hidden md:block">
                    {activeTab === 'dashboard' && 'Welcome to your learning dashboard'}
                    {activeTab === 'my-courses' && 'Continue your learning journey'}
                    {activeTab === 'resources' && 'Access learning materials'}
                  </p>
                </div>
            </div>
            {/* Header Actions */}
             <div className="flex items-center space-x-4">
                 <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 shadow-xs">
                     <span className="text-sm font-bold text-gray-700 hidden md:block">
                        {profile?.firstname || user?.firstname || 'Student'}
                     </span>
                     <div className="w-8 h-8 bg-linear-to-br from-teal-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {profile?.firstname?.[0] || user?.firstname?.[0] || 'S'}
                     </div>
                 </div>
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Welcome Section */}
                <div className="bg-linear-to-r from-teal-500 to-blue-500 rounded-[2.5rem] shadow-2xl p-8 md:p-12 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-60 h-60 bg-black/10 rounded-full blur-2xl -ml-16 -mb-16"></div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <h1 className="text-3xl md:text-5xl font-bold mb-4">
                        Welcome back, {profile?.firstname || user?.firstname || 'Student'}! 👋
                      </h1>
                      <p className="text-teal-100 text-xl font-medium max-w-lg">
                        You've learned for <span className="text-white font-bold">24 hours</span> this week. Keep up the momentum!
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('my-courses')}
                      className="bg-white text-teal-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-teal-900/10 hover:shadow-2xl transition-all duration-300 w-fit"
                    >
                      Resume Learning
                    </motion.button>
                  </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Courses Enrolled', value: enrolledCourses.length.toString(), icon: <GraduationCap size={24} />, color: 'teal' },
                    { label: 'Hours Learned', value: '24', icon: <Clock size={24} />, color: 'blue' },
                    { label: 'Resources', value: resources.length.toString(), icon: <Library size={24} />, color: 'purple' },
                    { label: 'Learning Streak', value: '12 days', icon: <Flame size={24} />, color: 'orange' }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                         <div className={`w-12 h-12 bg-${stat.color}-100 rounded-2xl flex items-center justify-center text-${stat.color}-600`}>
                          {stat.icon}
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                      <div className="text-gray-600 font-medium">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Continue Learning */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Continue Learning</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setActiveTab('my-courses')}
                      className="text-teal-600 font-bold hover:text-teal-700 flex items-center gap-1"
                    >
                      View All <ChevronRight size={16} />
                    </motion.button>
                  </div>
                  {enrolledCourses.length > 0 ? (
                    <div className="space-y-4">
                      {enrolledCourses.slice(0, 3).map((course, index) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                          className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all duration-300 group cursor-pointer"
                          onClick={() => openCoursePlayer(course)}
                        >
                           <div className="w-full sm:w-24 h-48 sm:h-24 rounded-xl overflow-hidden shrink-0">
                               <img
                                src={course.image}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                           </div>
                          
                          <div className="flex-1 min-w-0 w-full">
                             <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">{course.category}</span>
                                  <div className="flex items-center text-yellow-500 text-xs font-bold gap-1">
                                      <Star size={12} fill="currentColor"/> {course.rating}
                                  </div>
                             </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-teal-600 transition-colors">
                              {course.title}
                            </h3>
                            <div className="flex items-center text-gray-500 text-sm gap-4">
                               <span className="flex items-center gap-1"><User size={14} /> {course.instructor}</span>
                               <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 bg-teal-500 text-white rounded-xl shadow-lg shadow-teal-500/30 flex items-center justify-center shrink-0"
                          >
                            <Play size={20} fill="currentColor" className="ml-1" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                        No courses enrolled yet.
                    </div>
                  )}
                </div>

                {/* Recent Resources */}
                 <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Recent Resources</h2>
                     <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setActiveTab('resources')}
                      className="text-teal-600 font-bold hover:text-teal-700 flex items-center gap-1"
                    >
                      View All <ChevronRight size={16} />
                    </motion.button>
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.slice(0, 3).map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-teal-200 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
                        onClick={() => window.open(resource.downloadUrl, '_blank')}
                      >
                         <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                                {getResourceIcon(resource.type)}
                            </div>
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg uppercase">{resource.type}</span>
                         </div>
                         <h3 className="font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-teal-600 transition-colors">
                            {resource.title}
                         </h3>
                         <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">
                            {resource.description}
                         </p>
                        <div className="flex items-center justify-between text-xs text-gray-400 font-medium pt-4 border-t border-gray-50">
                          <span>{resource.size}</span>
                          <span>{resource.uploadDate}</span>
                        </div>
                      </motion.div>
                    ))}
                    {resources.length === 0 && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500 py-8">
                            No resources available.
                        </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'my-courses' && (
              <motion.div
                key="my-courses"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
                    <p className="text-gray-600 mt-2 text-lg">Continue your learning journey</p>
                  </div>
                  <div className="flex space-x-4">
                  </div>
                </div>

                {enrolledCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrolledCourses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{
                           y: -5
                        }}
                         className="group relative bg-white rounded-4xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden flex flex-col h-full cursor-pointer"
                        onClick={() => openCoursePlayer(course)}
                      >
                        {/* Image Section */}
                        <div className="relative h-60 overflow-hidden shrink-0">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                           {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60" />

                          {/* Badges */}
                          <div className="absolute top-4 left-4 flex gap-2">
                               <span className={`px-3 py-1.5 backdrop-blur-md bg-white/90 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-sm ${
                                  course.level === 'Beginner' ? 'text-green-600' :
                                  course.level === 'Intermediate' ? 'text-blue-600' : 'text-purple-600'
                              }`}>
                                  {course.level}
                              </span>
                          </div>
                           <div className="absolute bottom-4 left-4 right-4 text-white">
                               <div className="flex items-center gap-2 mb-1 text-yellow-400 text-xs font-bold">
                                   <Star size={14} fill="currentColor" /> {course.rating}
                               </div>
                               <h3 className="font-bold text-xl leading-tight line-clamp-2 mb-1">{course.title}</h3>
                               <p className="text-white/80 text-sm font-medium">{course.instructor}</p>
                           </div>
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                           <div className="flex items-center justify-between text-sm text-gray-500 mb-6 font-medium">
                               <span className="flex items-center gap-1.5"><Clock size={16} className="text-teal-500"/> {course.duration}</span>
                               <span className="flex items-center gap-1.5"><BookOpen size={16} className="text-purple-500"/> {course.lessons} Lessons</span>
                           </div>
                           
                           <div className="mt-auto">
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                        Last Accessed: <br/> <span className="text-gray-600 normal-case">{course.lastAccessed}</span>
                                    </div>
                                     <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30"
                                    >
                                      <Play size={18} fill="currentColor" className="ml-0.5" />
                                    </motion.button>
                                </div>
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-12 text-lg">
                    No enrolled courses found.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'resources' && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Learning Resources</h1>
                    <p className="text-gray-600 mt-2 text-lg">Access course materials and downloads</p>
                  </div>
                  <div className="flex space-x-4">
                  </div>
                </div>
                {resources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-4xl p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group"
                      >
                        <div className="flex items-start justify-between mb-6">
                           <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors duration-300">
                               {getResourceIcon(resource.type)}
                           </div>
                           <div className="flex items-center gap-2">
                               <button 
                                onClick={() => window.open(resource.downloadUrl, '_blank')}
                                className="p-2 text-gray-400 hover:text-teal-600 transition-colors">
                                  <Download size={20}/>
                               </button>
                           </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight group-hover:text-teal-600 transition-colors">{resource.title}</h3>
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{resource.description}</p>
                        
                         <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                             <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                                  resource.category === 'development' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                             }`}>{resource.category}</span>
                             <span className="text-xs font-bold text-gray-400">{resource.size}</span>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-12 text-lg">
                    No resources available.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

       {/* Course Player Overlay (Preserving functionality) */}
       <AnimatePresence>
        {isCoursePlayerOpen && selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
             {/* Player Header */}
             <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
               <div className="flex items-center space-x-4">
                  <button onClick={() => setIsCoursePlayerOpen(false)} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                      <ChevronLeft size={24} />
                  </button>
                  <div>
                      <h2 className="font-bold text-lg">{selectedCourse.title}</h2>
                      <p className="text-sm text-gray-400">{currentLesson?.title}</p>
                  </div>
               </div>
                <div className="flex items-center space-x-4">
                     <span className="text-sm font-medium bg-gray-800 px-3 py-1 rounded-full">{
                       lessons.filter(l => l.courseId === selectedCourse.id).length > 0 
                       ? Math.round((lessons.filter(l => l.courseId === selectedCourse.id).findIndex(l => l.id === currentLesson?.id) + 1) / lessons.filter(l => l.courseId === selectedCourse.id).length * 100) 
                       : 0
                     }% Complete</span>
                </div>
             </div>

             <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
                    {/* Video Player Container */}
                   <div className="bg-black aspect-video w-full max-h-[70vh] relative group">
                      {currentLesson?.videoUrl ? (
                         <iframe
                           width="100%"
                           height="100%"
                           src={getEmbedUrl(currentLesson.videoUrl)}
                           title={currentLesson.title}
                           frameBorder="0"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                           allowFullScreen
                           className="w-full h-full"
                         ></iframe>
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-500">
                           Video not available
                         </div>
                       )}
                   </div>
                   
                   {/* Lesson Info */}
                   <div className="p-8 max-w-5xl mx-auto w-full">
                       <div className="flex items-center justify-between mb-6">
                           <h1 className="text-2xl font-bold text-gray-800">{currentLesson?.title}</h1>
                       </div>
                       
                       <div className="prose max-w-none text-gray-600 leading-relaxed">
                           <p>{currentLesson?.description}</p>
                       </div>

                       {/* Course Resources (Visible below video) */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Course Resources</h3>
                            {resources.filter(r => r.courseId === selectedCourse.id).length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {resources.filter(r => r.courseId === selectedCourse.id).map((res, idx) => (
                                        <div key={idx} className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-teal-300 transition-colors cursor-pointer group" onClick={() => window.open(res.downloadUrl, '_blank')}>
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4 text-xl">
                                                {getResourceIcon(res.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">{res.title}</div>
                                                <div className="text-xs text-gray-500">{res.size}</div>
                                            </div>
                                            <Download size={18} className="text-gray-400 group-hover:text-teal-500"/>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No specific resources for this course.</p>
                            )}
                        </div>
                   </div>
                </div>

                {/* Player Sidebar */}
                <div className="w-96 bg-white border-l border-gray-200 flex-col shrink-0 hidden lg:flex">
                     <div className="flex border-b border-gray-200">
                         {['lessons', 'resources'].map((tab) => (
                             <button
                               key={tab}
                               onClick={() => setActiveSidebar(tab as any)}
                               className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider ${
                                   activeSidebar === tab ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-400 hover:text-gray-600'
                               }`}
                             >
                                 {tab}
                             </button>
                         ))}
                     </div>
                     
                     <div className="flex-1 overflow-y-auto">
                         {activeSidebar === 'lessons' && (
                             <div className="divide-y divide-gray-100">
                                 {lessons.filter(l => l.courseId === selectedCourse.id).map((lesson, idx) => (
                                     <div
                                       key={lesson.id}
                                       onClick={() => {
                                           if (!lesson.isLocked) setCurrentLesson(lesson);
                                       }}
                                       className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-4 ${
                                           currentLesson?.id === lesson.id ? 'bg-teal-50/50' : ''
                                       }`}
                                     >
                                        <div className="mt-1">
                                             {lesson.isLocked ? (
                                                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center"><div className="w-2 h-2 bg-gray-300 rounded-full"></div></div>
                                             ) : currentLesson?.id === lesson.id ? (
                                                 <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white"><Play size={10} fill="currentColor"/></div>
                                             ) : (
                                                  <div className="w-6 h-6 rounded-full border-2 border-teal-500 flex items-center justify-center text-teal-500 font-bold text-xs">{idx + 1}</div>
                                             )}
                                        </div>
                                        <div>
                                            <div className={`font-semibold text-sm ${currentLesson?.id === lesson.id ? 'text-teal-700' : 'text-gray-800'}`}>{lesson.title}</div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                <Clock size={12}/> {lesson.duration}
                                            </div>
                                        </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                         {activeSidebar === 'resources' && (
                             <div className="divide-y divide-gray-100">
                                {resources.filter(r => r.courseId === selectedCourse.id).length > 0 ? (
                                   resources.filter(r => r.courseId === selectedCourse.id).map((res, idx) => (
                                       <div key={idx} className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => window.open(res.downloadUrl, '_blank')}>
                                           <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4 text-xl group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                               {getResourceIcon(res.type)}
                                           </div>
                                           <div className="flex-1 min-w-0">
                                               <div className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors truncate">{res.title}</div>
                                               <div className="text-xs text-gray-500 flex items-center gap-2">
                                                 <span>{res.size}</span>
                                               </div>
                                           </div>
                                           <Download size={18} className="text-gray-400 group-hover:text-teal-500"/>
                                       </div>
                                   ))
                                ) : (
                                   <div className="p-6 text-center text-gray-500">
                                       <Library size={48} className="mx-auto mb-4 text-gray-300"/>
                                       <p>No specific resources for this course</p>
                                   </div>
                                )}
                             </div>
                         )}
                     </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;