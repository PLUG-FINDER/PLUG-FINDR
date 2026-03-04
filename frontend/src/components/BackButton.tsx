import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/student/StudentPages.css'; // Reusing the style for back-button

interface BackButtonProps {
  label?: string;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ label = 'Back', onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button onClick={handleClick} className="back-button">
      ← {label}
    </button>
  );
};

export default BackButton;







