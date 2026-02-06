import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAVIGATION_TABS } from '../../constants/navigation';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-0 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-1 ml-[130px]">
          {NAVIGATION_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-3 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
