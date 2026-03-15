import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './shared/components/layout/Layout';
import Dashboard from './features/dashboard/Dashboard';
import Requests from './features/requests/Requests';
import Inventory from './features/inventory/Inventory';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="requests" element={<Requests />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="rag" element={<div className="text-slate-400 font-bold italic text-center p-12 bg-white rounded-3xl border border-slate-200 shadow-sm">RAG Search functionality coming soon.</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
