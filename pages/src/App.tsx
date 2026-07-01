import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import BenchmarkPage from './pages/BenchmarkPage';
import QuickStartPage from './pages/QuickStartPage';
import DocsPage from './pages/DocsPage';
import ScanPage from './pages/ScanPage';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage><FeaturesPage /></LandingPage>} />
        <Route path="/benchmark" element={<LandingPage><BenchmarkPage /></LandingPage>} />
        <Route path="/quickstart" element={<LandingPage><QuickStartPage /></LandingPage>} />
        <Route path="/docs" element={<LandingPage><DocsPage /></LandingPage>} />
        <Route path="/scan" element={<LandingPage><ScanPage /></LandingPage>} />
      </Routes>
    </>
  );
};

export default App;
