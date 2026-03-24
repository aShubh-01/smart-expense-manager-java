import axios from "axios";
import authService from "./authService";

const API = `${import.meta.env.VITE_BACKEND_URL}/api/profile`;

const headers = () => ({ headers: { "X-User-Id": authService.getCurrentUser()?.id } });

const profileService = {
  getProfile: () => {
    return axios.get(API, headers());
  },

  updateProfile: (profile) => {
    return axios.post(API, profile, headers());
  }
};

export default profileService;
