import React, { useState, useEffect } from 'react';
import { TrendingUp, ExternalLink, Award, Users, Calendar, Activity } from 'lucide-react';

const GlobalCARTBenchmarkTable = ({ indication = 'NHL' }) => {
  const [activeMetric, setActiveMetric] = useState('PFS'); // PFS or OS
  const initialDisease = indication === 'NHL' ? 'B-NHL' : 'B-ALL';
  const [selectedDisease, setSelectedDisease] = useState(initialDisease);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    const newDisease = indication === 'NHL' ? 'B-NHL' : 'B-ALL';
    setSelectedDisease(newDisease);
  }, [indication]);

  // Data structure
  const benchmarkData = {
    'B-NHL': {
      // Tali-cel first, then others
      products: [
        { name: 'Tali-cel', code: 'tali', isOurs: true },
        { name: 'Axi-cel', code: 'axi' },
        { name: 'Tisa-cel', code: 'tisa' },
        { name: 'Liso-cel', code: 'liso' }
      ],
      studyReferences: {
        'tali': { pmid: 'NA', links: [] },
        'axi': {
          pmid: '36138152',
          links: [{ url: 'https://doi.org/10.1038/s41591-022-01969-y', label: 'https://doi.org/10.1038/s41591-022-01969-y' }]
        },
        'tisa': {
          pmid: '36138152',
          links: [{ url: 'https://doi.org/10.1038/s41591-022-01969-y', label: 'https://doi.org/10.1038/s41591-022-01969-y' }]
        },
        'liso': {
          pmid: '39657136',
          links: [{ url: 'https://doi.org/10.1182/bloodadvances.2024014164', label: 'https://doi.org/10.1182/bloodadvances.2024014164' }]
        }
      },
      demographics: {
        patients: { 'tali': '140', 'axi': '209', 'tisa': '209', 'liso': '101' },
        medianAge: { 'tali': '53 (17-83)', 'axi': '62 (20-79)', 'tisa': '64 (20-81)', 'liso': '71 (30-85)' },
        priorLines: { 'tali': '3 (1-7)', 'axi': '2 (2-8)', 'tisa': '2 (2-10)', 'liso': '3 (1-8)' }
      },
      data: {
        PFS: {
          '6month': { 'tali': '58', 'axi': '~55', 'tisa': '~40', 'liso': '62.1' },
          '9month': { 'tali': '52', 'axi': '~50', 'tisa': '~35', 'liso': '~55' },
          '12month': { 'tali': '40', 'axi': '46.6', 'tisa': '33.2', 'liso': '55' }
        },
        OS: {
          '6month': { 'tali': '74', 'axi': '~75', 'tisa': '~70', 'liso': '78.9' },
          '9month': { 'tali': '67', 'axi': '~65', 'tisa': '~55', 'liso': '~70' },
          '12month': { 'tali': '63', 'axi': '63.5', 'tisa': '48.8', 'liso': '68' }
        }
      }
    },
    'B-ALL': {
      products: [
        { name: 'Tali-cel', code: 'tali', isOurs: true },
        { name: 'Tisa-cel', code: 'tisa' },
        { name: 'Brexu-cel', code: 'brexu' }
      ],
      studyReferences: {
        'tali': { pmid: 'NA', links: [] },
        'tisa': {
          pmid: '40554426',
          links: [{ url: 'https://doi.org/10.1182/bloodadvances.2025015881', label: 'https://doi.org/10.1182/bloodadvances.2025015881' }]
        },
        'brexu': {
          pmid: '39418622',
          links: [{ url: 'https://doi.org/10.1200/JCO.24.00321', label: 'https://doi.org/10.1200/JCO.24.00321' }]
        }
      },
      demographics: {
        patients: { 'tali': '118', 'tisa': '149', 'brexu': '189' },
        medianAge: { 'tali': '30 (15-78)', 'tisa': '22 (18-25.9)', 'brexu': '46 (18-81)' },
        priorLines: { 'tali': '2 (1-7)', 'tisa': '4 (1-15)', 'brexu': '4 (2-12)' }
      },
      data: {
        PFS: {
          '6month': { 'tali': '71', 'tisa': '~75', 'brexu': '~60' },
          '9month': { 'tali': '60', 'tisa': '~60', 'brexu': '~50' },
          '12month': { 'tali': '57', 'tisa': '~55', 'brexu': '46' }
        },
        OS: {
          '6month': { 'tali': '84', 'tisa': '~85', 'brexu': '~80' },
          '9month': { 'tali': '75', 'tisa': '~80', 'brexu': '~70' },
          '12month': { 'tali': '68', 'tisa': '~70', 'brexu': '63' }
        }
      }
    }
  };

  const currentData = benchmarkData[selectedDisease];
  const products = currentData.products;

  // Helper function to determine if value should be green (approximate)
  const isApproximate = (value) => {
    return typeof value === 'string' && value.startsWith('~');
  };

  // Helper function to get cell styling with hover effects
  const getCellStyle = (value, isOurs, rowType = 'data') => {
    const baseClasses = 'transition-all duration-300';
    
    if (rowType === 'header') {
      return isOurs 
        ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black shadow-lg hover:shadow-xl hover:scale-[1.02]'
        : 'bg-gradient-to-br from-teal-600 to-teal-700 text-white font-black shadow-md hover:shadow-lg hover:scale-[1.01]';
    }
    
    if (isOurs) {
      return `${baseClasses} bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900 font-bold hover:from-amber-100 hover:to-orange-100 hover:shadow-md`;
    }
    if (isApproximate(value)) {
      return `${baseClasses} text-green-600 font-semibold hover:bg-green-50`;
    }
    return `${baseClasses} text-gray-900 hover:bg-gray-50`;
  };

  // Get icon for row type
  const getRowIcon = (rowType) => {
    switch(rowType) {
      case 'patients': return <Users className="w-4 h-4" />;
      case 'age': return <Calendar className="w-4 h-4" />;
      case 'therapy': return <Activity className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-xl border border-gray-200 p-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-3 shadow-lg">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-1 bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
              Tali-cel: Comparable Real-World Efficacy
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              vs Globally Approved CAR-Ts for r/r {selectedDisease}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          {/* Disease Toggle */}
          <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-md border border-gray-200">
            {['B-NHL', 'B-ALL'].map((disease) => (
              <button
                key={disease}
                onClick={() => setSelectedDisease(disease)}
                className={`px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                  selectedDisease === disease
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {disease}
              </button>
            ))}
          </div>

          {/* PFS/OS Toggle */}
          <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-md border border-gray-200">
            {['PFS', 'OS'].map((metric) => (
              <button
                key={metric}
                onClick={() => setActiveMetric(metric)}
                className={`px-8 py-3 rounded-lg text-sm font-black transition-all duration-300 ${
                  activeMetric === metric
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Table */}
      <div className="overflow-hidden rounded-xl shadow-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Table Header */}
            <thead>
              <tr>
                <th className="bg-gradient-to-br from-slate-700 to-slate-800 text-white px-6 py-5 text-left font-black text-sm uppercase tracking-wider border-b-4 border-teal-500">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>CAR-T Products</span>
                  </div>
                </th>
                {products.map((product) => (
                  <th
                    key={product.code}
                    className={`px-6 py-5 text-center font-black text-sm uppercase tracking-wider border-b-4 ${
                      product.isOurs ? 'border-amber-500' : 'border-teal-500'
                    } ${getCellStyle(null, product.isOurs, 'header')} relative group`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-lg">{product.name}</span>
                      {/* {product.isOurs && (
                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-pulse">
                          OUR PRODUCT
                        </span>
                      )} */}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Number of Patients */}
              <tr className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-300">
                <td className="px-6 py-5 font-bold text-gray-800 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-transparent">
                  <div className="flex items-center gap-3">
                    {getRowIcon('patients')}
                    <div>
                      <div className="text-sm">No. Of Patients</div>
                      <div className="text-xs text-gray-500 font-normal">Clinical Trial Enrollment</div>
                    </div>
                  </div>
                </td>
                {products.map((product) => (
                  <td
                    key={product.code}
                    className={`px-6 py-5 text-center border-b border-gray-200 ${getCellStyle(currentData.demographics.patients[product.code], product.isOurs)} cursor-pointer`}
                    onMouseEnter={() => setHoveredCell(`patients-${product.code}`)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div className="text-2xl font-black">{currentData.demographics.patients[product.code]}</div>
                    <div className="text-xs text-gray-500 mt-1">patients</div>
                  </td>
                ))}
              </tr>

              {/* Median Age */}
              <tr className="group hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent transition-all duration-300">
                <td className="px-6 py-5 font-bold text-gray-800 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-transparent">
                  <div className="flex items-center gap-3">
                    {getRowIcon('age')}
                    <div>
                      <div className="text-sm">Median Age</div>
                      <div className="text-xs text-gray-500 font-normal">Years (Range)</div>
                    </div>
                  </div>
                </td>
                {products.map((product) => (
                  <td
                    key={product.code}
                    className={`px-6 py-5 text-center border-b border-gray-200 ${getCellStyle(currentData.demographics.medianAge[product.code], product.isOurs)} cursor-pointer`}
                    onMouseEnter={() => setHoveredCell(`age-${product.code}`)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div className="text-lg font-bold">{currentData.demographics.medianAge[product.code]}</div>
                    <div className="text-xs text-gray-500 mt-1">years</div>
                  </td>
                ))}
              </tr>

              {/* Prior Lines of Therapy */}
              <tr className="group hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-300">
                <td className="px-6 py-5 font-bold text-gray-800 border-b-2 border-gray-300 bg-gradient-to-r from-green-50 to-transparent">
                  <div className="flex items-center gap-3">
                    {getRowIcon('therapy')}
                    <div>
                      <div className="text-sm">Median Prior Lines</div>
                      <div className="text-xs text-gray-500 font-normal">of Therapy (Range)</div>
                    </div>
                  </div>
                </td>
                {products.map((product) => (
                  <td
                    key={product.code}
                    className={`px-6 py-5 text-center border-b-2 border-gray-300 ${getCellStyle(currentData.demographics.priorLines[product.code], product.isOurs)} cursor-pointer`}
                    onMouseEnter={() => setHoveredCell(`therapy-${product.code}`)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div className="text-lg font-bold">{currentData.demographics.priorLines[product.code]}</div>
                    <div className="text-xs text-gray-500 mt-1">lines</div>
                  </td>
                ))}
              </tr>

              {/* Section Header - PFS or OS */}
              <tr>
                <td colSpan={products.length + 1} className="bg-indigo-600 px-6 py-4">
                  <div className="flex items-center justify-center gap-3 text-white">
                    <Activity className="w-6 h-6" />
                    <span className="font-black text-lg uppercase tracking-wider">
                      {activeMetric === 'PFS' ? 'Progression Free Survival (%)' : 'Overall Survival (%)'}
                    </span>
                  </div>
                </td>
              </tr>

              {/* 6 Month */}
              <tr className="group hover:bg-gradient-to-r hover:from-teal-50 hover:to-transparent transition-all duration-300">
                <td className="px-6 py-5 font-bold text-gray-800 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-black shadow-md">
                      6
                    </div>
                    <span className="text-sm">Month</span>
                  </div>
                </td>
                {products.map((product) => (
                  <td
                    key={product.code}
                    className={`px-6 py-5 text-center border-b border-gray-200 ${getCellStyle(currentData.data[activeMetric]['6month'][product.code], product.isOurs)} cursor-pointer relative group/cell`}
                    onMouseEnter={() => setHoveredCell(`6month-${product.code}`)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div className="text-3xl font-black">
                      {currentData.data[activeMetric]['6month'][product.code]}
                      <span className="text-lg ml-1">%</span>
                    </div>
                    {hoveredCell === `6month-${product.code}` && (
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent pointer-events-none rounded-lg"></div>
                    )}
                  </td>
                ))}
              </tr>

              {/* 9 Month */}
              <tr className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-300">
                <td className="px-6 py-5 font-bold text-gray-800 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black shadow-md">
                      9
                    </div>
                    <span className="text-sm">Month</span>
                  </div>
                </td>
                {products.map((product) => (
                  <td
                    key={product.code}
                    className={`px-6 py-5 text-center border-b border-gray-200 ${getCellStyle(currentData.data[activeMetric]['9month'][product.code], product.isOurs)} cursor-pointer relative group/cell`}
                    onMouseEnter={() => setHoveredCell(`9month-${product.code}`)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div className="text-3xl font-black">
                      {currentData.data[activeMetric]['9month'][product.code]}
                      <span className="text-lg ml-1">%</span>
                    </div>
                    {hoveredCell === `9month-${product.code}` && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none rounded-lg"></div>
                    )}
                  </td>
                ))}
              </tr>

              {/* 12 Month */}
              <tr className="group hover:bg-gradient-to-r hover:from-indigo-50 hover:to-transparent transition-all duration-300">
                <td className="px-6 py-5 font-bold text-gray-800 border-b-2 border-gray-300 bg-gradient-to-r from-indigo-50 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-md">
                      12
                    </div>
                    <span className="text-sm">Month</span>
                  </div>
                </td>
                {products.map((product) => (
                  <td
                    key={product.code}
                    className={`px-6 py-5 text-center border-b-2 border-gray-300 ${getCellStyle(currentData.data[activeMetric]['12month'][product.code], product.isOurs)} cursor-pointer relative group/cell`}
                    onMouseEnter={() => setHoveredCell(`12month-${product.code}`)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div className="text-3xl font-black">
                      {currentData.data[activeMetric]['12month'][product.code]}
                      <span className="text-lg ml-1">%</span>
                    </div>
                    {hoveredCell === `12month-${product.code}` && (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none rounded-lg"></div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Study Reference */}
              <tr className="bg-gradient-to-r from-slate-50 to-white">
                <td className="px-6 py-6 font-bold text-gray-800 bg-gradient-to-r from-slate-100 to-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-md">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm">Study Reference</div>
                      <div className="text-xs text-gray-500 font-normal">PMID & DOI Links</div>
                    </div>
                  </div>
                </td>
                {products.map((product) => {
                  const reference = currentData.studyReferences[product.code];
                  return (
                    <td
                      key={product.code}
                      className={`px-6 py-6 text-center text-xs ${
                        product.isOurs ? 'bg-gradient-to-br from-amber-50 to-orange-50' : 'bg-white'
                      } transition-all duration-300 hover:shadow-inner`}
                    >
                      <div className="space-y-3">
                        <div className={`font-black text-sm ${product.isOurs ? 'text-amber-700' : 'text-gray-700'}`}>
                          {reference.pmid === 'NA' ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                              <span>Internal Study</span>
                            </span>
                          ) : (
                            `PMID: ${reference.pmid}`
                          )}
                        </div>
                        {reference.links.length > 0 ? (
                          reference.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all duration-300 group/link px-3 py-2 rounded-lg hover:bg-blue-50"
                            >
                              <ExternalLink className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                              <span>View Publication</span>
                            </a>
                          ))
                        ) : null}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-1.5 h-full bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full min-h-[60px]"></div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-gray-900 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Clinical Interpretation
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              <span className="font-bold">Note:</span> All references are from peer-reviewed clinical trials. 
              <span className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 bg-green-100 text-green-700 rounded font-semibold">
                ~ indicates approximate values
              </span>
              * and # indicate specific cohort annotations. PMID numbers link to PubMed database entries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalCARTBenchmarkTable;
