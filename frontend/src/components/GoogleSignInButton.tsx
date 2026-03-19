import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../config/firebase";
import { authAPI } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

interface GoogleSignInButtonProps {
 role?: "STUDENT" | "VENDOR" | "ADMIN";
 isSignUp?: boolean;
 whatsappNumber?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
 role = "STUDENT",
 isSignUp = false,
 whatsappNumber,
}) => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const { updateUser } = useAuth();
 const navigate = useNavigate();

 const handleGoogleAuth = async () => {
  setError("");
  setLoading(true);

  try {
   console.log("🔵 Starting Google Sign-In...");
   console.log("Firebase auth instance:", auth);

   const provider = new GoogleAuthProvider();
   console.log("✅ GoogleAuthProvider created");

   const result = await signInWithPopup(auth, provider);
   console.log("✅ Google Sign-In successful:", result.user.email);

   const firebaseUser = result.user;

   // Get ID token
   const idToken = await firebaseUser.getIdToken();
   console.log("✅ ID Token retrieved");

   // Call backend to verify and create/update user
   let response;
   if (isSignUp) {
    // For signup: use googleRegister endpoint
    response = await authAPI.googleRegister({
     firebaseUID: firebaseUser.uid,
     name: firebaseUser.displayName || "",
     email: firebaseUser.email || "",
     role,
     whatsappNumber,
    });
    console.log("✅ Backend registration successful");
   } else {
    // For login: use googleAuth endpoint
    response = await authAPI.googleAuth({
     idToken,
    });
    console.log("✅ Backend verification successful");
   }

   // Store token and user data
   localStorage.setItem("token", response.token);
   localStorage.setItem("user", JSON.stringify(response.user));
   updateUser(response.user);

   // Navigate based on role
   const roleRoutes: Record<string, string> = {
    STUDENT: "/student/dashboard",
    VENDOR: "/vendor/dashboard",
    ADMIN: "/admin/dashboard",
   };

   navigate(roleRoutes[response.user.role] || "/");
  } catch (err: any) {
   console.error("❌ Google auth error:", err);
   console.error("Error code:", err.code);
   console.error("Error message:", err.message);

   // Handle specific Firebase errors
   if (err.code === "auth/popup-closed-by-user") {
    setError("Sign in was cancelled");
   } else if (err.code === "auth/popup-blocked") {
    setError("Pop-up was blocked. Please allow pop-ups for this site.");
   } else if (err.code === "auth/network-request-failed") {
    setError("Network error. Please check your connection.");
   } else if (err.response?.data?.message) {
    setError(err.response.data.message);
   } else {
    setError("Google Sign-in failed. Please try again.");
   }
  } finally {
   setLoading(false);
  }
 };

 return (
  <div>
   {error && (
    <div style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "0.5rem", textAlign: "center" }}>{error}</div>
   )}
   <button
    type="button"
    onClick={handleGoogleAuth}
    disabled={loading}
    className="google-signin-btn"
        style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid #ddd",
            borderRadius: "0.5rem",
            backgroundColor: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            fontWeight: "500",
            fontSize: window.innerWidth <= 768 ? "1.3rem" : "1rem",
            transition: "all 0.2s",
            opacity: loading ? 0.7 : 1,
        }}
    onMouseEnter={(e) => {
     if (!loading) {
      e.currentTarget.style.backgroundColor = "#f9f9f9";
      e.currentTarget.style.borderColor = "#999";
     }
    }}
    onMouseLeave={(e) => {
     e.currentTarget.style.backgroundColor = "#fff";
     e.currentTarget.style.borderColor = "#ddd";
    }}
   >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
     <g clipPath="url(#clip0)">
      <path
       d="M23.745 12.27c0-.79-.07-1.54-.18-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.85c2.27-2.09 3.57-5.17 3.57-8.82z"
       fill="#4285F4"
      />
      <path
       d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.85-3c-1.08.72-2.45 1.13-4.08 1.13-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.05 21.3 7.12 24 12 24z"
       fill="#34A853"
      />
      <path
       d="M5.27 14.26C5.02 13.56 4.88 12.81 4.88 12c0-.81.14-1.56.39-2.26V6.65h-3.98a11.86 11.86 0 000 10.7l3.98-3.09z"
       fill="#FBBC05"
      />
      <path
       d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.46C17.94 1.12 15.24 0 12 0 7.12 0 3.05 2.7 1.29 6.65l3.98 3.09c.95-2.85 3.6-4.99 6.73-4.99z"
       fill="#EA4335"
      />
     </g>
     <defs>
      <clipPath id="clip0">
       <rect width="24" height="24" fill="white" />
      </clipPath>
     </defs>
    </svg>
    {loading ? "Signing in..." : isSignUp ? "Sign Up with Google" : "Sign In with Google"}
   </button>
  </div>
 );
};

export default GoogleSignInButton;
