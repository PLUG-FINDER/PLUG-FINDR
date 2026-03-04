# PlugFindr Frontend

A React-based frontend application for PlugFindr marketplace with role-based access control (Student, Vendor, Admin).

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management

## Features

- **Role-based Authentication**: Single login page for all user types
- **Student Dashboard**: Search vendors, view profiles, leave reviews
- **Vendor Dashboard**: Manage business profile, upload flyers, view ratings
- **Admin Dashboard**: Approve vendors, manage reports, moderate content
- **Protected Routes**: Role-based route protection
- **Modern UI**: Teal-based color scheme with responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Build

To build for production:
```bash
npm run build
```

The build output will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API service layer
│   ├── auth/             # Authentication context and protected routes
│   ├── components/       # Reusable components
│   ├── layouts/          # Role-based layouts
│   ├── pages/            # Page components
│   │   ├── auth/         # Login and Register
│   │   ├── student/      # Student pages
│   │   ├── vendor/       # Vendor pages
│   │   └── admin/        # Admin pages
│   ├── App.tsx           # Main app component with routing
│   └── main.tsx          # Entry point
├── .env.example          # Example environment variables
├── package.json
└── README.md
```

## Environment Variables

- `VITE_API_BASE_URL`: Base URL for the backend API (default: http://localhost:5000/api)

## Authentication Flow

1. Users register/login through the same page
2. JWT token is stored in localStorage
3. Token is automatically attached to all API requests
4. Users are redirected to role-specific dashboards after login
5. Protected routes check authentication and role permissions

## API Integration

All API calls are made through the Axios client configured in `src/api/axios.ts`. The client automatically:
- Attaches JWT tokens to requests
- Handles 401 errors by redirecting to login
- Uses the base URL from environment variables


