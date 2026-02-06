import React, { useState } from 'react';

// Import the gradient functions from RWEDashboard
const GRADIENT_CONFIG = {
  clinical: {
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
    stops: [
      { percent: 0, color: [68, 1, 84] },      // Dark purple
      { percent: 25, color: [59, 82, 139] },   // Blue-purple
      { percent: 50, color: [33, 145, 140] },  // Teal
      { percent: 75, color: [94, 201, 98] },   // Green
      { percent: 100, color: [253, 231, 37] }  // Yellow
    ]
  },
  plasma: {
    stops: [
      { percent: 0, color: [13, 8, 135] },     // Dark blue
      { percent: 25, color: [126, 3, 168] },   // Purple
      { percent: 50, color: [203, 70, 121] },  // Pink
      { percent: 75, color: [248, 149, 64] },  // Orange
      { percent: 100, color: [240, 249, 33] }  // Yellow
    ]
  }
};

const interpolateColor = (color1, color2, factor) => {
  const result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
  }
  return result;
};

const getContinuousGradientColor = (percentage, scheme = 'clinical') => {
  const clampedPercent = Math.max(0, Math.min(100, percentage));
  const stops = GRADIENT_CONFIG[scheme].stops;
  
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
  const interpolatedColor = interpolateColor(lowerStop.color, upperStop.color, factor);
  
  return `rgb(${interpolatedColor[0]}, ${interpolatedColor[1]}, ${interpolatedColor[2]})`;
};

const getContrastTextColor = (percentage) => {
  return percentage < 50 ? 'white' : '#1f2937';
};

export default function GradientDemo() {
  const [selectedScheme, setSelectedScheme] = useState('clinical');
  const [hoveredPercent, setHoveredPercent] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Continuous Gradient Color System
          </h1>
          <p className="text-lg text-slate-600">
            Every percentage from 0% to 100% gets a unique color with smooth transitions
          </p>
        </div>

        {/* Scheme Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Color Schemes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.keys(GRADIENT_CONFIG).map(scheme => (
              <button
                key={scheme}
                onClick={() => setSelectedScheme(scheme)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedScheme === scheme 
                    ? 'bg-teal-50 border-teal-200 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-bold capitalize mb-2 text-slate-700">
                  {scheme}
                </div>
                <div 
                  className="h-6 rounded border border-slate-200"
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
              </button>
            ))}
          </div>
        </div>

        {/* Every Single Percentage Demo */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Every Percentage (0% - 100%) - {selectedScheme.charAt(0).toUpperCase() + selectedScheme.slice(1)}
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Hover over any cell to see the exact percentage and color values
          </p>
          
          <div className="grid grid-cols-10 sm:grid-cols-20 gap-1">
            {Array.from({ length: 101 }, (_, i) => i).map(percent => (
              <div
                key={percent}
                className="aspect-square rounded cursor-pointer transition-all hover:scale-110 hover:z-10 relative border border-white/20"
                style={{ 
                  backgroundColor: getContinuousGradientColor(percent, selectedScheme),
                  color: getContrastTextColor(percent)
                }}
                onMouseEnter={() => setHoveredPercent(percent)}
                onMouseLeave={() => setHoveredPercent(null)}
                title={`${percent}%`}
              >
                {percent % 10 === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {percent}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {hoveredPercent !== null && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-lg"
                  style={{ 
                    backgroundColor: getContinuousGradientColor(hoveredPercent, selectedScheme),
                    color: getContrastTextColor(hoveredPercent)
                  }}
                >
                  {hoveredPercent}%
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-700">
                    Percentage: {hoveredPercent}%
                  </div>
                  <div className="text-sm text-slate-600">
                    Color: {getContinuousGradientColor(hoveredPercent, selectedScheme)}
                  </div>
                  <div className="text-sm text-slate-600">
                    Scheme: {selectedScheme}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step-by-step Demo */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Step-by-Step Color Changes (Every 1%)
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Notice how each percentage gets a slightly different color
          </p>
          
          <div className="space-y-4">
            {[
              { start: 0, end: 20, label: "Low Range (0-20%)" },
              { start: 20, end: 40, label: "Low-Medium Range (20-40%)" },
              { start: 40, end: 60, label: "Medium Range (40-60%)" },
              { start: 60, end: 80, label: "Medium-High Range (60-80%)" },
              { start: 80, end: 100, label: "High Range (80-100%)" }
            ].map(range => (
              <div key={range.start} className="space-y-2">
                <h3 className="text-sm font-bold text-slate-700">{range.label}</h3>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i).map(percent => (
                    <div
                      key={percent}
                      className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold border border-white/20"
                      style={{ 
                        backgroundColor: getContinuousGradientColor(percent, selectedScheme),
                        color: getContrastTextColor(percent)
                      }}
                      title={`${percent}%`}
                    >
                      {percent}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}