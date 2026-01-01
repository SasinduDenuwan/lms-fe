import { createContext, useContext, useState } from "react";
import { 
    getStudents, 
    addStudent, 
    updateStudent, 
    deleteStudent,
    getUserProfile,
    updateUserProfile,
    changeUserPassword
} from "../services/students";

interface StudentContextType {
    students: any[];
    loading: boolean;
    fetchAllStudents: () => Promise<void>;
    addNewStudent: (student: any) => Promise<any>;
    updateStudentData: (id: string, student: any) => Promise<any>;
    removeStudent: (studentId: string) => Promise<any>;
    fetchUserProfile: () => Promise<any>;
    updateProfile: (formData: FormData) => Promise<any>;
    changePassword: (data: any) => Promise<any>;
}

export const StudentContext = createContext<StudentContextType | null>(null);

export const StudentProvider = ({ children }: { children: React.ReactNode }) => {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAllStudents = async () => {
        setLoading(true);
        try {
            const res = await getStudents();
            if (res.message === 'success' || res.data) {
                setStudents(res.data);
            }
        } catch (error) {
            console.error("Error fetching students", error);
        } finally {
            setLoading(false);
        }
    };

    const addNewStudent = async (student: any) => {
        try {
            const res = await addStudent(student);
            await fetchAllStudents();
            return res;
        } catch (error) {
            console.error("Error adding student", error);
            throw error;
        }
    };

    const updateStudentData = async (id: string, student: any) => {
        try {
            const res = await updateStudent(id, student);
            await fetchAllStudents();
            return res;
        } catch (error) {
            console.error("Error updating student", error);
            throw error;
        }
    };

    const removeStudent = async (studentId: string) => {
        try {
            const res = await deleteStudent(studentId);
            await fetchAllStudents();
            return res;
        } catch (error) {
            console.error("Error deleting student", error);
            throw error;
        }
    };

    const fetchUserProfile = async () => {
        try {
            return await getUserProfile();
        } catch (error) {
            console.error("Error fetching user profile", error);
            throw error;
        }
    };

    const updateProfile = async (formData: FormData) => {
        try {
            return await updateUserProfile(formData);
        } catch (error) {
            console.error("Error updating profile", error);
            throw error;
        }
    };

    const changePassword = async (data: any) => {
        try {
            return await changeUserPassword(data);
        } catch (error) {
            console.error("Error changing password", error);
            throw error;
        }
    };

    return (
        <StudentContext.Provider 
            value={{ 
                students, 
                loading, 
                fetchAllStudents, 
                addNewStudent, 
                updateStudentData, 
                removeStudent,
                fetchUserProfile,
                updateProfile,
                changePassword
            }}
        >
            {children}
        </StudentContext.Provider>
    );
};

export const useStudent = () => {
    const context = useContext(StudentContext);
    if (!context) {
        throw new Error("useStudent must be used within a StudentProvider");
    }
    return context;
};
