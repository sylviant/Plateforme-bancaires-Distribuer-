import axios from 'axios';

// L'API Gateway centrale tourne sur le port 8080 (Spring Cloud Gateway)
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour injecter le jeton JWT si présent
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/inscription', userData),
  getStatus: () => api.get('/auth/status').catch(() => ({ data: "Service d'identité indisponible (simulation locale)" }))
};

export const accountService = {
  getAccounts: (userId) => api.get(`/comptes/utilisateur/${userId}`),
  getAccountByNumber: (num) => api.get(`/comptes/${num}`),
  createAccount: (accountData) => api.post('/comptes', accountData)
};

export const transactionService = {
  getHistory: (accountId) => api.get(`/transactions/compte/${accountId}`),
  executeDeposit: (data) => api.post('/transactions/depot', data),
  executeWithdrawal: (data) => api.post('/transactions/retrait', data),
  executeTransfer: (data) => api.post('/transactions/transfert', data)
};

export const loanService = {
  getLoans: (userId) => api.get(`/prets/utilisateur/${userId}`),
  applyForLoan: (loanData) => api.post('/prets/demande', loanData),
  getAllRequests: () => api.get('/prets/toutes')
};

export const ocrService = {
  uploadDocument: (formData) => api.post('/ocr/analyse', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const auditService = {
  getLogs: () => api.get('/audit/logs')
};

export default api;