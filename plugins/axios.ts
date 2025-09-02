import axios from "axios";

const api = "http://localhost:8000/backend/api/v1";
// const api = "http://13.251.88.87:6083/core/api/v1"

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

// Function to handle navigation (you'll need to provide this)
let navigate: ((path: string) => void) | null = null;

// Function to show notifications (you'll need to provide this)
let showSuccessNotification:
  | ((title: string, description: string) => void)
  | null = null;
let showErrorNotification:
  | ((title: string, description: string) => void)
  | null = null;

// Function to set up the interceptors with React dependencies
export const setupAxiosInterceptors = (
  navigateFunction: (path: string) => void,
  successNotificationFunction: (title: string, description: string) => void,
  errorNotificationFunction: (title: string, description: string) => void
) => {
  navigate = navigateFunction;
  showSuccessNotification = successNotificationFunction;
  showErrorNotification = errorNotificationFunction;
};

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
      showSuccessNotification?.("Success", data.message);
    }

    return res;
  },
  (error) => {
    if (!error.response) {
      showErrorNotification?.(
        "Network Error",
        "Cannot reach the server. Please check your internet connection."
      );
      navigate?.("/network-error/1");

      return Promise.reject(error);
    }

    const { status, data, request } = error.response;

    if (status === 500) {
      showErrorNotification?.(
        "Network Error",
        "Unable to connect to the server. Please check your internet connection."
      );
      navigate?.("/network-error/2");
    } else if (status === 422) {
      showErrorNotification?.("Validation Error", data.message);
    } else if (status === 419 && !request.responseURL.endsWith("/auth-user")) {
      showErrorNotification?.("Error", "Server Error");
    } else if (status === 401 && request.responseURL.endsWith("/auth-user")) {
      showErrorNotification?.(
        "Error",
        "Authentication Error. Please login again."
      );
      window.localStorage.removeItem("APP_TOKEN");
      navigate?.("/login");
    } else {
      showErrorNotification?.(
        "Error",
        data.message || "Something went wrong. Please try again."
      );
    }

    return Promise.reject(error);
  }
);

export default axiosRequest;
