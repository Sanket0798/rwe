import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <img 
            src="/ImmunoACT-Logo-No-Background.png" 
            alt="ImmunoACT" 
            className="h-10 w-auto" 
          />
          <p className="text-sm text-gray-600">
            © 2026 ImmunoACT Pvt. Ltd. All rights reserved.
          </p>
          <img 
            src="/The Hope Initiative transparent.png" 
            alt="The Hope Initiative" 
            className="h-12 w-auto" 
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
