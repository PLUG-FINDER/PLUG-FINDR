import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  group?: string;
}

interface OptGroup {
  label: string;
  options: Option[];
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  className = "",
  style = {},
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Group options by group label
  const groupedOptions: OptGroup[] = [];
  const ungroupedOptions: Option[] = [];
  
  // Filter out empty placeholder option for grouping (only show actual options in dropdown)
  const validOptions = options.filter(opt => opt.value !== '');
  
  validOptions.forEach(option => {
    if (option.group && option.group !== '') {
      let group = groupedOptions.find(g => g.label === option.group);
      if (!group) {
        group = { label: option.group, options: [] };
        groupedOptions.push(group);
      }
      group.options.push(option);
    } else {
      ungroupedOptions.push(option);
    }
  });

  // Flatten all options for keyboard navigation (excluding empty placeholder)
  const allOptions: Option[] = [];
  groupedOptions.forEach(group => {
    allOptions.push(...group.options);
  });
  allOptions.push(...ungroupedOptions.filter(opt => opt.value !== ''));

  const selectedOption = allOptions.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Scroll highlighted option into view
      if (highlightedIndex >= 0 && dropdownRef.current) {
        const optionElement = dropdownRef.current.querySelector(`[data-index="${highlightedIndex}"]`) as HTMLElement;
        if (optionElement) {
          optionElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, highlightedIndex]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex(prev => 
          prev < allOptions.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0) {
        handleSelect(allOptions[highlightedIndex].value);
      } else if (!isOpen) {
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div
      ref={selectRef}
      className={`custom-select ${className}`}
      style={{ position: 'relative', ...style }}
      id={id}
    >
      <div
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          paddingRight: '2.5rem',
          borderRadius: '12px',
          border: '2px solid var(--gray-200)',
          fontSize: '1rem',
          backgroundColor: 'var(--gray-50)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          outline: 'none',
          transition: 'all 0.2s ease'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary-500)';
          e.currentTarget.style.boxShadow = '0 0 0 4px var(--primary-50)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--gray-200)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span style={{ 
          flex: 1, 
          textAlign: 'left',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          style={{
            width: '20px',
            height: '20px',
            flexShrink: 0,
            marginLeft: '0.5rem',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'var(--text-secondary)'
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="custom-select-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.25rem',
            backgroundColor: 'var(--gray-50)',
            border: '2px solid var(--gray-200)',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            animation: 'slideDown 0.2s ease'
          }}
          role="listbox"
        >
          {groupedOptions.map((group, groupIndex) => (
            <div key={group.label}>
              <div style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--gray-100)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}>
                {group.label}
              </div>
              {group.options.map((option, optionIndex) => {
                const flatIndex = groupedOptions.slice(0, groupIndex).reduce((acc, g) => acc + g.options.length, 0) + optionIndex;
                const isSelected = option.value === value;
                const isHighlighted = flatIndex === highlightedIndex;
                
                return (
                  <div
                    key={option.value}
                    data-index={flatIndex}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(flatIndex)}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      backgroundColor: isSelected 
                        ? 'var(--primary-100)' 
                        : isHighlighted 
                        ? 'var(--primary-50)' 
                        : 'transparent',
                      color: isSelected ? 'var(--primary-700)' : 'var(--text-primary)',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.15s ease',
                      borderLeft: isSelected ? '3px solid var(--primary-500)' : '3px solid transparent'
                    }}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {option.label}
                  </div>
                );
              })}
            </div>
          ))}
          
          {ungroupedOptions.length > 0 && (
            <>
              {groupedOptions.length > 0 && (
                <div style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--gray-100)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  position: 'sticky',
                  top: groupedOptions.length > 0 ? '0' : undefined,
                  zIndex: 1
                }}>
                  Other
                </div>
              )}
              {ungroupedOptions.map((option, optionIndex) => {
                const flatIndex = allOptions.length - ungroupedOptions.length + optionIndex;
                const isSelected = option.value === value;
                const isHighlighted = flatIndex === highlightedIndex;
                
                return (
                  <div
                    key={option.value}
                    data-index={flatIndex}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(flatIndex)}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      backgroundColor: isSelected 
                        ? 'var(--primary-100)' 
                        : isHighlighted 
                        ? 'var(--primary-50)' 
                        : 'transparent',
                      color: isSelected ? 'var(--primary-700)' : 'var(--text-primary)',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.15s ease',
                      borderLeft: isSelected ? '3px solid var(--primary-500)' : '3px solid transparent'
                    }}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {option.label}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-select-trigger:focus {
          border-color: var(--primary-500) !important;
          box-shadow: 0 0 0 4px var(--primary-50) !important;
        }

        [data-theme="dark"] .custom-select-trigger {
          background-color: var(--card-bg) !important;
          border-color: rgba(129, 140, 248, 0.3) !important;
        }

        [data-theme="dark"] .custom-select-dropdown {
          background-color: var(--card-bg) !important;
          border-color: rgba(129, 140, 248, 0.3) !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.6), 0 0 20px rgba(129, 140, 248, 0.2) !important;
        }

        [data-theme="dark"] .custom-select-dropdown > div > div {
          background-color: rgba(17, 16, 9, 0.8) !important;
        }

        .custom-select-dropdown::-webkit-scrollbar {
          width: 8px;
        }

        .custom-select-dropdown::-webkit-scrollbar-track {
          background: var(--gray-100);
          border-radius: 4px;
        }

        .custom-select-dropdown::-webkit-scrollbar-thumb {
          background: var(--primary-300);
          border-radius: 4px;
        }

        .custom-select-dropdown::-webkit-scrollbar-thumb:hover {
          background: var(--primary-400);
        }
      `}</style>
    </div>
  );
};

export default CustomSelect;

