import { Home, BarChart3 } from 'lucide-react';
// import { Home, LineChart, Users, Brain, BarChart3 } from 'lucide-react';

export const NAVIGATION_TABS = [
  { id: 'home', label: 'Home', icon: Home, path: '/home' },
  // Temporarily commented out - will need in future
  // { id: 'survival', label: 'Survival Analysis', icon: LineChart, path: '/survival-analysis' },
  // { id: 'prediction', label: 'Patient Prediction', icon: Users, path: '/patient-prediction' },
  // { id: 'ml', label: 'ML Prediction', icon: Brain, path: '/ml-prediction' },
  { id: 'dashboard', label: 'Patient Persona & RWE', icon: BarChart3, path: '/dashboard' },
];
