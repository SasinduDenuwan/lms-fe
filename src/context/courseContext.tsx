import { createContext, useContext, useState } from "react";
import { 
    getAllCourses, 
    addCourse, 
    updateCourse, 
    deleteCourse, 
    getCourseForStudentByUserID 
} from "../services/course";

interface CourseContextType {
    courses: any[];
    loading: boolean;
    fetchAllCourses: () => Promise<void>;
    addNewCourse: (course: any) => Promise<any>;
    updatedCourseData: (courseId: string, courseData: any) => Promise<any>;
    removeCourse: (courseId: string) => Promise<any>;
    fetchStudentCourses: (userId: string) => Promise<any>;
}

export const CourseContext = createContext<CourseContextType | null>(null);

export const CourseProvider = ({ children }: { children: React.ReactNode }) => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAllCourses = async () => {
        setLoading(true);
        try {
            const res = await getAllCourses();
            if (res.code === 200 && res.data) {
                setCourses(res.data);
            }
        } catch (error) {
            console.error("Error fetching courses", error);
        } finally {
            setLoading(false);
        }
    };

    const addNewCourse = async (course: any) => {
        try {
            const res = await addCourse(course);
            await fetchAllCourses();
            return res;
        } catch (error) {
            console.error("Error adding course", error);
            throw error;
        }
    };

    const updatedCourseData = async (courseId: string, courseData: any) => {
        try {
            const res = await updateCourse(courseId, courseData);
            await fetchAllCourses();
            return res;
        } catch (error) {
            console.error("Error updating course", error);
            throw error;
        }
    };

    const removeCourse = async (courseId: string) => {
        try {
            const res = await deleteCourse(courseId);
            await fetchAllCourses();
            return res;
        } catch (error) {
            console.error("Error deleting course", error);
            throw error;
        }
    };

    const fetchStudentCourses = async (userId: string) => {
        try {
            return await getCourseForStudentByUserID(userId);
        } catch (error) {
            console.error("Error fetching student courses", error);
            throw error;
        }
    };

    return (
        <CourseContext.Provider 
            value={{ 
                courses, 
                loading, 
                fetchAllCourses, 
                addNewCourse, 
                updatedCourseData, 
                removeCourse,
                fetchStudentCourses
            }}
        >
            {children}
        </CourseContext.Provider>
    );
};

export const useCourse = () => {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error("useCourse must be used within a CourseProvider");
    }
    return context;
};
