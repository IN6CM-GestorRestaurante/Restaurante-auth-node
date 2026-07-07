import dotenv from 'dotenv';

dotenv.config();

const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 587;

export const config = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'Restaurante_Super_Secret_Key_2026_DotNet8',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    issuer: process.env.JWT_ISSUER || 'auth-service',
    audience: process.env.JWT_AUDIENCE || 'restaurante-app',
  },

  // SMTP Configuration (aligned with .NET SmtpSettings)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: smtpPort,
    enableSsl:
      process.env.SMTP_ENABLE_SSL === 'true' ||
      (process.env.SMTP_ENABLE_SSL === undefined && smtpPort === 465),
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
    fromEmail: process.env.SMTP_FROM || 'noreply@restaurante.app',
    fromName: process.env.SMTP_FROM_NAME || 'Gestor Restaurante',
  },

  // File Upload Configuration
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    uploadPath: process.env.UPLOAD_PATH || './uploads/profiles/',
  },

  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dueikakf8',
    apiKey: process.env.CLOUDINARY_API_KEY || '119292848621234',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'ckVTJkNQUjUatlwOcYFMg-9hAyM',
    baseUrl: process.env.CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/dueikakf8/image/upload/',
    defaultAvatarPath:
      process.env.CLOUDINARY_DEFAULT_AVATAR &&
      !process.env.CLOUDINARY_DEFAULT_AVATAR.includes('${')
        ? process.env.CLOUDINARY_DEFAULT_AVATAR
        : [
            process.env.CLOUDINARY_FOLDER || 'auth_service/profiles',
            process.env.CLOUDINARY_DEFAULT_AVATAR_FILENAME || 'avatar-default.png',
          ]
            .filter(Boolean)
            .join('/'),
    folder: process.env.CLOUDINARY_FOLDER || 'auth_service/profiles',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 1 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    authWindowMs:
      parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 10) ||
      parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) ||
      1 * 60 * 1000,
    authMaxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 30,
    emailWindowMs:
      parseInt(process.env.RATE_LIMIT_EMAIL_WINDOW_MS, 10) || 15 * 60 * 1000,
    emailMaxRequests: parseInt(process.env.RATE_LIMIT_EMAIL_MAX, 10) || 10,
  },

  // Security
  security: {
    saltRounds: 10,
    maxLoginAttempts: 5,
    lockoutTime: 30 * 60 * 1000,
    passwordMinLength: 6, // Alineado con la validación de .NET (mínimo 6)
    blacklistedIPs: process.env.BLACKLISTED_IPS
      ? process.env.BLACKLISTED_IPS.split(',').map((ip) => ip.trim())
      : [],
    whitelistedIPs: process.env.WHITELISTED_IPS
      ? process.env.WHITELISTED_IPS.split(',').map((ip) => ip.trim())
      : [],
    restrictedPaths: process.env.RESTRICTED_PATHS
      ? process.env.RESTRICTED_PATHS.split(',').map((path) => path.trim())
      : [],
  },

  // App Settings
  app: {
    frontendUrl: process.env.FRONTEND_URL,
    adminServiceUrl: process.env.ADMIN_SERVICE_URL || 'http://localhost:3001',
    userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3003',
  },

  // CORS Origins
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : [],
    adminAllowedOrigins: process.env.ADMIN_ALLOWED_ORIGINS
      ? process.env.ADMIN_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : [],
  },

  // Verification tokens
  verification: {
    emailTokenExpiry:
      (process.env.VERIFICATION_EMAIL_EXPIRY_HOURS
        ? parseInt(process.env.VERIFICATION_EMAIL_EXPIRY_HOURS, 10)
        : 24) *
      60 *
      60 *
      1000,
    passwordResetExpiry:
      (process.env.PASSWORD_RESET_EXPIRY_HOURS
        ? parseInt(process.env.PASSWORD_RESET_EXPIRY_HOURS, 10)
        : 1) *
      60 *
      60 *
      1000,
  },
};
