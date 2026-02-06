import React from 'react';

const Checkbox = ({ label, checked, onChange, className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mr-2 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
      />
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    </div>
  );
};

export default Checkbox;
