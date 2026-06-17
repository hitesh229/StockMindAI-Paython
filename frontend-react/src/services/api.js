import axios from 'axios';

const API_BASE_URL = 'https://localhost:7026/api'; // Standard default .NET Core Web API dev address

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT token in request headers
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Service Endpoints
export const authService = {
  login: async (usernameOrEmail, password) => {
    const res = await api.post('/auth/login', { usernameOrEmail, password });
    if (res.data) {
      localStorage.setItem('user', JSON.stringify(res.data));
    }
    return res.data;
  },
  register: async (username, email, password, riskAppetite, investmentGoals) => {
    const res = await api.post('/auth/register', { username, email, password, riskAppetite, investmentGoals });
    if (res.data) {
      localStorage.setItem('user', JSON.stringify(res.data));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },
  updateProfile: async (riskAppetite, investmentGoals) => {
    const res = await api.put('/auth/profile', { riskAppetite, investmentGoals });
    return res.data;
  }
};

// Stock Service Endpoints
export const stockService = {
  getDetails: async (symbol) => {
    const res = await api.get(`/stock/details?symbol=${encodeURIComponent(symbol)}`);
    return res.data;
  },
  search: async (query) => {
    const res = await api.get(`/stock/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },
  getWatchlist: async () => {
    const res = await api.get('/stock/watchlist');
    return res.data;
  },
  addToWatchlist: async (symbol) => {
    const res = await api.post(`/stock/watchlist/${symbol}`);
    return res.data;
  },
  removeFromWatchlist: async (symbol) => {
    const res = await api.delete(`/stock/watchlist/${symbol}`);
    return res.data;
  },
  getAlerts: async () => {
    const res = await api.get('/stock/alerts');
    return res.data;
  },
  markAlertsRead: async () => {
    const res = await api.post('/stock/alerts/read');
    return res.data;
  }
};

// Portfolio Service Endpoints
export const portfolioService = {
  getPortfolio: async () => {
    const res = await api.get('/portfolio');
    return res.data;
  },
  addHolding: async (symbol, shares, purchasePrice, purchaseDate) => {
    const res = await api.post('/portfolio', { symbol, shares, purchasePrice, purchaseDate });
    return res.data;
  },
  deleteHolding: async (id) => {
    const res = await api.delete(`/portfolio/${id}`);
    return res.data;
  },
  getRiskReport: async () => {
    const res = await api.get('/portfolio/risk');
    return res.data;
  },
  uploadCsv: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/portfolio/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  syncBrokerHoldings: async (broker, authCode) => {
    const res = await api.post('/portfolio/broker/sync', { broker, authCode });
    return res.data;
  }
};

// AI Engine Service Endpoints
export const aiService = {
  chat: async (question, activeSymbol = null) => {
    const res = await api.post('/ai/chat', { question, activeSymbol });
    return res.data;
  },
  getChatHistory: async () => {
    const res = await api.get('/ai/chat/history');
    return res.data;
  },
  clearChatHistory: async () => {
    const res = await api.post('/ai/chat/clear');
    return res.data;
  },
  getPredictions: async (symbol) => {
    const res = await api.get(`/ai/predict?symbol=${encodeURIComponent(symbol)}`);
    return res.data;
  },
  getRecommendation: async (symbol) => {
    const res = await api.get(`/ai/recommend?symbol=${encodeURIComponent(symbol)}`);
    return res.data;
  },
  getMarketSummary: async () => {
    const res = await api.get('/ai/market-summary');
    return res.data;
  }
};

export default api;
