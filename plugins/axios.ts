import axios from "axios";
import { notification } from "antd";
import { Capacitor } from "@capacitor/core";

// 👇 choose base URL depending on environment
const api = "http://127.0.0.1:8000/backend/api/v1";
const nonApi = "http://127.0.0.1:8000/storage";
// const api = "https://bibo-ai-backend.onrender.com/backend/api/v1";
// const nonApi = "https://bibo-ai-backend.onrender.com/";

// Configure Ant Design notification globally
notification.config({
  placement: "topRight", // Changed from bottomRight
  top: 50,
  duration: 4,
  rtl: false, // Changed from true
  maxCount: 3, // Limit concurrent notifications
});

// Configure axios defaults
axios.defaults.baseURL = api;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.headers.common["Content-Type"] = "application/json";

// Only set withXSRFToken for web platform
if (!Capacitor.isNativePlatform()) {
  axios.defaults.withXSRFToken = true;
}

const axiosRequest = axios.create({
  baseURL: api,
  // Only use withCredentials on web platform
  withCredentials: !Capacitor.isNativePlatform(),
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${window.localStorage.getItem("APP_TOKEN")}`,
    Accept: "application/json",
  },
});

// Request interceptor to update token on each request
axiosRequest.interceptors.request.use(
  (config) => {
    let token = window.localStorage.getItem("APP_TOKEN");

    const studentToken = window.localStorage.getItem("APP_STUDENT_TOKEN");

    if (studentToken) {
      token = studentToken;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosRequest.interceptors.response.use(
  (res) => {
    const { status, data, request, config } = res;

    // Skip notifications for /quizzes endpoint
    // if (
    //   request?.responseURL?.endsWith("/quizzes") ||
    //   request?.responseURL?.endsWith("/quizzes/get-quiz") ||
    //   request?.responseURL?.endsWith("/quiz-attempts") ||
    //   request?.responseURL?.endsWith("/answers")
    // ) {
    //   return res;
    // }

    const isLogout = request.responseURL?.endsWith("/logout");
    const isDelete = config.method === "delete";
    const isEmailSent = data.message === "Email Sent";

    if (
      status === 201 ||
      (status === 200 && (isLogout || isDelete || isEmailSent)) ||
      status === 202
    ) {
      setTimeout(() => {
        notification.success({
          message: "Success",
          description: data.message,
          placement: "topRight",
        });
      }, 100);
    }
    return res;
  },
  (error) => {
    const { response, config, request } = error;

    // Skip notifications for /quizzes endpoint
    if (
      request?.responseURL?.endsWith("/quizzes") ||
      request?.responseURL?.endsWith("/quizzes/get-quiz")
    ) {
      return Promise.reject(error);
    }

    if (
      !response &&
      (error.code === "NETWORK_ERROR" ||
        error.code === "ECONNABORTED" ||
        !error.status)
    ) {
      setTimeout(() => {
        notification.error({
          message: "Network Error",
          description:
            "Cannot reach the server. Please check your internet connection.",
          placement: "topRight",
        });
      }, 100);
      return Promise.reject(error);
    }

    const { status, data } = response || {};

    setTimeout(() => {
      if (status === 500) {
        notification.error({
          message: "Network Error",
          description:
            "Unable to connect to the server. Please check your internet connection.",
          placement: "topRight",
        });
      } else if (status === 422) {
        notification.error({
          message: "Validation Error",
          description: data?.message || "Validation failed",
          placement: "topRight",
        });
      } else if (
        status === 419 &&
        !request?.responseURL?.endsWith("/auth-user")
      ) {
        notification.error({
          message: "Error",
          description: "Server Error",
          placement: "topRight",
        });
      } else if (
        status === 401 &&
        request?.responseURL?.endsWith("/auth-user")
      ) {
        notification.error({
          message: "Error",
          description: "Authentication Error. Please login again.",
          placement: "topRight",
        });
        window.localStorage.removeItem("APP_TOKEN");
        window.location.href = "/";
      } else {
        notification.error({
          message: "Error",
          description:
            data?.message || "Something went wrong. Please try again.",
          placement: "topRight",
        });
      }
    }, 100);

    return Promise.reject(error);
  }
);

export { axiosRequest as default, nonApi };
