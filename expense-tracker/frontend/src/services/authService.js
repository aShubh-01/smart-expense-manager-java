import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;

const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  },

  signup: async (email, password, username) => {
    const response = await axios.post(`${API_URL}/signup`, { email, password, username });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
