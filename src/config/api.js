// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // hospitals: `${API_BASE_URL}/api/hospitals`,
  // physicians: `${API_BASE_URL}/api/physicians`,
  // predictResponse: `${API_BASE_URL}/api/predict-response`,
  // survivalData: `${API_BASE_URL}/api/survival-data`,
  // generateSurvivalPlot: `${API_BASE_URL}/api/generate-survival-plot`,
  // New survival analysis endpoint
  survivalAnalysis: `${API_BASE_URL}/survival-analysis`,
  filtersData: `${API_BASE_URL}/filters-data`,
  health: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
