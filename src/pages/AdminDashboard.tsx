// AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CreditCard,
  LogOut,
  Plus,
  Image as ImageIcon,
  Trash2,
  Edit,
  Mail,
  Camera,
  User,
  FileText,
  X,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Calendar,
  Search,
  Menu
} from 'lucide-react';
import { getInstructors, addInstructor, updateInstructor, deleteInstructor } from '../services/instructor';
import { getStudents, addStudent, updateStudent, deleteStudent } from '../services/students';
import { getAllCourses, addCourse, updateCourse, deleteCourse as deleteCourseService } from '../services/course';
import { getAllPayments } from '../services/payment';
import Swal from 'sweetalert2';
import { generatePDF } from '../utils/pdfGenerator';
import DashboardAnalytics from '../components/DashboardAnalytics';
import Pagination from '../components/Pagination';
// --- Interfaces ---
interface Student {
  id?: number | string;
  _id?: string;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  roles: string;
  createdAt: string;
  updatedAt: string;
}
interface Instructor {
  id?: number | string;
  _id?: string;
  name: string;
  role?: string;
  experience?: number;
  students?: number;
  courses?: number;
  image?: string;
  bio?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}
interface Course {
  _id: string;
  id?: string;
  title: string;
  description: string;
  level: string;
  category: string;
  image: string;
  students: number;
  instructor: {
      _id: string;
      name: string;
      role?: string;
      image?: string;
  }; // When sending to backend, we send string ID, but when receiving we get object
  price: number;
  lessons: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
  videos: CourseVideo[];
  resources: CourseResource[];
  rating?: number;
  status?: string;
}
interface CourseVideo {
  _id?: string;
  course_id?: string;
  video_title: string;
  video_url: string;
  video_order: number;
}
interface CourseResource {
  _id?: string;
  course_id?: string;
  resource_title: string;
  resource_url: string;
  resource_order: number;
}

