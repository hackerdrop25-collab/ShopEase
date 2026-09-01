import api from "./axios";

export const registerApi = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginApi = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};
