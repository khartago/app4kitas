import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('../pages/educator/Dashboard'));
const MeineGruppe = lazy(() => import('../pages/educator/MeineGruppe'));
const Kinder = lazy(() => import('../pages/educator/Kinder'));
const Nachrichten = lazy(() => import('../pages/educator/Nachrichten'));
const Notizen = lazy(() => import('../pages/educator/Notizen'));

const EducatorRoutes: React.FC = () => (
  <Suspense fallback={<div>Lädt...</div>}>
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="meine-gruppe" element={<MeineGruppe />} />
      <Route path="kinder" element={<Kinder />} />
      <Route path="nachrichten" element={<Nachrichten />} />
      <Route path="notizen" element={<Notizen />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  </Suspense>
);

export default EducatorRoutes; 