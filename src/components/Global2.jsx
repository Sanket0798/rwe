import { useState } from 'react';
import ComparisonTable from './ComparisonTable';

const GlobalCARTBenchmark = ({ activeDisease }) => {
  const [metricType, setMetricType] = useState('PFS');

  const nhlData = {
    title: 'Tali-cel: Comparable Real-World Efficacy to Globally Approved CAR-Ts for r/r B-NHL',
    products: ['Axi-cel', 'Tisa-cel', 'Liso-cel', 'Tali-cel'],
    metrics: {
      basicInfo: [
        {
          label: 'No. Of patients',
          values: ['209', '209', '101', '140']
        },
        {
          label: 'Median Age (Years)',
          values: ['62 (20-79)', '64 (20-81)', '71 (30-85)', '53 (17-83)']
        },
        {
          label: 'Median prior lines of therapy',
          values: ['2 (2-8)', '2 (2-10)', '3 (1-8)', '3 (1-7)']
        }
      ],
      PFS: [
        {
          label: '6 month',
          values: [55, 40, 62.1, 58],
          references: ['~55 %', '~40 %', '62.1 %', '58 %']
        },
        {
          label: '9 month',
          values: [50, 35, 55, 52],
          references: ['~50 %', '~35 %', '~55 %', '52 %']
        },
        {
          label: '12 month',
          values: [46.6, 33.2, 55, 40],
          references: ['46.6 %', '33.2 %', '55 %', '40 %']
        }
      ],
      OS: [
        {
          label: '6 month',
          values: [75, 70, 78.9, 74],
          references: ['~75 %', '~70 %', '78.9 %', '74 %']
        },
        {
          label: '9 month',
          values: [65, 55, 70, 67],
          references: ['~65 %', '~55 %', '~70 %', '67 %']
        },
        {
          label: '12 month',
          values: [63.5, 48.8, 68, 63],
          references: ['63.5 %', '48.8 %', '68 %', '63 %']
        }
      ],
      studyReferences: [
        {
          label: 'Study reference',
          values: [
            'PMID: 36138152',
            'PMID: 36138152',
            'PMID: 39657136',
            'NA'
          ],
          links: [
            'https://doi.org/10.1038/s41591-022-01969-y',
            'https://doi.org/10.1200/JCO.22.00110',
            'https://doi.org/10.1182/bloodadvances.2024014164',
            ''
          ]
        }
      ]
    }
  };

  const ballData = {
    title: 'Tali-cel: Comparable Real-World Efficacy to Globally Approved CAR-Ts for r/r B-ALL',
    products: ['Tisa-cel', 'Brexu-cel', 'Tali-cel'],
    metrics: {
      basicInfo: [
        {
          label: 'No. Of patients',
          values: ['149', '189', '118']
        },
        {
          label: 'Median Age (Years)',
          values: ['22 (18-25.9)', '46 (18-81)', '30 (15-78)']
        },
        {
          label: 'Median prior lines of therapy',
          values: ['4 (1-15)', '4 (2-12)', '2 (1-7)']
        }
      ],
      PFS: [
        {
          label: '6 month',
          values: [75, 60, 71],
          references: ['~75 %', '~60 %', '71 %']
        },
        {
          label: '9 month',
          values: [60, 50, 60],
          references: ['~60 %', '~50 %', '~60 %']
        },
        {
          label: '12 month',
          values: [55, 46, 57],
          references: ['~55 %', '46 %', '57 %']
        }
      ],
      OS: [
        {
          label: '6 month',
          values: [85, 80, 84],
          references: ['~85 %', '~80 %', '84 %']
        },
        {
          label: '9 month',
          values: [80, 70, 75],
          references: ['~80 %', '~70 %', '~75 %']
        },
        {
          label: '12 month',
          values: [70, 63, 68],
          references: ['~70 %', '63 %', '68 %']
        }
      ],
      studyReferences: [
        {
          label: 'Study reference',
          values: [
            'PMID: 40554426',
            'PMID: 39418622',
            'NA'
          ],
          links: [
            'https://doi.org/10.1182/bloodadvances.2024015881',
            'https://doi.org/10.1200/JCO.24.00321',
            ''
          ]
        }
      ]
    }
  };

  const currentData = activeDisease === 'NHL' ? nhlData : ballData;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              Comparative Analysis
            </span>
            <span className="text-sm text-gray-600">vs Global CAR-T</span>
          </div>
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setMetricType('PFS')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                metricType === 'PFS'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>PFS</span>
            </button>
            <button
              onClick={() => setMetricType('OS')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                metricType === 'OS'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>OS</span>
            </button>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Performance Benchmark
        </h2>
        <p className="text-lg text-teal-700 font-semibold mt-1">{activeDisease === 'NHL' ? 'NHL' : 'B-ALL'}</p>
      </div>

      <div className="p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{currentData.title}</h3>

        <ComparisonTable
          data={currentData}
          metricType={metricType}
        />

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
                The comparison shows Tali-cel demonstrates competitive {metricType === 'PFS' ? 'progression-free survival' : 'overall survival'} rates
                compared to globally approved CAR-T products for {activeDisease === 'NHL' ? 'B-NHL' : 'B-ALL'} patients.
                The analysis includes {currentData.products[currentData.products.length - 2]} patients from the global dataset,
                providing a comprehensive view of treatment efficacy across all risk categories and disease characteristics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalCARTBenchmark;
