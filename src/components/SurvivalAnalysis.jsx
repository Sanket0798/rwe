import React, { useState, useEffect } from 'react';
import { HeartPulse, Users, Activity, Timer } from "lucide-react";

const API_BASE_URL = 'http://localhost:5000/api';

const SurvivalAnalysis = () => {
  const [indication, setIndication] = useState('Leukemia');
  const [survivalType, setSurvivalType] = useState('PFS');
  const [plotImage, setPlotImage] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maxMonths, setMaxMonths] = useState(12);
  const [availableHospitals, setAvailableHospitals] = useState([]);
  const [cutoffDate, setCutoffDate] = useState('');
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');

  // Filtering options
  const [splitByHospital, setSplitByHospital] = useState(false);
  const [selectedHospitals, setSelectedHospitals] = useState([]);

  // Leukemia specific
  const [splitRelapse, setSplitRelapse] = useState(false);
  const [splitByLines, setSplitByLines] = useState(false);
  const [linesCutoff, setLinesCutoff] = useState(3);
  const [splitByBlast, setSplitByBlast] = useState(false);
  const [blastCutoff, setBlastCutoff] = useState(5);

  // Lymphoma specific
  const [splitByBulk, setSplitByBulk] = useState(false);
  const [splitByIpi, setSplitByIpi] = useState(false);
  const [ipiCutoff, setIpiCutoff] = useState(2);

  // Demographics
  const [splitByAge, setSplitByAge] = useState(false);
  const [ageCutoff, setAgeCutoff] = useState(15);
  const [splitGender, setSplitGender] = useState(false);

  // Display options
  const [showCi, setShowCi] = useState(true);
  const [showCensor, setShowCensor] = useState(true);
  const [showRiskTable, setShowRiskTable] = useState(true);
  const [showAllPatients, setShowAllPatients] = useState(true);

  useEffect(() => {
    fetchSurvivalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indication]);

  const fetchSurvivalData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/survival-data?indication=${indication}`);
      const data = await response.json();
      setAvailableHospitals(data.hospitals || []);
      setSelectedHospitals(data.hospitals || []);
      setMinDate(data.min_date || '');
      setMaxDate(data.max_date || '');
    } catch (error) {
      console.error('Error fetching survival data:', error);
    }
  };

  const generatePlot = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/generate-survival-plot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indication,
          survival_type: survivalType,
          max_months: maxMonths,
          filters: {
            cutoff_date: cutoffDate || null,
            split_by_hospital: splitByHospital,
            selected_hospitals: selectedHospitals,
            split_relapse: splitRelapse,
            split_by_lines: splitByLines,
            lines_cutoff: linesCutoff,
            split_by_blast: splitByBlast,
            blast_cutoff: blastCutoff,
            split_by_bulk: splitByBulk,
            split_by_ipi: splitByIpi,
            ipi_cutoff: ipiCutoff,
            split_by_age: splitByAge,
            age_cutoff: ageCutoff,
            split_gender: splitGender,
            show_ci: showCi,
            show_censor: showCensor,
            show_risk_table: showRiskTable,
            show_all_patients: showAllPatients
          }
        })
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setPlotImage(data.plot);
        setStats(data.stats || []);
      }
    } catch (error) {
      console.error('Error generating plot:', error);
      alert('Error generating plot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-emerald-700 mb-6">Survival Curve Analysis</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indication</label>
            <select
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Leukemia">Leukemia</option>
              <option value="Lymphoma">Lymphoma</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Survival Type</label>
            <select
              value={survivalType}
              onChange={(e) => setSurvivalType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="PFS">PFS</option>
              <option value="OS">OS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Follow-up (months)</label>
            <input
              type="number"
              value={maxMonths}
              onChange={(e) => setMaxMonths(parseInt(e.target.value))}
              min="1"
              max="120"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Infusion Cutoff (from earliest to selected)
          </label>
          <input
            type="date"
            value={cutoffDate}
            onChange={(e) => setCutoffDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={splitByHospital}
              onChange={(e) => setSplitByHospital(e.target.checked)}
              className="mr-2 h-4 w-4 text-emerald-600"
            />
            <label className="text-sm font-medium text-gray-700">Split by Hospital</label>
          </div>
          {splitByHospital && (
            <div className="mt-3">
              <p className="grid grid-cols-1 sm:grid-cols-2 gap-2">Select hospitals (remaining grouped as Others)</p>
              <div className="grid grid-cols-2 gap-2">
                {availableHospitals.map(hospital => (
                  <div key={hospital} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedHospitals.includes(hospital)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedHospitals([...selectedHospitals, hospital]);
                        } else {
                          setSelectedHospitals(selectedHospitals.filter(h => h !== hospital));
                        }
                      }}
                      className="mr-2 h-4 w-4 text-emerald-600"
                    />
                    <label className="text-sm text-gray-700">{hospital}</label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            {indication} Specific Features
          </h3>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={splitRelapse}
                onChange={(e) => setSplitRelapse(e.target.checked)}
                className="mr-2 h-4 w-4 text-emerald-600"
              />
              <label className="text-sm font-medium text-gray-700">Split by Relapsed/Refractory</label>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={splitByLines}
                  onChange={(e) => setSplitByLines(e.target.checked)}
                  className="mr-2 h-4 w-4 text-emerald-600"
                />
                <label className="text-sm font-medium text-gray-700">Split by Previous Lines of Therapy</label>
              </div>
              {splitByLines && (
                <div className="ml-6">
                  <input
                    type="number"
                    value={linesCutoff}
                    onChange={(e) => setLinesCutoff(parseInt(e.target.value))}
                    min="0"
                    max="20"
                    className="w-32 px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Cohort 1: Lines &lt; {linesCutoff}, Cohort 2: Lines ≥ {linesCutoff}
                  </p>
                </div>
              )}
            </div>

            {indication === 'Leukemia' && (
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={splitByBlast}
                    onChange={(e) => setSplitByBlast(e.target.checked)}
                    className="mr-2 h-4 w-4 text-emerald-600"
                  />
                  <label className="text-sm font-medium text-gray-700">Split by Blast Percentage</label>
                </div>
                {splitByBlast && (
                  <div className="ml-6">
                    <input
                      type="number"
                      value={blastCutoff}
                      onChange={(e) => setBlastCutoff(parseInt(e.target.value))}
                      min="0"
                      max="100"
                      className="w-32 px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Cohort 1: Blast% &lt; {blastCutoff}, Cohort 2: Blast% ≥ {blastCutoff}
                    </p>
                  </div>
                )}
              </div>
            )}

            {indication === 'Lymphoma' && (
              <>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={splitByBulk}
                    onChange={(e) => setSplitByBulk(e.target.checked)}
                    className="mr-2 h-4 w-4 text-emerald-600"
                  />
                  <label className="text-sm font-medium text-gray-700">Split by Bulky/Non-Bulky Disease</label>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={splitByIpi}
                      onChange={(e) => setSplitByIpi(e.target.checked)}
                      className="mr-2 h-4 w-4 text-emerald-600"
                    />
                    <label className="text-sm font-medium text-gray-700">Split by IPI Score</label>
                  </div>
                  {splitByIpi && (
                    <div className="ml-6">
                      <input
                        type="number"
                        value={ipiCutoff}
                        onChange={(e) => setIpiCutoff(parseInt(e.target.value))}
                        min="0"
                        max="4"
                        className="w-32 px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Cohort 1: IPI &lt; {ipiCutoff} (Low), Cohort 2: IPI ≥ {ipiCutoff} (High)
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Demographic Selection</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={splitByAge}
                  onChange={(e) => setSplitByAge(e.target.checked)}
                  className="mr-2 h-4 w-4 text-emerald-600"
                />
                <label className="text-sm font-medium text-gray-700">Split by Age</label>
              </div>
              {splitByAge && (
                <div className="ml-6">
                  <input
                    type="number"
                    value={ageCutoff}
                    onChange={(e) => setAgeCutoff(parseInt(e.target.value))}
                    min="0"
                    max="120"
                    className="w-32 px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-1">Age cutoff</p>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={splitGender}
                onChange={(e) => setSplitGender(e.target.checked)}
                className="mr-2 h-4 w-4 text-emerald-600"
              />
              <label className="text-sm font-medium text-gray-700">Split by Gender</label>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Display Options</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={showCi}
                onChange={(e) => setShowCi(e.target.checked)}
                className="mr-2 h-4 w-4 text-emerald-600"
              />
              <label className="text-sm text-gray-700">Show 95% Confidence Interval</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={showCensor}
                onChange={(e) => setShowCensor(e.target.checked)}
                className="mr-2 h-4 w-4 text-emerald-600"
              />
              <label className="text-sm text-gray-700">Show Censor Markers</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={showRiskTable}
                onChange={(e) => setShowRiskTable(e.target.checked)}
                className="mr-2 h-4 w-4 text-emerald-600"
              />
              <label className="text-sm text-gray-700">Show Risk Table</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={showAllPatients}
                onChange={(e) => setShowAllPatients(e.target.checked)}
                className="mr-2 h-4 w-4 text-emerald-600"
              />
              <label className="text-sm text-gray-700">Show All Patients Curve</label>
            </div>
          </div>
        </div>

        <button
          onClick={generatePlot}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Generating Plot...' : 'Generate Survival Curve'}
        </button>
      </div>

      {plotImage && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <img src={`data:image/png;base64,${plotImage}`} alt="Survival Plot" className="w-full rounded-lg" />

          {stats && stats.length > 0 && (
            <div className="mt-6">

              {stats.map((stat, idx) => (
                <div key={idx} className="my-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="relative bg-white p-6 rounded-3xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center gap-3">
                        <HeartPulse className="w-7 h-7 text-emerald-700" />
                        <p className="text-gray-600 text-sm font-semibold">Median Survival</p>
                      </div>

                      <p className="text-3xl font-bold text-gray-900 mt-3">
                        {stat.median_survival}
                      </p>
                    </div>
                    <div className="relative bg-white p-6 rounded-3xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center gap-3">
                        <Users className="w-7 h-7 text-blue-700" />
                        <p className="text-gray-600 text-sm font-semibold">(n)</p>
                      </div>

                      <p className="text-3xl font-bold text-gray-900 mt-3">
                        {stat.n}
                      </p>
                    </div>
                    <div className="relative bg-white p-6 rounded-3xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center gap-3">
                        <Activity className="w-7 h-7 text-purple-700" />
                        <p className="text-gray-600 text-sm font-semibold">6-Month Survival</p>
                      </div>

                      <p className="text-3xl font-bold text-gray-900 mt-3">
                        {stat.pct_survival_at_6}
                      </p>
                    </div>
                    <div className="relative bg-white p-6 rounded-3xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center gap-3">
                        <Timer className="w-7 h-7 text-orange-700" />
                        <p className="text-gray-600 text-sm font-semibold">Max Survival Month</p>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mt-3">
                        {stat.pct_survival_at_12}
                      </p>
                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SurvivalAnalysis;