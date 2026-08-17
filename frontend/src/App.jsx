import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HotelProvider } from './context/HotelContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import Guests from './pages/Guests';
import Billing from './pages/Billing';
import Settings from './pages/Settings';

export default function App() {
  return (
    <HotelProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="guests" element={<Guests />} />
          <Route path="billing" element={<Billing />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HotelProvider>
  );
}
