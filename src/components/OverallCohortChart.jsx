import { useState, useEffect } from 'react';
import { LineChart as LineChartIcon, Info, Activity, TrendingUp } from 'lucide-react';
import { fetchSurvivalAnalysis } from '../services/survivalAnalysisService';

// Generate mock data as fallback (moved outside component to avoid useEffect dependency warning)
const generateMockOverallData = (indication) => {
  const timePoints = Array.from({ length: 13 }, (_, i) => i); // 0 to 12 months
  const survivalCurve = timePoints.map(month => {
    if (month === 0) return 1.0;
    // Realistic survival curve that drops over time
    const baseRate = indication === 'NHL' ? 0.65 : 0.58; // NHL typically better than B-ALL
    const dropRate = Math.exp(-month * 0.08); // Exponential decay
    return Math.max(baseRate, dropRate);
  });

  return {
    cohort_size: indication === 'NHL' ? 175 : 88,
    overall_km: {
      n: indication === 'NHL' ? 175 : 88,
      x: timePoints,
      y: survivalCurve
    }
  };
};

const OverallCohortChart = ({
  indication = 'NHL',
  analysisType = 'PFS',
  timeline = '12 Month',
  gradientScheme = 'clinical',
  overallCohortData = null,
  selectedPersonaData = null, // NEW: for individual persona data
  onResetToOverall = null // NEW: callback to reset to overall view
}) => {
  console.log('🔄 OverallCohortChart rendered with:', {
    indication,
    analysisType,
    timeline,
    hasOverallCohortData: !!overallCohortData,
    hasSelectedPersonaData: !!selectedPersonaData
  });

  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentView, setCurrentView] = useState('overall'); // 'overall' or 'persona'

  // Use passed data or fetch from API
  useEffect(() => {
    console.log('🔄 OverallCohortChart useEffect triggered with:', {
      indication,
      analysisType,
      timeline,
      hasOverallCohortData: !!overallCohortData,
      hasSelectedPersonaData: !!selectedPersonaData
    });

    const setupChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Priority 1: If selectedPersonaData is provided, show persona chart
        if (selectedPersonaData && selectedPersonaData.kmData) {
          console.log('📊 Switching to persona view:', {
            persona: selectedPersonaData.persona,
            patients: selectedPersonaData.patients,
            survivalRate: selectedPersonaData.survivalRate,
            isEmpty: selectedPersonaData.isEmpty
          });

          const personaChartData = {
            cohort_size: selectedPersonaData.patients,
            overall_km: selectedPersonaData.kmData,
            persona_info: {
              title: selectedPersonaData.title,
              persona: selectedPersonaData.persona,
              description: selectedPersonaData.description,
              isEmpty: selectedPersonaData.isEmpty
            }
          };

          setChartData(personaChartData);
          setCurrentView('persona');
          setLoading(false);
          return;
        }

        // Priority 2: If we have overallCohortData passed as props, use it directly
        console.log('🔍 Checking overallCohortData prop:', {
          overallCohortData: overallCohortData,
          hasKmData: overallCohortData?.kmData ? 'yes' : 'no',
          totalPatients: overallCohortData?.totalPatients,
          pfs: overallCohortData?.pfs
        });

        if (overallCohortData && overallCohortData.kmData) {
          console.log('✅ Using passed overall cohort data');
          const transformedData = {
            cohort_size: overallCohortData.totalPatients,
            overall_km: overallCohortData.kmData
          };
          setChartData(transformedData);
          setCurrentView('overall');
          setLoading(false);
          return;
        }

        // Priority 3: Fetch data directly from API
        console.log('⚠️ No overallCohortData prop, fetching directly from API for indication:', indication);
        const apiFilters = {
          activeLevel: 'global',
          selectedInstitute: '',
          selectedRegion: '',
          selectedPhysician: '',
          analysisType: analysisType.toLowerCase(),
          timeline: timeline
        };

        const apiResult = await fetchSurvivalAnalysis(apiFilters, indication.toLowerCase());

        if (apiResult && apiResult.overallCohort && apiResult.overallCohort.kmData) {
          console.log('✅ Using direct API fetch result:', {
            totalPatients: apiResult.overallCohort.totalPatients,
            pfs: apiResult.overallCohort.pfs,
            indication: indication
          });

          const transformedData = {
            cohort_size: apiResult.overallCohort.totalPatients,
            overall_km: apiResult.overallCohort.kmData
          };
          setChartData(transformedData);
          setCurrentView('overall');
          setLoading(false);
          return;
        }

        // DIRECT API TEST - Let's bypass the service layer to see raw data
        console.log('🧪 Making direct API call for debugging, indication:', indication);
        const directApiPayload = {
          indication: indication.toLowerCase(), // Make sure we use the correct indication
          analysis_type: analysisType.toLowerCase(),
          filter_type: 'global',
          filter_value: 'all',
          lines_of_failure: 'all',
          active_level: 'global',
          selected_institute: '',
          selected_regions: [],
          selected_physicians: []
        };

        console.log('📤 Direct API payload:', directApiPayload);

        const directResponse = await fetch('http://localhost:5000/survival-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(directApiPayload)
        });
        const directData = await directResponse.json();

        console.log('🔍 Direct API response:', {
          cohort_size: directData.cohort_size,
          overall_km_n: directData.overall_km?.n,
          survival_at_12: directData.overall_km?.y[12] ? Math.round(directData.overall_km.y[12] * 100) : 'N/A',
          indication_used: indication
        });

        // Use the direct API data if available
        if (directData && directData.overall_km) {
          console.log('✅ Using direct API data:', {
            cohort_size: directData.cohort_size,
            indication: indication,
            survival_at_12: directData.overall_km.y[12] ? Math.round(directData.overall_km.y[12] * 100) : 'N/A'
          });
          setChartData({
            cohort_size: directData.cohort_size,
            overall_km: directData.overall_km
          });
          setCurrentView('overall');
          setLoading(false);
          return;
        }
        console.log('❌ All data sources failed, using mock data for indication:', indication);
        const mockData = generateMockOverallData(indication);
        console.log('📊 Generated mock data:', {
          cohort_size: mockData.cohort_size,
          indication: indication,
          survival_at_12: mockData.overall_km.y[12] ? Math.round(mockData.overall_km.y[12] * 100) : 'N/A'
        });
        setChartData(mockData);

      } catch (err) {
        console.error('❌ Error fetching overall cohort data:', err);
        setError(err.message);

        // Fallback to mock data for demonstration
        const mockData = generateMockOverallData(indication);
        setChartData(mockData);
      } finally {
        setLoading(false);
      }
    };

    setupChartData();
  }, [indication, analysisType, timeline, overallCohortData, selectedPersonaData]);

  // Chart rendering component
  const ChartComponent = ({ data }) => {
    const width = 800;
    const height = 350;
    const margin = { top: 40, right: 80, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Use EXACT data from backend API
    const timePoints = data.overall_km.x; // [0, 1, 2, 3, ..., 24]
    const survivalData = data.overall_km.y; // [1.0, 0.948, 0.840, ..., 0.396]
    const maxTime = Math.max(...timePoints); // Should be 24

    console.log('📊 Plotting exact backend data:', {
      timePoints: timePoints.slice(0, 5), // First 5 points
      survivalData: survivalData.slice(0, 5), // First 5 points
      maxTime,
      totalPoints: timePoints.length
    });

    // Scale functions
    const xScale = (time) => (time / maxTime) * chartWidth;
    const yScale = (survival) => chartHeight - (survival * chartHeight); // survival is already 0-1

    // Generate step-after path for Kaplan-Meier curve (EXACT plotting)
    const generateKMPath = (xData, yData) => {
      if (xData.length === 0) return '';

      let path = `M 0 ${yScale(yData[0])}`;
      for (let i = 1; i < xData.length; i++) {
        const x = xScale(xData[i]);
        const prevY = yScale(yData[i - 1]);
        const currentY = yScale(yData[i]);
        // Step-after: horizontal line then vertical drop
        path += ` L ${x} ${prevY} L ${x} ${currentY}`;
      }
      return path;
    };

    // Handle mouse events for tooltips
    const handleMouseMove = (event, index) => {
      const svgRect = event.currentTarget.closest('svg').getBoundingClientRect();

      setMousePosition({
        x: event.clientX - svgRect.left,
        y: event.clientY - svgRect.top
      });

      setHoveredPoint({
        index,
        month: timePoints[index],
        survival: Math.round(survivalData[index] * 100) // Convert to percentage for display
      });
    };

    const handleMouseLeave = () => {
      setHoveredPoint(null);
    };

    // Calculate key statistics using EXACT data
    const survivalAt12Months = timePoints.includes(12)
      ? Math.round(survivalData[timePoints.indexOf(12)] * 100)
      : Math.round(survivalData[Math.min(12, survivalData.length - 1)] * 100);

    const medianIndex = survivalData.findIndex(point => point <= 0.5);
    const medianTime = medianIndex !== -1 ? timePoints[medianIndex] : maxTime;

    console.log('📈 Calculated statistics:', {
      survivalAt12Months,
      medianTime,
      medianIndex
    });

    return (
      <div className="space-y-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start justify-end flex-col">
            {/* <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div className="text-sm text-blue-600 font-medium">Total Patients</div>
            </div> */}
            <div className="text-4xl font-bold text-blue-900">{data.overall_km.n}</div>
            <div className="text-base text-blue-600 mt-1">
              {data.persona_info?.isEmpty ? 'No patients in this subgroup' : 'Total Patients'}
            </div>
          </div>

          <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <div className="text-sm text-teal-600 font-medium">12-Month {analysisType}</div>
            </div>
            <div className="text-2xl font-bold text-teal-900">
              {data.persona_info?.isEmpty ? 'N/A' : `${survivalAt12Months}%`}
            </div>
            <div className="text-xs text-teal-600 mt-1">
              {data.persona_info?.isEmpty ? 'No data available' : 'Survival Rate'}
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <div className="text-sm text-amber-600 font-medium">Median {analysisType}</div>
            </div>
            <div className="text-2xl font-bold text-amber-900">
              {data.persona_info?.isEmpty ? 'N/A' : medianTime.toFixed(1)}
            </div>
            <div className="text-xs text-amber-600 mt-1">
              {data.persona_info?.isEmpty ? 'No data available' : 'Months'}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full flex justify-center relative bg-white rounded-xl border border-slate-200 p-4">
          {data.persona_info?.isEmpty ? (
            // Special display for empty subgroups
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-6xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>

              </div>
              <div className="text-xl font-bold text-slate-700 mb-2">No Patients in This Subgroup</div>
              <div className="text-sm text-slate-500 max-w-md">
                This patient subgroup ({data.persona_info.persona}) has no patients in the current dataset,
                so no survival curve can be generated.
              </div>
              <div className="mt-4 px-4 py-2 bg-slate-100 rounded-lg text-xs text-slate-600">
                Try clicking on a card with patients (non-zero values) to see survival curves
              </div>
            </div>
          ) : (
            // Normal chart display
            <svg width={width} height={height} className="rounded-lg">
              {/* Grid lines */}
              <g transform={`translate(${margin.left}, ${margin.top})`}>
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1.0].map(y => (
                  <line
                    key={y}
                    x1={0}
                    y1={yScale(y)}
                    x2={chartWidth}
                    y2={yScale(y)}
                    stroke="#f1f5f9"
                    strokeWidth={1}
                  />
                ))}
                {/* Vertical grid lines - use actual time points */}
                {[0, 6, 12, 18, 24].map(month => (
                  <line
                    key={month}
                    x1={xScale(month)}
                    y1={0}
                    x2={xScale(month)}
                    y2={chartHeight}
                    stroke="#f1f5f9"
                    strokeWidth={1}
                  />
                ))}

                {/* Main Kaplan-Meier curve using EXACT backend data */}
                <path
                  d={generateKMPath(timePoints, survivalData)}
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth={4}
                  style={{ cursor: 'crosshair' }}
                />

                {/* Interactive hover areas */}
                {timePoints.map((time, index) => (
                  <rect
                    key={`hover-${index}`}
                    x={index === 0 ? 0 : xScale(time) - 10}
                    y={0}
                    width={index === 0 ? 10 : 20}
                    height={chartHeight}
                    fill="transparent"
                    style={{ cursor: 'crosshair' }}
                    onMouseMove={(e) => handleMouseMove(e, index)}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}

                {/* Data points - plot every point from backend */}
                {timePoints.map((time, index) => (
                  <circle
                    key={`point-${index}`}
                    cx={xScale(time)}
                    cy={yScale(survivalData[index])}
                    r={hoveredPoint?.index === index ? 6 : 3}
                    fill="#0EA5E9"
                    stroke="white"
                    strokeWidth={2}
                    style={{ cursor: 'crosshair' }}
                    onMouseMove={(e) => handleMouseMove(e, index)}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}

                {/* Axes */}
                <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#64748b" strokeWidth={2} />
                <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#64748b" strokeWidth={2} />

                {/* X-axis labels */}
                {[0, 6, 12, 18, 24].map(month => (
                  <text
                    key={month}
                    x={xScale(month)}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    fontSize={12}
                    fill="#64748b"
                  >
                    {month}
                  </text>
                ))}

                {/* Y-axis labels */}
                {[0, 25, 50, 75, 100].map(percent => (
                  <text
                    key={percent}
                    x={-15}
                    y={yScale(percent / 100) + 4}
                    textAnchor="end"
                    fontSize={12}
                    fill="#64748b"
                  >
                    {percent}%
                  </text>
                ))}
              </g>

              {/* Axis titles */}
              <text
                x={width / 2}
                y={height - 10}
                textAnchor="middle"
                fontSize={14}
                fontWeight="bold"
                fill="#374151"
              >
                Time (Months)
              </text>

              <text
                x={20}
                y={height / 2}
                textAnchor="middle"
                fontSize={14}
                fontWeight="bold"
                fill="#374151"
                transform={`rotate(-90, 20, ${height / 2})`}
              >
                {analysisType} %
              </text>

              {/* Chart title */}
              {/* <text
                x={width / 2}
                y={25}
                textAnchor="middle"
                fontSize={16}
                fontWeight="bold"
                fill="#1f2937"
              >
                {currentView === 'persona' && chartData?.persona_info
                  ? `${chartData.persona_info.title} - ${indication} (n=${data.overall_km.n})`
                  : `Overall Cohort ${analysisType} - ${indication} (n=${data.overall_km.n})`
                }
              </text> */}

              {/* Interactive Tooltip */}
              {hoveredPoint && (
                <g transform={`translate(${mousePosition.x}, ${mousePosition.y})`}>
                  <rect
                    x={-50}
                    y={-40}
                    width={100}
                    height={50}
                    fill="white"
                    stroke="#e2e8f0"
                    strokeWidth={1}
                    rx={4}
                    filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
                  />
                  <text x={0} y={-20} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#374151">
                    {hoveredPoint.month} months
                  </text>
                  <text x={0} y={-5} textAnchor="middle" fontSize={12} fill="#0EA5E9">
                    {analysisType}: {hoveredPoint.survival}%
                  </text>
                </g>
              )}
            </svg>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <span className="text-slate-600">Loading overall cohort curve...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !chartData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 mb-6">
        <div className="flex items-center gap-3 text-red-600">
          <Info className="w-5 h-5" />
          <div>
            <div className="font-medium">Unable to load overall cohort data</div>
            <div className="text-sm text-red-500 mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg">
            <LineChartIcon className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {currentView === 'persona' && chartData?.persona_info
                ? `${chartData.persona_info.persona}`
                : 'Overall Cohort Kaplan-Meier Curve'
              }
            </h3>
            {/* <p className="text-sm text-slate-600 mt-2">
              {currentView === 'persona' && chartData?.persona_info
                ? chartData.persona_info.description
                : `Default view showing ${analysisType} analysis for ${indication} patients over ${timeline.replace(' Month', ' months')}`
              }
            </p> */}
          </div>
        </div>

        {/* Reset Button - only show when viewing persona */}
        {currentView === 'persona' && (
          <button
            onClick={() => {
              if (onResetToOverall) {
                onResetToOverall();
              }
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            ← Back to Overall Cohort
          </button>
        )}

        {error && (
          <div className="ml-auto">
            <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
              Using fallback data
            </div>
          </div>
        )}
      </div>

      {/* Chart Content */}
      {chartData && <ChartComponent data={chartData} />}

      {/* Clinical Note */}
      <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-slate-800 mb-1">Clinical Interpretation</div>
            <div className="text-sm text-slate-600">
              {chartData?.persona_info?.isEmpty ? (
                <>
                  This patient subgroup (<strong>{chartData.persona_info.persona}</strong>) contains no patients in the current dataset.
                  {/* This could indicate that this specific combination of disease characteristics and risk factors is rare,
                  or that patients with these characteristics were not included in the current study population.
                  Consider clicking on cards with patient data (non-zero values) to view meaningful survival curves. */}
                </>
              ) : currentView === 'persona' && chartData?.persona_info ? (
                <>
                  This Kaplan-Meier curve represents the {analysisType.toLowerCase()} probability for the specific patient subgroup: <strong>{chartData.persona_info.persona}</strong>.
                  {/* The step-function shows the probability of remaining progression-free at each time point for this targeted population.
                  This analysis includes {chartData?.overall_km?.n || 'available'} patients with these specific characteristics,
                  providing insights into treatment efficacy for this particular risk profile. */}
                </>
              ) : (
                <>
                  This Kaplan-Meier curve represents the overall {analysisType.toLowerCase()} probability for the entire {indication} patient cohort.
                  {/* The step-function shows the probability of remaining progression-free at each time point.
                  This analysis includes all {chartData?.overall_km?.n || 'available'} patients from the global dataset,
                  providing a comprehensive view of treatment efficacy across all risk categories and disease characteristics. */}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallCohortChart;