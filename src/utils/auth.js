/**
 * Authentication utility functions
 */

const AUTH_STORAGE_KEY = 'actelligence_auth';
const USER_STORAGE_KEY = 'actelligence_user';

/**
 * Store authentication data in localStorage
 */
export const storeAuthData = (userData) => {
  try {
    const authData = {
      isAuthenticated: true,
      timestamp: new Date().getTime(),
      rememberMe: userData.rememberMe || false
    };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    
    console.log('✅ Authentication data stored successfully');
    return true;
  } catch (error) {
    console.error('❌ Error storing authentication data:', error);
    return false;
  }
};

/**
 * Retrieve and validate authentication data from localStorage
 */
export const getAuthData = () => {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    
    if (!storedAuth || !storedUser) {
      return { isValid: false, user: null };
    }
    
    const authData = JSON.parse(storedAuth);
    const userData = JSON.parse(storedUser);
    
    // Check if the stored auth is still valid (not expired)
    const currentTime = new Date().getTime();
    const authTime = authData.timestamp || 0;
    const rememberMe = authData.rememberMe || false;
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days if remembered, 24 hours if not
    
    if (currentTime - authTime < maxAge) {
      return { isValid: true, user: userData, rememberMe };
    } else {
      // Auth expired, clear it
      clearAuthData();
      return { isValid: false, user: null };
    }
  } catch (error) {
    console.error('❌ Error retrieving authentication data:', error);
    clearAuthData(); // Clear potentially corrupted data
    return { isValid: false, user: null };
  }
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    console.log('✅ Authentication data cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing authentication data:', error);
    return false;
  }
};

/**
 * Check if user is currently authenticated
 */
export const isAuthenticated = () => {
  const { isValid } = getAuthData();
  return isValid;
};

/**
 * Get current user data if authenticated
 */
export const getCurrentUser = () => {
  const { isValid, user } = getAuthData();
  return isValid ? user : null;
};

/**
 * Update user data in storage (for profile updates, etc.)
 */
export const updateUserData = (updatedUserData) => {
  try {
    const { isValid, user } = getAuthData();
    if (!isValid) {
      return false;
    }
    
    const newUserData = { ...user, ...updatedUserData };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUserData));
    
    console.log('✅ User data updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating user data:', error);
    return false;
  }
};