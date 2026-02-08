import React, { useState, useMemo, useEffect, useRef } from 'react';
import KaplanMeierModal from './KaplanMeierModal';
import OverallCohortChart from './OverallCohortChart';
import Global2 from './Global2';
// import APIStatus from './common/APIStatus';
import { useSurvivalAnalysis } from '../hooks/useSurvivalAnalysis';
import { useFiltersData } from '../hooks/useFiltersData';
// import { fetchSurvivalAnalysis } from '../services/survivalAnalysisService';
// Import test utilities for debugging
import { testAPIConnection, testSurvivalAnalysis } from '../utils/apiTest';
import { testOverallCohortAPI } from '../utils/testOverallCohort';
import {
  Users , Layers, Box, TrendingUp, TrendingDown,
  Filter, ChevronLeft, Calendar, Check, CircleDot, Circle, Scale,
  ChevronDown, Search, X, ChevronUp
} from 'lucide-react';

/**
 * NexCAR19 Unified Dashboard
 * Modules:
 * 1. Patient Personas: Detailed drill-down with granular filters.
 * 2. Benchmarking: Comparative analysis against SOC and Global CAR-T.
 */

// --- Constants & Mock Data ---
// Fallback data - will be replaced by real data from API
const FALLBACK_FILTERS_DATA = {
  institutes: ["Tata Memorial Center", "Apollo Mumbai", "AIIMS Delhi", "Max Healthcare", "Fortis Memorial", "CMC Vellore"],
  regions: ["North India", "West Zone", "South Zone", "East Zone", "Central India"],
  physicians: ["Dr. Anjali Gupta", "Dr. Rajesh Patil", "Dr. Vikram Singh", "Dr. Meera Reddy", "Dr. S. K. Sharma", "Dr. Kabir Khan"]
};

// SOC Regimens List
const BENCHMARK_REGIMENS = {
  NHL: ["Salvage + BMT", "R-ESHAP", "Tafasitamab + Lenalidomide", "BMT (Standard)", "POLA + BR"],
  "B-ALL": ["Inotuzumab ozogamicin", "Imatinib mesylate", "Ph+ FLAG (Flud/Cyt/G-CSF)", "Ponatinib mesylate", "PH- Inotuzumab + Mini-hyper-CVD + Blina"]
};

// Continuous Gradient Configuration - True gradient with smooth transitions
const GRADIENT_CONFIG = {
  // Define gradient stops for smooth color transitions
  clinical: {
    // Colors from dark blue (0%) to dark red (100%) through cyan, green, yellow, orange
    stops: [
      { percent: 0, color: [0, 32, 96] },      // Dark blue #002060
      { percent: 20, color: [0, 150, 200] },   // Cyan #0096c8
      { percent: 40, color: [0, 200, 100] },   // Green #00c864
      { percent: 60, color: [150, 220, 0] },   // Yellow-green #96dc00
      { percent: 80, color: [255, 165, 0] },   // Orange #ffa500
      { percent: 100, color: [139, 0, 0] }     // Dark red #8b0000
    ]
  },
  viridis: {
    // Viridis color scheme - popular in scientific visualization
    stops: [
      { percent: 0, color: [68, 1, 84] },      // Dark purple
      { percent: 25, color: [59, 82, 139] },   // Blue-purple
      { percent: 50, color: [33, 145, 140] },  // Teal
      { percent: 75, color: [94, 201, 98] },   // Green
      { percent: 100, color: [253, 231, 37] }  // Yellow
    ]
  },
  plasma: {
    // Plasma color scheme - another scientific favorite
    stops: [
      { percent: 0, color: [13, 8, 135] },     // Dark blue
      { percent: 25, color: [126, 3, 168] },   // Purple
      { percent: 50, color: [203, 70, 121] },  // Pink
      { percent: 75, color: [248, 149, 64] },  // Orange
      { percent: 100, color: [240, 249, 33] }  // Yellow
    ]
  }
};

// Linear interpolation between two colors
const interpolateColor = (color1, color2, factor) => {
  const result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
  }
  return result;
};

// Get exact color for any percentage (0-100) with smooth gradient
const getContinuousGradientColor = (percentage, scheme = 'clinical') => {
  // Clamp percentage between 0 and 100
  const clampedPercent = Math.max(0, Math.min(100, percentage));

  const stops = GRADIENT_CONFIG[scheme].stops;

  // Find the two stops that bracket our percentage
  let lowerStop = stops[0];
  let upperStop = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (clampedPercent >= stops[i].percent && clampedPercent <= stops[i + 1].percent) {
      lowerStop = stops[i];
      upperStop = stops[i + 1];
      break;
    }
  }

  // Calculate interpolation factor
  const range = upperStop.percent - lowerStop.percent;
  const factor = range === 0 ? 0 : (clampedPercent - lowerStop.percent) / range;

  // Interpolate between the two colors
  const interpolatedColor = interpolateColor(lowerStop.color, upperStop.color, factor);

  // Return as hex color
  return `rgb(${interpolatedColor[0]}, ${interpolatedColor[1]}, ${interpolatedColor[2]})`;
};

// Helper function to determine text color for contrast
const getContrastTextColor = (percentage) => {
  // For lower percentages (darker colors), use white text
  // For higher percentages (brighter colors), use dark text
  return percentage < 50 ? 'text-white' : 'text-slate-900';
};

// --- Overall Cohort Calculation Functions ---
// Calculate weighted average for overall cohort (13th curve for NHL, 5th curve for B-ALL)
// const calculateOverallCohort = (dataset, analysisType) => {
//   let totalPatients = 0;
//   let weightedPfsSum = 0;
//   let weightedOsSum = 0;

//   dataset.rows.forEach(row => {
//     dataset.columns.forEach(col => {
//       const cellData = row.values[col.id];
//       const patientCount = cellData.n;

//       weightedPfsSum += (cellData.pfs * patientCount);
//       weightedOsSum += (cellData.os * patientCount);
//       totalPatients += patientCount;
//     });
//   });

//   return {
//     pfs: Math.round(weightedPfsSum / totalPatients),
//     os: Math.round(weightedOsSum / totalPatients),
//     totalPatients: totalPatients,
//     // Create mock data for Kaplan-Meier modal
//     n: totalPatients,
//     title: 'Overall Cohort',
//     description: `Combined analysis across all ${dataset.rows.length * dataset.columns.length} patient subgroups`
//   };
// };

// --- DATA GENERATORS ---
// Helper to generate mock data based on a base NexCAR dataset but skewed for SOC/Global
const generateBenchmarkData = (baseData, modifier = 0.8) => {
  const newData = JSON.parse(JSON.stringify(baseData)); // Deep copy
  if (newData.rows) {
    newData.rows.forEach(row => {
      Object.keys(row.values).forEach(key => {
        // Mock logic: SOC is usually lower efficacy, Global CAR-T is comparable/higher
        // Randomize slightly to look real
        const variance = (Math.random() * 0.2) - 0.1; // +/- 10%
        const factor = modifier + variance;
        row.values[key].pfs = Math.min(100, Math.max(0, Math.round(row.values[key].pfs * factor)));
        if (row.values[key].os) {
          row.values[key].os = Math.min(100, Math.max(0, Math.round(row.values[key].os * factor)));
        }
      });
    });
  }
  return newData;
};

// Base NexCAR Data - matching your exact image values with OS data added
const DATA_NHL_NEXCAR = {
  totalPatients: 122,
  columns: [
    { id: 'nb_low', label: 'Low Risk', sub: 'Non-Bulky', type: 'non-bulky', range: '0-2' },
    { id: 'nb_high', label: 'High Risk', sub: 'Non-Bulky', type: 'non-bulky', range: '3-5' },
    { id: 'b_low', label: 'Low Risk', sub: 'Bulky', type: 'bulky', range: '0-2' },
    { id: 'b_high', label: 'High Risk', sub: 'Bulky', type: 'bulky', range: '3-5' },
  ],
  rows: [
    {
      id: "refractory",
      title: "Primary Refractory",
      totalN: 47,
      desc: "No response to frontline treatment",
      values: {
        nb_low: { pfs: 48, os: 52, n: 30 },
        nb_high: { pfs: 17, os: 22, n: 5 },
        b_low: { pfs: 60, os: 65, n: 18 },
        b_high: { pfs: 25, os: 30, n: 5 }
      }
    },
    {
      id: "early_relapse",
      title: "Early Relapse",
      totalN: 54,
      desc: "Relapse within 12M from last line of therapy",
      values: {
        nb_low: { pfs: 57, os: 61, n: 36 },
        nb_high: { pfs: 25, os: 30, n: 6 },
        b_low: { pfs: 33, os: 38, n: 6 },
        b_high: { pfs: 40, os: 45, n: 5 }
      }
    },
    {
      id: "late_relapse",
      title: "Late Relapse",
      totalN: 21,
      desc: "Relapse after 12M from last line of therapy",
      values: {
        nb_low: { pfs: 86, os: 88, n: 28 },
        nb_high: { pfs: 100, os: 100, n: 5 },
        b_low: { pfs: 60, os: 63, n: 5 },
        b_high: { pfs: 33, os: 40, n: 5 }
      }
    }
  ]
};

