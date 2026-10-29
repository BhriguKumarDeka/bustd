import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ToastContainer from './components/Toast';

import Overview from './pages/Overview';
import NewInspection from './pages/NewInspection';
import InspectionDetail from './pages/InspectionDetail';
import InspectionHistory from './pages/InspectionHistory';
import Products from './pages/Products';
import RuleLibrary from './pages/RuleLibrary';

export default function App() {
  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark text-charcoal-900 dark:text-zinc-100 flex transition-colors">
      {/* Left Navigation Rail */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 p-6 md:p-8 max-w-full overflow-y-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/inspections/new" element={<NewInspection />} />
            <Route path="/inspections/:id" element={<InspectionDetail />} />
            <Route path="/history" element={<InspectionHistory />} />
            <Route path="/products" element={<Products />} />
            <Route path="/rules" element={<RuleLibrary />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Notification Toast Layer */}
      <ToastContainer />
    </div>
  );
}
