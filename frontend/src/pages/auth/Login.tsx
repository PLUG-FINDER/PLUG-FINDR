import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { authAPI } from "../../api/auth";
import Loader from "../../components/Loader";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import { loginSchema, type LoginFormData } from "../../validation/authSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import "./Auth.css";

const Login: React.FC = () => {
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 const { login } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();
 const authCardRef = useRef<HTMLDivElement>(null);

 const from = (location.state as any)?.from?.pathname || null;

 // #region agent log
 useEffect(() => {
  if (authCardRef.current) {
   const card = authCardRef.current;
   const computed = window.getComputedStyle(card);
   const viewportWidth = window.innerWidth;
   const mediaQueryMatch769 = window.matchMedia("(min-width: 769px)").matches;
   const mediaQueryMatch1025 = window.matchMedia("(min-width: 1025px)").matches;

   fetch("http://127.0.0.1:7242/ingest/f66f5750-cf54-4ed3-b984-2b9a5b6acd7e", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     location: "Login.tsx:useEffect",
     message: "Auth card computed styles check - post-fix",
     data: {
      viewportWidth,
      mediaQueryMatch769,
      mediaQueryMatch1025,
      computedWidth: computed.width,
      computedMaxWidth: computed.maxWidth,
      computedMargin: computed.margin,
      actualWidth: card.offsetWidth,
      actualClientWidth: card.clientWidth,
     },
     timestamp: Date.now(),
     runId: "post-fix",
     hypothesisId: "A",
    }),
   }).catch(() => {});
  }
 }, []);
 // #endregion

 const {
  register,
  handleSubmit,
  formState: { errors },
  reset,
 } = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  mode: "onChange",
 });

 const onSubmit = async (data: LoginFormData) => {
  setError("");
  setLoading(true);

  try {
   await login(data.email, data.password);
   reset();
   const user = JSON.parse(localStorage.getItem("user") || "{}");
   const roleRoutes: Record<string, string> = {
    STUDENT: "/student/dashboard",
    VENDOR: "/vendor/dashboard",
    ADMIN: "/admin/dashboard",
   };
   navigate(from || roleRoutes[user.role] || "/");
  } catch (err: any) {
   // Log the full error for debugging
   console.error("Login error:", err);
   console.error("Error response:", err.response?.data);
   console.error("Error status:", err.response?.status);
   console.error("Error message:", err.message);

   // Check if it's a network error (can't reach backend)
   if (!err.response) {
    setError("Cannot connect to server. Please check your network connection and ensure the backend is running.");
    return;
   }

   const errorMessage = err.response?.data?.message || "Login failed. Please try again.";

   // If email not verified, try to sync verification status first
   if (err.response?.status === 403 && errorMessage.includes("Email not verified")) {
    try {
     // Try to sync verification status from Firebase
     await authAPI.syncEmailVerification(data.email);
     // If sync succeeds, try login again
     try {
      await login(data.email, data.password);
      reset();
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const roleRoutes: Record<string, string> = {
       STUDENT: "/student/dashboard",
       VENDOR: "/vendor/dashboard",
       ADMIN: "/admin/dashboard",
      };
      navigate(from || roleRoutes[user.role] || "/");
      return;
     } catch (retryErr: any) {
      // If retry still fails, show error
      setError(err.response?.data?.message || "Email not verified. Please verify your email before logging in.");
     }
    } catch (syncErr) {
     // If sync fails, show the original error
     setError(errorMessage);
    }
   } else {
    setError(errorMessage);
   }
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="auth-container" style={{ position: "relative", minHeight: "100vh" }}>
   <div ref={authCardRef} className="auth-card" style={{ position: "relative", zIndex: 1 }}>
    <h1 className="auth-title">Login to PlugFindr</h1>
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
     {error && <div className="auth-error">{error}</div>}
     <div className="auth-field">
      <label htmlFor="email">Email</label>
      <input
       id="email"
       type="email"
       {...register("email")}
       placeholder="Enter your email"
       className={errors.email ? "auth-input-error" : ""}
      />
      {errors.email && <span className="auth-field-error">{errors.email.message}</span>}
     </div>
     <div className="auth-field">
      <label htmlFor="password">Password</label>
      <div className="password-input-wrapper">
       <input
        id="password"
        type={showPassword ? "text" : "password"}
        {...register("password")}
        placeholder="Enter your password"
        className={errors.password ? "auth-input-error" : ""}
       />
       <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
       >
        {showPassword ? (
         <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
         >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
         </svg>
        ) : (
         <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
         >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
         </svg>
        )}
       </button>
      </div>
      {errors.password && <span className="auth-field-error">{errors.password.message}</span>}
     </div>
     <div style={{ textAlign: "right", marginTop: "-0.5rem" }}>
      <Link
       to="/forgot-password"
       style={{
        color: "var(--primary-600)",
        textDecoration: "none",
        fontSize: "1.11rem", // Larger for mobile
        fontWeight: 600,
       }}
       onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
       onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
      >
       Forgot Password?
      </Link>
     </div>
     <button type="submit" className="auth-button" disabled={loading}>
      {loading ? <Loader size="small" /> : "Login"}
     </button>
    </form>
    <div style={{ margin: "1.5rem 0", textAlign: "center" }}>
     <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1rem" }}>Or continue with</p>
     <GoogleSignInButton />
    </div>
    <p className="auth-link">
         <span style={{ fontSize: window.innerWidth <= 768 ? '1.2rem' : undefined, fontWeight: 500 }}>
             Don't have an account? <Link to="/register" style={{ fontSize: window.innerWidth <= 768 ? '1.2rem' : undefined }}>Register here</Link>
         </span>
    </p>
   </div>
  </div>
 );
};

export default Login;
