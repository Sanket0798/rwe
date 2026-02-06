import React, { useState } from 'react';

// Demo component to showcase the new search functionality
const SearchDemo = () => {
  const [selectedInstitute, setSelectedInstitute] = useState('');
  const [selectedPhysicians, setSelectedPhysicians] = useState([]);

  // Mock data for demo
  const mockInstitutes = [
    "AIIMS - Delhi",
    "Apollo - Mumbai", 
    "Tata Memorial Hospital",
    "Fortis Healthcare",
    "Max Healthcare",
    "CMC Vellore"
  ];

  const mockPhysicians = [
    "Dr. Abhijit Baheti",
    "Dr. Abhishek Charan", 
    "Dr. Akshay Lahoti",
    "Dr. Amul Kapoor",
    "Dr. Anil Aribandi",
    "Dr. Anshul Gupta",
    "Dr. Anupam chakrapani"
  ];

  const togglePhysician = (physician) => {
    setSelectedPhysicians(prev => 
      prev.includes(physician) 
        ? prev.filter(p => p !== physician)
        : [...prev, physician]
    );
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Search Functionality Demo</h2>
      
      <div className="space-y-6">
        {/* Institute Search Demo */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-2">Institute Level Search</h3>
          <div className="text-xs text-slate-500 mb-2">
            Selected: {selectedInstitute || 'None'}
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-xs text-slate-600">
              🔍 Searchable dropdown with {mockInstitutes.length} institutes
            </div>
          </div>
        </div>

        {/* Physician Multi-Select Demo */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-2">Physician Multi-Select Search</h3>
          <div className="text-xs text-slate-500 mb-2">
            Selected: {selectedPhysicians.length} physicians
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-xs text-slate-600">
              👨‍⚕️ Multi-select with search from {mockPhysicians.length} physicians
            </div>
            {selectedPhysicians.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedPhysicians.map(physician => (
                  <span key={physician} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                    {physician}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features List */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="text-sm font-bold text-green-800 mb-2">✅ Features Added</h4>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Real-time search filtering</li>
            <li>• Click outside to close dropdowns</li>
            <li>• Clear selection buttons</li>
            <li>• Multi-select with visual pills</li>
            <li>• Bulk clear functionality</li>
            <li>• Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchDemo;