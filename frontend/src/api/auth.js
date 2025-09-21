import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true,
});

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const socialCallback = (userId) => API.post("/auth/social/callback", { userId });
