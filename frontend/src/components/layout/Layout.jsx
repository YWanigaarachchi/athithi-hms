import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import NewBookingModal from '../modals/NewBookingModal';

export default function Layout() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar onNewBookingClick={() => setIsBookingModalOpen(true)} />
        <main className="page-body">
          <Outlet context={{ openBookingModal: () => setIsBookingModalOpen(true) }} />
        </main>
      </div>

      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}
