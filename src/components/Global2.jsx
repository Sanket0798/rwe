import ComparisonTable from './ComparisonTable';

const GlobalCARTBenchmark = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 px-8 py-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          Performance Benchmark
        </h2>
        <p className="text-lg text-teal-700 font-semibold mt-1">Global CAR-T Comparative Analysis</p>
      </div>

      <div className="p-8">
        <ComparisonTable />

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Clinical Interpretation</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                The comparison shows Tali-cel demonstrates competitive survival rates
                compared to globally approved CAR-T products. Use the toggle buttons above to switch between
                disease types (B-ALL and NHL) and survival metrics (PFS and OS) to explore different data views.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalCARTBenchmark;
