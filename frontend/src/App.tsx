import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './auth/ProtectedRoute';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import VendorLayout from './layouts/VendorLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import ResendVerification from './pages/auth/ResendVerification';
import Landing from './pages/Landing';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import VendorSearch from './pages/student/VendorSearch';
import Reviews from './pages/student/Reviews';
import VendorDetail from './pages/student/VendorDetail';
import MyFeedback from './pages/student/MyFeedback';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProfile from './pages/vendor/VendorProfile';
import UploadFlyers from './pages/vendor/UploadFlyers';
import VendorFeedback from './pages/vendor/VendorFeedback';
import MyGeneralFeedback from './pages/vendor/MyGeneralFeedback';
import VendorMarket from './pages/vendor/VendorMarket';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import VendorApprovals from './pages/admin/VendorApprovals';
import VendorList from './pages/admin/VendorList';
import RejectedVendors from './pages/admin/RejectedVendors';
import AdminVendorDetail from './pages/admin/AdminVendorDetail';
import FeedbackMonitors from './pages/admin/FeedbackMonitors';
import StudentList from './pages/admin/StudentList';
import About from './pages/About';
import Settings from './pages/Settings';

import './App.css';
import './styles/responsive.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Landing Page - Public */}
          <Route path="/" element={<Landing />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/resend-verification" element={<ResendVerification />} />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="search" element={<VendorSearch />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="feedback" element={<MyFeedback />} />
            <Route path="vendor/:id" element={<VendorDetail />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />} />
          </Route>

          {/* Vendor Routes */}
          <Route
            path="/vendor/*"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <VendorLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="profile" element={<VendorProfile />} />
            <Route path="market" element={<VendorMarket />} />
            <Route path="upload-flyers" element={<UploadFlyers />} />
            <Route path="feedback" element={<VendorFeedback />} />
            <Route path="my-feedback" element={<MyGeneralFeedback />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="vendor-approvals" element={<VendorApprovals />} />
            <Route path="vendors" element={<VendorList />} />
            <Route path="vendors/rejected" element={<RejectedVendors />} />
            <Route path="vendor/:id" element={<AdminVendorDetail />} />
            <Route path="students" element={<StudentList />} />
            <Route path="feedback-monitors" element={<FeedbackMonitors />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />} />
          </Route>

        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


