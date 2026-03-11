import React, { useEffect, useRef, useState } from 'react';

interface HostelAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const HostelAutocomplete: React.FC<HostelAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search for hostel near KNUST...",
  className = "",
  required = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is loaded
    if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
    } else {
      // Wait for Google Maps to load
      const checkGoogleMaps = setInterval(() => {
        if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
          setIsLoaded(true);
          clearInterval(checkGoogleMaps);
        }
      }, 100);

      return () => clearInterval(checkGoogleMaps);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // KNUST coordinates: 6.6720° N, 1.5710° W
    // Expanded bounds to include nearby areas around KNUST campus
    const knustBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(6.64, -1.60), // Southwest corner (expanded)
      new google.maps.LatLng(6.70, -1.54)  // Northeast corner (expanded)
    );

    // KNUST center point for radius-based filtering
    const knustCenter = new google.maps.LatLng(6.6720, -1.5710);
    const knustRadius = 5000; // 5km radius around KNUST

    // Create autocomplete instance with strict bounds
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      bounds: knustBounds,
      componentRestrictions: { country: 'gh' }, // Restrict to Ghana
      types: ['establishment', 'geocode'],
      fields: ['name', 'formatted_address', 'geometry', 'place_id']
    });

    autocompleteRef.current = autocomplete;

    // Handle place selection with location validation
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      // Validate that the selected place is within KNUST area
      if (place.geometry && place.geometry.location) {
        const selectedLocation = place.geometry.location;
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          knustCenter,
          selectedLocation
        );
        
        // Check if location is within 5km radius of KNUST
        if (distance > knustRadius) {
          alert('Please select a location within 5km of KNUST campus. The selected location is too far away.');
          onChange(''); // Clear the input
          if (inputRef.current) {
            inputRef.current.value = '';
          }
          return;
        }
      }
      
      // If validation passes, set the value
      if (place.name) {
        onChange(place.name);
      } else if (place.formatted_address) {
        // Extract location name from address if name is not available
        const addressParts = place.formatted_address.split(',');
        onChange(addressParts[0].trim());
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      required={required}
      autoComplete="off"
      style={{ 
        width: '100%',
        padding: '0.875rem 1rem',
        borderRadius: '12px',
        border: '2px solid var(--gray-200)',
        fontSize: '1rem',
        backgroundColor: 'var(--gray-50)',
        color: 'var(--text-primary)',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
        outline: 'none'
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary-500)';
        e.currentTarget.style.boxShadow = '0 0 0 4px var(--primary-50)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--gray-200)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
};

export default HostelAutocomplete;

