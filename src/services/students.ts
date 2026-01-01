import api from "./api";

export const getStudents = async () => {
    const res = await api.get("/student/get-all-students");
    console.log("getStudents response:", res.data);
    return res.data;
}

export const addStudent = async (student: any) => {
    const res = await api.post("/student/add-student", student);
    return res.data;
}   

export const updateStudent = async (id: string, student: any) => {
    const res = await api.put(`/student/update-student/${id}`, student);
    return res.data;
}   


export const deleteStudent = async (studentId: string) => {
    const res = await api.delete(`/student/delete-student/${studentId}`);
    return res.data;
}

// User Profile Methods
export const getUserProfile = async () => {
  const res = await api.get("/student/profile");
  return res.data;
};

export const updateUserProfile = async (formData: FormData) => {
  const res = await api.put("/student/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const changeUserPassword = async (data: any) => {
  const res = await api.put("/student/change-password", data);
  return res.data;
};