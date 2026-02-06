
// Generic API request handler with error handling
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// GET request helper
export const get = (url) => apiRequest(url);

// POST request helper
export const post = (url, data) => apiRequest(url, {
  method: 'POST',
  body: JSON.stringify(data),
});
