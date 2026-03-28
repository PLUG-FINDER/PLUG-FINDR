import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlobalAIChat from '../components/GlobalAIChat';
import './Layout.css';

const VendorLayout: React.FC = () => {
  const layoutMainRef = useRef<HTMLElement>(null);

  // #region agent log
  useEffect(() => {
    const measureLayout = () => {
      const navbar = document.querySelector('.navbar');
      const layoutMain = document.querySelector('.layout-main');
      
      if (navbar && layoutMain) {
        const navbarRect = navbar.getBoundingClientRect();
        const layoutMainRect = layoutMain.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(layoutMain);
        const navbarComputed = window.getComputedStyle(navbar);
        
        fetch('http://127.0.0.1:7242/ingest/f66f5750-cf54-4ed3-b984-2b9a5b6acd7e', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'VendorLayout.tsx:useEffect',
            message: 'Layout spacing measurements',
            data: {
              navbarHeight: navbarRect.height,
              navbarPosition: navbarComputed.position,
              navbarTop: navbarRect.top,
              navbarBottom: navbarRect.bottom,
              layoutMainPaddingTop: computedStyle.paddingTop,
              layoutMainPaddingTopParsed: parseFloat(computedStyle.paddingTop),
              layoutMainTop: layoutMainRect.top,
              spacingBetween: layoutMainRect.top - navbarRect.bottom,
              windowWidth: window.innerWidth,
              windowHeight: window.innerHeight
            },
            timestamp: Date.now(),
            runId: 'initial',
            hypothesisId: 'A,B,C'
          })
        }).catch(() => {});
      }
    };
    
    setTimeout(measureLayout, 100);
    window.addEventListener('resize', measureLayout);
    window.addEventListener('scroll', measureLayout);
    
    return () => {
      window.removeEventListener('resize', measureLayout);
      window.removeEventListener('scroll', measureLayout);
    };
  }, []);
  // #endregion

  return (
    <div className="layout">
      <Navbar userRole="VENDOR" />
      <div className="layout-content full-width">
        <main className="layout-main" ref={layoutMainRef}>
          <Outlet />
        </main>
        <Footer />
      </div>
      <GlobalAIChat />
    </div>
  );
};

export default VendorLayout;
