import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BedDouble, CalendarCheck, Users,
  Receipt, Settings, LogOut, Hotel
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/',         label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/rooms',    label: 'Rooms',      icon: BedDouble },
  { path: '/bookings', label: 'Bookings',   icon: CalendarCheck },
  { path: '/guests',   label: 'Guests',     icon: Users },
  { path: '/billing',  label: 'Billing',    icon: Receipt },
  { path: '/settings', label: 'Settings',   icon: Settings },
];

export default function Sidebar() {
  return (
    <nav className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🏨</div>
        <div className="sidebar-brand-text">
          <h2>Athithi</h2>
          <span>HMS • අමුත්තා</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <p className="nav-section-label">Main</p>
        {NAV_ITEMS.slice(0, 4).map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon className="nav-icon" size={18} />
            {label}
          </NavLink>
        ))}

        <p className="nav-section-label" style={{ marginTop: 12 }}>Finance</p>
        <NavLink
          to="/billing"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <Receipt className="nav-icon" size={18} />
          Billing
        </NavLink>

        <p className="nav-section-label" style={{ marginTop: 12 }}>System</p>
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <Settings className="nav-icon" size={18} />
          Settings
        </NavLink>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="nav-item text-muted text-sm">
          <Hotel size={16} />
          <span>v1.0 · Sri Lanka</span>
        </div>
      </div>
    </nav>
  );
}
