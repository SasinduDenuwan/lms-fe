import api from "./api";

export const getAllCourses = async () => {
    const res = await api.get("/course/get-all-courses-admin");
    return res.data;
}

export const addCourse = async (course: any) => {
    const res = await api.post("/course/add-course", course);
    return res.data;
}   

export const updateCourse = async (courseId: string, courseData: any) => {
    const res = await api.put(`/course/update-course/${courseId}`, courseData);
    return res.data;
}   

export const deleteCourse = async (courseId: string) => {
    const res = await api.delete(`/course/delete-course/${courseId}`);
    return res.data;
}

export const getCourseForStudentByUserID = async (userID: string) => {
    const res = await api.get(`/course/get-courses-user/${userID}`);
    return res.data;
}