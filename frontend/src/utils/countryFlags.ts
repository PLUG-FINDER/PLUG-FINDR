// Map country codes to ISO country codes for flag emojis
export const getCountryFlag = (countryCode: string, countryName: string): string => {
  // Map country codes to ISO 3166-1 alpha-2 codes
  const countryCodeMap: Record<string, string> = {
    '+1': 'US', // US/CA - defaulting to US flag
    '+44': 'GB', // UK
    '+234': 'NG', // Nigeria
    '+233': 'GH', // Ghana
    '+254': 'KE', // Kenya
    '+27': 'ZA', // South Africa
    '+91': 'IN', // India
    '+86': 'CN', // China
    '+81': 'JP', // Japan
    '+82': 'KR', // South Korea
    '+61': 'AU', // Australia
    '+64': 'NZ', // New Zealand
    '+33': 'FR', // France
    '+49': 'DE', // Germany
    '+39': 'IT', // Italy
    '+34': 'ES', // Spain
    '+31': 'NL', // Netherlands
    '+32': 'BE', // Belgium
    '+41': 'CH', // Switzerland
    '+46': 'SE', // Sweden
    '+47': 'NO', // Norway
    '+45': 'DK', // Denmark
    '+358': 'FI', // Finland
    '+351': 'PT', // Portugal
    '+353': 'IE', // Ireland
    '+48': 'PL', // Poland
    '+7': 'RU', // Russia/Kazakhstan - defaulting to RU
    '+90': 'TR', // Turkey
    '+971': 'AE', // UAE
    '+966': 'SA', // Saudi Arabia
    '+20': 'EG', // Egypt
    '+212': 'MA', // Morocco
    '+255': 'TZ', // Tanzania
    '+256': 'UG', // Uganda
    '+250': 'RW', // Rwanda
    '+251': 'ET', // Ethiopia
  };

  // Get ISO code from map
  const isoCode = countryCodeMap[countryCode] || 'UN'; // UN for unknown

  // Convert ISO code to flag emoji
  // Flag emojis are made of two regional indicator symbols
  // Each letter is offset by 0x1F1E6 (A) = 127397
  const getFlagEmoji = (iso: string): string => {
    if (iso.length !== 2) return '🏳️';
    const codePoints = iso
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return getFlagEmoji(isoCode);
};

// Enhanced country code type with flag
export interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

// Helper to create country codes array with flags
export const createCountryCodesWithFlags = (
  countryCodes: Array<{ code: string; country: string }>
): CountryCode[] => {
  return countryCodes.map(cc => ({
    ...cc,
    flag: getCountryFlag(cc.code, cc.country)
  }));
};




