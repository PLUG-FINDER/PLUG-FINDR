import { CorsOptions } from "cors";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Function to check if origin is allowed
const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return false;
  
  // Always allow localhost
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return true;
  }
  
  // Allow the configured CLIENT_URL
  if (origin === CLIENT_URL) {
    return true;
  }
  
  const url = new URL(origin);
  
  // Check if it's a local network IP (private IP ranges):
  // - 192.168.0.0 - 192.168.255.255
  // - 10.0.0.0 - 10.255.255.255
  // - 172.16.0.0 - 172.31.255.255 (includes 172.20.x.x like 172.20.10.2)
  const isLocalNetwork = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(url.hostname);
  
  // Allow any port for local network IPs (more permissive for network access)
  if (isLocalNetwork) {
    return true;
  }
  
  return false;
};

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};



