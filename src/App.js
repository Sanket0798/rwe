import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthRoute from './components/common/AuthRoute';

// Page Components
import HomePage from './components/Home';
// Temporarily commented out - will need in future
// import SurvivalAnalysis from './components/SurvivalAnalysis';
// import MLPrediction from './components/MLPrediction';
// import PatientPrediction from './components/PatientPrediction';
import RWEDashboard from './components/RWEDashboard';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';

// Hooks
import { useApi } from './hooks/useApi';
import { API_ENDPOINTS } from './config/api';

// Auth utilities
import { getAuthData, storeAuthData, clearAuthData } from './utils/auth';

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state for auth check

  // Fetch hospitals and physicians data
  const { data: hospitals = [] } = useApi(API_ENDPOINTS.hospitals);
  const { data: physicians = [] } = useApi(API_ENDPOINTS.physicians);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        console.log('🔍 Checking authentication status...');
        const { isValid, user } = getAuthData();
        
        if (isValid && user) {
          console.log('✅ Restoring authentication from localStorage');
          setUser(user);
          setIsAuthenticated(true);
        } else {
          console.log('ℹ️ No valid authentication found');
        }
      } catch (error) {
        console.error('❌ Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData) => {
    try {
      console.log('🔐 Logging in user:', userData.email);
      
      // Store authentication data using utility function
      const success = storeAuthData(userData);
      
      if (success) {
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ Login completed successfully');
      } else {
        console.warn('⚠️ Failed to store auth data, but proceeding with login');
        // Still set state even if localStorage fails
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('❌ Error during login:', error);
      // Still set state even if there's an error
      setUser(userData);
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    try {
      console.log('🚪 Logging out user');
      
      // Clear authentication data using utility function
      clearAuthData();
      
      // Clear state
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout completed successfully');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Still clear state even if there's an error
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading ACTelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Authentication Routes */}
          <Route 
            path="/login" 
            element={
              <AuthRoute isAuthenticated={isAuthenticated}>
                <Login onLogin={handleLogin} />
              </AuthRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <AuthRoute isAuthenticated={isAuthenticated}>
                <ForgotPassword />
              </AuthRoute>
            } 
          />

          {/* Protected Application Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="home" element={<HomePage />} />
            {/* Temporarily commented out - will need in future */}
            {/* <Route path="survival-analysis" element={<SurvivalAnalysis />} /> */}
            {/* <Route 
              path="patient-prediction" 
              element={
                <PatientPrediction 
                  hospitals={hospitals || []} 
                  physicians={physicians || []} 
                />
              } 
            /> */}
            {/* <Route path="ml-prediction" element={<MLPrediction />} /> */}
            <Route path="dashboard" element={<RWEDashboard />} />
          </Route>

          {/* Catch all route - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;