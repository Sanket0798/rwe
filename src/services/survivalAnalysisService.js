import { post, get } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Service for handling survival analysis API calls
 */

// Map frontend filter values to backend API format
const mapFiltersToAPI = (filters, activeIndication) => {
  // Map indication
  const indication = activeIndication === 'NHL' ? 'nhl' : 'all';
  
  // Map analysis type - backend expects 'analysis_type', not 'endpoint'
  const analysis_type = filters.analysisType.toLowerCase(); // 'pfs' or 'os'
  
  // Map timeline to months - extract number from timeline string
  const timelineMonths = parseInt(filters.timeline.split(' ')[0]); // "12 Month" -> 12
  
  // Legacy filter mapping (for backward compatibility)
  let filter_type = 'global';
  let filter_value = 'all';
  
  if (filters.activeLevel === 'institute' && filters.selectedInstitute) {
    filter_type = 'account';
    filter_value = filters.selectedInstitute;
  } else if (filters.activeLevel === 'region' && filters.selectedRegion) {
    filter_type = 'zone';
    filter_value = filters.selectedRegion;
  } else if (filters.activeLevel === 'physician' && filters.selectedPhysician) {
    filter_type = 'hcp';
    filter_value = filters.selectedPhysician;
  }
  
  return {
    indication,
    analysis_type,
    filter_type,
    filter_value,
    lines_of_failure: "all", // Default to all for now
    // Timeline parameter - NEW!
    timeline_months: timelineMonths,
    // New enhanced filtering parameters - convert single values to arrays for backend compatibility
    active_level: filters.activeLevel || 'global',
    selected_institute: filters.selectedInstitute || '',
    selected_regions: filters.selectedRegion ? [filters.selectedRegion] : [],
    selected_physicians: filters.selectedPhysician ? [filters.selectedPhysician] : []
  };
};

// Transform API response to match frontend data structure
const transformAPIResponse = (apiResponse, indication, analysisType, timelineMonths) => {
  const { cohort_size, overall_km, n_patient_persona_bucket, persona_km_objects } = apiResponse;
  
  if (indication === 'NHL') {
    return transformNHLData(cohort_size, overall_km, n_patient_persona_bucket, persona_km_objects, analysisType, timelineMonths);
  } else {
    return transformBALLData(cohort_size, overall_km, n_patient_persona_bucket, persona_km_objects, analysisType, timelineMonths);
  }
};

const transformNHLData = (cohortSize, overallKm, personaBuckets, kmObjects, analysisType, timelineMonths) => {
  console.log('🔄 Transforming NHL data:', {
    cohortSize,
    timelineMonths,
    kmObjectsCount: kmObjects.length,
    kmObjectsPreview: kmObjects.slice(0, 3).map(obj => ({
      persona: obj.persona,
      n: obj.n,
      survival: Math.round(obj.y[timelineMonths] * 100)
    }))
  });

  // Create a mapping from persona names to survival data
  const personaMap = {};
  kmObjects.forEach(obj => {
    // Extract survival rate at the selected timeline (not fixed at 12 months)
    const survivalAtTimeline = Math.round(obj.y[timelineMonths] * 100);
    personaMap[obj.persona] = {
      pfs: survivalAtTimeline,
      os: survivalAtTimeline, 
      n: obj.n
    };
    console.log(`📊 Mapped persona: "${obj.persona}" -> n=${obj.n}, survival=${survivalAtTimeline}%`);
  });
  
  // Transform to frontend structure
  const rows = [];
  
  // Group personas by relapse type - IMPORTANT: Match backend naming exactly
  const refractory = Object.keys(personaMap).filter(p => p.includes('Primary Refractory'));
  const earlyRelapse = Object.keys(personaMap).filter(p => p.includes('Early Relapse'));
  const lateRelapse = Object.keys(personaMap).filter(p => p.includes('Late Relapse'));
  
  console.log('🔍 Grouped personas:', {
    refractory: refractory.length,
    earlyRelapse: earlyRelapse.length,
    lateRelapse: lateRelapse.length
  });
  
  if (refractory.length > 0) {
    rows.push(createNHLRow('refractory', 'Primary Refractory', 'No Response to Frontline Treatment', refractory, personaMap));
  }
  
  if (earlyRelapse.length > 0) {
    rows.push(createNHLRow('early_relapse', 'Early Relapse', 'Relapse within 12M from last line of Therapy', earlyRelapse, personaMap));
  }
  
  if (lateRelapse.length > 0) {
    rows.push(createNHLRow('late_relapse', 'Late Relapse', 'Relapse after 12M from last line of Therapy', lateRelapse, personaMap));
  }
  
  console.log('✅ NHL transformation complete:', {
    totalPatients: cohortSize,
    rowsCreated: rows.length,
    rowDetails: rows.map(r => ({ id: r.id, title: r.title, totalN: r.totalN }))
  });
  
  return {
    totalPatients: cohortSize,
    // Add overall cohort data from backend
    overallCohort: overallKm ? {
      pfs: Math.round(overallKm.y[timelineMonths] * 100), // Use selected timeline
      os: Math.round(overallKm.y[timelineMonths] * 100),  // Use selected timeline
      totalPatients: overallKm.n,
      kmData: overallKm, // Store full KM data for modal
      title: 'Overall Cohort',
      description: `Real-world evidence across all ${rows.length * 4} patient subgroups at ${timelineMonths} months`
    } : null,
    // IMPORTANT: Include the raw persona KM objects for card matching
    persona_km_objects: kmObjects,
    columns: [
      { id: 'nb_low', label: 'Low Risk', sub: 'Non-Bulky', type: 'non-bulky', range: '0-2' },
      { id: 'nb_high', label: 'High Risk', sub: 'Non-Bulky', type: 'non-bulky', range: '3-5' },
      { id: 'b_low', label: 'Low Risk', sub: 'Bulky', type: 'bulky', range: '0-2' },
      { id: 'b_high', label: 'High Risk', sub: 'Bulky', type: 'bulky', range: '3-5' },
    ],
    rows
  };
};

