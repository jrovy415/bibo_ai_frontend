import axios from "axios";
import { notification } from "antd";

const api = "http://localhost:8000/backend/api/v1";
// const api = "http://13.251.88.87:6083/core/api/v1"

// Configure Ant Design notification globally
notification.config({
  placement: "bottomRight",
  bottom: 50,
  duration: 3,
  rtl: true,
});

axios.defaults.baseURL = api;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.withXSRFToken = true;

const axiosRequest = axios.create({
  baseURL: api,
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${window.localStorage.getItem("APP_TOKEN")}`,
    Accept: "application/json",
  },
});

axiosRequest.interceptors.response.use(
  (res) => {
    const { status, data, request, config } = res;

    const isLogout = request.responseURL.endsWith("/logout");
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
    if (!error.response) {
      notification.error({
        message: "Network Error",
        description:
          "Cannot reach the server. Please check your internet connection.",
      });

      // Navigate to network error page
      // window.location.href = "/network-error/1";

      return Promise.reject(error);
    }

    const { status, data, request } = error.response;

    if (status === 500) {
      notification.error({
        message: "Network Error",
        description:
          "Unable to connect to the server. Please check your internet connection.",
      });
      // window.location.href = "/network-error/2";
    } else if (status === 422) {
      notification.error({
        message: "Validation Error",
        description: data.message,
      });
    } else if (status === 419 && !request.responseURL.endsWith("/auth-user")) {
      notification.error({
        message: "Error",
        description: "Server Error",
      });
    } else if (status === 401 && request.responseURL.endsWith("/auth-user")) {
      notification.error({
        message: "Error",
        description: "Authentication Error. Please login again.",
      });
      window.localStorage.removeItem("APP_TOKEN");
      window.location.href = "/";
    } else {
      notification.error({
        message: "Error",
        description: data.message || "Something went wrong. Please try again.",
      });
    }

    return Promise.reject(error);
  }
);

export default axiosRequest;
