import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('../pages/super_admin/Dashboard'));
const Institutionen = lazy(() => import('../pages/super_admin/Institutionen'));
const Educators = lazy(() => import('../pages/super_admin/Educators'));
const Parents = lazy(() => import('../pages/super_admin/Parents'));
const Statistiken = lazy(() => import('../pages/super_admin/Statistiken'));
const Reports = lazy(() => import('../pages/super_admin/Reports'));

const SuperAdminRoutes: React.FC = () => (
  <Suspense fallback={<div>Lädt...</div>}>
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="institutionen" element={<Institutionen />} />
      <Route path="erzieher" element={<Educators />} />
      <Route path="eltern" element={<Parents />} />
      <Route path="statistiken" element={<Statistiken />} />
      <Route path="berichte" element={<Reports />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  </Suspense>
);

export default SuperAdminRoutes; 