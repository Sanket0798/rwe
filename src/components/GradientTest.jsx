import React from 'react';

// Simple test component to demonstrate the continuous gradient
const GradientTest = () => {
  // Sample data that mimics your RWE dashboard values
  const sampleData = [
    { label: "Primary Refractory - Low Risk", value: 48 },
    { label: "Primary Refractory - High Risk", value: 17 },
    { label: "Late Relapse - Low Risk", value: 86 },
    { label: "Late Relapse - High Risk", value: 100 },
    { label: "Early Relapse - Low Risk", value: 57 },
    { label: "Early Relapse - High Risk", value: 25 }
  ];

  // Gradient configuration
  const GRADIENT_CONFIG = {
    clinical: {
      stops: [
        { percent: 0, color: [0, 32, 96] },      // Dark blue
        { percent: 20, color: [0, 150, 200] },   // Cyan
        { percent: 40, color: [0, 200, 100] },   // Green
        { percent: 60, color: [150, 220, 0] },   // Yellow-green
        { percent: 80, color: [255, 165, 0] },   // Orange
        { percent: 100, color: [139, 0, 0] }     // Dark red
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

  const getContinuousGradientColor = (percentage) => {
    const clampedPercent = Math.max(0, Math.min(100, percentage));
    const stops = GRADIENT_CONFIG.clinical.stops;
    
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

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">
          Continuous Gradient Test - RWE Dashboard Colors
        </h1>
        
        {/* Sample Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sampleData.map((item, index) => (
            <div
              key={index}
              className="h-32 rounded-lg p-4 flex flex-col justify-between transition-all hover:scale-105 cursor-pointer shadow-lg"
              style={{ 
                backgroundColor: getContinuousGradientColor(item.value),
                color: getContrastTextColor(item.value)
              }}
            >
              <div className="text-sm font-medium opacity-90">
                {item.label}
              </div>
              <div className="text-3xl font-bold">
                {item.value}%
              </div>
            </div>
          ))}
        </div>

        {/* Gradient Demonstration */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Every Percentage Gets a Unique Color
          </h2>
          <p className="text-slate-600 mb-6">
            Notice how each percentage has a slightly different color - no two are the same!
          </p>
          
          {/* Show progression from 0% to 100% */}
          <div className="space-y-4">
            {[
              { range: "0-20%", values: [0, 5, 10, 15, 20] },
              { range: "20-40%", values: [20, 25, 30, 35, 40] },
              { range: "40-60%", values: [40, 45, 50, 55, 60] },
              { range: "60-80%", values: [60, 65, 70, 75, 80] },
              { range: "80-100%", values: [80, 85, 90, 95, 100] }
            ].map(section => (
              <div key={section.range}>
                <h3 className="text-sm font-bold text-slate-700 mb-2">{section.range}</h3>
                <div className="flex gap-2">
                  {section.values.map(percent => (
                    <div
                      key={percent}
                      className="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-sm border border-white/20"
                      style={{ 
                        backgroundColor: getContinuousGradientColor(percent),
                        color: getContrastTextColor(percent)
                      }}
                    >
                      {percent}%
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Fine-grained demonstration */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Fine-Grained Color Changes (45% - 55%)
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              See how even 1% differences create visible color changes:
            </p>
            <div className="flex gap-1">
              {Array.from({ length: 11 }, (_, i) => 45 + i).map(percent => (
                <div
                  key={percent}
                  className="w-12 h-12 rounded flex items-center justify-center font-bold text-xs border border-white/20"
                  style={{ 
                    backgroundColor: getContinuousGradientColor(percent),
                    color: getContrastTextColor(percent)
                  }}
                >
                  {percent}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradientTest;