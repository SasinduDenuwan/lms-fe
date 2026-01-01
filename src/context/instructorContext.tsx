import { createContext, useContext, useState } from "react";
import { 
    getInstructors, 
    addInstructor, 
    updateInstructor, 
    deleteInstructor 
} from "../services/instructor";

interface InstructorContextType {
    instructors: any[];
    loading: boolean;
    fetchAllInstructors: () => Promise<void>;
    addNewInstructor: (instructor: any) => Promise<any>;
    updateInstructorData: (id: string, instructor: any) => Promise<any>;
    removeInstructor: (instructorId: string) => Promise<any>;
}

export const InstructorContext = createContext<InstructorContextType | null>(null);

export const InstructorProvider = ({ children }: { children: React.ReactNode }) => {
    const [instructors, setInstructors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAllInstructors = async () => {
        setLoading(true);
        try {
            const res = await getInstructors();
            if (res.message === 'success' || res.data) {
                setInstructors(res.data);
            }
        } catch (error) {
            console.error("Error fetching instructors", error);
        } finally {
            setLoading(false);
        }
    };

    const addNewInstructor = async (instructor: any) => {
        try {
            const res = await addInstructor(instructor);
            await fetchAllInstructors();
            return res;
        } catch (error) {
            console.error("Error adding instructor", error);
            throw error;
        }
    };

    const updateInstructorData = async (id: string, instructor: any) => {
        try {
            const res = await updateInstructor(id, instructor);
            await fetchAllInstructors();
            return res;
        } catch (error) {
            console.error("Error updating instructor", error);
            throw error;
        }
    };

    const removeInstructor = async (instructorId: string) => {
        try {
            const res = await deleteInstructor(instructorId);
            await fetchAllInstructors();
            return res;
        } catch (error) {
            console.error("Error deleting instructor", error);
            throw error;
        }
    };

    return (
        <InstructorContext.Provider 
            value={{ 
                instructors, 
                loading, 
                fetchAllInstructors, 
                addNewInstructor, 
                updateInstructorData, 
                removeInstructor 
            }}
        >
            {children}
        </InstructorContext.Provider>
    );
};

export const useInstructor = () => {
    const context = useContext(InstructorContext);
    if (!context) {
        throw new Error("useInstructor must be used within a InstructorProvider");
    }
    return context;
};
