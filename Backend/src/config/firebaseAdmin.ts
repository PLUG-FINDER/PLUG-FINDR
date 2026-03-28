import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  let serviceAccountJson: admin.ServiceAccount | null = null;

  // Try to get from single JSON string first
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountString) {
    try {
      serviceAccountJson = JSON.parse(serviceAccountString);
    } catch (error) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", error);
    }
  }

  // If not found, try to construct from individual environment variables
  if (!serviceAccountJson) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const clientId = process.env.FIREBASE_CLIENT_ID;
    const authUri = process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth";
    const tokenUri = process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token";
    const authProviderX509CertUrl = process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs";
    const clientX509CertUrl = process.env.FIREBASE_CLIENT_X509_CERT_URL;

    if (projectId && privateKeyId && privateKey && clientEmail && clientId) {
      serviceAccountJson = {
        type: "service_account",
        project_id: projectId,
        private_key_id: privateKeyId,
        private_key: privateKey,
        client_email: clientEmail,
        client_id: clientId,
        auth_uri: authUri,
        token_uri: tokenUri,
        auth_provider_x509_cert_url: authProviderX509CertUrl,
        client_x509_cert_url: clientX509CertUrl || `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`
      } as any;
    }
  }

  if (serviceAccountJson) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });
      console.log("✅ Firebase Admin SDK initialized");
    } catch (error) {
      console.error("❌ Failed to initialize Firebase Admin SDK:", error);
    }
  } else {
    console.warn("⚠️  FIREBASE_SERVICE_ACCOUNT not found. Firebase Admin features will be disabled.");
    console.warn("   To enable, either set FIREBASE_SERVICE_ACCOUNT (JSON string) or");
    console.warn("   set individual variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, etc.");
  }
}

export default admin;

