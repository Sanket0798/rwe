import { useState } from 'react';

const ComparisonTable = ({ data, metricType }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  const findComparisonProduct = (rowData) => {
    const talicelIndex = data.products.indexOf('Tali-cel');
    const talicelValue = rowData.values[talicelIndex];

    let bestCompetitor = null;
    let bestValue = -Infinity;

    rowData.values.forEach((value, index) => {
      if (index !== talicelIndex && typeof value === 'number') {
        if (value < talicelValue && value > bestValue) {
          bestValue = value;
          bestCompetitor = {
            name: data.products[index],
            value: value,
            index: index
          };
        }
      }
    });

    if (!bestCompetitor) {
      rowData.values.forEach((value, index) => {
        if (index !== talicelIndex && typeof value === 'number') {
          if (value > bestValue) {
            bestValue = value;
            bestCompetitor = {
              name: data.products[index],
              value: value,
              index: index
            };
          }
        }
      });
    }

    return bestCompetitor;
  };

  const getComparisonInsight = (rowData) => {
    const talicelIndex = data.products.indexOf('Tali-cel');
    const talicelValue = rowData.values[talicelIndex];
    const competitor = findComparisonProduct(rowData);

    if (!competitor) return null;

    const difference = talicelValue - competitor.value;
    const percentageDiff = ((Math.abs(difference) / competitor.value) * 100).toFixed(1);

    return {
      competitor: competitor.name,
      talicelValue,
      competitorValue: competitor.value,
      difference,
      percentageDiff,
      isBetter: difference > 0,
      isEqual: Math.abs(difference) < 1
    };
  };

  const currentMetrics = data.metrics[metricType];

  const getCellColor = (productIndex, rowIndex, isMetricRow) => {
    if (!isMetricRow) return 'bg-white';

    const talicelIndex = data.products.indexOf('Tali-cel');
    const rowData = currentMetrics[rowIndex];
    const talicelValue = rowData.values[talicelIndex];
    const cellValue = rowData.values[productIndex];

    if (productIndex === talicelIndex) {
      return 'bg-teal-600 text-white';
    }

    if (typeof cellValue === 'number') {
      if (cellValue > talicelValue) {
        return 'bg-green-100 text-green-800';
      } else if (cellValue < talicelValue) {
        return 'bg-orange-50 text-orange-700';
      } else {
        return 'bg-gray-100 text-gray-700';
      }
    }

    return 'bg-white';
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-teal-600 to-teal-700">
                <th className="px-6 py-4 text-left text-sm font-bold text-white border-r border-teal-500">
                  Commercially approved CAR-T Products
                </th>
                {data.products.map((product, index) => (
                  <th
                    key={index}
                    className={`px-6 py-4 text-center text-sm font-bold border-r border-teal-500 last:border-r-0 ${
                      product === 'Tali-cel' ? 'bg-teal-700 text-white' : 'text-white'
                    }`}
                  >
                    {product}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.metrics.basicInfo.map((row, rowIndex) => (
                <tr key={`basic-${rowIndex}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50 border-r border-gray-200">
                    {row.label}
                  </td>
                  {row.values.map((value, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 text-sm text-center text-gray-700 border-r border-gray-100 last:border-r-0 bg-white"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}

              <tr className="bg-gradient-to-r from-teal-700 to-teal-800">
                <td colSpan={data.products.length + 1} className="px-6 py-3 text-sm font-bold text-white">
                  {metricType === 'PFS' ? 'Progression Free Survival (%)' : 'Overall Survival (%)'}
                </td>
              </tr>

              {currentMetrics.map((row, rowIndex) => {
                // const insight = getComparisonInsight(row);
                return (
                  <tr key={`metric-${rowIndex}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50 border-r border-gray-200">
                      {row.label}
                    </td>
                    {row.references.map((value, colIndex) => (
                      <td
                        key={colIndex}
                        onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`px-6 py-4 text-sm text-center font-semibold border-r border-gray-100 last:border-r-0 transition-all ${getCellColor(
                          colIndex,
                          rowIndex,
                          true
                        )} ${hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex ? 'ring-2 ring-teal-400 ring-inset' : ''}`}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {data.metrics.studyReferences.map((row, rowIndex) => (
                <tr key={`study-${rowIndex}`} className="bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                    {row.label}
                  </td>
                  {row.values.map((value, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 text-xs text-center text-gray-600 border-r border-gray-100 last:border-r-0"
                    >
                      {value === 'NA' ? (
                        <span className="text-gray-400 font-medium">NA</span>
                      ) : (
                        <div className="space-y-1">
                          <div className="font-medium">{value}</div>
                          {row.links[colIndex] && (
                            <a
                              href={row.links[colIndex]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-600 hover:text-teal-800 hover:underline block truncate"
                            >
                              {row.links[colIndex].replace('https://', '')}
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6 border border-teal-200">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Comparative Analysis Summary
          </h4>
          <div className="space-y-3">
            {currentMetrics.map((row, index) => {
              const insight = getComparisonInsight(row);
              if (!insight) return null;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-teal-700">{row.label.split(' ')[0]}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{row.label} Timepoint</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Tali-cel vs {insight.competitor}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {insight.talicelValue}% vs {insight.competitorValue}%
                      </div>
                      <div
                        className={`text-xs font-medium mt-1 ${
                          insight.isBetter ? 'text-green-600' : insight.isEqual ? 'text-gray-600' : 'text-orange-600'
                        }`}
                      >
                        {insight.isEqual ? (
                          'Comparable'
                        ) : insight.isBetter ? (
                          <>+{insight.percentageDiff}% better</>
                        ) : (
                          <>{insight.percentageDiff}% lower</>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {insight.isBetter ? (
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : insight.isEqual ? (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">Legend</h3>
            <div className="mt-2 text-sm text-amber-700 space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-teal-600 rounded"></div>
                <span>Tali-cel (Our Product)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Better than Tali-cel</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-50 border border-orange-300 rounded"></div>
                <span>Lower than Tali-cel (Comparison baseline)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;
