import axios from "axios";
import { notification } from "antd";
import { Capacitor } from "@capacitor/core";

const api = "https://bibo-ai-backend.onrender.com/backend/api/v1";

// Configure Ant Design notification globally
notification.config({
  placement: "bottomRight",
  bottom: 50,
  duration: 3,
  rtl: true,
});

// Configure axios based on platform
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
  timeout: 30000, // 30 second timeout
  headers: {
    Authorization: `Bearer ${window.localStorage.getItem("APP_TOKEN")}`,
    Accept: "application/json",
  },
});

// Request interceptor to update token on each request
axiosRequest.interceptors.request.use(
  (config) => {
    const token = window.localStorage.getItem("APP_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosRequest.interceptors.response.use(
  (res) => {
    const { status, data, request, config } = res;

    const isLogout = request.responseURL?.endsWith("/logout");
    const isDelete = config.method === "delete";
    const isEmailSent = data.message === "Email Sent";

    if (
      status === 201 ||
      (status === 200 && (isLogout || isDelete || isEmailSent)) ||
      status === 202
    ) {
      notification.success({
        message: "Success",
        description: data.message,
      });
    }

    return res;
  },
  (error) => {
    // Handle network connection errors
    if (!error.response && (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED' || !error.status)) {
      notification.error({
        message: "Network Error",
        description: "Cannot reach the server. Please check your internet connection.",
      });
      return Promise.reject(error);
    }

    const { status, data, request } = error.response || {};

    if (status === 500) {
      notification.error({
        message: "Network Error",
        description: "Unable to connect to the server. Please check your internet connection.",
      });
    } else if (status === 422) {
      notification.error({
        message: "Validation Error",
        description: data?.message || "Validation failed",
      });
    } else if (status === 419 && !request?.responseURL?.endsWith("/auth-user")) {
      notification.error({
        message: "Error",
        description: "Server Error",
      });
    } else if (status === 401 && request?.responseURL?.endsWith("/auth-user")) {
      notification.error({
        message: "Error",
        description: "Authentication Error. Please login again.",
      });
      window.localStorage.removeItem("APP_TOKEN");
      window.location.href = "/";
    } else {
      notification.error({
        message: "Error",
        description: data?.message || "Something went wrong. Please try again.",
      });
    }

    return Promise.reject(error);
  }
);

export default axiosRequest;