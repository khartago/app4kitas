import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('../pages/educator/Dashboard'));
const Checkin = lazy(() => import('../pages/educator/Checkin'));
const Kinder = lazy(() => import('../pages/educator/Kinder'));
const Chat = lazy(() => import('../pages/educator/Chat'));
const Notizen = lazy(() => import('../pages/educator/Notizen'));

const EducatorRoutes: React.FC = () => (
  <Suspense fallback={<div>Lädt...</div>}>
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="checkin" element={<Checkin />} />
      <Route path="kinder" element={<Kinder />} />
      <Route path="chat" element={<Chat />} />
      <Route path="notizen" element={<Notizen />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  </Suspense>
);

export default EducatorRoutes; 