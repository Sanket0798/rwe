import React from 'react';
import { AlertCircle, Check, Loader2 } from 'lucide-react';

/**
 * Simple API status indicator component
 */
export default function APIStatus({ apiHealthy, loading, error }) {
  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-sm text-blue-800 font-medium">Loading survival analysis data...</span>
        </div>
      </div>
    );
  }

  if (!apiHealthy || error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-800 font-medium">
            {error || 'Backend API unavailable - using mock data'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <Check className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-800 font-medium">Connected to live data</span>
      </div>
    </div>
  );
}