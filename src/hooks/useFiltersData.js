import { useState, useEffect, useCallback } from 'react';
import FiltersService from '../services/filtersService';

/**
 * Custom hook for managing filters data from the backend
 */
export const useFiltersData = () => {
  const [filtersData, setFiltersData] = useState({
    hospitals: [],
    physicians: [],
    regions: [],
    zones: [],
    totalRecords: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFiltersData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await FiltersService.getFiltersData();
      
      setFiltersData({
        hospitals: data.hospitals || [],
        physicians: data.physicians || [],
        regions: data.regions || [],
        zones: data.zones || [],
        totalRecords: data.total_records || 0
      });
      
      console.log('🎯 Filters data loaded in hook:', {
        hospitals: data.hospitals?.length || 0,
        physicians: data.physicians?.length || 0,
        regions: data.regions?.length || 0
      });
      
    } catch (err) {
      console.error('❌ Error in useFiltersData hook:', err);
      setError(err.message);
      
      // Fallback to empty arrays
      setFiltersData({
        hospitals: [],
        physicians: [],
        regions: [],
        zones: [],
        totalRecords: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiltersData();
  }, [fetchFiltersData]);

  return {
    filtersData,
    loading,
    error,
    refetch: fetchFiltersData
  };
};

export default useFiltersData;