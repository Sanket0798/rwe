import React, { useState, useEffect } from 'react';
import { Activity, Users, X } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const getContinuousGradientColor = (percentage) => {
  const clampedPercent = Math.max(0, Math.min(100, percentage));

  const stops = [
    { percent: 0, color: [255, 140, 0] },
    { percent: 25, color: [255, 200, 0] },
    { percent: 100, color: [34, 139, 34] }
  ];

  let lowerStop = stops[0];
  let upperStop = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (clampedPercent >= stops[i].percent && clampedPercent <= stops[i + 1].percent) {
      lowerStop = stops[i];
      upperStop = stops[i + 1];
      break;
    }
  }

  const range = upperStop.percent - lowerStop.percent;
  const factor = range === 0 ? 0 : (clampedPercent - lowerStop.percent) / range;

  const interpolatedColor = lowerStop.color.map((start, i) =>
    Math.round(start + factor * (upperStop.color[i] - start))
  );

  return `rgb(${interpolatedColor[0]}, ${interpolatedColor[1]}, ${interpolatedColor[2]})`;
};

// Helper function to determine text color for contrast
const getContrastTextColor = (percentage) => {
  // For lower percentages (darker colors), use dark text
  // For higher percentages (brighter colors), use white text
  return percentage < 50 ? 'text-slate-900' : 'text-white';
};


// Define line categories as a constant (doesn't change, so defined outside component)
const LINE_CATEGORIES = [
  { id: '1', label: '1st Line Failure', description: '2 prior lines of therapy' },
  { id: '2', label: '2nd Line Failure', description: '3 prior lines of therapy' },
  { id: '3', label: '3rd Line Failure', description: '4 prior lines of therapy' },
  { id: '3+', label: '3+ Lines Failure', description: '>4 prior lines of therapy' }
];