const createNHLRow = (id, title, desc, personas, personaMap) => {
  console.log(`🏗️ Creating NHL row: "${title}"`, {
    id,
    personasCount: personas.length,
    personas: personas
  });

  const values = {
    nb_low: { pfs: 0, os: 0, n: 0 },
    nb_high: { pfs: 0, os: 0, n: 0 },
    b_low: { pfs: 0, os: 0, n: 0 },
    b_high: { pfs: 0, os: 0, n: 0 }
  };
  
  let totalN = 0;
  
  personas.forEach(persona => {
    const data = personaMap[persona];
    totalN += data.n;
    
    console.log(`  📌 Processing persona: "${persona}"`, {
      n: data.n,
      pfs: data.pfs,
      os: data.os
    });
    
    // Map persona to column based on characteristics
    if (persona.includes('Non-Bulky') && persona.includes('Low (0–2)')) {
      values.nb_low = data;
      console.log(`    ✅ Assigned to nb_low:`, data);
    } else if (persona.includes('Non-Bulky') && persona.includes('High (3–5)')) {
      values.nb_high = data;
      console.log(`    ✅ Assigned to nb_high:`, data);
    } else if (persona.includes('Bulky') && persona.includes('Low (0–2)')) {
      values.b_low = data;
      console.log(`    ✅ Assigned to b_low:`, data);
    } else if (persona.includes('Bulky') && persona.includes('High (3–5)')) {
      values.b_high = data;
      console.log(`    ✅ Assigned to b_high:`, data);
    } else {
      console.warn(`    ⚠️ Could not map persona to column:`, persona);
    }
  });
  
  console.log(`✅ Row "${title}" created:`, {
    totalN,
    values: {
      nb_low: values.nb_low.n,
      nb_high: values.nb_high.n,
      b_low: values.b_low.n,
      b_high: values.b_high.n
    }
  });
  
  return {
    id,
    title,
    desc,
    totalN,
    values
  };
};

const transformBALLData = (cohortSize, overallKm, personaBuckets, kmObjects, analysisType, timelineMonths) => {
  console.log('🔄 Transforming B-ALL data:', {
    cohortSize,
    timelineMonths,
    kmObjectsCount: kmObjects.length,
    kmObjectsPreview: kmObjects.slice(0, 3).map(obj => ({
      persona: obj.persona,
      n: obj.n,
      survival: Math.round(obj.y[timelineMonths] * 100)
    }))
  });

  const personaMap = {};
  kmObjects.forEach(obj => {
    const survivalAtTimeline = Math.round(obj.y[timelineMonths] * 100);
    personaMap[obj.persona] = {
      pfs: survivalAtTimeline, // Actual value from API at selected timeline
      os: survivalAtTimeline,  // Same value - will be correct based on API call
      n: obj.n
    };
    console.log(`📊 Mapped persona: "${obj.persona}" -> n=${obj.n}, survival=${survivalAtTimeline}%`);
  });
  
  const rows = [];
  
  const refractory = Object.keys(personaMap).filter(p => p.includes('Refractory'));
  const relapsed = Object.keys(personaMap).filter(p => p.includes('Relapsed') && !p.includes('Refractory'));
  
  console.log('🔍 Grouped personas:', {
    refractory: refractory.length,
    relapsed: relapsed.length
  });
  
  if (refractory.length > 0) {
    rows.push(createBALLRow('refractory', 'Refractory Population', 'Disease that did not respond to the last line of therapy.', refractory, personaMap));
  }
  
  if (relapsed.length > 0) {
    rows.push(createBALLRow('relapsed', 'Relapsed Population', 'Disease that returned after a period of improvement.', relapsed, personaMap));
  }
  
  console.log('✅ B-ALL transformation complete:', {
    totalPatients: cohortSize,
    rowsCreated: rows.length,
    rowDetails: rows.map(r => ({ id: r.id, title: r.title, totalN: r.totalN }))
  });
  
  return {
    totalPatients: cohortSize,
    // Add overall cohort data from backend
    overallCohort: overallKm ? {
      pfs: Math.round(overallKm.y[timelineMonths] * 100), // Use selected timeline
      os: Math.round(overallKm.y[timelineMonths] * 100),  // Use selected timeline
      totalPatients: overallKm.n,
      kmData: overallKm, // Store full KM data for modal
      title: 'Overall Cohort',
      description: `Real-world evidence across all ${rows.length * 2} patient subgroups at ${timelineMonths} months`
    } : null,
    // IMPORTANT: Include the raw persona KM objects for card matching
    persona_km_objects: kmObjects,
    columns: [
      { id: 'low', label: 'Low Disease Burden', sub: 'Low', type: 'low', range: null },
      { id: 'high', label: 'High Disease Burden', sub: 'High', type: 'high', range: null }
    ],
    rows
  };
};

