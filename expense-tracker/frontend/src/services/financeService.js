import axios from "axios";
import authService from "./authService";

const API = `${import.meta.env.VITE_BACKEND_URL}/api/finance`;

const getHeaders = () => ({ headers: { "X-User-Id": authService.getCurrentUser()?.id } });

const financeService = {
  // EMIs
  getEmis: () => axios.get(`${API}/emis`, getHeaders()),
  saveEmi: (emi) => axios.post(`${API}/emis`, emi, getHeaders()),
  deleteEmi: (id) => axios.delete(`${API}/emis/${id}`, getHeaders()),

  // Debts
  getDebts: () => axios.get(`${API}/debts`, getHeaders()),
  saveDebt: (debt) => axios.post(`${API}/debts`, debt, getHeaders()),
  deleteDebt: (id) => axios.delete(`${API}/debts/${id}`, getHeaders()),

  // Bills
  getBills: () => axios.get(`${API}/bills`, getHeaders()),
  saveBill: (bill) => axios.post(`${API}/bills`, bill, getHeaders()),
  deleteBill: (id) => axios.delete(`${API}/bills/${id}`, getHeaders()),
};

export default financeService;