interface Payment {
  _id: string;
  user_id: string;
  transaction_id: string;
  payment_status: string;
  amount: number;
  payment_method: string;
  createdAt: string;
  updatedAt: string;
  order_id?: string;
}
const backgroundImages = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1600',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600'
];
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  // --- State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'instructors' | 'courses' | 'payments'>('dashboard');
 
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentBg, setCurrentBg] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  // --- Modal / Form State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'student' | 'instructor' | 'course' | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  
  const getItemsPerPage = () => {
    switch (activeTab) {
      case 'students':
        return 5;
      case 'payments':
        return 8; 
      case 'instructors':
      case 'courses':
      default:
        return 6; 
    }
  };
  const itemsPerPage = getItemsPerPage();

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, statusFilter]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await getStudents();
        console.log("getStudents response:", response); // Debugging
        if (response.message === 'success' || response.data) {
            setStudents(response.data);
        } else {
            console.error("Failed to fetch students:", response.message);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchStudents();
  }, []);


  const [instructors, setInstructors] = useState<Instructor[]>([]);
  
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await getInstructors();
        if (response.message === 'success' || response.data) {
            setInstructors(response.data);
        } else {
            console.error("Failed to fetch instructors:", response.message);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchInstructors();
  }, []);

  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllCourses();
        if (response.code === 200 && response.data) {
          setCourses(response.data);
        } else {
          console.error("Failed to fetch courses:", response.message);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await getAllPayments();
        if (response.message === 'Payments fetched successfully' && response.data) {
          setPayments(response.data);
        } else {
          console.error("Failed to fetch payments:", response.message);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };
    fetchPayments();
  }, []);

  // --- Effects ---
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    setIsVisible(true);
  }, []);
  useEffect(() => {
    if (isModalOpen) {
      if (modalMode === 'add') {
        if (modalType === 'student') {
          setFormData({
            firstname: '',
            lastname: '',
            email: '',
            password: '',
            roles: 'STUDENT',
          });
        } else if (modalType === 'instructor') {
          setFormData({
            name: '',
            role: '',
            experience: 0,
            students: 0,
            courses: 0,
            image: '',
            bio: '',
          });
        } else if (modalType === 'course') {
          setFormData({
            title: '',
            description: '',
            level: 'BEGINNER',
            category: 'DEVELOPMENT',
            image: '',
            students: 0,
            instructor: '',
            price: 0,
            duration: 0,
            lessons: 0,
            videos: [],
            resources: [],
            rating: 0,
          });
        }
      } else {
         if (modalType === 'course' && selectedItem) {
             setFormData({
                 ...selectedItem,
                 instructor: selectedItem.instructor?._id || selectedItem.instructor // Ensure we have the ID for the select input
             });
        } else {
             setFormData({ ...selectedItem });
        }
      }
    }
  }, [isModalOpen, modalMode, modalType, selectedItem]);
  const deleteStudentHandler = async (id: number | string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteStudent(id.toString());
        if (response.message === 'success' || response.data) {
           setStudents(prev => prev.filter(student => String(student.id) !== String(id) && String(student._id) !== String(id)));
           Swal.fire(
             'Deleted!',
             'Student has been deleted.',
             'success'
           );
        } else {
           Swal.fire(
             'Error!',
             response.message || 'Failed to delete student',
             'error'
           );
        }
      } catch (error) {
        console.error(error);
        Swal.fire(
          'Error!',
          'Failed to delete student',
          'error'
        );
      }
    }
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => {
           // Determine field name based on modal type or object structure
           if (modalType === 'student') {
             return { ...prev, profilePicLink: reader.result as string };
           } else {
             // For instructor and course
             return { ...prev, image: reader.result as string, imageFile: file };
           }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteCourse = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteCourseService(id);
        if (response.code === 200 || response.message === 'success') {
          setCourses(prev => prev.filter(course => course._id !== id));
          Swal.fire(
            'Deleted!',
            'Course has been deleted.',
            'success'
          );
        } else {
          Swal.fire(
            'Error!',
            response.message || 'Failed to delete course',
            'error'
          );
        }
      } catch (error) {
        console.error(error);
        Swal.fire(
          'Error!',
          'Failed to delete course',
          'error'
        );
      }
    }
  };
  // Helper function removed as instructor is now populated in course object
  // const getInstructorName ...
  // --- Handlers ---
  const handleLogout = () => {
    localStorage.clear();
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'Logged out successfully',
      timer: 1500,
      showConfirmButton: false
    });
    navigate('/login');
  };
  const openModal = (type: 'student' | 'instructor' | 'course', mode: 'add' | 'edit' | 'view', item?: any) => {
    setModalType(type);
    setModalMode(mode);
    setSelectedItem(item || null);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedItem(null);
      setModalType(null);
      setFormData(null);
    }, 300);
  };
  const handleSave = async () => {
    if (modalType === 'student') {
      if (modalMode === 'add') {
        try {
          setIsSubmitting(true);
          const response = await addStudent(formData);
          if ((response.message === 'User registed' || response.message === 'User registered successfully' || response.code === 201 || response.code === 200) && response.data) {
             setStudents([...students, response.data]);
             Swal.fire({
               icon: 'success',
               title: 'Success!',
               text: 'Student added successfully',
               timer: 2000,
               showConfirmButton: false
             });
          } else {
             Swal.fire({
               icon: 'error',
               title: 'Error!',
               text: response.message || 'Failed to add student',
             });
          }
        } catch (error) {
           console.error(error);
           Swal.fire({
             icon: 'error',
             title: 'Error!',
             text: 'An error occurred while adding student',
           });
        } finally {
           setIsSubmitting(false);
        }
      } else if (modalMode === 'edit') {
        try {
           setIsSubmitting(true);
           const studentId = formData.id || formData._id;
           const response = await updateStudent(studentId, formData);
            if ((response.message === 'User updated' || response.message === 'User updated successfully' || response.code === 200 || response.code === 201) && response.data) {
               setStudents(prev => prev.map(s => {
                   if (s.id && formData.id && s.id === formData.id) return response.data;
                   if (s._id && formData._id && s._id === formData._id) return response.data;
                   return s;
                return s;
               }));
                // toast.dismiss(); // Dismiss previous if any, though swal is modal
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Student updated successfully',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: response.message || 'Failed to update student',
                });
           }
        } catch (error) {
            console.error(error);
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'An error occurred while updating student',
            });
        } finally {
            setIsSubmitting(false);
        }
      }
    } else if (modalType === 'instructor') {
      if (modalMode === 'add') {
        try {
          setIsSubmitting(true);
          // Use FormData for file upload
          const instructorData = new FormData();
          instructorData.append('name', formData.name);
          instructorData.append('role', formData.role);
          instructorData.append('experience', formData.experience.toString());
          // instructorData.append('students', formData.students.toString()); // Backend likely calculates this
          // instructorData.append('courses', formData.courses.toString());   // Backend likely calculates this
          instructorData.append('bio', formData.bio);
          if (formData.imageFile) {
            instructorData.append('image', formData.imageFile);
          }

          const response = await addInstructor(instructorData);
          if (response.message === 'success' || response.data) {
              setInstructors([...instructors, response.data]);
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Instructor added successfully',
                timer: 2000,
                showConfirmButton: false
              });
          } else {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: response.message || 'Failed to add instructor',
              });
          }
        } catch (error) {
            console.error(error);
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'An error occurred while adding instructor',
            });
        } finally {
            setIsSubmitting(false);
          }
        } else if (modalMode === 'edit') {
        try {
          setIsSubmitting(true);
          const instructorData = new FormData();
          instructorData.append('id', formData.id || formData._id); // Ensure ID is sent
          instructorData.append('name', formData.name);
          instructorData.append('role', formData.role);
          instructorData.append('experience', formData.experience.toString());
          instructorData.append('bio', formData.bio);
          if (formData.imageFile) {
            instructorData.append('image', formData.imageFile);
          }

          const instructorId = formData.id || formData._id;
          const response = await updateInstructor(instructorId, instructorData);
          
          if (response.message === 'success' || response.data) {
            setInstructors(prev => prev.map(i => {
                if (i.id && formData.id && i.id === formData.id) return response.data;
                if (i._id && formData._id && i._id === formData._id) return response.data;
                return i;
            }));
            // toast.dismiss();
            Swal.fire({
              icon: 'success',
              title: 'Updated!',
              text: 'Instructor updated successfully',
              timer: 2000,
              showConfirmButton: false
            });
          } else {
             Swal.fire({
               icon: 'error',
               title: 'Error!',
               text: response.message || 'Failed to update instructor',
             });
          }
        } catch (error) {
             console.error(error);
             Swal.fire({
               icon: 'error',
               title: 'Error!',
               text: 'An error occurred while updating instructor',
             });
        } finally {
             setIsSubmitting(false);
        }
      }
    } else if (modalType === 'course') {
        const courseData = new FormData();
        courseData.append('title', formData.title);
        courseData.append('description', formData.description);
        courseData.append('level', formData.level);
        courseData.append('category', formData.category);
        courseData.append('price', formData.price.toString());
        courseData.append('duration', formData.duration.toString());
        courseData.append('instructor', formData.instructor); // Should be the ID
        
        // Calculate lessons count based on videos
        const lessonCount = formData.videos?.length || 0;
        courseData.append('lessons', lessonCount.toString());
        
         // Handle Videos and Resources - usually sent as JSON string if using FormData for other fields, 
         // or backend expects them separately. Assuming backend handles parsing or separate endpoint.
         // Based on user request, let's try sending them as stringified JSON if the backend accepts it in one go.
         courseData.append('videos', JSON.stringify(formData.videos || []));
         courseData.append('resources', JSON.stringify(formData.resources || []));

        if (formData.imageFile) {
            courseData.append('image', formData.imageFile);
        }

      if (modalMode === 'add') {
         try {
             setIsSubmitting(true);
             const response = await addCourse(courseData);
             if (response.code === 201 || response.code === 200 || response.message === 'success' || response.data) {
                 // Refresh list
                 const allCourses = await getAllCourses();
                 if(allCourses.data) setCourses(allCourses.data);
                 Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Course created successfully',
                    timer: 2000,
                    showConfirmButton: false
                 });
             } else {
              console.log(response);
              console.log(response.message);
                 Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: response.message || 'Failed to create course',
                 });
             }
         } catch (error) {
             console.error(error);
             Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Error creating course',
             });
         } finally {
             setIsSubmitting(false);
         }
      } else if (modalMode === 'edit') {
         try {
             setIsSubmitting(true);
             const courseId = formData._id || formData.id;
             // courseData.append('courseId', courseId); // Not needed in body if in params, but keeping extra data doesn't hurt. Backend uses params.
             const response = await updateCourse(courseId, courseData);
              if (response.code === 200 || response.message === 'success') {
                  // Refresh list to see updates
                  const allCourses = await getAllCourses();
                  if(allCourses.data) setCourses(allCourses.data);
                  Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Course updated successfully',
                    timer: 2000,
                    showConfirmButton: false
                 });
              } else {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: response.message || 'Failed to update course',
                 });
              }
         } catch (error) {
              console.error(error);
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Error updating course',
             });
         } finally {
              setIsSubmitting(false);
         }
      }
    }
    closeModal();
  };

  const deleteInstructorHandler = async (id: string | number) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
      });

      if (result.isConfirmed) {
        try {
            const response = await deleteInstructor(id.toString());
            if (response.message === 'success' || response.data) {
                 Swal.fire(
                   'Disabled!',
                   'Instructor has been disabled.',
                   'success'
                 );
                 setInstructors(prev => prev.filter(inst => String(inst.id) !== String(id) && String(inst._id) !== String(id)));
            } else {
                 Swal.fire(
                   'Error!',
                   response.message || 'Failed to disable instructor',
                   'error'
                 );
            }
        } catch (error) {
            console.error(error);
            Swal.fire(
              'Error!',
              'Failed to disable instructor',
              'error'
            );
        }
      }
  };

  // --- Export Handlers ---
  const handleExportStudents = () => {
    const columns = ['First Name', 'Last Name', 'Email', 'Role', 'Joined Date'];
    const data = filteredStudents.map(student => [
        student.firstname,
        student.lastname,
        student.email,
        student.roles,
        new Date(student.createdAt).toLocaleDateString()
    ]);
    generatePDF({
        title: 'Student Report',
        columns,
        data,
        filename: 'students_report'
    });
  };

  const handleExportInstructors = () => {
      const columns = ['Name', 'Role', 'Experience', 'Students', 'Courses'];
      const data = filteredInstructors.map(inst => [
          inst.name,
          inst.role || 'N/A',
          `${inst.experience || 0} Years`,
          inst.students || 0,
          inst.courses || 0
      ]);
      generatePDF({
          title: 'Instructor Report',
          columns,
          data,
          filename: 'instructors_report'
      });
  };

  const handleExportCourses = () => {
      const columns = ['Title', 'Level', 'Category', 'Price', 'Instructor', 'Students'];
      const data = filteredCourses.map(course => [
          course.title,
          course.level,
          course.category,
          `LKR ${course.price}`,
          course.instructor?.name || 'Unknown',
          course.students
      ]);
      generatePDF({
          title: 'Course Listing Report',
          columns,
          data,
          filename: 'courses_report'
      });
  };

  const handleExportPayments = () => {
      const columns = ['Transaction ID', 'Student', 'Amount', 'Date', 'Status'];
      const data = filteredPayments.map(payment => {
          const student = students.find(s => s._id === payment.user_id || s.id === payment.user_id);
          const studentName = student ? `${student.firstname} ${student.lastname}` : 'Unknown';
          return [
              payment.transaction_id,
              studentName,
              `LKR ${payment.amount}`,
              new Date(payment.createdAt).toLocaleDateString(),
              payment.payment_status
          ];
      });
      generatePDF({
          title: 'Payment Transaction Report',
          columns,
          data,
          filename: 'payments_report'
      });
  };

  // --- Navigation ---
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={24} />, color: 'teal' },
    { id: 'students', label: 'Students', icon: <GraduationCap size={24} />, color: 'blue' },
    { id: 'instructors', label: 'Instructors', icon: <Users size={24} />, color: 'purple' },
    { id: 'courses', label: 'Courses', icon: <BookOpen size={24} />, color: 'indigo' },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={24} />, color: 'teal' },
  ];
  // --- Filters ---
  // --- Filters ---
  const filteredStudents = students.filter(student =>
    student && ((student.firstname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
     (student.lastname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
     (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
  );
  const filteredInstructors = instructors.filter(instructor =>
    (instructor.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  const filteredCourses = courses.filter(course =>
    (course.title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  const filteredPayments = payments.filter(payment =>
    (payment.transaction_id.toLowerCase()).includes(searchTerm.toLowerCase())
  );
  // --- Calculations ---
  const totalStudents = students.length;
  const totalInstructors = instructors.length;
  const publishedCourses = courses.length;
  const totalRevenue = payments.filter(p => p.payment_status === 'Completed').reduce((sum, p) => sum + p.amount, 0);
  // --- Helper Colors ---
  // --- Helper Colors ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': case 'published': case 'completed': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'INACTIVE': case 'draft': case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REJECTED': case 'suspended': case 'archived': case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // --- Pagination Logic ---
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const paginatedInstructors = filteredInstructors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      {/* Admin Sidebar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-white/80 backdrop-blur-xl border-r border-white/20 flex flex-col w-80 transition-all duration-300 fixed h-full z-40 shadow-xl ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Admin Profile */}
        <div className="p-6 border-b border-white/20 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-linear-to-br from-teal-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">AD</div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-400 rounded-full border-2 border-white"></div>
            </div>
           
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
              <div className="font-bold text-gray-800 truncate text-lg">ADMIN USER</div>
              <div className="text-sm text-teal-600 truncate">Super Administrator</div>
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
                  setActiveTab(item.id as any);
                  setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-semibold transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-white shadow-lg border border-white/50 text-gray-800'
                  : 'text-gray-600 hover:bg-white/50 hover:shadow-md'
              }`}
            >
              <span className="text-gray-600">{item.icon}</span>
             
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 text-left text-lg">{item.label}</motion.span>
             
            </motion.button>
          ))}
        </nav>
        <div className="px-6 pb-2">
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center space-x-4 p-4 rounded-2xl font-semibold transition-all duration-300 text-red-500 hover:bg-red-50 hover:shadow-md"
            >
              <span className="text-gray-600"><LogOut size={24} /></span>
             
              <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 text-left text-lg"
                >
                  Logout
                </motion.span>
             
            </motion.button>
        </div>
      </motion.div>
      {/* Main Content */}
      <div className="flex-1 transition-all duration-300 lg:ml-80 relative z-10 w-full">
       
        {/* Admin Header */}
        <header className="bg-white/60 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-6">
            <div className="flex items-center space-x-4">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-white/50 text-gray-600 transition-colors">
                  <Menu size={28} />
               </button>
               <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-br from-teal-600 to-indigo-600 bg-clip-text text-transparent capitalize">
                {activeTab}
              </h1>
              <p className="text-gray-500 text-lg mt-2">
                {activeTab === 'dashboard' && 'Platform overview and analytics'}
                {activeTab === 'students' && 'Manage student accounts and progress'}
                {activeTab === 'instructors' && 'Manage instructors and teaching staff'}
                {activeTab === 'courses' && 'Course management and content'}
                {activeTab === 'payments' && 'Payment history and transactions'}
              </p>
            </div>
          </div>
          </div>
        </header>
        {/* Admin Content */}
        <main className="p-4 md:p-8">
          <AnimatePresence mode="wait">
           
            {/* --- DASHBOARD TAB --- */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                {/* Welcome Section - REMOVED for cleaner look */}
               
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Students', value: totalStudents.toString(), icon: <GraduationCap size={24} />, color: 'teal', change: '+12%' },
                    { label: 'Total Instructors', value: totalInstructors.toString(), icon: <Users size={24} />, color: 'purple', change: '+4%' },
                    { label: 'Active Courses', value: publishedCourses.toString(), icon: <BookOpen size={24} />, color: 'blue', change: '+5%' },
                    { label: 'Total Revenue', value: `LKR ${(totalRevenue).toLocaleString()}`, icon: <CreditCard size={24} />, color: 'indigo', change: '+23%' },
                  ].map((stat, index) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02, y: -5 }} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-${stat.color}-100 rounded-2xl flex items-center justify-center text-${stat.color}-600`}>{stat.icon}</div>
                        {/* Removed percentage change */}
                      </div>
                      <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                      <div className="text-gray-600 font-medium">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Analytics Section */}
                <DashboardAnalytics students={students} payments={payments} courses={courses} />
                {/* Quick Actions */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => openModal('student', 'add')} className="bg-white border border-gray-200 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300 group">
                      <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-teal-600"><Plus size={32} /></span>
                      </div>
                      <div className="font-semibold text-gray-800">Add Student</div>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => openModal('instructor', 'add')} className="bg-white border border-gray-200 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300 group">
                      <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-purple-600"><Users size={32} /></span>
                      </div>
                      <div className="font-semibold text-gray-800">Add Instructor</div>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => openModal('course', 'add')} className="bg-white border border-gray-200 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300 group">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-blue-600"><FileText size={32} /></span>
                      </div>
                      <div className="font-semibold text-gray-800">Create Course</div>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
            {/* --- STUDENTS TAB --- */}
            {activeTab === 'students' && (
              <motion.div key="students" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
                    <p className="text-gray-600 text-lg mt-2">Manage student accounts, progress, and access</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={20} className="text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 pr-6 py-3 bg-white/50 backdrop-blur-sm border border-white/60 text-gray-800 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-white shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-64 md:w-80"
                      />
                    </div>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExportStudents}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-teal-600 border border-teal-100 rounded-2xl font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <FileText size={20} />
                      <span>Export PDF</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openModal('student', 'add')} 
                      className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all duration-300"
                    >
                      <Plus size={20} />
                      <span>Add Student</span>
                    </motion.button>
                  </div>
                </div>
                {/* Students Table (Reverted to Modern Table) */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>
                  <div className="overflow-x-auto relative z-10">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200/60 backdrop-blur-sm">
                          <th className="px-4 py-3 md:px-8 md:py-6 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Student</th>
                          <th className="px-4 py-3 md:px-8 md:py-6 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Contact</th>
                          <th className="px-4 py-3 md:px-8 md:py-6 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Status & Date</th>
                          <th className="px-4 py-3 md:px-8 md:py-6 text-right text-xs font-extrabold text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100/50">
                        {paginatedStudents.map((student, index) => (
                          <motion.tr
                            key={student._id || student.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-white/60 transition-all duration-300 group"
                          >
                              <td className="px-4 py-3 md:px-8 md:py-6">
                                <div className="flex items-center space-x-3 md:space-x-5">
                                <div className="relative">
                                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-teal-500/30 transition-all duration-300 transform group-hover:scale-105">
                                    {(student.firstname && student.firstname[0]) || 'S'}{(student.lastname && student.lastname[0]) || ''}
                                  </div>
                                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                                </div>
                                <div>
                                  <div className="font-bold text-gray-800 text-lg group-hover:text-teal-600 transition-colors">{student.firstname} {student.lastname}</div>
                                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Student</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 md:px-8 md:py-6">
                                <div className="flex flex-col space-y-1">
                                  <div className="flex items-center text-gray-600 font-medium">
                                      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center mr-3 text-teal-500 group-hover:bg-teal-100 transition-colors">
                                           <Mail size={14} />
                                      </div>
                                      {student.email}
                                  </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 md:px-8 md:py-6">
                                <div className="flex flex-col space-y-2">
                                    <span className="inline-flex items-center w-fit px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                        Active
                                    </span>
                                    <div className="flex items-center text-gray-400 text-xs font-medium">
                                        <Calendar size={12} className="mr-1.5" />
                                        Joined {new Date(student.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 md:px-8 md:py-6 text-right">
                              <div className="flex items-center justify-end space-x-3">
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => openModal('student', 'edit', student)} className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors shadow-sm" title="Edit">
                                  <Edit size={18}/>
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => {
                                  const id = student._id || student.id;
                                  if (id) deleteStudentHandler(id);
                                }} className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors shadow-sm" title="Delete">
                                  <Trash2 size={18}/>
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Pagination */}
                <Pagination 
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredStudents.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                />
              </motion.div>
            )}
            {/* --- INSTRUCTORS TAB --- */}
            {activeTab === 'instructors' && (
              <motion.div key="instructors" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Instructor Management</h1>
                    <p className="text-gray-600 text-lg mt-2">Manage course instructors and teaching staff</p>
                  </div>
                  <div className="flex space-x-4">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent opacity-0 pointer-events-none">
                      <option value="all">All Status</option>
                    </select>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={handleExportInstructors} className="px-6 py-3 bg-white text-purple-600 border border-purple-100 rounded-2xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 mr-2">
                      Export PDF
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => openModal('instructor', 'add')} className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      Add Instructor
                    </motion.button>
                  </div>
                </div>
                {/* Instructors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedInstructors.map((instructor, index) => (
                    <motion.div
                      key={instructor._id || instructor.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -10 }}
                      className="group relative"
                    >
                      {/* Animated Gradient Border */}
                      <div className="absolute -inset-0.5 bg-linear-to-r from-teal-400 via-purple-500 to-blue-500 rounded-[2.1rem] blur opacity-0 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                     
                      {/* Card Content */}
                      <div className="relative h-full bg-white/80 backdrop-blur-xl rounded-4xl p-6 border border-white/60 shadow-xl transition-all duration-500 overflow-hidden hover:bg-white/90">
                         {/* Decorative Background Elements */}
                         <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-bl from-purple-100/50 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-110"></div>
                        
                         <div className="relative z-10 flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                              <div className="relative">
                                <div className="p-1 rounded-2xl bg-linear-to-br from-teal-400 to-purple-500 shadow-lg">
                                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-white">
                                        <img src={instructor.image} alt={instructor.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-3 -right-3 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
                                  {instructor.experience}+ Years
                                </div>
                              </div>
                             
                              <div className="flex space-x-2">
                                 <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openModal('instructor', 'edit', instructor)} className="p-2.5 bg-white text-gray-700 hover:text-purple-600 rounded-xl shadow-sm border border-gray-100 transition-colors">
                                    <Edit size={16} />
                                 </motion.button>
                                 <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => {
                                   const id = instructor._id || instructor.id;
                                   if (id) deleteInstructorHandler(id);
                                 }} className="p-2.5 bg-white text-gray-700 hover:text-red-500 rounded-xl shadow-sm border border-gray-100 transition-colors">
                                    <Trash2 size={16} />
                                 </motion.button>
                              </div>
                            </div>
                            {/* Info */}
                            <div className="mb-4">
                               <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">{instructor.name}</h3>
                               <p className="text-sm font-semibold text-purple-600 tracking-wide uppercase">{instructor.role}</p>
                            </div>
                           
                            <p className="text-gray-500 text-sm mb-8 grow line-clamp-3 leading-relaxed">
                              {instructor.bio}
                            </p>
                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                               <div className="bg-white/60 rounded-2xl p-3 border border-gray-100 group-hover:border-purple-200 group-hover:bg-purple-50/50 transition-all duration-300">
                                  <div className="flex items-center justify-between mb-1">
                                      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Courses</div>
                                      <BookOpen size={14} className="text-purple-400" />
                                  </div>
                                  <div className="font-bold text-gray-800 text-lg">{instructor.courses}</div>
                               </div>
                               <div className="bg-white/60 rounded-2xl p-3 border border-gray-100 group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-all duration-300">
                                  <div className="flex items-center justify-between mb-1">
                                      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Students</div>
                                      <Users size={14} className="text-blue-400" />
                                  </div>
                                  <div className="font-bold text-gray-800 text-lg">{instructor.students}</div>
                               </div>
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Pagination */}
                <Pagination 
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredInstructors.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                />
              </motion.div>
            )}
            {/* --- COURSES TAB --- */}
            {activeTab === 'courses' && (
              <motion.div key="courses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
                    <p className="text-gray-600 text-lg mt-2">Create, edit, and manage course content</p>
                  </div>
                  <div className="flex space-x-4">
                    {/* <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select> */}
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => openModal('course', 'add')} className="px-6 py-3 bg-teal-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      Add Course
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={handleExportCourses} className="px-6 py-3 bg-white text-teal-600 border border-teal-100 rounded-2xl font-semibold shadow-sm hover:shadow-md transition-all duration-300">
                      Export PDF
                    </motion.button>
                  </div>
                </div>
                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedCourses.map((course, index) => (
                    <motion.div
                      key={course._id || course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative bg-white rounded-4xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col h-full"
                    >
                      {/* Image Section */}
                      <div className="relative h-56 overflow-hidden shrink-0">
                        <img 
                          src={course.image} 
                          alt={course.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                         {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-80" />
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                           <span className={`px-3 py-1.5 backdrop-blur-md bg-white/90 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-sm ${
                             course.level === 'BEGINNER' ? 'text-teal-600' : 
                             course.level === 'INTERMEDIATE' ? 'text-blue-600' : 'text-purple-600'
                           }`}>
                             {course.level}
                           </span>
                        </div>
                        <div className="absolute top-4 right-4">
                           <span className="px-3 py-1.5 backdrop-blur-md bg-black/40 text-white rounded-2xl text-[10px] font-bold uppercase tracking-wider border border-white/20">
                             {course.category}
                           </span>
                        </div>

                        {/* Price Tag (Floating) */}
                         <div className="absolute bottom-4 right-4">
                           <div className="bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-lg border border-white/50">
                             <span className="text-gray-900 font-extrabold text-lg">
                               {course.price > 0 ? `LKR ${course.price.toLocaleString()}` : 'Free'}
                             </span>
                           </div>
                        </div>
                      </div>
                      
                      {/* Content Section */}
                      <div className="p-6 flex flex-col flex-1 relative">
                         {/* Main Content */}
                         <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight line-clamp-2 group-hover:text-teal-600 transition-colors">
                              {course.title}
                            </h3>
                             {/* Instructor Row */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full p-0.5 bg-linear-to-tr from-teal-400 to-blue-500">
                                   <img 
                                     src={course.instructor?.image || ''} 
                                     alt={course.instructor?.name || 'Instructor'} 
                                     className="w-full h-full rounded-full object-cover border-2 border-white" 
                                   />
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Instructor</span>
                                   <span className="text-sm font-semibold text-gray-700">{course.instructor?.name || 'Unknown'}</span>
                                </div>
                            </div>
                            
                            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-medium">
                              {course.description}
                            </p>
                         </div>

                         {/* Stats Grid */}
                         <div className="grid grid-cols-3 gap-2 py-4 border-t border-gray-100 mb-6 bg-gray-50/50 rounded-2xl px-4 mt-auto">
                            <div className="flex flex-col items-center justify-center">
                               <BookOpen size={16} className="text-teal-500 mb-1" />
                               <span className="text-xs font-bold text-gray-700">{course.lessons}</span>
                               <span className="text-[10px] text-gray-400 font-medium uppercase">Lessons</span>
                            </div>
                             <div className="flex flex-col items-center justify-center border-l border-gray-200/50">
                               <Users size={16} className="text-blue-500 mb-1" />
                               <span className="text-xs font-bold text-gray-700">{course.students}</span>
                               <span className="text-[10px] text-gray-400 font-medium uppercase">Students</span>
                            </div>
                             <div className="flex flex-col items-center justify-center border-l border-gray-200/50">
                               <Calendar size={16} className="text-purple-500 mb-1" />
                               <span className="text-xs font-bold text-gray-700">{course.duration}h</span>
                               <span className="text-[10px] text-gray-400 font-medium uppercase">Duration</span>
                            </div>
                         </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                           <button 
                             onClick={() => openModal('course', 'view', course)} 
                             className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-all active:scale-95"
                           >
                             Details
                           </button>
                           <button 
                             onClick={() => openModal('course', 'edit', course)} 
                             className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-900 text-white shadow-lg shadow-gray-200 hover:bg-gray-800 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                           >
                             <Edit size={14} />
                             Edit
                           </button>
                           <button 
                             onClick={() => deleteCourse(course._id || course.id!)} 
                             className="w-12 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-all active:scale-95"
                             title="Delete Course"
                           >
                             <Trash2 size={18}/>
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Pagination */}
                <Pagination 
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredCourses.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                />
              </motion.div>
            )}
            {/* --- PAYMENTS TAB --- */}
            {activeTab === 'payments' && (
              <motion.div key="payments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="flex items-center justify-between">
                   <h1 className="text-3xl font-bold text-gray-800">Payment Management</h1>
                   <button onClick={handleExportPayments} className="px-6 py-3 bg-teal-500 text-white rounded-2xl font-semibold shadow-lg hover:bg-teal-600 transition-colors">Export Report</button>
                </div>
                <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>
                  <div className="overflow-x-auto relative z-10">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200/60 backdrop-blur-sm">
                          <th className="px-4 py-3 md:px-8 md:py-6 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Transaction ID</th>
                          <th className="px-4 py-3 md:px-8 md:py-6 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Student</th>
                          <th className="px-4 py-3 md:px-8 md:py-6 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Amount</th>
                          <th className="px-4 py-3 md:px-8 md:py-6 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Date</th>
                          <th className="px-4 py-3 md:px-8 md:py-6 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100/50">
                        {paginatedPayments.map((payment, index) => {
                          const student = students.find(s => s._id === payment.user_id || s.id === payment.user_id);
                          const studentName = student ? `${student.firstname} ${student.lastname}` : 'Unknown Student';
                          
                          return (
                          <motion.tr 
                            key={payment._id} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: index * 0.05 }} 
                            className="hover:bg-white/60 transition-all duration-300 group"
                          >
                            <td className="px-4 py-3 md:px-8 md:py-6 font-mono text-sm text-gray-500">{payment.transaction_id}</td>
                            <td className="px-4 py-3 md:px-8 md:py-6">
                                <div className="font-bold text-gray-800">{studentName}</div>
                            </td>
                            <td className="px-4 py-3 md:px-8 md:py-6">
                                <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">LKR {payment.amount.toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-3 md:px-8 md:py-6 text-gray-600 font-medium">{new Date(payment.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 md:px-8 md:py-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(payment.payment_status.toLowerCase())}`}>
                                    {payment.payment_status}
                                </span>
                            </td>
                          </motion.tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Pagination */}
                <Pagination 
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredPayments.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      {/* --- CENTERED MODAL (Add/Edit/View) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 w-full shadow-2xl overflow-hidden border border-white/50 max-h-[90vh] flex flex-col ${modalType === 'course' ? 'max-w-4xl' : 'max-w-2xl'}`}
            >
                {/* Decorative Elements */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-teal-200/30 via-purple-200/30 to-transparent rounded-bl-full pointer-events-none -mr-20 -mt-20"></div>
              <div className="relative z-10 flex flex-col flex-1 min-h-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8 shrink-0">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 bg-clip-text bg-linear-to-r from-teal-600 to-purple-600">
                        {modalMode === 'add' ? `New ${modalType === 'student' ? 'Student' : modalType === 'instructor' ? 'Instructor' : 'Course'}` :
                         modalMode === 'edit' ? `Edit ${modalType === 'student' ? 'Student' : modalType === 'instructor' ? 'Instructor' : 'Course'}` : 'View Details'}
                        </h2>
                         <p className="text-gray-500 mt-1">Fill in the details below to update the system.</p>
                    </div>
                    <button onClick={closeModal} className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors">
                      <X size={24} />
                    </button>
                  </div>
                  {/* MODAL BODY (Scrollable) */}
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {/* --- STUDENT FIELDS --- */}
                   {modalType === 'student' && formData && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">First Name</label>
                           <input disabled={modalMode === 'view'} value={formData.firstname || ''} onChange={(e) => setFormData({...formData, firstname: e.target.value})} type="text" className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/50 text-gray-800 font-medium placeholder-gray-400 transition-all" placeholder="John" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Last Name</label>
                           <input disabled={modalMode === 'view'} value={formData.lastname || ''} onChange={(e) => setFormData({...formData, lastname: e.target.value})} type="text" className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/50 text-gray-800 font-medium placeholder-gray-400 transition-all" placeholder="Doe" />
                        </div>
                      </div>
                     
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                         <input disabled={modalMode === 'view'} value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} type="email" className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/50 text-gray-800 font-medium placeholder-gray-400 transition-all" placeholder="email@example.com" />
                      </div>

                      {modalMode === 'add' && (
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                           <div className="relative">
                             <input value={formData.password || ''} onChange={(e) => setFormData({...formData, password: e.target.value})} type={showPassword ? "text" : "password"} className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/50 text-gray-800 font-medium placeholder-gray-400 transition-all pr-12" placeholder="••••••••" />
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors">
                               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                             </button>
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* --- INSTRUCTOR FIELDS --- */}
                  {modalType === 'instructor' && formData && (
                    <div className="space-y-6">
                        {/* Image Upload Area */}
                      <div className="flex flex-col items-center justify-center mb-6">
                        <div className="relative group cursor-pointer" onClick={() => modalMode !== 'view' && document.getElementById('instructor-upload')?.click()}>
                            <div className="w-32 h-32 rounded-4xl overflow-hidden border-4 border-white shadow-xl bg-gray-100 flex items-center justify-center relative">
                                {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="Avatar" /> : <User size={48} className="text-gray-300" />}
                                {modalMode !== 'view' && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                )}
                            </div>
                            {modalMode !== 'view' && (
                                <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-xl shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                                   <Plus size={16} />
                                </div>
                            )}
                        </div>
                        {modalMode !== 'view' && (
                           <>
                             <input id="instructor-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                             <p className="text-xs text-gray-400 mt-3 font-medium">Click to upload photo</p>
                           </>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                           <input disabled={modalMode === 'view'} value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/50 text-gray-800 font-medium placeholder-gray-400 transition-all" placeholder="Dr. Smith" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Role</label>
                           <input disabled={modalMode === 'view'} value={formData.role || ''} onChange={(e) => setFormData({...formData, role: e.target.value})} type="text" className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/50 text-gray-800 font-medium placeholder-gray-400 transition-all" placeholder="Senior Lecturer" />
                        </div>
                      </div>
                     
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Experience (Years)</label>
                           <input disabled={modalMode === 'view'} value={formData.experience || 0} onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value) || 0})} type="number" className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/50 text-gray-800 font-medium placeholder-gray-400 transition-all" placeholder="5" />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Bio</label>
                         <textarea disabled={modalMode === 'view'} value={formData.bio || ''} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={4} className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/50 text-gray-800 font-medium placeholder-gray-400 transition-all resize-none" placeholder="Brief biography..." />
                      </div>
                    </div>
                  )}
                  {/* --- COURSE FIELDS --- */}
                  {modalType === 'course' && formData && (
                    <div className="space-y-6">
                      <div className="h-48 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 relative">
                        {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="Course" /> : <ImageIcon size={40} className="text-gray-400" />}
                      </div>
                      {/* Basic Info */}
                       <div className="space-y-6">
                          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">Basic Information</h3>
                          <div className="flex flex-col items-center justify-center mb-6">
                            <div className="relative group cursor-pointer" onClick={() => modalMode !== 'view' && document.getElementById('course-upload')?.click()}>
                                <div className="w-full h-48 rounded-4xl overflow-hidden border-4 border-white shadow-xl bg-gray-100 flex items-center justify-center relative">
                                    {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="Course" /> : <div className="text-gray-300 flex flex-col items-center"><User size={48} /> <span className="text-sm mt-2">Cover Image</span></div>}
                                    {modalMode !== 'view' && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                {modalMode !== 'view' && (
                                    <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white p-2 rounded-xl shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                                       <Plus size={16} />
                                    </div>
                                )}
                            </div>
                            {modalMode !== 'view' && (
                               <>
                                 <input id="course-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                 <p className="text-xs text-gray-400 mt-3 font-medium">Click to upload cover image</p>
                               </>
                            )}
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Course Title</label>
                             <input disabled={modalMode === 'view'} value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} type="text" className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/50 text-gray-800 font-medium placeholder-gray-400 transition-all" placeholder="Mastering React..." />
                          </div>
                         
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Description</label>
                             <textarea disabled={modalMode === 'view'} value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/50 text-gray-800 font-medium placeholder-gray-400 transition-all h-32 resize-none" placeholder="Course description..." />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Level</label>
                                <select disabled={modalMode === 'view'} value={formData.level || 'BEGINNER'} onChange={(e) => setFormData({...formData, level: e.target.value})} className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/50 text-gray-800 font-medium transition-all cursor-pointer">
                                  {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(level => (
                                      <option key={level} value={level}>{level}</option>
                                  ))}
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Category</label>
                                <select disabled={modalMode === 'view'} value={formData.category || 'DEVELOPMENT'} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/50 text-gray-800 font-medium transition-all cursor-pointer">
                                  {['DEVELOPMENT', 'DESIGN', 'BUSINESS', 'MARKETING', 'IT & SOFTWARE', 'PERSONAL DEVELOPMENT', 'MUSIC', 'PHOTOGRAPHY', 'GENERAL'].map(category => (
                                      <option key={category} value={category}>{category}</option>
                                  ))}
                                </select>
                             </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Price (LKR)</label>
                               <input disabled={modalMode === 'view'} value={formData.price || 0} onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})} type="number" className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/50 text-gray-800 font-medium placeholder-gray-400 transition-all" placeholder="4999" />
                            </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Duration (Hours)</label>
                                <input disabled={modalMode === 'view'} value={formData.duration || 0} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})} type="number" className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/50 text-gray-800 font-medium placeholder-gray-400 transition-all" placeholder="10" />
                             </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Instructor</label>
                            <select disabled={modalMode === 'view'} value={formData.instructor || ''} onChange={(e) => setFormData({...formData, instructor: e.target.value})} className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/50 text-gray-800 font-medium transition-all cursor-pointer">
                              <option value="">Select Instructor</option>
                              {instructors.map((inst) => (
                                <option key={inst._id || inst.id} value={inst._id || inst.id}>
                                  {inst.name}
                                </option>
                              ))}
                            </select>
                          </div>
                      </div>
                      {/* Content Management (Videos & Resources) */}
                      {(modalMode !== 'view' || (formData.videos?.length > 0 || formData.resources?.length > 0)) && (
                        <div className="space-y-8 pt-6 border-t border-gray-100">
                          {/* Videos Section */}
                          <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-800">Course Videos ({formData.videos?.length || 0})</h3>
                             </div>
                            
                             <div className="space-y-3">
                                {formData.videos?.map((video: any, idx: number) => (
                                   <div key={idx} className="bg-white/50 rounded-2xl p-4 border border-gray-100 flex gap-4 items-start group hover:border-indigo-200 transition-colors">
                                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 mt-2">
                                         {video.video_order || idx + 1}
                                      </div>
                                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <input
                                            disabled={modalMode === 'view'}
                                            placeholder="Video Title"
                                            value={video.video_title}
                                            onChange={(e) => {
                                                const newVideos = [...formData.videos];
                                                newVideos[idx].video_title = e.target.value;
                                                setFormData({ ...formData, videos: newVideos });
                                            }}
                                            className="w-full px-4 py-3 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium border-none"
                                         />
                                         <div className="relative w-full">
                                            <input
                                                disabled={modalMode === 'view'}
                                                placeholder="Video URL (e.g. YouTube/Vimeo)"
                                                value={video.video_url}
                                                onChange={(e) => {
                                                    const newVideos = [...formData.videos];
                                                    newVideos[idx].video_url = e.target.value;
                                                    setFormData({ ...formData, videos: newVideos });
                                                }}
                                                className="w-full px-4 py-3 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm border-none font-mono text-gray-600 pr-10"
                                            />
                                            {modalMode === 'view' && video.video_url && (
                                                <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="absolute right-3 top-3 text-indigo-600 hover:text-indigo-800" title="Open Link">
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                         </div>
                                      </div>
                                      {modalMode !== 'view' && (
                                          <button
                                            onClick={() => {
                                                const newVideos = formData.videos.filter((_: any, i: number) => i !== idx);
                                                setFormData({ ...formData, videos: newVideos });
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                                          >
                                              <Trash2 size={16} />
                                          </button>
                                      )}
                                   </div>
                                ))}
                                {modalMode !== 'view' && (
                                    <button
                                      onClick={() => setFormData((prev: any) => ({
                                          ...prev,
                                          videos: [...(prev.videos || []), { video_title: '', video_url: '', video_order: (prev.videos?.length || 0) + 1 }]
                                      }))}
                                      className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-2xl flex items-center justify-center text-indigo-500 font-bold hover:bg-indigo-50/50 hover:border-indigo-400 transition-all group"
                                    >
                                      <div className="flex items-center space-x-2 group-hover:scale-105 transition-transform">
                                          <span className="p-1 rounded-lg bg-indigo-100"><Plus size={20} /></span>
                                          <span>Add Video</span>
                                      </div>
                                    </button>
                                )}
                                {(!formData.videos || formData.videos.length === 0) && modalMode === 'view' && (
                                    <div className="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-2xl">
                                        No videos added yet.
                                    </div>
                                )}
                             </div>
                          </div>
                          {/* Resources Section */}
                          <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-800">Resources ({formData.resources?.length || 0})</h3>
                             </div>
                            
                             <div className="space-y-3">
                                {formData.resources?.map((resource: any, idx: number) => (
                                   <div key={idx} className="bg-white/50 rounded-2xl p-4 border border-gray-100 flex gap-4 items-start group hover:border-teal-200 transition-colors">
                                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-xs shrink-0 mt-2">
                                         {resource.resource_order || idx + 1}
                                      </div>
                                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <input
                                            disabled={modalMode === 'view'}
                                            placeholder="Resource Title (e.g. PDF Guide)"
                                            value={resource.resource_title}
                                            onChange={(e) => {
                                                const newResources = [...formData.resources];
                                                newResources[idx].resource_title = e.target.value;
                                                setFormData({ ...formData, resources: newResources });
                                            }}
                                            className="w-full px-4 py-3 bg-white rounded-xl focus:ring-2 focus:ring-teal-500/20 text-sm font-medium border-none"
                                         />
                                         <div className="relative w-full">
                                            <input
                                                disabled={modalMode === 'view'}
                                                placeholder="Resource URL (Download Link)"
                                                value={resource.resource_url}
                                                onChange={(e) => {
                                                    const newResources = [...formData.resources];
                                                    newResources[idx].resource_url = e.target.value;
                                                    setFormData({ ...formData, resources: newResources });
                                                }}
                                                className="w-full px-4 py-3 bg-white rounded-xl focus:ring-2 focus:ring-teal-500/20 text-sm border-none font-mono text-gray-600 pr-10"
                                            />
                                            {modalMode === 'view' && resource.resource_url && (
                                                <a href={resource.resource_url} target="_blank" rel="noopener noreferrer" className="absolute right-3 top-3 text-teal-600 hover:text-teal-800" title="Open Link">
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                         </div>
                                      </div>
                                      {modalMode !== 'view' && (
                                          <button
                                            onClick={() => {
                                                const newResources = formData.resources.filter((_: any, i: number) => i !== idx);
                                                setFormData({ ...formData, resources: newResources });
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                                          >
                                              <Trash2 size={16} />
                                          </button>
                                      )}
                                   </div>
                                ))}
                                {modalMode !== 'view' && (
                                    <button
                                      onClick={() => setFormData((prev: any) => ({
                                          ...prev,
                                          resources: [...(prev.resources || []), { resource_title: '', resource_url: '', resource_order: (prev.resources?.length || 0) + 1 }]
                                      }))}
                                      className="w-full py-4 border-2 border-dashed border-teal-200 rounded-2xl flex items-center justify-center text-teal-500 font-bold hover:bg-teal-50/50 hover:border-teal-400 transition-all group"
                                    >
                                      <div className="flex items-center space-x-2 group-hover:scale-105 transition-transform">
                                          <span className="p-1 rounded-lg bg-teal-100"><Plus size={20} /></span>
                                          <span>Add Resource</span>
                                      </div>
                                    </button>
                                )}
                                {(!formData.resources || formData.resources.length === 0) && modalMode === 'view' && (
                                    <div className="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-2xl">
                                        No resources added yet.
                                    </div>
                                )}
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                  {/* Actions */}
                  <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-100 shrink-0">
                    <button onClick={closeModal} className="px-6 py-3 bg-white text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    {modalMode !== 'view' && (
                      <button 
                        onClick={handleSave} 
                        disabled={isSubmitting}
                        className={`px-8 py-3 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 ${modalType === 'student' ? 'bg-linear-to-r from-teal-500 to-emerald-500' : modalType === 'instructor' ? 'bg-linear-to-r from-purple-600 to-indigo-600' : 'bg-linear-to-r from-blue-500 to-cyan-500'} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                        <span>{isSubmitting ? 'Saving...' : (modalMode === 'add' ? 'Create' : 'Save Changes')}</span>
                      </button>
                    )}
                  </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AdminDashboard;