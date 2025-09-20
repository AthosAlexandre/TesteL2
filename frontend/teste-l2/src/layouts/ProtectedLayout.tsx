import React from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import Topbar from '../components/top-bar/Topbar';

export default function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Topbar />
      <Outlet />
    </ProtectedRoute>
  );
}
