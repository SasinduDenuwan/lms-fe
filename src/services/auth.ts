import api from "./api";

export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });

  return res.data;
};

export const register = async ( firstname:string, lastname:string, email: string, password: string) => {
  const res = await api.post("/auth/register", { firstname, lastname, email, password });
  return res.data;
};

export const getMyDetails = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const refreshTokens = async (refreshToken: string) => {
  const res = await api.post("/auth/refresh", {
    token: refreshToken,
  });
  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};  

export const checkOTP = async (email: string, otp: string) => {
  const res = await api.post("/auth/check-otp", { email, otp });
  return res.data;
};  

export const resetPassword = async (email: string, password: string) => {
  const res = await api.put("/auth/reset-password", { email, password });
  return res.data;
};