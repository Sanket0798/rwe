# Actelligence - NexCAR19 Clinical Analytics Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-org/actelligence)
[![React](https://img.shields.io/badge/React-19.2.1-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()
[![Production Ready](https://img.shields.io/badge/status-Production%20Ready-green.svg)]()

## 🏥 Overview

Actelligence is a comprehensive clinical analytics platform designed for NexCAR19 CAR-T cell therapy analysis. The platform provides real-world evidence (RWE) insights, patient persona analysis, and survival analytics for healthcare professionals and researchers.

### Key Features

- **🧬 Patient Personas & RWE Dashboard** - Advanced patient segmentation and real-world evidence analysis
- **📊 Survival Analysis** - Kaplan-Meier survival curves with interactive visualizations
- **🎯 ML Prediction Models** - Machine learning-powered patient outcome predictions
- **🔍 Advanced Filtering** - Multi-level filtering by institute, region, physician, and clinical parameters
- **📈 Benchmarking** - Comparative analysis against Standard of Care (SOC) and Global CAR-T data
- **🎨 Interactive Visualizations** - Heat maps, gradient charts, and clinical data visualizations
- **🔐 Secure Authentication** - Role-based access control for healthcare professionals

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Backend API** running on port 5000

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd front

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm start
```

The application will be available at `http://localhost:3000`

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm start

# Build for production
npm run build

# Run test suite
npm test

# Eject from Create React App (⚠️ irreversible)
npm run eject
```

### Project Structure

```
src/
├── components/           # React components
│   ├── common/          # Reusable UI components
│   ├── layout/          # Layout components
│   ├── RWEDashboard.jsx # Main dashboard
│   ├── SurvivalAnalysis.jsx
│   ├── MLPrediction.jsx
│   └── ...
├── hooks/               # Custom React hooks
├── services/            # API service layer
├── utils/               # Utility functions
├── config/              # Configuration files
└── constants/           # Application constants
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Application Settings
REACT_APP_NAME=Actelligence
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_ML_PREDICTION=true
REACT_APP_ENABLE_RWE_DASHBOARD=true
```

### Production Configuration

For production deployment, update the environment variables:

```env
REACT_APP_API_URL=https://your-production-api-domain.com
```

## 📦 Dependencies

### Core Dependencies

- **React 19.2.1** - UI framework
- **React Router DOM 7.12.0** - Client-side routing
- **Lucide React 0.556.0** - Icon library
- **@nivo/heatmap 0.99.0** - Data visualization

### Development Dependencies

- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **PostCSS 8.4.31** - CSS processing
- **Testing Library** - Component testing utilities

## 🏗️ Architecture

### Component Architecture

```
App.js
├── Layout/
│   ├── Header
│   ├── Sidebar
│   └── Footer
├── Pages/
│   ├── RWEDashboard (Main)
│   ├── SurvivalAnalysis
│   ├── MLPrediction
│   └── PatientPrediction
└── Common/
    ├── ErrorBoundary
    ├── LoadingSpinner
    └── Modal
```

### State Management

- **React Hooks** - Local component state
- **Custom Hooks** - Shared business logic
- **Context API** - Global state (authentication)

### API Integration

- **RESTful API** - Backend communication
- **Custom Hooks** - Data fetching (`useApi`, `useSurvivalAnalysis`)
- **Service Layer** - API abstraction

## 🎨 UI/UX Features

### Design System

- **Tailwind CSS** - Consistent styling
- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - User preference support
- **Accessibility** - WCAG 2.1 compliant

### Interactive Features

- **Real-time Data** - Live API integration
- **Advanced Filtering** - Multi-dimensional data filtering
- **Export Capabilities** - Data export functionality
- **Interactive Charts** - Hover states and drill-down

## 🔐 Security

### Authentication

- **JWT Tokens** - Secure authentication
- **Role-based Access** - User permission system
- **Session Management** - Automatic token refresh
- **Protected Routes** - Route-level security

### Data Security

- **HTTPS Only** - Encrypted data transmission
- **Input Validation** - Client-side validation
- **XSS Protection** - Content Security Policy
- **CSRF Protection** - Cross-site request forgery prevention

## 🚀 Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# The build folder contains the production-ready files
# Deploy the contents of the build/ folder to your web server
```

### Deployment Checklist

- [ ] Update `REACT_APP_API_URL` for production
- [ ] Enable HTTPS
- [ ] Configure CDN (optional)
- [ ] Set up monitoring and analytics
- [ ] Configure error tracking
- [ ] Test all features in production environment

### Recommended Hosting

- **Netlify** - Automatic deployments from Git
- **Vercel** - Optimized for React applications
- **AWS S3 + CloudFront** - Scalable static hosting
- **Azure Static Web Apps** - Enterprise-grade hosting

## 📊 Performance

### Optimization Features

- **Code Splitting** - Lazy loading of components
- **Bundle Optimization** - Webpack optimizations
- **Image Optimization** - Compressed assets
- **Caching Strategy** - Browser and API caching

### Performance Metrics

- **Lighthouse Score** - 90+ across all metrics
- **First Contentful Paint** - < 1.5s
- **Time to Interactive** - < 3s
- **Bundle Size** - Optimized for fast loading

## 🧪 Testing

### Testing Strategy

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage

- **Unit Tests** - Component logic testing
- **Integration Tests** - API integration testing
- **E2E Tests** - User workflow testing
- **Accessibility Tests** - WCAG compliance testing

## 🐛 Troubleshooting

### Common Issues

**API Connection Issues**
```bash
# Check if backend is running
curl http://localhost:5000/health

# Verify environment variables
echo $REACT_APP_API_URL
```

**Build Issues**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear React Scripts cache
npm start -- --reset-cache
```

**Performance Issues**
```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

## 📚 Documentation

### Additional Resources

- [API Documentation](../back/README.md) - Backend API reference
- [Component Library](./docs/components.md) - UI component documentation
- [Deployment Guide](./docs/deployment.md) - Detailed deployment instructions
- [Contributing Guide](./docs/contributing.md) - Development guidelines

## 🤝 Support

### Getting Help

- **Technical Issues** - Create an issue in the repository
- **Feature Requests** - Submit via project management system
- **Security Issues** - Contact security team directly

### Team Contacts

- **Frontend Team** - frontend@actelligence.com
- **DevOps Team** - devops@actelligence.com
- **Product Team** - product@actelligence.com

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ for advancing CAR-T cell therapy research and clinical outcomes.**

---

## 🔄 Version History

### v1.0.0 (Production Release)
- ✅ Complete RWE Dashboard implementation
- ✅ Advanced patient persona analysis
- ✅ Survival analysis with Kaplan-Meier curves
- ✅ Multi-level filtering system
- ✅ Production-ready authentication
- ✅ Responsive design and accessibility
- ✅ Performance optimizations
- ✅ Security hardening

---

*Last updated: February 2026*#   r w e  
 #   r w e  
 