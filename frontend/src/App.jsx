import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/dashboard/DashboardPage';
import RoomsPage from './pages/rooms/RoomsPage';
import BookingsPage from './pages/bookings/BookingsPage';
import GuestsPage from './pages/guests/GuestsPage';
import BillingPage from './pages/billing/BillingPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/guests" element={<GuestsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
