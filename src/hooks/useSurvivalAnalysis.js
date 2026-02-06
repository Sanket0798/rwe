import { useState, useEffect, useCallback } from 'react';
import { fetchSurvivalAnalysis, checkAPIHealth } from '../services/survivalAnalysisService';

/**
 * Custom hook for managing survival analysis data
 */
export const useSurvivalAnalysis = (filters, activeIndication, activeModule) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiHealthy, setApiHealthy] = useState(true);

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      console.log('🏥 Checking API health on component mount...');
      const healthy = await checkAPIHealth();
      console.log('🏥 API health result:', healthy);
      setApiHealthy(healthy);
      if (!healthy) {
        setError('Backend API is not available. Using mock data.');
      }
    };
    
    checkHealth();
  }, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    // Only fetch for personas module, benchmarking uses static data
    if (activeModule !== 'personas') {
      return;
    }

    if (!apiHealthy) {
      console.log('🚫 API not available - using fallback data');
      return;
    }

    // Check if we should make an API call based on active level
    const shouldFetch = 
      filters.activeLevel === 'global' ||
      (filters.activeLevel === 'institute' && filters.selectedInstitute) ||
      (filters.activeLevel === 'region' && filters.selectedRegion) ||
      (filters.activeLevel === 'physician' && filters.selectedPhysician);

    if (!shouldFetch) {
      console.log('⏸️ Waiting for filter selection...');
      return;
    }

    console.log('📡 Fetching survival data:', {
      level: filters.activeLevel,
      indication: activeIndication
    });
    
    setLoading(true);
    setError(null);

    try {
      const result = await fetchSurvivalAnalysis(filters, activeIndication);
      console.log('✅ Data loaded:', result.totalPatients, 'patients');
      setData(result);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, activeIndication, activeModule, apiHealthy]);

  // Fetch data when dependencies change - only for personas module
  useEffect(() => {
    // Skip entirely if not in personas module
    if (activeModule !== 'personas') {
      console.log('📊 Skipping API call - benchmarking module uses static data');
      return;
    }

    console.log('🔄 useSurvivalAnalysis useEffect triggered:', {
      activeModule,
      apiHealthy,
      'filters.activeLevel': filters.activeLevel,
      'filters.timeline': filters.timeline,
      'filters.selectedPhysician': filters.selectedPhysician,
      'filters.selectedRegion': filters.selectedRegion
    });
    fetchData();
  }, [fetchData, activeModule, apiHealthy, filters.activeLevel, filters.timeline, filters.selectedPhysician, filters.selectedRegion, filters.analysisType]);

  return {
    data,
    loading,
    error,
    apiHealthy,
    refetch: fetchData
  };
};