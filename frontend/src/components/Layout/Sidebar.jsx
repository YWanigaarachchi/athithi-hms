import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BedDouble, CalendarDays,
  Users, Receipt, LogOut, Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';

const NAV_ITEMS = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/rooms',    icon: BedDouble,       label: 'Rooms'      },
  { to: '/bookings', icon: CalendarDays,    label: 'Bookings'   },
  { to: '/guests',   icon: Users,           label: 'Guests'     },
  { to: '/billing',  icon: Receipt,         label: 'Billing'    },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🏨</div>
        <div className="sidebar-brand-text">
          <h1>Athithi</h1>
          <span>Hotel Management System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">
          {getInitials(user?.name?.split(' ')[0], user?.name?.split(' ')[1])}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name || 'Staff'}</div>
          <div className="sidebar-user-role">{user?.role || 'receptionist'}</div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
