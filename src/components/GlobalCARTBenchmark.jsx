import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const GlobalCARTBenchmark = ({ indication = 'NHL' }) => {
  const [activeMetric, setActiveMetric] = useState('PFS'); // PFS or OS
  // Map indication to disease format (NHL -> B-NHL, B-ALL -> B-ALL)
  const initialDisease = indication === 'NHL' ? 'B-NHL' : 'B-ALL';
  const [selectedDisease, setSelectedDisease] = useState(initialDisease); // B-NHL or B-ALL

  // Update selectedDisease when indication prop changes
  useEffect(() => {
    const newDisease = indication === 'NHL' ? 'B-NHL' : 'B-ALL';
    setSelectedDisease(newDisease);
  }, [indication]);

  // Data structure for different diseases and metrics
  const benchmarkData = {
    'B-NHL': {
      products: [
        { name: 'Axi-cel', code: 'axi', color: '#3B82F6' },
        { name: 'Tisa-cel', code: 'tisa', color: '#8B5CF6' },
        { name: 'Liso-cel', code: 'liso', color: '#10B981' },
        { name: 'Tali-cel', code: 'tali', color: '#F59E0B', isOurs: true }
      ],
      studyReferences: {
        'axi': {
          pmid: 'PMID: 36138152',
          links: [
            { url: 'https://doi.org/10.1038/s41591-022-01969-y', label: 'https://doi.org/10.1038/s41591-022-01969-y' }
          ]
        },
        'tisa': {
          pmid: 'PMID: 36138152',
          links: [
            { url: 'https://doi.org/10.1038/s41591-022-01969-y', label: 'https://doi.org/10.1038/s41591-022-01969-y' }
          ]
        },
        'liso': {
          pmid: 'PMID: 39657136',
          links: [
            { url: 'https://doi.org/10.1182/bloodadvances.2024014164', label: 'https://doi.org/10.1182/bloodadvances.2024014164' }
          ]
        },
        'tali': {
          pmid: 'NA',
          links: []
        }
      },
      demographics: {
        patients: { 'axi': '209', 'tisa': '209', 'liso': '101', 'tali': '140' },
        medianAge: { 'axi': '62 (20-79)', 'tisa': '64 (20-81)', 'liso': '71 (30-85)', 'tali': '53 (17-83)' },
        priorLines: { 'axi': '2 (2-8)', 'tisa': '2 (2-10)', 'liso': '3 (1-8)', 'tali': '3 (1-7)' }
      },
      data: {
        PFS: {
          '6month': { 'axi': 55, 'tisa': 40, 'liso': 62.1, 'tali': 58 },
          '9month': { 'axi': 50, 'tisa': 35, 'liso': 55, 'tali': 52 },
          '12month': { 'axi': 46.6, 'tisa': 33.2, 'liso': 55, 'tali': 40 }
        },
        OS: {
          '6month': { 'axi': 75, 'tisa': 70, 'liso': 78.9, 'tali': 74 },
          '9month': { 'axi': 65, 'tisa': 55, 'liso': 70, 'tali': 67 },
          '12month': { 'axi': 63.5, 'tisa': 48.8, 'liso': 68, 'tali': 63 }
        }
      }
    },
    'B-ALL': {
      products: [
        { name: 'Tisa-cel', code: 'tisa', color: '#8B5CF6' },
        { name: 'Brexu-cel', code: 'brexu', color: '#EC4899' },
        { name: 'Tali-cel', code: 'tali', color: '#F59E0B', isOurs: true }
      ],
      studyReferences: {
        'tisa': {
          pmid: 'PMID: 40554426',
          links: [
            { url: 'https://doi.org/10.1182/bloodadvances.2025015881', label: 'https://doi.org/10.1182/bloodadvances.2025015881' }
          ]
        },
        'brexu': {
          pmid: 'PMID: 39418622',
          links: [
            { url: 'https://doi.org/10.1200/JCO.24.00321', label: 'https://doi.org/10.1200/JCO.24.00321' }
          ]
        },
        'tali': {
          pmid: 'NA',
          links: []
        }
      },
      demographics: {
        patients: { 'tisa': '149', 'brexu': '189', 'tali': '118' },
        medianAge: { 'tisa': '22 (18-25.9)', 'brexu': '46 (18-81)', 'tali': '30 (15-78)' },
        priorLines: { 'tisa': '4 (1-15)', 'brexu': '4 (2-12)', 'tali': '2 (1-7)' }
      },
      data: {
        PFS: {
          '6month': { 'tisa': 75, 'brexu': 60, 'tali': 71 },
          '9month': { 'tisa': 60, 'brexu': 50, 'tali': 60 },
          '12month': { 'tisa': 55, 'brexu': 46, 'tali': 57 }
        },
        OS: {
          '6month': { 'tisa': 85, 'brexu': 80, 'tali': 84 },
          '9month': { 'tisa': 80, 'brexu': 70, 'tali': 75 },
          '12month': { 'tisa': 70, 'brexu': 63, 'tali': 68 }
        }
      }
    }
  };

  const timePoints = ['6month', '9month', '12month'];
  const timeLabels = { '6month': '6 Month', '9month': '9 Month', '12month': '12 Month' };

  const currentData = benchmarkData[selectedDisease];
  const products = currentData.products;

  // Function to determine comparison status
  const getComparisonStatus = (timePoint, productCode) => {
    const taliValue = currentData.data[activeMetric][timePoint]['tali'];
    const productValue = currentData.data[activeMetric][timePoint][productCode];
    
    if (productCode === 'tali') return 'neutral';
    
    const difference = taliValue - productValue;
    
    if (difference > 0) return 'better'; // Tali-cel is better
    if (difference < 0) return 'worse'; // Tali-cel is worse
    return 'equal';
  };

  // Function to get the best comparison (Tali-cel vs the product it performs better against)
  const getBestComparison = (timePoint) => {
    const taliValue = currentData.data[activeMetric][timePoint]['tali'];
    let bestCompetitor = null;
    let maxDifference = -Infinity;

    products.forEach(product => {
      if (product.code !== 'tali') {
        const productValue = currentData.data[activeMetric][timePoint][product.code];
        const difference = taliValue - productValue;
        
        if (difference > maxDifference) {
          maxDifference = difference;
          bestCompetitor = {
            name: product.name,
            code: product.code,
            value: productValue,
            difference: difference
          };
        }
      }
    });

    return bestCompetitor && maxDifference > 0 ? bestCompetitor : null;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 font-sans">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Global CAR-T Performance Benchmark
            </h2>
            <p className="text-sm text-gray-600">
              Comparative analysis vs globally approved CAR-T products
            </p>
          </div>
          
          {/* Disease Toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            {['B-NHL', 'B-ALL'].map((disease) => (
              <button
                key={disease}
                onClick={() => setSelectedDisease(disease)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                  selectedDisease === disease
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {disease}
              </button>
            ))}
          </div>
        </div>

        {/* PFS/OS Toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1 w-fit">
          {['PFS', 'OS'].map((metric) => (
            <button
              key={metric}
              onClick={() => setActiveMetric(metric)}
              className={`px-6 py-2.5 rounded-md text-sm font-bold transition-all duration-200 ${
                activeMetric === metric
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {metric}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Demographics Section - Modern & Interactive */}
      <div className="mb-8">
        {/* Section Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-teal-500 to-teal-600"></div>
          <div className="text-center">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-wider">
              Patient Demographics & Baseline Characteristics
            </h3>
            <p className="text-xs text-gray-500 mt-1">Comparative Analysis Across CAR-T Products</p>
          </div>
          <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent via-teal-500 to-teal-600"></div>
        </div>

        {/* Product Headers Row - Aligned with data columns */}
        <div className="flex items-center gap-4 mb-4">
          {/* Empty space for icon/label column */}
          <div className="w-64 flex-shrink-0"></div>
          
          {/* Product Header Cards */}
          <div className="flex-1 grid grid-cols-4 gap-3">
            {products.map((product, idx) => (
              <div
                key={product.code}
                className={`relative rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  product.isOurs
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg'
                    : 'bg-gradient-to-br from-teal-500 to-teal-600 shadow-md'
                }`}
                style={{ 
                  animationDelay: `${idx * 100}ms`,
                  animation: 'slideUp 0.5s ease-out forwards'
                }}
              >
                <div className="text-center">
                  <h4 className="text-white font-black text-lg tracking-wide">
                    {product.name}
                  </h4>
                </div>
                
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-20">
                  <div className="absolute top-2 right-2 w-12 h-8 border-t-2 border-r-2 border-white rounded-tr-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demographics Data Cards */}
        <div className="space-y-4">
          {/* Number of Patients */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
            <div className="flex items-center gap-4 p-4">
              {/* Icon & Label */}
              <div className="flex items-center gap-3 w-64 flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Number of Patients</h5>
                  <p className="text-xs text-gray-500">Clinical Trial Enrollment</p>
                </div>
              </div>

              {/* Values Grid */}
              <div className="flex-1 grid grid-cols-4 gap-3">
                {products.map((product) => (
                  <div
                    key={product.code}
                    className={`rounded-lg p-3 text-center transition-all duration-300 hover:scale-110 ${
                      product.isOurs
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300'
                        : 'bg-gray-50 border border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    <div className={`text-2xl font-black ${
                      product.isOurs ? 'text-amber-600' : 'text-gray-800'
                    }`}>
                      {currentData.demographics.patients[product.code]}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">patients</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Median Age */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
            <div className="flex items-center gap-4 p-4">
              {/* Icon & Label */}
              <div className="flex items-center gap-3 w-64 flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Median Age</h5>
                  <p className="text-xs text-gray-500">Years (Range)</p>
                </div>
              </div>

              {/* Values Grid */}
              <div className="flex-1 grid grid-cols-4 gap-3">
                {products.map((product) => (
                  <div
                    key={product.code}
                    className={`rounded-lg p-3 text-center transition-all duration-300 hover:scale-110 ${
                      product.isOurs
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300'
                        : 'bg-gray-50 border border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className={`text-lg font-black ${
                      product.isOurs ? 'text-amber-600' : 'text-gray-800'
                    }`}>
                      {currentData.demographics.medianAge[product.code]}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">years</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prior Lines of Therapy */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
            <div className="flex items-center gap-4 p-4">
              {/* Icon & Label */}
              <div className="flex items-center gap-3 w-64 flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Prior Lines of Therapy</h5>
                  <p className="text-xs text-gray-500">Median (Range)</p>
                </div>
              </div>

              {/* Values Grid */}
              <div className="flex-1 grid grid-cols-4 gap-3">
                {products.map((product) => (
                  <div
                    key={product.code}
                    className={`rounded-lg p-3 text-center transition-all duration-300 hover:scale-110 ${
                      product.isOurs
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300'
                        : 'bg-gray-50 border border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className={`text-lg font-black ${
                      product.isOurs ? 'text-amber-600' : 'text-gray-800'
                    }`}>
                      {currentData.demographics.priorLines[product.code]}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">lines</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Study Reference - Redesigned */}
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h5 className="font-bold text-gray-900 text-base">Study References</h5>
                <p className="text-xs text-gray-500">Clinical Trial Publications & Citations</p>
              </div>
            </div>

            {/* References Grid */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {products.map((product) => {
                const reference = currentData.studyReferences[product.code];
                return (
                  <div
                    key={product.code}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg ${
                      product.isOurs
                        ? 'bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-200'
                        : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {/* Product Name Badge */}
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                      product.isOurs
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {product.name}
                    </div>

                    {/* PMID */}
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">PMID:</span>
                      <div className={`text-sm font-bold mt-1 ${
                        product.isOurs ? 'text-amber-700' : 'text-gray-800'
                      }`}>
                        {reference.pmid.replace('PMID: ', '')}
                      </div>
                    </div>

                    {/* Links */}
                    {reference.links.length > 0 ? (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          DOI Link:
                        </div>
                        {reference.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Publication
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-amber-200">
                        <div className="flex items-center gap-2 text-xs text-amber-600 italic">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Internal Study Data
                        </div>
                      </div>
                    )}

                    {/* Our Product Badge */}
                    {product.isOurs && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-md">
                        OUR PRODUCT
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Note */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-gray-500 leading-relaxed">
                <span className="font-semibold text-gray-700">Note:</span> All references are from peer-reviewed clinical trials. 
                PMID numbers link to PubMed database entries. DOI links provide direct access to full publications.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Section Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-1 flex-1 bg-gradient-to-r from-teal-500 to-transparent rounded-full"></div>
        <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
          {activeMetric === 'PFS' ? 'Progression Free Survival (%)' : 'Overall Survival (%)'}
        </h3>
        <div className="h-1 flex-1 bg-gradient-to-l from-teal-500 to-transparent rounded-full"></div>
      </div>

      {/* Modern Table View */}
      <div className="space-y-6">
        {timePoints.map((timePoint, idx) => {
          const bestComparison = getBestComparison(timePoint);
          
          return (
            <div 
              key={timePoint}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-300"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Time Point Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {timeLabels[timePoint]}
                </h3>
                
                {/* Comparison Badge */}
                {bestComparison && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">
                      +{bestComparison.difference.toFixed(1)}% vs {bestComparison.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-4 gap-4">
                {products.map((product) => {
                  const value = currentData.data[activeMetric][timePoint][product.code];
                  const status = getComparisonStatus(timePoint, product.code);
                  
                  return (
                    <div
                      key={product.code}
                      className={`relative rounded-lg p-4 transition-all duration-300 hover:scale-105 ${
                        product.isOurs
                          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 shadow-md'
                          : 'bg-white border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Product Name */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          product.isOurs ? 'text-amber-700' : 'text-gray-600'
                        }`}>
                          {product.name}
                        </span>
                        
                        {/* Status Indicator */}
                        {!product.isOurs && status === 'better' && (
                          <div className="flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          </div>
                        )}
                        {!product.isOurs && status === 'worse' && (
                          <div className="flex items-center justify-center w-5 h-5 bg-red-100 rounded-full">
                            <TrendingDown className="w-3 h-3 text-red-600" />
                          </div>
                        )}
                      </div>

                      {/* Value Display */}
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-black ${
                          product.isOurs ? 'text-amber-600' : 'text-gray-800'
                        }`}>
                          {value}
                        </span>
                        <span className={`text-lg font-semibold ${
                          product.isOurs ? 'text-amber-500' : 'text-gray-500'
                        }`}>
                          %
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            product.isOurs
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                              : 'bg-gradient-to-r from-gray-400 to-gray-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>

                      {/* Our Product Badge */}
                      {product.isOurs && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                          OUR PRODUCT
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Detailed Comparison Text */}
              {bestComparison && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Tali-cel</span> demonstrates{' '}
                    <span className="font-bold text-blue-700">
                      {bestComparison.difference.toFixed(1)}% higher {activeMetric}
                    </span>{' '}
                    compared to {bestComparison.name} ({bestComparison.value}%) at {timeLabels[timePoint].toLowerCase()}.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="w-1 h-full bg-teal-500 rounded-full" />
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">Clinical Interpretation</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Comparison shows real-world efficacy data for Tali-cel against commercially approved CAR-T products 
              for relapsed/refractory {selectedDisease}. {activeMetric === 'PFS' ? 'Progression-Free Survival' : 'Overall Survival'} 
              rates are calculated from available clinical trial data and demonstrate competitive performance across all time points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalCARTBenchmark;