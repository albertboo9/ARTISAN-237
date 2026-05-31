export default () => ({
  app: {
    port: parseInt(process.env.PORT || "3001", 10),
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || "30000", 10),
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },
  auth: {
    JWT_SECRET: process.env.JWT_SECRET || "default-jwt-secret-change-me",
    REFRESH_TOKEN_SECRET:
      process.env.REFRESH_TOKEN_SECRET || "default-refresh-secret-change-me",
    JWT_ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m",
    JWT_REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "default-jwt-secret-change-me",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },
  didit: {
    workflowId: process.env.DIDIT_WORKFLOW_ID || "",
    apiKey: process.env.DIDIT_API_KEY || "",
    apiUrl: process.env.DIDIT_API_URL || "https://verification.didit.me/v3",
  },
  mail: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465", 10),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    privateKey: process.env.FIREBASE_PRIVATE_KEY || "",
  },
  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
  },
});