const LinesOfFailure = ({
  indication,
  analysisType,
  timeline,
  filters,
  selectedPersona,
  onClose
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data when selectedPersona changes
  useEffect(() => {
    // Don't fetch if no persona selected or if persona is invalid
    if (!selectedPersona || !selectedPersona.title) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const timelineMonths = parseInt(timeline.split(' ')[0]);

        // Base payload with persona-specific filters
        const basePayload = {
          indication: indication.toLowerCase() === 'nhl' ? 'nhl' : 'all',
          analysis_type: analysisType.toLowerCase(),
          timeline_months: timelineMonths,
          filter_type: 'global',
          filter_value: 'all',
          active_level: filters.activeLevel || 'global',
          selected_institute: filters.selectedInstitute || '',
          selected_regions: filters.selectedRegion ? [filters.selectedRegion] : [],
          selected_physicians: filters.selectedPhysician ? [filters.selectedPhysician] : []
        };

        console.log('📡 Fetching lines of failure for persona:', selectedPersona.title);

        // Fetch data for each line category
        const promises = LINE_CATEGORIES.map(async (category) => {
          const payload = {
            ...basePayload,
            lines_of_failure: category.id
          };

          const response = await fetch(API_ENDPOINTS.survivalAnalysis, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const result = await response.json();

          // No detailed logging - keep console clean

          // Find the specific persona in the results
          let personaData = null;
          if (result.persona_km_objects && Array.isArray(result.persona_km_objects)) {
            // Try exact match first
            personaData = result.persona_km_objects.find(p =>
              p.persona === selectedPersona.title
            );

            // If no exact match, try partial match (for debugging)
            if (!personaData) {
              // Try to find by matching key parts (silent fallback)
              const searchTitle = selectedPersona.title.toLowerCase();
              personaData = result.persona_km_objects.find(p => {
                const personaLower = p.persona.toLowerCase();
                // Check if all major parts match
                return searchTitle.includes('early relapsed') && personaLower.includes('early relapsed') &&
                  searchTitle.includes('non-bulky') && personaLower.includes('non-bulky') &&
                  searchTitle.includes('high') && personaLower.includes('high');
              });
            }
          }

          // Extract survival rate
          let survivalRate = 0;
          let patientCount = 0;

          if (personaData) {
            patientCount = personaData.n || 0;
            if (personaData.x && personaData.y && Array.isArray(personaData.x) && Array.isArray(personaData.y)) {
              const timelineIndex = personaData.x.findIndex(t => t === timelineMonths);
              if (timelineIndex !== -1) {
                survivalRate = Math.round(personaData.y[timelineIndex] * 100 * 10) / 10;
              }
            }
          }

          return {
            id: category.id,
            label: category.label,
            description: category.description,
            n: patientCount,
            survival_rate: survivalRate
          };
        });

        const results = await Promise.all(promises);
        const totalPatients = results.reduce((sum, r) => sum + r.n, 0);

        // Only log summary in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Lines of failure data loaded:', {
            persona: selectedPersona.title,
            breakdown: results.map(r => ({ label: r.label, n: r.n })),
            total: totalPatients,
            expected: selectedPersona.row?.values?.[selectedPersona.col?.id]?.n || 'unknown'
          });
        }

        setData({
          persona: selectedPersona.title,
          indication: basePayload.indication,
          analysis_type: basePayload.analysis_type,
          timeline_months: timelineMonths,
          total_patients: totalPatients,
          expected_patients: selectedPersona.row?.values?.[selectedPersona.col?.id]?.n || null,
          lines_of_failure: results
        });

      } catch (err) {
        console.error('❌ Error fetching lines of failure data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPersona, indication, analysisType, timeline, filters]);

  // Don't render if no persona selected
  if (!selectedPersona || !selectedPersona.title) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm">Loading Lines of Failure Analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-700">
            <Activity className="w-5 h-5" />
            <div>
              <h3 className="font-bold">Error Loading Data</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!data || !data.lines_of_failure) {
    return null;
  }

  // Check if all lines of failure have 0 patients
  const allEmpty = data.lines_of_failure.every(line => line.n === 0);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6 animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-full p-2">
              <Activity className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Lines of Failure Analysis
              </h2>
              <p className="text-sm text-slate-600">
                Survival outcomes by prior lines of therapy
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Selected Persona Info */}
        {/* <div className="bg-white rounded-lg p-4 border border-purple-100">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Selected Persona:</span>
              <span className="text-purple-700 font-bold">{data.persona}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
              <Users className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700">
                <span className="font-bold">{data.total_patients}</span>
                {data.expected_patients && data.expected_patients !== data.total_patients && (
                  <span className="text-slate-500"> of {data.expected_patients}</span>
                )} Patients Analyzed
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
              <Activity className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700">
                <span className="font-bold">{analysisType}</span> at {timeline}
              </span>
            </div>
          </div>

          
        </div> */}
      </div>

      {/* Lines of Failure Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.lines_of_failure.map((line) => {
          const isDisabled = line.n === 0;
          const cardColor = getContinuousGradientColor(line.survival_rate);
          const textColor = getContrastTextColor(line.survival_rate); // Dynamic text color based on percentage

          return (
            <div
              key={line.id}
              className={`relative rounded-xl p-3 transition-all ${isDisabled
                ? 'cursor-not-allowed opacity-40 grayscale '
                : 'hover:shadow-lg'
                } ${textColor} overflow-hidden`}
              style={{ backgroundColor: isDisabled ? '#e2e8f0' : cardColor }}
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/5 pointer-events-none" />

              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold opacity-90">
                    {line.label}
                  </h3>
                  <div className="flex items-center gap-1 bg-black/15 px-2 py-1 rounded-lg backdrop-blur-sm">
                    <Users className="w-3 h-3" />
                    <span className="text-xs font-mono font-bold">{line.n}</span>
                  </div>
                </div>

                {/* Survival Rate */}
                <div className="mb-3">
                  <div className="text-4xl font-bold tracking-tight leading-none drop-shadow-sm">
                    {Math.round(line.survival_rate)}
                    <span className="text-xl font-medium opacity-80">%</span>
                  </div>
                  {/* <div className="text-xs opacity-75 mt-1">
                    {analysisType} Rate
                  </div> */}
                </div>

                {/* Description */}
                {/* <div className="text-xs opacity-70 mb-2">
                  {line.description}
                </div> */}

                {/* Visual Progress Bar */}
                <div className="w-full h-1 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className="h-full opacity-60 rounded-full transition-all duration-500"
                    style={{
                      width: `${line.survival_rate}%`,
                      backgroundColor: 'currentColor'
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-purple-100 text-sm text-slate-500">
        {/* All Empty State Warning */}
        {allEmpty && (
          <div className="p-3 bg-slate-50 border-l-4 border-slate-400 rounded">
            <div className="flex items-start gap-2">
              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>No data available:</strong> None of the {data.expected_patients || 'patients'} in this persona have prior treatment line information recorded. Lines of failure analysis requires this data to categorize patients.
              </p>
            </div>
          </div>
        )}

        {/* Simplified Info Note - Only show if significant difference and NOT all empty */}
        {!allEmpty && data.expected_patients && data.expected_patients !== data.total_patients &&
          (data.expected_patients - data.total_patients) > 2 && (
            <div className="p-2.5 bg-blue-50 border-l-4 border-blue-400 rounded">
              <div className="flex items-start gap-2">
                <p className="text-sm text-blue-900 leading-relaxed">
                  <strong>{data.expected_patients - data.total_patients} patient(s)</strong> from the original cohort are not shown because their prior treatment line data is not recorded in the system.
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default LinesOfFailure;
