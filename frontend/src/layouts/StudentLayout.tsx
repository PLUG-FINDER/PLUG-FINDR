import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlobalAIChat from '../components/GlobalAIChat';
import './Layout.css';

const StudentLayout: React.FC = () => {
  return (
    <div className="layout">
      <Navbar userRole="STUDENT" />
      <div className="layout-content full-width">
        <main className="layout-main">
          <Outlet />
        </main>
        <Footer />
      </div>
      <GlobalAIChat />
    </div>
  );
};

export default StudentLayout;
