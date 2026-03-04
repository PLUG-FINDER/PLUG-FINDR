import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Layout.css';

const AdminLayout: React.FC = () => {
  return (
    <div className="layout">
      <Navbar userRole="ADMIN" />
      <div className="layout-content full-width">
        <main className="layout-main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
