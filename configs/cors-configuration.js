import { config } from './config.js';

export const corsOptions = {
  origin: (origin, callback) => {
    // Se valida contra la lista de orígenes permitidos en la configuración
    const allowed = [...config.cors.allowedOrigins, ...config.cors.adminAllowedOrigins];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS_VIOLATION: Origen no autorizado.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
