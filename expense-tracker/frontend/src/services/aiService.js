import axios from "axios";
import authService from "./authService";

const API = "http://localhost:8080/api/ai";

const getHeaders = () => ({ headers: { "X-User-Id": authService.getCurrentUser()?.id } });

const aiService = {

  generateFinancialReport: () => {
    return axios.post(`${API}/financial-report`, {}, getHeaders());
  },

  getPrediction: () => {
    return axios.get(`${API}/prediction`, getHeaders());
  },

  getBehaviorInsights: () => {
    return axios.get(`${API}/behavior-insights`, getHeaders());
  },

  chat: (message) => {
    return axios.post(`${API}/chat`, { message }, getHeaders());
  },

  getHistory: () => {
    return axios.get(`${API}/history`, getHeaders());
  },

  deleteHistory: () => {
    return axios.delete(`${API}/history`, getHeaders());
  }

};

export default aiService;