const DATA_BALL_NEXCAR = {
  totalPatients: 88,
  columns: [
    { id: 'low', label: 'Low Disease Burden', sub: 'Low', type: 'low', range: null },
    { id: 'high', label: 'High Disease Burden', sub: 'High', type: 'high', range: null }
  ],
  rows: [
    {
      id: "refractory",
      title: "Refractory Population",
      desc: "Disease that did not respond to the last line of therapy.",
      totalN: 35,
      values: {
        low: { pfs: 66, os: 70, n: 26 },
        high: { pfs: 52, os: 58, n: 9 }
      }
    },
    {
      id: "relapsed",
      title: "Relapsed Population",
      desc: "Disease that returned after a period of improvement.",
      totalN: 53,
      values: {
        low: { pfs: 47, os: 52, n: 38 },
        high: { pfs: 50, os: 55, n: 15 }
      }
    }
  ]
};

// --- Shared Components ---
const Badge = ({ children, color = "slate" }) => {
  const colors = {
    slate: "bg-slate-100 text-slate-700",
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-blue-50 text-blue-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    indigo: "bg-indigo-50 text-indigo-700"
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-sm mt-2 font-semibold ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

// --- Component: Searchable Institute Dropdown ---
const SearchableInstituteDropdown = ({
  institutes,
  selectedInstitute,
  onSelect,
  placeholder = "Search institutes..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter institutes based on search term
  const filteredInstitutes = useMemo(() => {
    if (!searchTerm) return institutes;
    return institutes.filter(institute =>
      institute.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [institutes, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (institute) => {
    onSelect(institute);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = () => {
    onSelect('');
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Institute Display / Search Input */}
      <div
        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus-within:ring-teal-500 focus-within:border-teal-500 p-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          {selectedInstitute ? (
            <div className="flex items-center gap-2 flex-1">
              <span className="truncate">{selectedInstitute}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
          <div className="text-slate-500 flex-shrink-0">
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search institutes..."
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:ring-teal-500 focus:border-teal-500"
                autoFocus
              />
            </div>
          </div>

          {/* Institute List */}
          <div className="max-h-40 overflow-y-auto">
            {filteredInstitutes.length > 0 ? (
              filteredInstitutes.map((institute) => (
                <div
                  key={institute}
                  onClick={() => handleSelect(institute)}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${selectedInstitute === institute ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-700'
                    }`}
                >
                  {institute}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400 italic">
                No institutes found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Component: Searchable Single-Select Physicians ---
const SearchablePhysicianDropdown = ({
  physicians,
  selectedPhysician,
  onSelect,
  placeholder = "Search physicians..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter physicians based on search term
  const filteredPhysicians = useMemo(() => {
    if (!searchTerm) return physicians;
    return physicians.filter(physician =>
      physician.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [physicians, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (physician) => {
    onSelect(physician);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = () => {
    onSelect('');
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Physician Display / Search Input */}
      <div
        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus-within:ring-teal-500 focus-within:border-teal-500 p-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          {selectedPhysician ? (
            <div className="flex items-center gap-2 flex-1">
              <span className="truncate">{selectedPhysician}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
          <div className="text-slate-500 flex-shrink-0">
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search physicians..."
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:ring-teal-500 focus:border-teal-500"
                autoFocus
              />
            </div>
          </div>

          {/* Physician List */}
          <div className="max-h-40 overflow-y-auto">
            {filteredPhysicians.length > 0 ? (
              filteredPhysicians.map((physician) => (
                <div
                  key={physician}
                  onClick={() => handleSelect(physician)}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${selectedPhysician === physician ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-700'
                    }`}
                >
                  {physician}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400 italic">
                No physicians found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Component: Overall Cohort Card ---
// const OverallCohortCard = ({ dataset, analysisType, gradientScheme, onCardClick, indication }) => {
//   // Use real backend data if available, otherwise fallback to frontend calculation
//   const overallCohort = dataset.overallCohort || calculateOverallCohort(dataset, analysisType);
//   const currentValue = analysisType.toLowerCase() === 'pfs' ? overallCohort.pfs : overallCohort.os;
//   const textColor = getContrastTextColor(currentValue);

//   // Determine data source for display
//   const isRealData = !!dataset.overallCohort;

//   return (
//     <div className="bg-white rounded-xl shadow-lg border-2 border-amber-200 p-6 mb-6 relative overflow-hidden">

//       <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600"></div>

//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

//         <div className="flex-1">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="bg-amber-100 rounded-full p-2">
//               <Users className="w-6 h-6 text-amber-700" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold text-slate-900">
//                 🎯 Overall Cohort - {indication}
//               </h2>
//               <p className="text-sm text-slate-600">
//                 {overallCohort.description || `Combined analysis across all patient subgroups`}
//               </p>
//             </div>
//           </div>
//           <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 mt-3">
//             <div className="flex items-center gap-2 mb-2">
//               <strong>Data Source:</strong> 
//               <span className={`px-2 py-1 rounded text-xs font-medium ${isRealData ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
//                 {isRealData ? '🔬 Backend Kaplan-Meier Analysis' : '📊 Frontend Weighted Average'}
//               </span>
//             </div>
//             <strong>Clinical Significance:</strong> {isRealData ? 'Real survival analysis using lifelines KaplanMeierFitter' : 'Weighted average based on patient distribution across all risk categories and disease characteristics'}. 
//             This represents the overall treatment efficacy for the entire patient population.
//           </div>
//         </div>

//         {/* Right side - Metrics */}
//         <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
//           {/* PFS Card */}
//           <div
//             className={`relative cursor-pointer transition-all hover:scale-105 hover:shadow-xl rounded-xl p-4 min-w-32 ${textColor === 'white' ? 'text-white' : 'text-slate-900'}`}
//             style={{ backgroundColor: getContinuousGradientColor(overallCohort.pfs, gradientScheme) }}
//             onClick={() => onCardClick && onCardClick(
//               { ...overallCohort, pfs: overallCohort.pfs, os: overallCohort.os },
//               { title: 'Overall Cohort', desc: overallCohort.description },
//               { label: 'All Patients', sub: 'Combined' }
//             )}
//           >
//             <div className="text-center">
//               <div className="text-xs font-bold opacity-80 mb-1">PFS</div>
//               <div className="text-3xl font-bold tracking-tight leading-none drop-shadow-sm">
//                 {overallCohort.pfs}%
//               </div>
//               <div className="text-xs opacity-75 mt-1">n = {overallCohort.totalPatients}</div>
//             </div>
//             {/* Subtle gradient overlay */}
//             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/5 rounded-xl pointer-events-none" />
//           </div>

//           {/* OS Card */}
//           <div
//             className={`relative cursor-pointer transition-all hover:scale-105 hover:shadow-xl rounded-xl p-4 min-w-32 ${getContrastTextColor(overallCohort.os) === 'white' ? 'text-white' : 'text-slate-900'}`}
//             style={{ backgroundColor: getContinuousGradientColor(overallCohort.os, gradientScheme) }}
//             onClick={() => onCardClick && onCardClick(
//               { ...overallCohort, pfs: overallCohort.pfs, os: overallCohort.os },
//               { title: 'Overall Cohort', desc: overallCohort.description },
//               { label: 'All Patients', sub: 'Combined' }
//             )}
//           >
//             <div className="text-center">
//               <div className="text-xs font-bold opacity-80 mb-1">OS</div>
//               <div className="text-3xl font-bold tracking-tight leading-none drop-shadow-sm">
//                 {overallCohort.os}%
//               </div>
//               <div className="text-xs opacity-75 mt-1">n = {overallCohort.totalPatients}</div>
//             </div>
//             {/* Subtle gradient overlay */}
//             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/5 rounded-xl pointer-events-none" />
//           </div>
//         </div>
//       </div>

//       {/* Bottom info bar */}
//       <div className="mt-4 pt-4 border-t border-amber-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
//         <div className="flex items-center gap-4">
//           {isRealData ? (
//             <>
//               <span>🔬 Kaplan-Meier analysis</span>
//               <span>📊 Lifelines library</span>
//               <span>📈 Real survival curves</span>
//             </>
//           ) : (
//             <>
//               <span>📊 Weighted by patient count</span>
//               <span>🔬 Clinically validated</span>
//               <span>📈 Publication ready</span>
//             </>
//           )}
//         </div>
//         <div className="text-amber-700 font-medium">
//           Click cards to view {isRealData ? 'real' : 'combined'} survival curves
//         </div>
//       </div>
//     </div>
//   );
// };

// --- Component: Heat Map Legend ---
const HeatMapLegend = ({ scheme = 'clinical' }) => {
  // Generate CSS gradient string for the legend bar
  const generateGradientCSS = (scheme) => {
    const stops = GRADIENT_CONFIG[scheme].stops;
    const gradientStops = stops.map(stop =>
      `rgb(${stop.color[0]}, ${stop.color[1]}, ${stop.color[2]}) ${stop.percent}%`
    ).join(', ');
    return `linear-gradient(to right, ${gradientStops})`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Continuous Color Gradient - Card View
      </div>
      <div className="flex items-center gap-4">
        {/* Continuous Gradient Bar */}
        <div className="flex-1">
          <div
            className="h-8 rounded-lg border border-slate-200"
            style={{ background: generateGradientCSS(scheme) }}
          />
          <div className="flex justify-between text-xs text-slate-600 mt-2">
            <span>0%</span>
            <span>20%</span>
            <span>40%</span>
            <span>60%</span>
            <span>80%</span>
            <span>100%</span>
          </div>
          <div className="text-center text-xs text-slate-500 mt-1">
            Every percentage gets a unique color
          </div>
        </div>

        {/* Sample Colors */}
        {/* <div className="flex flex-col gap-1">
          {[10, 30, 50, 70, 90].map(percent => (
            <div key={percent} className="flex items-center gap-2 text-xs">
              <div
                className="w-4 h-4 rounded border border-slate-200"
                style={{ backgroundColor: getContinuousGradientColor(percent, scheme) }}
              />
              <span className="text-slate-600 font-mono">{percent}%</span>
            </div>
          ))}
        </div> */}
      </div>

      {/* Scheme Selector */}
      {/* <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Color Schemes
        </div>
        <div className="flex gap-2">
          {Object.keys(GRADIENT_CONFIG).map(schemeName => (
            <div key={schemeName} className="text-center">
              <div
                className="w-16 h-4 rounded border border-slate-200 mb-1"
                style={{ background: generateGradientCSS(schemeName) }}
              />
              <div className="text-xs text-slate-600 capitalize">{schemeName}</div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

// --- Component: Benchmarking Summary Bar ---
const BenchmarkingSummary = ({ filters, activeIndication, currentDataset }) => {
  // Don't show summary for Global CAR-T (it has its own header)
  if (filters.comparator === 'Global CAR-T') {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Benchmarking Info */}
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 rounded-lg p-3 flex items-center gap-3">
            <Scale className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="text-lg font-bold text-indigo-900">Benchmarking</div>
              <div className="text-xs text-indigo-600 font-medium">{activeIndication} Analysis</div>
            </div>
          </div>
        </div>

        {/* Comparator Info */}
        <div className="flex-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active Comparison</div>
          <div className="flex flex-wrap gap-2">
            <Badge color="indigo">
              {filters.comparator}
            </Badge>
            {filters.comparator === 'SOC' && filters.selectedRegimen && (
              <Badge color="amber">
                {filters.selectedRegimen}
              </Badge>
            )}
            <Badge color="slate">
              vs NexCAR19
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

// // --- Component: Active Filters Summary Bar ---
// const ActiveFiltersSummary = ({ filters, activeModule, totalPatients, apiData }) => {
//   const getActiveFiltersText = () => {
//     const filterTexts = [];

//     // Define display names for levels
//     const levelNames = {
//       'global': 'Overall Cohort',
//       'institute': 'Hospitals',
//       'region': 'Geographic Regions',
//       'physician': 'Physicians'
//     };

//     if (filters.activeLevel !== 'global') {
//       filterTexts.push(`Level: ${levelNames[filters.activeLevel]}`);

//       if (filters.activeLevel === 'region' && filters.selectedRegion) {
//         filterTexts.push(`Region: ${filters.selectedRegion}`);
//       }
//       if (filters.activeLevel === 'institute' && filters.selectedInstitute) {
//         filterTexts.push(`Hospital: ${filters.selectedInstitute}`);
//       }
//       if (filters.activeLevel === 'physician' && filters.selectedPhysician) {
//         filterTexts.push(`Physician: ${filters.selectedPhysician}`);
//       }
//     }

//     if (activeModule === 'benchmarking' && filters.comparator !== 'NexCAR19') {
//       filterTexts.push(`Comparator: ${filters.comparator}`);
//       if (filters.comparator === 'SOC' && filters.selectedRegimen) {
//         filterTexts.push(`Regimen: ${filters.selectedRegimen}`);
//       }
//     }

//     return filterTexts.length > 0 ? filterTexts : ['All Patients (Overall Cohort)'];
//   };

//   // Get the actual filtered patient count from API data if available
//   // IMPORTANT: Always prioritize apiData when available, as it contains the filtered results
//   const actualPatientCount = apiData ? apiData.totalPatients : totalPatients;
//   const isFiltered = filters.activeLevel !== 'global' ||
//     (activeModule === 'benchmarking' && filters.comparator !== 'NexCAR19');

//   // Debug logging for patient count
//   React.useEffect(() => {
//     if (process.env.NODE_ENV === 'development') {
//       console.log('🔍 ActiveFiltersSummary Patient Count Debug:', {
//         'apiData?.totalPatients': apiData?.totalPatients,
//         'totalPatients': totalPatients,
//         'actualPatientCount': actualPatientCount,
//         'isFiltered': isFiltered,
//         'activeLevel': filters.activeLevel,
//         'selectedPhysician': filters.selectedPhysician,
//         'selectedRegion': filters.selectedRegion,
//         'apiData exists': !!apiData
//       });
//     }
//   }, [apiData, totalPatients, actualPatientCount, isFiltered, filters.activeLevel, filters.selectedPhysician, filters.selectedRegion]);

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//         {/* Active Filters */}
//         <div className="flex-1">
//           <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active Filters</div>
//           <div className="flex flex-wrap gap-2">
//             {getActiveFiltersText().map((filter, index) => (
//               <Badge key={index} color={isFiltered ? "amber" : "slate"}>
//                 {filter}
//               </Badge>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// --- Component: Filter Sidebar ---
const FilterSidebar = ({
  isOpen,
  toggle,
  filters,
  setFilters,
  activeModule,
  activeIndication,
  filtersData
}) => {
  // --- Helper Functions ---
  const setLevel = (level) => {
    setFilters(prev => ({
      ...prev,
      activeLevel: level,
      // Clear other selections when switching levels
      selectedInstitute: level === 'institute' ? prev.selectedInstitute : '',
      selectedRegion: level === 'region' ? prev.selectedRegion : '',
      selectedPhysician: level === 'physician' ? prev.selectedPhysician : ''
    }));
  };

  const handleComparatorChange = (type) => {
    setFilters(prev => ({
      ...prev,
      comparator: type,
      // Reset regimen if switching away from SOC
      selectedRegimen: type === 'SOC' ? (BENCHMARK_REGIMENS[activeIndication]?.[0] || '') : ''
    }));
  };

  // Safe access to regimens to prevent crash if indication mismatch
  const currentRegimens = BENCHMARK_REGIMENS[activeIndication] || [];

  // Use real data from API or fallback to mock data
  const currentFiltersData = {
    institutes: filtersData?.hospitals || FALLBACK_FILTERS_DATA.institutes,
    regions: filtersData?.regions || FALLBACK_FILTERS_DATA.regions,
    physicians: filtersData?.physicians || FALLBACK_FILTERS_DATA.physicians
  };

  // Check if we're using real data
  const isUsingRealData = filtersData && filtersData.hospitals && filtersData.hospitals.length > 0;

  // --- Render ---
  if (!isOpen) {
    return (
      <div className="fixed left-0 top-0 w-12 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 h-screen z-30 shadow-lg">
        <button onClick={toggle} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-0 w-72 bg-white border-r border-slate-200 flex flex-col h-screen overflow-y-auto z-80 shadow-lg">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          {activeModule === 'benchmarking' ? <Scale className="w-4 h-4 text-teal-600" /> : <Filter className="w-4 h-4 text-teal-600" />}
          {activeModule === 'benchmarking' ? 'Benchmarks' : 'Filters'}
        </h3>
        <button onClick={toggle} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Data Source Indicator */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${isUsingRealData ? 'bg-green-500' : 'bg-amber-500'}`}></div>
          <span className="text-slate-600 font-medium">
            {isUsingRealData ? `Real World Cohort: ${filtersData.totalRecords}` : 'Fallback Data'}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* --- COMMON: Gradient Scheme Filter --- */}
        {/* <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Box className="w-3 h-3" /> Color Scheme
          </label>
          <div className="space-y-2">
            {Object.keys(GRADIENT_CONFIG).map((scheme) => (
              <div
                key={scheme}
                onClick={() => setFilters(prev => ({ ...prev, gradientScheme: scheme }))}
                className={`p-2 rounded-lg cursor-pointer border transition-all ${filters.gradientScheme === scheme ? 'bg-teal-50 border-teal-200 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold capitalize ${filters.gradientScheme === scheme ? 'text-teal-900' : 'text-slate-700'}`}>
                    {scheme}
                  </span>
                  {filters.gradientScheme === scheme && <Check className="w-4 h-4 text-teal-600" />}
                </div>
                <div 
                  className="h-3 rounded border border-slate-200"
                  style={{ 
                    background: (() => {
                      const stops = GRADIENT_CONFIG[scheme].stops;
                      const gradientStops = stops.map(stop => 
                        `rgb(${stop.color[0]}, ${stop.color[1]}, ${stop.color[2]}) ${stop.percent}%`
                      ).join(', ');
                      return `linear-gradient(to right, ${gradientStops})`;
                    })()
                  }}
                />
              </div>
            ))}
          </div>
        </div> */}

        {/* --- Timeline Filter - Only for Patient Personas --- */}
        {activeModule === 'personas' && (
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Elapsed Time
            </label>
            <div className="relative">
              <select
                value={filters.timeline}
                onChange={(e) => setFilters(prev => ({ ...prev, timeline: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 appearance-none"
              >
                <option value="1 Month">1 Month</option>
                <option value="3 Month">3 Months</option>
                <option value="6 Month">6 Months</option>
                <option value="12 Month">12 Months</option>
                <option value="18 Month">18 Months</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        )}

        {/* --- MODULE SPECIFIC --- */}
        {activeModule === 'personas' ? (
          /* PERSONAS FILTERS */
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Analysis Level</label>
            <div className="space-y-3">
              {['global', 'institute', 'region', 'physician'].map(lvl => {
                // Define display names for each level
                const levelNames = {
                  'global': 'Overall Cohort',
                  'institute': 'Hospitals',
                  'region': 'Geographic Regions',
                  'physician': 'Physicians'
                };

                return (
                  <div key={lvl}>
                    <div
                      onClick={() => setLevel(lvl)}
                      className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${filters.activeLevel === lvl ? 'bg-teal-50 border border-teal-100' : 'hover:bg-slate-50 border border-transparent'
                        }`}
                    >
                      {filters.activeLevel === lvl ? <CircleDot className="w-4 h-4 text-teal-600" /> : <Circle className="w-4 h-4 text-slate-300" />}
                      <span className={`ml-2 text-sm font-medium ${filters.activeLevel === lvl ? 'text-teal-900' : 'text-slate-700'
                        } flex items-center gap-2`}>
                        {levelNames[lvl]}
                      </span>
                    </div>
                    {/* Sub-menus */}
                    {filters.activeLevel === lvl && lvl !== 'global' && (
                      <div className="ml-6 mt-2 pl-2 border-l-2 border-teal-100 space-y-1.5 animate-in slide-in-from-left-2 duration-200">
                        {lvl === 'region' && (
                          <div className="relative">
                            <select
                              value={filters.selectedRegion || ''}
                              onChange={(e) => setFilters(prev => ({ ...prev, selectedRegion: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2 appearance-none"
                            >
                              <option value="">Select a region...</option>
                              {currentFiltersData.regions.map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                              <ChevronDown className="h-3 w-3" />
                            </div>
                          </div>
                        )}
                        {lvl === 'institute' && (
                          <SearchableInstituteDropdown
                            institutes={currentFiltersData.institutes}
                            selectedInstitute={filters.selectedInstitute}
                            onSelect={(institute) => setFilters(prev => ({ ...prev, selectedInstitute: institute }))}
                            placeholder="Search hospitals..."
                          />
                        )}
                        {lvl === 'physician' && (
                          <SearchablePhysicianDropdown
                            physicians={currentFiltersData.physicians}
                            selectedPhysician={filters.selectedPhysician}
                            onSelect={(physician) => setFilters(prev => ({ ...prev, selectedPhysician: physician }))}
                            placeholder="Search physicians..."
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* BENCHMARKING FILTERS */
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Comparators</label>
              <div className="space-y-2">
                {['NexCAR19', 'SOC', 'Global CAR-T'].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => handleComparatorChange(opt)}
                    className={`p-3 rounded-lg cursor-pointer border transition-all ${filters.comparator === opt ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${filters.comparator === opt ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {opt}
                      </span>
                      {filters.comparator === opt && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {opt === 'NexCAR19' && 'Current RWE Data (Reference)'}
                      {opt === 'SOC' && 'Standard of Care Regimens'}
                      {opt === 'Global CAR-T' && 'International Approved Products'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-Filter: SOC Regimen Selector */}
            {filters.comparator === 'SOC' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Select Regimen</label>
                <div className="relative">
                  <select
                    value={filters.selectedRegimen}
                    onChange={(e) => setFilters(prev => ({ ...prev, selectedRegimen: e.target.value }))}
                    className="w-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2.5 appearance-none"
                  >
                    {currentRegimens.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Module: Patient Personas NHL View ---
const PersonasNHLView = ({ timeline, dataset, comparisonDataset, onCardClick, analysisType, gradientScheme, selectedPersona = null, onResetToOverall = null, activeIndication = 'NHL' }) => {
  // Calculate patient count for the card
  const totalPatients = dataset.totalPatients;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overall Cohort Card */}
      {/* <OverallCohortCard
        dataset={dataset}
        analysisType={analysisType}
        gradientScheme={gradientScheme}
        onCardClick={onCardClick}
        indication="NHL"
      /> */}

      {/* Individual Subgroups */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Individual Patient Subgroups</h3>
          <p className="text-sm text-slate-600">Detailed breakdown by risk category and disease characteristics</p>
        </div>

        <div className="w-full">
          {/* Header Grid - Full Width */}
          <div className="grid grid-cols-10 gap-2 lg:gap-4 mb-2">
            <div className="col-span-2">
              <div className="bg-teal-50 rounded-lg p-3 flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-teal-900" /><span className='text-2xl font-bold text-teal-900'>{totalPatients}</span> <span className='text-sm font-medium text-teal-600'>Patients</span>
              </div>
            </div>
            <div className="col-span-4 flex items-center justify-center bg-teal-50 rounded-t-lg border-t border-x border-teal-100 p-2 lg:p-3 text-center relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-teal-500 rounded-t-lg"></div>
              <div className="flex justify-center items-center gap-1 lg:gap-2 text-teal-800 font-bold uppercase tracking-wider text-xs lg:text-sm">
                <Layers className="w-3 h-3 lg:w-4 lg:h-4" /> Non-Bulky
              </div>
            </div>
            <div className="col-span-4 flex items-center justify-center bg-indigo-50 rounded-t-lg border-t border-x border-indigo-100 p-2 lg:p-3 text-center relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 rounded-t-lg"></div>
              <div className="flex justify-center items-center gap-1 lg:gap-2 text-indigo-800 font-bold uppercase tracking-wider text-xs lg:text-sm">
                <Box className="w-3 h-3 lg:w-4 lg:h-4" /> Bulky
              </div>
            </div>
          </div>

          <div className="grid grid-cols-10 gap-2 lg:gap-4 mb-4 lg:mb-6">
            <div className="col-span-2 flex items-end pb-2 pl-1 lg:pl-2">
              <span className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest"></span>
            </div>
            {dataset.columns.map((col, index) => (
              <div key={col.id} className="col-span-2 text-center border-b border-slate-100 pb-2">
                <div className="text-xs lg:text-sm font-bold text-slate-700">{col.label}</div>
                <div className="text-[8px] lg:text-[10px] text-slate-400 font-mono bg-slate-100 inline-block px-1 lg:px-1.5 rounded mt-1">
                  IPI {col.range}
                </div>
              </div>
            ))}
          </div>

          {/* Rows - Full Width Grid */}
          <div className="space-y-3 lg:space-y-4">
            {dataset.rows.map((row, rIdx) => (
              <div key={row.id} className="grid grid-cols-10 gap-2 lg:gap-4 items-stretch group hover:bg-slate-50/50 rounded-xl transition-colors p-1 lg:p-2 -mx-1 lg:-mx-2">
                <div className="col-span-2 flex flex-col justify-center pr-2 lg:pr-4 border-r border-slate-100 relative">
                  <h3 className="font-bold text-slate-800 text-sm lg:text-[15px] leading-tight">{row.title}</h3>
                  <p className="text-[10px] lg:text-xs text-slate-500 mt-1 line-clamp-2">{row.desc}</p>
                  <div className="text-xs text-slate-400 mt-2 font-mono flex items-center gap-1">
                    <Users className="w-3 h-3" />n = {row.totalN}
                  </div>
                </div>
                {dataset.columns.map((col, colIndex) => {
                  const currentValue = analysisType.toLowerCase() === 'pfs' ? row.values[col.id].pfs : row.values[col.id].os;
                  const compData = comparisonDataset ? comparisonDataset.rows[rIdx].values[col.id] : null;
                  const cardColor = getContinuousGradientColor(currentValue, gradientScheme);
                  const textColor = getContrastTextColor(currentValue);

                  return (
                    <div key={`${row.id}-${col.id}`} className="col-span-2">
                      <div
                        className={`h-20 lg:h-28 rounded-lg p-2 lg:p-3 flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer ${textColor} relative overflow-hidden border border-white/20`}
                        style={{ backgroundColor: cardColor }}
                        onClick={() => onCardClick && onCardClick(row.values[col.id], row, col)}
                      >
                        {/* Subtle gradient overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/5 pointer-events-none" />

                        <div className="flex justify-end items-end z-10">
                          {!compData && (
                            <div className="flex items-center gap-1 opacity-90 bg-black/15 px-1 lg:px-1.5 py-0.5 rounded text-[10px] lg:text-[12px] backdrop-blur-sm">
                              <Users className="w-2 h-2 lg:w-3 lg:h-3" />
                              <span className="font-mono">{row.values[col.id].n}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-start z-10">
                          <div className="text-xl lg:text-4xl font-bold tracking-tight leading-none drop-shadow-sm">
                            {currentValue}<span className="text-sm lg:text-lg font-medium opacity-80">%</span>
                          </div>
                          {/* Visual Bar with gradient */}
                          {!compData && (
                            <div className="w-full h-0.5 lg:h-1 bg-black/10 rounded-full mt-1 lg:mt-2 overflow-hidden">
                              <div
                                className="h-full opacity-60 rounded-full"
                                style={{
                                  width: `${currentValue}%`,
                                  backgroundColor: 'currentColor'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overall Cohort Kaplan-Meier Chart - NEW DEFAULT DISPLAY */}
      <OverallCohortChart
        indication={activeIndication}
        analysisType={analysisType}
        timeline={timeline}
        gradientScheme={gradientScheme}
        overallCohortData={dataset?.overallCohort || null}
        selectedPersonaData={selectedPersona}
        onResetToOverall={onResetToOverall}
      />
    </div>
  );
};

// --- Module: Patient Personas B-ALL View ---
const PersonasBALLView = ({ timeline, dataset, comparisonDataset, onCardClick, analysisType, gradientScheme, selectedPersona = null, onResetToOverall = null, activeIndication = 'B-ALL' }) => {
  // Calculate patient count for the card
  const totalPatients = dataset.totalPatients;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overall Cohort Card */}
      {/* <OverallCohortCard
        dataset={dataset}
        analysisType={analysisType}
        gradientScheme={gradientScheme}
        onCardClick={onCardClick}
        indication="B-ALL"
      /> */}

      {/* Individual Subgroups */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Individual Patient Subgroups</h3>
          <p className="text-sm text-slate-600">Detailed breakdown by disease burden categories</p>
        </div>

        <div className="w-full">
          {/* Header Grid - Full Width */}
          <div className="grid grid-cols-6 gap-2 lg:gap-4 mb-2">
            <div className="col-span-2">
              <div className="bg-teal-50 rounded-lg p-3 flex items-center justify-center gap-3">
                <Users className="w-6 h-6 text-teal-900" /><span className='text-3xl font-bold text-teal-900'>{totalPatients}</span> <span className='text-sm font-medium text-teal-600'>Patients</span>
              </div>
            </div>
            <div className="col-span-2 flex items-center justify-center bg-teal-50 rounded-t-lg border-t border-x border-teal-100 p-2 lg:p-3 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-teal-500 rounded-t-lg"></div>
              <span className="text-teal-800 font-bold uppercase text-xs lg:text-sm">Low Burden</span>
            </div>
            <div className="col-span-2 flex items-center justify-center bg-amber-50 rounded-t-lg border-t border-x border-amber-100 p-2 lg:p-3 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 rounded-t-lg"></div>
              <span className="text-amber-800 font-bold uppercase text-xs lg:text-sm">High Burden</span>
            </div>
          </div>

          {/* Rows - Full Width Grid */}
          <div className="space-y-4 mt-6">
            {dataset.rows.map((row, rIdx) => (
              <div key={row.id} className="grid grid-cols-6 gap-2 lg:gap-4 items-stretch group hover:bg-slate-50/50 rounded-xl transition-colors p-1 lg:p-2 -mx-1 lg:-mx-2">
                <div className="col-span-2 flex flex-col justify-center pr-2 lg:pr-4 border-r border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm lg:text-[15px] leading-tight">{row.title}</h3>
                  <p className="text-[10px] lg:text-xs text-slate-500 mt-1 line-clamp-2">{row.desc}</p>
                  <div className="text-xs text-slate-400 mt-2 font-mono flex items-center gap-1">
                    <Users className="w-3 h-3" />n = {row.totalN}
                  </div>
                </div>
                {dataset.columns.map(col => {
                  const currentValue = analysisType.toLowerCase() === 'pfs' ? row.values[col.id].pfs : row.values[col.id].os;
                  const compData = comparisonDataset ? comparisonDataset.rows[rIdx].values[col.id] : null;
                  const cardColor = getContinuousGradientColor(currentValue, gradientScheme);
                  const textColor = getContrastTextColor(currentValue);

                  return (
                    <div key={`${row.id}-${col.id}`} className="col-span-2">
                      <div
                        className={`h-20 lg:h-28 rounded-lg p-2 lg:p-3 flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer ${textColor} relative overflow-hidden border border-white/20`}
                        style={{ backgroundColor: cardColor }}
                        onClick={() => onCardClick && onCardClick(row.values[col.id], row, col)}
                      >
                        {/* Subtle gradient overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/5 pointer-events-none" />

                        <div className="flex justify-end items-start z-10">
                          {!compData && (
                            <div className="flex items-center gap-1.5 opacity-95 bg-black/15 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-xs lg:text-sm font-bold backdrop-blur-sm">
                              <Users className="w-3 h-3 lg:w-4 lg:h-4" />
                              <span className="font-mono">{row.values[col.id].n}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-start z-10 mt-auto">
                          <div className="text-3xl lg:text-5xl font-bold tracking-tight leading-none drop-shadow-sm">
                            {currentValue}<span className="text-xl lg:text-2xl font-medium opacity-80">%</span>
                          </div>
                          {/* Benchmarking Delta Badge */}
                          {compData && (
                            <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm ${(currentValue - (analysisType.toLowerCase() === 'pfs' ? compData.pfs : compData.os)) >= 0 ? 'bg-white/20 text-white' : 'bg-rose-900/30 text-rose-100'
                              }`}>
                              {(currentValue - (analysisType.toLowerCase() === 'pfs' ? compData.pfs : compData.os)) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {(currentValue - (analysisType.toLowerCase() === 'pfs' ? compData.pfs : compData.os)) > 0 ? '+' : ''}{currentValue - (analysisType.toLowerCase() === 'pfs' ? compData.pfs : compData.os)}% vs NexCAR
                            </div>
                          )}
                          {/* Visual Bar with gradient */}
                          {!compData && (
                            <div className="w-full h-0.5 lg:h-1 bg-black/10 rounded-full mt-1 lg:mt-2 overflow-hidden">
                              <div
                                className="h-full opacity-60 rounded-full"
                                style={{
                                  width: `${currentValue}%`,
                                  backgroundColor: 'currentColor'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overall Cohort Kaplan-Meier Chart - NEW DEFAULT DISPLAY */}
      <OverallCohortChart
        indication={activeIndication}
        analysisType={analysisType}
        timeline={timeline}
        gradientScheme={gradientScheme}
        overallCohortData={dataset?.overallCohort || null}
        selectedPersonaData={selectedPersona}
        onResetToOverall={onResetToOverall}
      />
    </div>
  );
};

// --- Main App Component ---
export default function RWEDashboard() {
  console.log('🔄 RWEDashboard component rendering...');

  const [activeModule, setActiveModule] = useState('personas'); // 'personas' | 'benchmarking'
  const [activeIndication, setActiveIndication] = useState('NHL');
  // Removed viewMode state since we only use card view now
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [kaplanMeierModal, setKaplanMeierModal] = useState({
    isOpen: false,
    cohortData: null,
    indication: null,
    timeline: null
  });
  const [filters, setFilters] = useState({
    timeline: '12 Month',
    activeLevel: 'global',
    selectedInstitute: '',
    selectedRegion: '',
    selectedPhysician: '',
    comparator: 'NexCAR19',
    selectedRegimen: '',
    analysisType: 'PFS', // New filter for PFS/OS
    gradientScheme: 'clinical' // New filter for gradient color scheme
  });

  // NEW: State for selected persona chart
  const [selectedPersona, setSelectedPersona] = useState(null);

  // Use the survival analysis hook for real data
  const {
    data: apiData,
    // loading: apiLoading,
    // error: apiError,
    apiHealthy
  } = useSurvivalAnalysis(filters, activeIndication, activeModule);

  // Use the filters data hook for real filter options
  const {
    filtersData,
    loading: filtersLoading,
    // error: filtersError
  } = useFiltersData();

  // Add test functions to window for debugging (development only)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Simple inline test
      const runQuickTest = async () => {
        console.log('🧪 Running quick API test...');
        try {
          const response = await fetch('http://localhost:5000/health');
          const data = await response.json();
          console.log('✅ Quick test result:', data);
        } catch (error) {
          console.error('❌ Quick test failed:', error);
        }
      };

      window.testAPI = async () => {
        console.log('🧪 Testing API connection...');
        const result = await testAPIConnection();
        console.log('API Test Result:', result);
        return result;
      };

      window.testSurvival = async () => {
        console.log('🧪 Testing survival analysis...');
        try {
          const result = await testSurvivalAnalysis();
          console.log('Survival Test Result:', result);
          return result;
        } catch (error) {
          console.error('Survival Test Error:', error);
          return null;
        }
      };

      window.testBothEndpoints = async () => {
        console.log('🧪 Testing both PFS and OS endpoints...');
        try {
          const result = await testSurvivalAnalysis();
          console.log('📊 Both endpoints tested:', result);

          // Compare first KM object values
          if (result.pfs.km_objects[0] && result.os.km_objects[0]) {
            console.log('📈 PFS 12-month survival:', Math.round(result.pfs.km_objects[0].y[12] * 100) + '%');
            console.log('📈 OS 12-month survival:', Math.round(result.os.km_objects[0].y[12] * 100) + '%');
          }

          return result;
        } catch (error) {
          console.error('Test Error:', error);
          return null;
        }
      };

      window.quickTest = runQuickTest;

      window.testOverallCohort = testOverallCohortAPI;

      console.log('🔧 Debug functions loaded:');
      console.log('  - window.testAPI() - Test API health');
      console.log('  - window.testSurvival() - Test survival analysis');
      console.log('  - window.testBothEndpoints() - Test both PFS and OS');
      console.log('  - window.testOverallCohort() - Test overall cohort API');
      console.log('  - window.quickTest() - Quick connection test');

      // Auto-run quick test
      setTimeout(runQuickTest, 1000);
    }
  }, []);

  // Debug filters data loading
  React.useEffect(() => {
    if (filtersData && !filtersLoading) {
      console.log('🎯 Real filters data loaded:', {
        hospitals: filtersData.hospitals?.length || 0,
        physicians: filtersData.physicians?.length || 0,
        regions: filtersData.regions?.length || 0,
        totalRecords: filtersData.totalRecords || 0
      });
    }
  }, [filtersData, filtersLoading]);

  // Debug API data updates
  React.useEffect(() => {
    if (apiData) {
      console.log('📊 API Data Updated in RWEDashboard:', {
        totalPatients: apiData.totalPatients,
        activeModule,
        activeLevel: filters.activeLevel,
        selectedPhysician: filters.selectedPhysician,
        selectedInstitute: filters.selectedInstitute,
        selectedRegion: filters.selectedRegion,
        timestamp: new Date().toISOString()
      });
    }
  }, [apiData, activeModule, filters.activeLevel, filters.selectedPhysician, filters.selectedInstitute, filters.selectedRegion]);

  // Function to open Kaplan-Meier modal
  const openKaplanMeierModal = (cohortData, rowData, columnData) => {
    // Instead of opening modal, update the chart to show persona data
    handlePersonaCardClick(cohortData, rowData, columnData);
  };

  // NEW: Function to handle persona card clicks
  const handlePersonaCardClick = (cohortData, rowData, columnData) => {
    try {
      console.log('🎯 Persona card clicked:', {
        cohortData,
        rowData: rowData?.title,
        columnData: columnData?.label,
        columnData_full: columnData
      });

      // Check if this is a 0% card (no patients)
      const currentValue = filters.analysisType.toLowerCase() === 'pfs' ? cohortData.pfs : cohortData.os;
      if (currentValue === 0 || cohortData.n === 0) {
        console.log('⚠️ Clicked on 0% card - no patients in this subgroup');

        // Show a user-friendly message instead of trying to find KM data
        const personaIdentifier = createPersonaIdentifier(rowData, columnData);

        // Create mock data for display purposes
        const emptyPersonaData = {
          kmData: {
            n: 0,
            x: Array.from({ length: 25 }, (_, i) => i), // 0 to 24 months
            y: Array.from({ length: 25 }, () => 0) // All zeros
          },
          patients: 0,
          persona: personaIdentifier,
          title: rowData.title,
          description: `${rowData.desc} - ${columnData?.label || 'All patients'} (${columnData?.sub || ''}) - No patients in this subgroup`,
          survivalRate: 0,
          isEmpty: true // Flag to indicate this is an empty subgroup
        };

        setSelectedPersona(emptyPersonaData);
        console.log('📊 Created empty persona data for display:', emptyPersonaData);
        return;
      }

      // Find the corresponding persona KM data from API response
      if (apiData && apiData.persona_km_objects) {
        // Create persona identifier to match with backend data
        const personaIdentifier = createPersonaIdentifier(rowData, columnData);
        console.log('🔍 Looking for persona:', personaIdentifier);
        console.log('🔍 Available personas:', apiData.persona_km_objects.map(p => p.persona));

        // Find matching KM object with exact match
        const matchingKM = apiData.persona_km_objects.find(kmObj => {
          const exactMatch = kmObj.persona === personaIdentifier;
          const titleMatch = kmObj.persona.includes(rowData.title);
          const patientMatch = kmObj.n === cohortData.n;

          console.log(`🔍 Checking "${kmObj.persona}":`, {
            exactMatch,
            titleMatch,
            patientMatch,
            kmObj_n: kmObj.n,
            cohortData_n: cohortData.n
          });

          return exactMatch || titleMatch || patientMatch;
        });

        if (matchingKM) {
          console.log('✅ Found matching KM data:', matchingKM);

          const personaData = {
            kmData: matchingKM,
            patients: matchingKM.n,
            persona: matchingKM.persona,
            title: rowData.title,
            description: `${rowData.desc} - ${columnData?.label || 'All patients'} (${columnData?.sub || ''})`,
            survivalRate: Math.round(matchingKM.y[12] * 100) // 12-month survival
          };

          setSelectedPersona(personaData);
        } else {
          console.warn('❌ No matching KM data found for persona');
          console.warn('❌ Searched for:', personaIdentifier);
          console.warn('❌ Available personas:', apiData.persona_km_objects.map(p => `"${p.persona}" (n=${p.n})`));

          // Reset to overall cohort view if no match found
          setSelectedPersona(null);
        }
      } else {
        console.warn('❌ No API data available for persona matching');
        console.warn('❌ apiData exists:', !!apiData);
        console.warn('❌ persona_km_objects exists:', !!(apiData && apiData.persona_km_objects));

        // Reset to overall cohort view if no API data
        setSelectedPersona(null);
      }
    } catch (error) {
      console.error('❌ Error in handlePersonaCardClick:', error);
      // Reset to overall cohort view on error
      setSelectedPersona(null);
    }
  };

  // Helper function to create persona identifier
  const createPersonaIdentifier = (rowData, columnData) => {
    let identifier = rowData.title;

    if (columnData) {
      // Add column information
      if (columnData.sub === 'Non-Bulky') {
        identifier += ' | Non-Bulky';
      } else if (columnData.sub === 'Bulky') {
        identifier += ' | Bulky';
      }

      if (columnData.range) {
        if (columnData.range === '0-2') {
          identifier += ' | IPI Low (0–2)';
        } else if (columnData.range === '3-5') {
          identifier += ' | IPI High (3–5)';
        }
      }

      // For B-ALL
      if (columnData.type === 'low') {
        identifier += ' | Blast <5%';
      } else if (columnData.type === 'high') {
        identifier += ' | Blast ≥5%';
      }
    }

    return identifier;
  };

  // NEW: Function to reset to overall cohort view
  const resetToOverallCohort = () => {
    try {
      console.log('🔄 Resetting to overall cohort view');
      setSelectedPersona(null);
    } catch (error) {
      console.error('❌ Error in resetToOverallCohort:', error);
    }
  };

  // Function to close Kaplan-Meier modal
  const closeKaplanMeierModal = () => {
    setKaplanMeierModal({
      isOpen: false,
      cohortData: null,
      indication: null,
      timeline: null
    });
  };

  // --- Logic to Select Dataset ---
  const currentDataset = useMemo(() => {
    console.log('🔍 Selecting dataset:', {
      activeModule,
      activeIndication,
      apiData: apiData ? 'available' : 'not available',
      apiHealthy
    });

    // 1. For personas module, use API data if available, otherwise fallback to mock
    if (activeModule === 'personas') {
      if (apiData && apiHealthy) {
        console.log('✅ Using API data for personas:', {
          totalPatients: apiData.totalPatients,
          overallCohort: apiData.overallCohort ? {
            totalPatients: apiData.overallCohort.totalPatients,
            pfs: apiData.overallCohort.pfs,
            os: apiData.overallCohort.os
          } : 'not available'
        });
        return apiData;
      }
      // Fallback to mock data
      console.log('⚠️ Using fallback mock data for personas');
      return activeIndication === 'NHL' ? DATA_NHL_NEXCAR : DATA_BALL_NEXCAR;
    }

    // 2. For benchmarking module, use mock data (can be extended later)
    const baseNexCAR = activeIndication === 'NHL' ? DATA_NHL_NEXCAR : DATA_BALL_NEXCAR;

    if (filters.comparator === 'NexCAR19') return baseNexCAR;

    // Generate mock benchmark data
    const modifier = filters.comparator === 'SOC' ? 0.65 : 1.05;
    return generateBenchmarkData(baseNexCAR, modifier);
  }, [activeModule, activeIndication, filters.comparator, apiData, apiHealthy]);

  // Comparison Reference (Always NexCAR19 for Benchmarking view when not viewing NexCAR19)
  const comparisonReference = useMemo(() => {
    if (activeModule === 'benchmarking' && filters.comparator !== 'NexCAR19') {
      return activeIndication === 'NHL' ? DATA_NHL_NEXCAR : DATA_BALL_NEXCAR;
    }
    return null;
  }, [activeModule, activeIndication, filters.comparator]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <FilterSidebar
        isOpen={isFilterOpen}
        toggle={() => setIsFilterOpen(!isFilterOpen)}
        filters={filters}
        setFilters={setFilters}
        activeModule={activeModule}
        activeIndication={activeIndication}
        filtersData={filtersData}
      />
      <div className={`transition-all duration-300 ${isFilterOpen ? 'ml-72' : 'ml-12'
        }`}>
        <div className="max-w-none px-4 lg:px-8">
          {/* Active Filters - Sticky at top for Patient Personas */}
          {activeModule === 'personas' && (
            <div className="sticky top-16 z-40 bg-slate-50 mb-3">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-col gap-4">
                  {/* Active Filters */}
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Active Filters</div>
                    <div className="flex flex-wrap gap-3">
                      {(() => {
                        const filterTexts = [];
                        const levelNames = {
                          'global': 'Overall Cohort',
                          'region': 'Geographic Regions',
                          'institute': 'Hospitals',
                          'physician': 'Physicians'
                        };

                        if (filters.activeLevel !== 'global') {
                          filterTexts.push(`Level: ${levelNames[filters.activeLevel]}`);

                          if (filters.activeLevel === 'region' && filters.selectedRegion) {
                            filterTexts.push(`Region: ${filters.selectedRegion}`);
                          }
                          if (filters.activeLevel === 'institute' && filters.selectedInstitute) {
                            filterTexts.push(`Hospital: ${filters.selectedInstitute}`);
                          }
                          if (filters.activeLevel === 'physician' && filters.selectedPhysician) {
                            filterTexts.push(`Physician: ${filters.selectedPhysician}`);
                          }
                        }

                        const isFiltered = filters.activeLevel !== 'global';
                        const displayTexts = filterTexts.length > 0 ? filterTexts : ['All Patients (Overall Cohort)'];

                        return (
                          <>
                            {displayTexts.map((filter, index) => (
                              <span key={index} className={`px-3 py-2 rounded-full text-sm font-semibold ${isFiltered ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                                {filter}
                              </span>
                            ))}
                            {/* Add Indication badge */}
                            <span className="px-3 py-2 rounded-full text-sm font-semibold bg-teal-50 text-teal-700">
                              {activeIndication}
                            </span>
                            {/* Add PFS/OS badge */}
                            <span className="px-3 py-2 rounded-full text-sm font-semibold bg-indigo-50 text-indigo-700">
                              {filters.analysisType}
                            </span>
                            {/* Add Timeline badge */}
                            <span className="px-3 py-2 rounded-full text-sm font-semibold bg-indigo-50 text-indigo-700">
                              {filters.timeline}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- Top Control Area --- */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Badge color={activeModule === 'benchmarking' ? "amber" : "indigo"}>
                {activeModule === 'benchmarking' ? "Comparative Analysis" : "NexCAR19 RWE"}
              </Badge>
              {filters.comparator !== 'NexCAR19' && activeModule === 'benchmarking' && (
                <Badge color="rose">
                  vs {filters.comparator === 'SOC' ? filters.selectedRegimen : 'Global CAR-T'}
                </Badge>
              )}
            </div>
            <div className="bg-white border border-slate-200 p-1 rounded-full shadow-sm inline-flex">
              <button
                onClick={() => { setActiveModule('personas'); setFilters(f => ({ ...f, timeline: '12 Month' })); }}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeModule === 'personas' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                Patient Personas
              </button>
              <button
                onClick={() => { setActiveModule('benchmarking'); setFilters(f => ({ ...f, timeline: '12 Month' })); }}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeModule === 'benchmarking' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                Benchmarking
              </button>
            </div>
          </div>



          {/* Header Area */}
          <div className="flex flex-col gap-6 mb-8 border-b border-slate-200 pb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
              {/* Controls - Only for Patient Personas */}
              {activeModule === 'personas' && (
                <div className="flex flex-col sm:flex-row gap-4">


                  <div className="flex flex-col">
                    <div className="bg-white border border-slate-200 p-1 rounded-full shadow-sm inline-flex">
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, analysisType: 'PFS' }))}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${filters.analysisType === 'PFS' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        PFS
                      </button>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, analysisType: 'OS' }))}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${filters.analysisType === 'OS' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        OS
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 text-center">
                      {filters.analysisType === 'PFS' ? 'Progression-Free Survival' : 'Overall Survival'}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-1 rounded-full shadow-sm inline-flex">
                    <button
                      onClick={() => setActiveIndication('NHL')}
                      className={`px-10 py-2 rounded-full text-sm font-bold transition-all ${activeIndication === 'NHL' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      NHL
                    </button>
                    <button
                      onClick={() => setActiveIndication('B-ALL')}
                      className={`px-10 py-2 rounded-full text-sm font-bold transition-all ${activeIndication === 'B-ALL' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      B-ALL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Benchmarking Summary Bar - Only for Benchmarking */}
          {activeModule === 'benchmarking' && (
            <BenchmarkingSummary
              filters={filters}
              activeIndication={activeIndication}
              currentDataset={currentDataset}
            />
          )}

          {/* API Status Indicator */}
          {/* <APIStatus
            apiHealthy={apiHealthy}
            loading={apiLoading}
            error={apiError}
          /> */}

          {/* Debug: Filters Data Status */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-700">🔧 Filters Data Status (Dev Only)</h3>
                  <div className="text-xs text-slate-500 mt-1">
                    {filtersLoading ? (
                      <span className="text-amber-600">Loading filters data...</span>
                    ) : filtersError ? (
                      <span className="text-red-600">Error: {filtersError}</span>
                    ) : (
                      <span className="text-green-600">
                        ✅ Loaded: {filtersData?.hospitals?.length || 0} hospitals, {filtersData?.physicians?.length || 0} physicians, {filtersData?.regions?.length || 0} regions
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      console.log('🎯 Current filters data:', filtersData);
                      alert(`Hospitals: ${filtersData?.hospitals?.length || 0}\nPhysicians: ${filtersData?.physicians?.length || 0}\nRegions: ${filtersData?.regions?.length || 0}`);
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium text-slate-600"
                  >
                    Debug Info
                  </button>
                  <button
                    onClick={async () => {
                      console.log('🧪 Manual API test started...');
                      console.log('Current filters:', filters);
                      
                      // Force a manual API call
                      try {
                        const result = await fetchSurvivalAnalysis(filters, activeIndication);
                        console.log('🎯 Manual API result:', result);
                        alert(`Manual test result: ${result.totalPatients} patients`);
                      } catch (error) {
                        console.error('❌ Manual API test failed:', error);
                        alert(`Manual test failed: ${error.message}`);
                      }
                    }}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-xs font-medium text-red-600"
                  >
                    Manual API Test
                  </button>
                  <button
                    onClick={() => {
                      // Reset to global view
                      setFilters(prev => ({
                        ...prev,
                        activeLevel: 'global',
                        selectedInstitute: '',
                        selectedRegion: '',
                        selectedPhysician: ''
                      }));
                    }}
                    className="px-3 py-1 bg-green-100 hover:bg-green-200 rounded text-xs font-medium text-green-600"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )} */}

          {/* Heat Map Legend - Only for Patient Personas */}
          {activeModule === 'personas' && (
            <HeatMapLegend scheme={filters.gradientScheme} />
          )}

          {/* Dynamic Content - Module-based Rendering */}
          <div className="min-h-[600px]">
            {activeModule === 'personas' ? (
              // PATIENT PERSONAS MODULE
              activeIndication === 'NHL'
                ? <PersonasNHLView
                  timeline={filters.timeline}
                  dataset={currentDataset}
                  comparisonDataset={comparisonReference}
                  onCardClick={openKaplanMeierModal}
                  analysisType={filters.analysisType}
                  gradientScheme={filters.gradientScheme}
                  selectedPersona={selectedPersona}
                  onResetToOverall={resetToOverallCohort}
                  activeIndication={activeIndication}
                />
                : <PersonasBALLView
                  timeline={filters.timeline}
                  dataset={currentDataset}
                  comparisonDataset={comparisonReference}
                  onCardClick={openKaplanMeierModal}
                  analysisType={filters.analysisType}
                  gradientScheme={filters.gradientScheme}
                  selectedPersona={selectedPersona}
                  onResetToOverall={resetToOverallCohort}
                  activeIndication={activeIndication}
                />
            ) : (
              // BENCHMARKING MODULE
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filters.comparator === 'Global CAR-T' ? (
                  // GLOBAL CAR-T BENCHMARK - Show Global2 component
                  <Global2 indication={activeIndication} />
                ) : (
                  // NexCAR19 or SOC - Show current interface
                  <>
                    {/* Benchmarking Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-indigo-100 rounded-full p-3">
                          <Scale className="w-6 h-6 text-indigo-700" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">
                            🏆 Benchmarking Analysis - {activeIndication}
                          </h3>
                          <p className="text-slate-600">
                            Compare NexCAR19 performance against {filters.comparator === 'SOC' ? 'Standard of Care' : 'Global CAR-T'} treatments
                          </p>
                        </div>
                      </div>

                      {/* Current Comparison Info */}
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-teal-600">NexCAR19</div>
                            <div className="text-xs text-slate-500">Reference Treatment</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg text-slate-400">vs</div>
                            <div className="text-xs text-slate-500">Comparison</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">{filters.comparator}</div>
                            <div className="text-xs text-slate-500">
                              {filters.comparator === 'SOC' ? filters.selectedRegimen || 'Standard of Care' : 'Global CAR-T Products'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Benchmarking Content Placeholder */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
                      <div className="text-center py-12 text-slate-500">
                        <Scale className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">
                          {filters.comparator === 'NexCAR19' ? 'NexCAR19 Reference Data' : 'SOC Benchmarking Interface'}
                        </p>
                        <p className="text-sm">Comparative analysis charts and tables will be implemented here</p>
                        <div className="mt-6 text-xs text-slate-400">
                          <p>Features coming soon:</p>
                          <ul className="mt-2 space-y-1">
                            <li>• Side-by-side survival curve comparisons</li>
                            <li>• Statistical significance testing</li>
                            <li>• Efficacy delta calculations</li>
                            <li>• Safety profile comparisons</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* DEBUG: Log dataset structure */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ display: 'none' }}>
                {console.log('🔍 Current dataset structure:', {
                  totalPatients: currentDataset?.totalPatients,
                  overallCohort: currentDataset?.overallCohort,
                  hasOverallCohort: !!currentDataset?.overallCohort,
                  overallCohortKeys: currentDataset?.overallCohort ? Object.keys(currentDataset.overallCohort) : 'none'
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kaplan-Meier Modal */}
      <KaplanMeierModal
        isOpen={kaplanMeierModal.isOpen}
        onClose={closeKaplanMeierModal}
        cohortData={kaplanMeierModal.cohortData}
        indication={kaplanMeierModal.indication}
        timeline={kaplanMeierModal.timeline}
        analysisType={kaplanMeierModal.analysisType}
        dataLevel={kaplanMeierModal.dataLevel}
        selectedInstitute={kaplanMeierModal.selectedInstitute}
        selectedRegion={kaplanMeierModal.selectedRegion}
        selectedPhysician={kaplanMeierModal.selectedPhysician}
      />
    </div>
  );
}