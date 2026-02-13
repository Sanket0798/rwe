import { Home, LineChart, Users, Brain, BarChart3 } from 'lucide-react';

// Feature flags for navigation items
const FEATURES = {
  HOME: false,
  SURVIVAL_ANALYSIS: false,
  PATIENT_PREDICTION: false,
  ML_PREDICTION: false,
  DASHBOARD: true,
};

const ALL_NAVIGATION_TABS = [
  { id: 'home', label: 'Home', icon: Home, path: '/home', enabled: FEATURES.HOME },
  { id: 'survival', label: 'Survival Analysis', icon: LineChart, path: '/survival-analysis', enabled: FEATURES.SURVIVAL_ANALYSIS },
  { id: 'prediction', label: 'Patient Prediction', icon: Users, path: '/patient-prediction', enabled: FEATURES.PATIENT_PREDICTION },
  { id: 'ml', label: 'ML Prediction', icon: Brain, path: '/ml-prediction', enabled: FEATURES.ML_PREDICTION },
  { id: 'dashboard', label: 'NexCAR19: Efficacy Analysis', icon: BarChart3, path: '/dashboard', enabled: FEATURES.DASHBOARD },
];

export const NAVIGATION_TABS = ALL_NAVIGATION_TABS.filter(tab => tab.enabled);
