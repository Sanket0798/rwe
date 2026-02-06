// Test utility to verify overall cohort API integration
import { fetchSurvivalAnalysis } from '../services/survivalAnalysisService';

export const testOverallCohortAPI = async () => {
  console.log('🧪 Testing Overall Cohort API Integration...');
  
  try {
    // Test with default parameters
    const defaultFilters = {
      activeLevel: 'global',
      selectedInstitute: '',
      selectedRegions: [],
      selectedPhysicians: [],
      analysisType: 'pfs',
      timeline: '12 Month'
    };

    console.log('📤 Sending request with filters:', defaultFilters);
    
    const result = await fetchSurvivalAnalysis(defaultFilters, 'nhl');
    
    console.log('📥 API Response:', result);
    
    if (result && result.overallCohort && result.overallCohort.kmData) {
      console.log('✅ Overall cohort data received:');
      console.log('  - Total patients:', result.totalPatients);
      console.log('  - Overall cohort patients:', result.overallCohort.totalPatients);
      console.log('  - Time points:', result.overallCohort.kmData.x?.length || 0);
      console.log('  - Survival points:', result.overallCohort.kmData.y?.length || 0);
      
      if (result.overallCohort.kmData.x && result.overallCohort.kmData.y) {
        console.log('  - Sample data points:');
        for (let i = 0; i < Math.min(5, result.overallCohort.kmData.x.length); i++) {
          const time = result.overallCohort.kmData.x[i];
          const survival = Math.round(result.overallCohort.kmData.y[i] * 100);
          console.log(`    Month ${time}: ${survival}% survival`);
        }
      }
      
      return { success: true, data: result };
    } else {
      console.error('❌ No overallCohort.kmData in response');
      console.log('Available data structure:', Object.keys(result || {}));
      return { success: false, error: 'Missing overallCohort.kmData' };
    }
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    return { success: false, error: error.message };
  }
};

// Add to window for browser console testing
if (typeof window !== 'undefined') {
  window.testOverallCohort = testOverallCohortAPI;
}