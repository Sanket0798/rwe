// Simple API test utilities
import { API_ENDPOINTS } from '../config/api';

export const testAPIConnection = async () => {
  try {
    console.log('Testing API connection to:', API_ENDPOINTS.health);
    
    const response = await fetch(API_ENDPOINTS.health);
    const data = await response.json();
    
    console.log('API Health Check Response:', data);
    return data.status === 'ok';
  } catch (error) {
    console.error('API Connection Test Failed:', error);
    return false;
  }
};

export const testSurvivalAnalysis = async () => {
  try {
    console.log('Testing survival analysis endpoint:', API_ENDPOINTS.survivalAnalysis);
    
    // Test PFS
    const pfsPayload = {
      data_path: "RWE_Validation_Analysis_Cleaned.csv",
      indication: "nhl",
      endpoint: "pfs",
      filter_type: "global",
      filter_value: "all",
      lines_of_failure: "all"
    };
    
    console.log('🧪 Testing PFS endpoint:', pfsPayload);
    const pfsResponse = await fetch(API_ENDPOINTS.survivalAnalysis, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pfsPayload)
    });
    const pfsData = await pfsResponse.json();
    console.log('📊 PFS Response:', pfsData);
    
    // Test OS
    const osPayload = {
      data_path: "RWE_Validation_Analysis_Cleaned.csv",
      indication: "nhl",
      endpoint: "os",
      filter_type: "global",
      filter_value: "all",
      lines_of_failure: "all"
    };
    
    console.log('🧪 Testing OS endpoint:', osPayload);
    const osResponse = await fetch(API_ENDPOINTS.survivalAnalysis, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(osPayload)
    });
    const osData = await osResponse.json();
    console.log('📊 OS Response:', osData);
    
    return { pfs: pfsData, os: osData };
  } catch (error) {
    console.error('Survival Analysis Test Failed:', error);
    throw error;
  }
};

// Auto-run tests when this module is imported (for debugging)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Test Utils Loaded - Run testAPIConnection() or testSurvivalAnalysis() in console');
}