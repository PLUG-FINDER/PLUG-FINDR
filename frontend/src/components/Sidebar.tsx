import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icons from './Icons';
import './Sidebar.css';

interface SidebarProps {
  items: { path: string; label: string; icon?: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon && (
              <span className="sidebar-icon">
                <Icons name={item.icon} size={20} />
              </span>
            )}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;


