import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };
  return (
    <header className="bg-white shadow-sm border-b-2 border-emerald-600">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 ml-[150px]">
            {/* <Activity className="w-10 h-10 text-emerald-600" /> */}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#355699] via-[#307a78] to-[#86be22] bg-clip-text text-transparent h-11">ACT<span className='italic'>elligence</span></h1>
              {/* <p className="text-sm text-gray-600">NexCAR19 Clinical Analytics Platform</p> */}
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="w-4 h-4" />
                <span>Welcome, {user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
