import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../plugins/axios"; // Your axios instance
import { User } from "../types/types";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState<User | undefined>();
  const navigate = useNavigate();

  async function login(payload: any) {
    const response = await axios.post("/auth/login", payload);

    window.localStorage.setItem("APP_TOKEN", response.data.token);

    window.location.href = "/dashboard";
  }

  async function logout() {
    try {
      await axios.post("/auth/logout");
      window.localStorage.removeItem("APP_TOKEN");
    } catch (e) {
      console.error(e);
    } finally {
      navigate("/login");
    }
  }

  async function getUser() {
    try {
      setLoading(true);

      const res = await axios.get("/auth/auth-user");

      setAuthUser(res.data.data);

      return res.data;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function forgot_password(payload: any) {
    const response = await axios.post("/forgot-password", payload);
    return response;
  }

  async function reset_password(payload: any) {
    const response = await axios.post("/reset-password", payload);
    return response;
  }

  async function update_password(payload: any) {
    const res = await axios.post(`update_password`, payload);
    return res;
  }

  return {
    loading,
    authUser,
    setAuthUser,
    login,
    logout,
    getUser,
    forgot_password,
    reset_password,
    update_password,
  };
};
