import API_BASE_URL from '../config/api';

/**
 * Service for fetching filter data from the backend
 */
export class FiltersService {
  /**
   * Fetch all available filter options from the backend
   * @returns {Promise<Object>} Filter options including hospitals, physicians, regions
   */
  static async getFiltersData() {
    try {
      const response = await fetch(`${API_BASE_URL}/filters-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('✅ Filters data loaded successfully:', {
        hospitals: data.hospitals?.length || 0,
        physicians: data.physicians?.length || 0,
        regions: data.regions?.length || 0,
        totalRecords: data.total_records || 0
      });

      return data;
    } catch (error) {
      console.error('❌ Error fetching filters data:', error);
      throw error;
    }
  }

  /**
   * Get hospitals grouped by region/zone
   * @returns {Promise<Object>} Hospitals grouped by region
   */
  static async getHospitalsByRegion() {
    try {
      const data = await this.getFiltersData();
      
      // For now, return all hospitals - can be enhanced later to group by actual regions
      return {
        'All Regions': data.hospitals || []
      };
    } catch (error) {
      console.error('❌ Error fetching hospitals by region:', error);
      return { 'All Regions': [] };
    }
  }

  /**
   * Get physicians grouped by hospital
   * @returns {Promise<Object>} Physicians grouped by hospital
   */
  static async getPhysiciansByHospital() {
    try {
      const data = await this.getFiltersData();
      
      // For now, return all physicians - can be enhanced later to group by actual hospitals
      return {
        'All Hospitals': data.physicians || []
      };
    } catch (error) {
      console.error('❌ Error fetching physicians by hospital:', error);
      return { 'All Hospitals': [] };
    }
  }
}

export default FiltersService;