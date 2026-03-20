import axios from "axios";
import { message } from "antd";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.message || "Something went wrong";
    message.error(msg);
    return Promise.reject(error);
  }
);

export default api;
