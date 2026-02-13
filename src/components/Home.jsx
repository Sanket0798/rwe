import React from 'react';

const HomePage = () => (
  <div className="space-y-8 px-4 sm:px-6 lg:px-0">
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-700 mb-4">Welcome to ACTelligence</h2>
      <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
        An interactive web app for exploratory survival analysis of real-world leukemia and lymphoma patients 
        undergoing CAR-T therapy.
      </p>
      
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg sm:text-xl font-semibold text-emerald-600 mb-4">Key Features</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">1. Kaplan-Meier Survival Analysis</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm sm:text-base">
              <li>Visualize <strong>Progression-Free Survival (PFS)</strong> and <strong>Overall Survival (OS)</strong></li>
              <li>Filter by Hospitals, Indication, Blast %, Lines of Therapy, IPI, Disease Burden, and more</li>
              <li>Download plots, at-risk tables, and cohort survival statistics</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">2. Patient Response Prediction</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm sm:text-base">
              <li>Predict response to CAR-T treatment based on patient characteristics</li>
              <li>Built-in decision support with color-coded response indicators</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 mt-6 pt-6">
        <h3 className="text-lg sm:text-xl font-semibold text-emerald-600 mb-4">How to Use</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm sm:text-base">
          <li>Select your disease indication and set filters in the sidebar</li>
          <li>Review PFS/OS analysis in dedicated tabs</li>
          <li>Visit the Prediction tab to assess likely CAR-T response</li>
          <li>Export any results/images for reporting or presentations</li>
        </ul>
      </div>
    </div>
  </div>
);

export default HomePage;