const createBALLRow = (id, title, desc, personas, personaMap) => {
  console.log(`🏗️ Creating B-ALL row: "${title}"`, {
    id,
    personasCount: personas.length,
    personas: personas
  });

  const values = {
    low: { pfs: 0, os: 0, n: 0 },
    high: { pfs: 0, os: 0, n: 0 }
  };
  
  let totalN = 0;
  
  personas.forEach(persona => {
    const data = personaMap[persona];
    totalN += data.n;
    
    console.log(`  📌 Processing persona: "${persona}"`, {
      n: data.n,
      pfs: data.pfs,
      os: data.os
    });
    
    if (persona.includes('Blast <5%')) {
      values.low = data;
      console.log(`    ✅ Assigned to low:`, data);
    } else if (persona.includes('Blast ≥5%')) {
      values.high = data;
      console.log(`    ✅ Assigned to high:`, data);
    } else {
      console.warn(`    ⚠️ Could not map persona to column:`, persona);
    }
  });
  
  console.log(`✅ Row "${title}" created:`, {
    totalN,
    values: {
      low: values.low.n,
      high: values.high.n
    }
  });
  
  return {
    id,
    title,
    desc,
    totalN,
    values
  };
};

/**
 * Fetch survival analysis data from the backend
 */
export const fetchSurvivalAnalysis = async (filters, activeIndication) => {
  try {
    const apiPayload = mapFiltersToAPI(filters, activeIndication);
    const timelineMonths = parseInt(filters.timeline.split(' ')[0]); // Extract months for transformation
    
    console.log('🚀 Sending survival analysis request:', {
      apiPayload,
      timelineMonths,
      'filters.activeLevel': filters.activeLevel,
      'filters.selectedPhysician': filters.selectedPhysician,
      'filters.selectedRegion': filters.selectedRegion,
      'apiPayload.selected_physicians': apiPayload.selected_physicians,
      'apiPayload.selected_regions': apiPayload.selected_regions,
      'filters.timeline': filters.timeline
    });
    console.log('📍 Endpoint:', API_ENDPOINTS.survivalAnalysis);
    
    const response = await post(API_ENDPOINTS.survivalAnalysis, apiPayload);
    console.log('📦 API response received:', {
      cohort_size: response.cohort_size,
      overall_km: response.overall_km,
      filter_info: response.filter_info
    });
    
    const transformedData = transformAPIResponse(response, activeIndication, filters.analysisType, timelineMonths);
    console.log('🔄 Transformed data:', {
      totalPatients: transformedData.totalPatients,
      overallCohort: transformedData.overallCohort,
      timelineMonths
    });
    
    return transformedData;
  } catch (error) {
    console.error('❌ Error fetching survival analysis:', error);
    throw error;
  }
};

/**
 * Check if the backend API is healthy
 */
export const checkAPIHealth = async () => {
  try {
    console.log('🔍 Checking API health at:', API_ENDPOINTS.health);
    const response = await get(API_ENDPOINTS.health);
    console.log('✅ API health response:', response);
    return response.status === 'ok';
  } catch (error) {
    console.error('❌ API health check failed:', error);
    return false;
  }
};

/**
 * Get Kaplan-Meier curve data for a specific cohort
 */
export const fetchKaplanMeierData = async (filters, activeIndication, cohortData) => {
  try {
    const apiPayload = mapFiltersToAPI(filters, activeIndication);
    const response = await post(API_ENDPOINTS.survivalAnalysis, apiPayload);
    
    // Check if this is overall cohort data
    if (cohortData.title === 'Overall Cohort' && response.overall_km) {
      return {
        timeline: response.overall_km.x,
        survivalProbability: response.overall_km.y,
        patientCount: response.overall_km.n,
        persona: 'Overall Cohort - All Patients'
      };
    }
    
    // Find the specific KM object for individual cohorts
    const kmObject = response.persona_km_objects.find(obj => 
      obj.persona.includes(cohortData.title) || 
      obj.n === cohortData.n
    );
    
    if (kmObject) {
      return {
        timeline: kmObject.x,
        survivalProbability: kmObject.y,
        patientCount: kmObject.n,
        persona: kmObject.persona
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Kaplan-Meier data:', error);
    throw error;
  }
};