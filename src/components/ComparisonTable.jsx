import { useState, memo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import PropTypes from 'prop-types';

// Constants
const CELL_TYPES = {
  TEXT: 'text',
  RANGE: 'range',
  PFS: 'pfs',
  LINK: 'link'
};

const PRIMARY_INDEX = 0;

const DISEASE_TYPES = {
  B_ALL: 'B-ALL',
  NHL: 'NHL'
};

const SURVIVAL_TYPES = {
  PFS: 'PFS',
  OS: 'OS'
};

// Data validation function
// const validateDiseaseData = (data, diseaseType) => {
//   const required = ['products', 'companies', 'demographics', 'survival', 'references'];

//   for (const field of required) {
//     if (!data[field]) {
//       throw new Error(`Missing required field: ${field} for ${diseaseType}`);
//     }
//   }

//   // Validate array lengths match
//   const productCount = data.products.length;
//   if (data.companies.length !== productCount) {
//     throw new Error(`Products and companies length mismatch for ${diseaseType}`);
//   }

//   // Validate demographics
//   const demographics = data.demographics;
//   if (!demographics.studySize || demographics.studySize.length !== productCount) {
//     throw new Error(`Invalid studySize data for ${diseaseType}`);
//   }
//   if (!demographics.medianAge || demographics.medianAge.length !== productCount) {
//     throw new Error(`Invalid medianAge data for ${diseaseType}`);
//   }
//   if (!demographics.priorTherapy || demographics.priorTherapy.length !== productCount) {
//     throw new Error(`Invalid priorTherapy data for ${diseaseType}`);
//   }

//   // Validate survival data
//   ['PFS', 'OS'].forEach(type => {
//     if (!data.survival[type]) {
//       throw new Error(`Missing survival data for ${type} in ${diseaseType}`);
//     }
//     ['month6', 'month9', 'month12'].forEach(period => {
//       if (!data.survival[type][period] || data.survival[type][period].length !== productCount) {
//         throw new Error(`Invalid survival data for ${type} ${period} in ${diseaseType}`);
//       }
//     });
//   });

//   // Validate references
//   if (!data.references || data.references.length !== productCount) {
//     throw new Error(`Invalid references data for ${diseaseType}`);
//   }

//   return true;
// };

// URL validation function
// const isValidHttpsUrl = (urlString) => {
//   if (!urlString) return false;
//   try {
//     const url = new URL(urlString);
//     return url.protocol === 'https:';
//   } catch {
//     return false;
//   }
// };

// Data structure for different disease types and survival metrics
const TABLE_DATA = {
  [DISEASE_TYPES.B_ALL]: {
    products: ['Tali-cel', 'Tisa-cel', 'Brexu-cel'],
    companies: ['ImmunoACT (Ref)', 'Novartis', 'Gilead'],
    demographics: {
      studySize: [
        { primary: '118', secondary: 'patients' },
        { primary: '149', secondary: 'patients' },
        { primary: '189', secondary: 'patients' }
      ],
      medianAge: [
        { median: 30, min: 15, max: 78 },
        { median: 22, min: 18, max: 25.9 },
        { median: 46, min: 18, max: 81 }
      ],
      priorTherapy: [
        { median: 2, min: 1, max: 7 },
        { median: 4, min: 1, max: 15 },
        { median: 4, min: 2, max: 12 }
      ]
    },
    survival: {
      [SURVIVAL_TYPES.PFS]: {
        month6: [
          { value: 71, delta: null },
          { value: 75, delta: 4 },
          { value: 60, delta: -11 }
        ],
        month9: [
          { value: 60, delta: null },
          { value: 60, delta: 0 },
          { value: 50, delta: -10 }
        ],
        month12: [
          { value: 57, delta: null },
          { value: 55, delta: -2 },
          { value: 46, delta: -11 }
        ]
      },
      [SURVIVAL_TYPES.OS]: {
        month6: [
          { value: 84, delta: null },
          { value: 85, delta: 1 },
          { value: 80, delta: -4 }
        ],
        month9: [
          { value: 75, delta: null },
          { value: 80, delta: 5 },
          { value: 70, delta: -5 }
        ],
        month12: [
          { value: 68, delta: null },
          { value: 70, delta: 2 },
          { value: 63, delta: -5 }
        ]
      }
    },
    references: [
      { text: 'NA', url: null },
      { text: 'PMID: 40554426', url: 'https://doi.org/10.1182/bloodadvances.2025015881' },
      { text: 'PMID: 39418622', url: 'https://doi.org/10.1200/JCO.24.00321' }
    ]
  },
  [DISEASE_TYPES.NHL]: {
    products: ['Tali-cel', 'Axi-cel', 'Tisa-cel', 'Liso-cel'],
    companies: ['ImmunoACT (Ref)', 'Gilead', 'Novartis', 'BMS'],
    demographics: {
      studySize: [
        { primary: '140', secondary: 'patients' },
        { primary: '209', secondary: 'patients' },
        { primary: '209', secondary: 'patients' },
        { primary: '101', secondary: 'patients' }
      ],
      medianAge: [
        { median: 53, min: 17, max: 83 },
        { median: 62, min: 20, max: 79 },
        { median: 64, min: 20, max: 81 },
        { median: 71, min: 30, max: 85 }
      ],
      priorTherapy: [
        { median: 3, min: 1, max: 7 },
        { median: 2, min: 2, max: 8 },
        { median: 2, min: 2, max: 10 },
        { median: 3, min: 1, max: 8 }
      ]
    },
    survival: {
      [SURVIVAL_TYPES.PFS]: {
        month6: [
          { value: 58, delta: null },
          { value: 55, delta: -3 },
          { value: 40, delta: -18 },
          { value: 62.1, delta: 4.1 }
        ],
        month9: [
          { value: 52, delta: null },
          { value: 50, delta: -2 },
          { value: 35, delta: -17 },
          { value: 55, delta: 3 }
        ],
        month12: [
          { value: 40, delta: null },
          { value: 46.6, delta: 6.6 },
          { value: 33.2, delta: -6.8 },
          { value: 55, delta: 15 }
        ]
      },
      [SURVIVAL_TYPES.OS]: {
        month6: [
          { value: 74, delta: null },
          { value: 75, delta: 1 },
          { value: 70, delta: -4 },
          { value: 78.9, delta: 4.9 }
        ],
        month9: [
          { value: 67, delta: null },
          { value: 65, delta: -2 },
          { value: 55, delta: -12 },
          { value: 70, delta: 3 }
        ],
        month12: [
          { value: 63, delta: null },
          { value: 63.5, delta: 0.5 },
          { value: 48.8, delta: -14.2 },
          { value: 68, delta: 5 }
        ]
      }
    },
    references: [
      { text: 'NA', url: null },
      { text: 'PMID: 36138152', url: 'https://doi.org/10.1038/s41591-022-01969-y' },
      { text: 'PMID: 36138152', url: 'https://doi.org/10.1038/s41591-022-01969-y' },
      { text: 'PMID: 39657136', url: 'https://doi.org/10.1182/bloodadvances.2024014164' }
    ]
  }
};

// Subcomponent: Range visualization for min-median-max values
const RangeVisual = memo(({ min, max, median, globalMin, globalMax, isPrimary }) => {
  const range = globalMax - globalMin;
  const leftPos = ((min - globalMin) / range) * 100;
  const width = ((max - min) / range) * 100;
  const medianPos = ((median - globalMin) / range) * 100;

  return (
    <div className="w-full mt-2" role="img" aria-label={`Range from ${min} to ${max}, median ${median}`}>
      <div className="flex items-baseline justify-center gap-1 mb-1">
        <span className={`text-sm font-bold ${isPrimary ? 'text-emerald-900' : 'text-slate-700'}`}>
          {median}
        </span>
        <span className="text-[10px] text-slate-400">
          ({min}-{max})
        </span>
      </div>

      <div className="relative h-4 w-32 mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-200" aria-hidden="true" />

        <div
          className={`absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full opacity-60 ${isPrimary ? 'bg-emerald-400' : 'bg-slate-400'
            }`}
          style={{ left: `${leftPos}%`, width: `${width}%` }}
          aria-hidden="true"
        />

        <div
          className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10 ${isPrimary ? 'bg-emerald-700' : 'bg-slate-600'
            }`}
          style={{ left: `${medianPos}%`, transform: 'translate(-50%, -50%)' }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
});

RangeVisual.displayName = 'RangeVisual';

RangeVisual.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  median: PropTypes.number.isRequired,
  globalMin: PropTypes.number.isRequired,
  globalMax: PropTypes.number.isRequired,
  isPrimary: PropTypes.bool.isRequired
};

// Subcomponent: Table row with different cell types
const TableRow = ({ label, subLabel, values, type = CELL_TYPES.TEXT, highlight = false, rangeConfig }) => {
  const getDeltaStyles = (delta) => {
    if (delta > 0) return 'bg-emerald-100 text-emerald-700';
    if (delta < 0) return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-500';
  };

  const renderCellContent = (val, idx) => {
    const isPrimary = idx === PRIMARY_INDEX;

    switch (type) {
      case CELL_TYPES.TEXT:
        return (
          <div className="flex flex-col items-center justify-center">
            <span className={`text-sm ${isPrimary ? 'font-bold text-emerald-900' : 'text-slate-600'}`}>
              {val.primary}
            </span>
            {val.secondary && (
              <span className="text-xs text-slate-400 mt-0.5">{val.secondary}</span>
            )}
          </div>
        );

      case CELL_TYPES.RANGE:
        return rangeConfig ? (
          <RangeVisual
            min={val.min}
            max={val.max}
            median={val.median}
            globalMin={rangeConfig.min}
            globalMax={rangeConfig.max}
            isPrimary={isPrimary}
          />
        ) : null;

      case CELL_TYPES.PFS:
        return (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-sm font-bold ${isPrimary ? 'text-emerald-900' : 'text-slate-700'}`}>
                {val.value}%
              </span>
              {val.delta !== null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getDeltaStyles(val.delta)}`}>
                  {val.delta > 0 ? '+' : ''}{val.delta}%
                </span>
              )}
            </div>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={val.value} aria-valuemin="0" aria-valuemax="100">
              <div
                className={`h-full rounded-full ${isPrimary ? 'bg-emerald-500' : 'bg-slate-400'}`}
                style={{ width: `${val.value}%` }}
              />
            </div>
          </div>
        );

      case CELL_TYPES.LINK:
        return val.url ? (
          <a
            href={val.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline flex items-center justify-center cursor-pointer"
          >
            {val.text}
            <ArrowUpRight size={10} className="ml-1" aria-hidden="true" />
          </a>
        ) : (
          <span className="text-xs text-slate-400 flex items-center justify-center">
            {val.text}
            <ArrowUpRight size={10} className="ml-1 opacity-30" aria-hidden="true" />
          </span>
        );

      default:
        return null;
    }
  };

  return (
    <tr className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${highlight ? 'bg-emerald-50/30' : ''
      }`}>
      <td className="py-4 pl-6 pr-4">
        <div className="font-medium text-slate-700 text-sm">{label}</div>
        {subLabel && <div className="text-xs text-slate-400 mt-0.5">{subLabel}</div>}
      </td>
      {values.map((val, idx) => (
        <td
          key={idx}
          className={`py-4 px-4 text-center ${idx === PRIMARY_INDEX ? 'bg-emerald-50/40 border-x border-emerald-100' : ''
            }`}
        >
          {renderCellContent(val, idx)}
        </td>
      ))}
    </tr>
  );
};

