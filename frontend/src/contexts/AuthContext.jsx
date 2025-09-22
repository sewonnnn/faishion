import React, { createContext, useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initial check for a token on component mount
    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                setUser(decodedUser);
            } catch (error) {
                console.error("Failed to decode token:", error);
                sessionStorage.removeItem("accessToken");
            }
        }
        setIsLoading(false);
    }, []);

    // 로그인 함수
    const login = (token) => {
        sessionStorage.setItem("accessToken", token);
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
    };

    // 로그아웃 함수
    const logout = () => {
        sessionStorage.removeItem("accessToken");
        setUser(null);
    };

    // axios API 인스턴스
    const api = useMemo(() => {
        const instance = axios.create({
            baseURL: "http://localhost:8080",
            withCredentials: true
        });

        instance.interceptors.request.use((config) => {
            const token = sessionStorage.getItem("accessToken");
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });

        instance.interceptors.response.use(
            (response) => {
                const newToken = response.headers.authorization;
                console.log(newToken);
                if (newToken) {
                    sessionStorage.setItem("accessToken", newToken);
                    const decodedUser = jwtDecode(newToken);
                    setUser(decodedUser);
                }
                return response;
            },
            (error) => {
                if (error.response?.status === 401) logout();
                return Promise.reject(error);
            }
        );

        return instance;
    }, [logout]);

    if (isLoading) {
        return <div>Loading...</div>; // 👈 Show a loading indicator
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, api }}>
            {children}
        </AuthContext.Provider>
    );
};