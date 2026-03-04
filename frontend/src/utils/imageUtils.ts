/**
 * Automatically detects the backend API base URL based on how the frontend is accessed.
 * This dynamically adapts to the current IP address, so it works even when IPs change.
 * 
 * Examples:
 * - Accessing via localhost → http://localhost:5000/api
 * - Accessing via 172.20.10.2 → http://172.20.10.2:5000/api
 * - Accessing via 192.168.1.100 → http://192.168.1.100:5000/api
 * 
 * @returns API base URL that matches the current access method
 */
export const getApiBaseUrl = (): string => {
  // If explicitly set in environment variable, use that
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Get the current hostname and protocol from the browser
  // This automatically gets whatever IP/hostname the user is accessing the site from
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // If accessing via localhost or 127.0.0.1, use localhost for backend
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }

  // If accessing via IP address (any IP - works with dynamic IPs like 172.20.10.2),
  // automatically use the same IP for backend connection
  // This handles dynamic IP addresses automatically - no configuration needed!
  return `${protocol}//${hostname}:5000/api`;
};

/**
 * Converts a relative image URL from the backend to a full URL
 * @param imageUrl - Relative URL like "/uploads/flyers/filename.jpg"
 * @returns Full URL like "http://localhost:5000/uploads/flyers/filename.jpg"
 */
export const getImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Get the backend base URL (without /api)
  const apiBaseUrl = getApiBaseUrl();
  const backendBaseUrl = apiBaseUrl.replace('/api', '');
  
  // Ensure the imageUrl starts with /
  const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${backendBaseUrl}${cleanUrl}`;
};
