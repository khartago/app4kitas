import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Groups = lazy(() => import('../pages/admin/Groups'));
const Children = lazy(() => import('../pages/admin/Children'));
const Personal = lazy(() => import('../pages/admin/Personal'));
const Statistiken = lazy(() => import('../pages/admin/Statistiken'));
const Notifications = lazy(() => import('../pages/admin/Notifications'));
const Settings = lazy(() => import('../pages/admin/Settings'));
const Reports = lazy(() => import('../pages/admin/Reports'));

const AdminRoutes: React.FC = () => (
  <Suspense fallback={<div>Lädt...</div>}>
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="gruppen" element={<Groups />} />
      <Route path="kinder" element={<Children />} />
      <Route path="personal" element={<Personal />} />
      <Route path="statistiken" element={<Statistiken />} />
      <Route path="benachrichtigungen" element={<Notifications />} />
      <Route path="einstellungen" element={<Settings />} />
      <Route path="berichte" element={<Reports />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  </Suspense>
);

export default AdminRoutes; 