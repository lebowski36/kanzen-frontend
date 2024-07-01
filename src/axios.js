import axios from "axios";
import store from "./store";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
});

instance.interceptors.request.use(
  (config) => {
    const token = store.state.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      console.error("API error:", error.response.data.message);
    } else {
      console.error("API error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
