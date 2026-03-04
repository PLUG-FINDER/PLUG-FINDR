import React from 'react';
import './Loader.css';

interface LoaderProps {
  size?: 'small' | 'default';
}

const Loader: React.FC<LoaderProps> = ({ size = 'default' }) => {
  return (
    <div className={`loader-container ${size === 'small' ? 'loader-small' : ''}`}>
      <div className="loader"></div>
    </div>
  );
};

export default Loader;


