import axios from "axios";

const API = "http://localhost:8080/api/ai";

const aiService = {

  generateFinancialReport: (data) => {
    return axios.post(`${API}/financial-report`, data);
  },

  getPrediction: () => {
    return axios.get(`${API}/prediction`);
  },

  getBehaviorInsights: () => {
    return axios.get(`${API}/behavior-insights`);
  }

};

export default aiService;