TableRow.propTypes = {
  label: PropTypes.string.isRequired,
  subLabel: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
  type: PropTypes.oneOf(Object.values(CELL_TYPES)),
  highlight: PropTypes.bool,
  rangeConfig: PropTypes.shape({
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired
  })
};

// Main component
const ComparisonTable = () => {
  const [diseaseType, setDiseaseType] = useState(DISEASE_TYPES.B_ALL);
  const [survivalType, setSurvivalType] = useState(SURVIVAL_TYPES.PFS);

  const currentData = TABLE_DATA[diseaseType];
  const currentSurvival = currentData.survival[survivalType];

  return (
    <div className="space-y-6">
      {/* Disease Type Toggle - Only at top */}
      <div className="flex justify-start">
        <div className="bg-white border border-slate-200 p-1 rounded-full shadow-sm inline-flex">
          <button
            onClick={() => setDiseaseType(DISEASE_TYPES.B_ALL)}
            className={`px-10 py-2 rounded-full text-sm font-bold transition-all ${diseaseType === DISEASE_TYPES.B_ALL
              ? 'bg-slate-800 text-white shadow'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            B-ALL
          </button>
          <button
            onClick={() => setDiseaseType(DISEASE_TYPES.NHL)}
            className={`px-10 py-2 rounded-full text-sm font-bold transition-all ${diseaseType === DISEASE_TYPES.NHL
              ? 'bg-slate-800 text-white shadow'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            NHL
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" role="table" aria-label="CAR-T Product Comparison">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <th scope="col" className="py-4 pl-6 pr-4 font-semibold w-1/3">
                Metric
              </th>
              {currentData.products.map((product, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`py-4 px-4 text-center font-semibold ${idx === PRIMARY_INDEX
                    ? 'font-bold text-emerald-800 bg-emerald-50/50 border-x border-emerald-100 relative'
                    : 'text-slate-400'
                    }`}
                  style={{ width: `${60 / currentData.products.length}%` }}
                >
                  {idx === PRIMARY_INDEX && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" aria-hidden="true" />
                  )}
                  {product}
                  <br />
                  <span className={`text-[10px] normal-case opacity-70 ${idx === PRIMARY_INDEX ? 'text-emerald-600' : ''
                    }`}>
                    {currentData.companies[idx]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-slate-50/30">
              <td colSpan={currentData.products.length + 1} className="py-4 px-4 text-sm bg-slate-50 font-bold text-slate-400 uppercase tracking-widest">
                Study Demographics
              </td>
            </tr>
            <TableRow
              label="No. of Patients"
              values={currentData.demographics.studySize}
            />
            <TableRow
              type={CELL_TYPES.RANGE}
              label="Median Age"
              rangeConfig={{ min: 0, max: 90 }}
              values={currentData.demographics.medianAge}
            />
            <TableRow
              type={CELL_TYPES.RANGE}
              label="Median Prior Lines of Therapy"
              rangeConfig={{ min: 0, max: 16 }}
              values={currentData.demographics.priorTherapy}
            />

            {/* Survival Section with inline PFS/OS Toggle */}
            <tr className="bg-slate-50/30">
              <td colSpan={currentData.products.length + 1} className="py-4 px-4 bg-slate-100 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">
                    {survivalType === SURVIVAL_TYPES.PFS ? 'Progression Free Survival (PFS)' : 'Overall Survival (OS)'}
                  </span>

                  {/* Survival Type Toggle - Inline with heading */}
                  <div className="bg-white border border-slate-200 p-1 rounded-full shadow-sm inline-flex">
                    <button
                      onClick={() => setSurvivalType(SURVIVAL_TYPES.PFS)}
                      className={`px-8 py-1.5 rounded-full text-xs font-bold transition-all ${survivalType === SURVIVAL_TYPES.PFS
                        ? 'bg-slate-800 text-white shadow'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      PFS
                    </button>
                    <button
                      onClick={() => setSurvivalType(SURVIVAL_TYPES.OS)}
                      className={`px-8 py-1.5 rounded-full text-xs font-bold transition-all ${survivalType === SURVIVAL_TYPES.OS
                        ? 'bg-slate-800 text-white shadow'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      OS
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <TableRow
              type={CELL_TYPES.PFS}
              label="6 Month"
              values={currentSurvival.month6}
              highlight
            />
            <TableRow
              type={CELL_TYPES.PFS}
              label="9 Month"
              values={currentSurvival.month9}
            />
            <TableRow
              type={CELL_TYPES.PFS}
              label="12 Month"
              values={currentSurvival.month12}
            />

            <TableRow
              type={CELL_TYPES.LINK}
              label="Study Reference"
              values={currentData.references}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

ComparisonTable.propTypes = {};

export default ComparisonTable;
