import { Router } from 'express';
import * as refreshController from './refresh.controller.js';
import * as authController from './auth.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import {
  authRateLimit,
  requestLimit,
} from '../../middlewares/request-limit.js';
import { upload, handleUploadError } from '../../helpers/file-upload.js';
import {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
} from '../../middlewares/validation.js';

const router = Router();

// Refresh token endpoints
router.post('/refresh', refreshController.refresh);
router.post('/logout', refreshController.logout);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Registra un nuevo usuario
 *     consumes:
 *       - multipart/form-data
 */
router.post(
  '/register',
  authRateLimit,
  upload.single('profilePicture'),
  handleUploadError,
  validateRegister,
  authController.register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Autentica un usuario
 */
router.post('/login', authRateLimit, validateLogin, authController.login);

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   post:
 *     tags: [Authentication]
 *     summary: Verifica el email del usuario
 */
router.post(
  '/verify-email',
  requestLimit,
  validateVerifyEmail,
  authController.verifyEmail
);

/**
 * @swagger
 * /api/v1/auth/resend-verification:
 *   post:
 *     tags: [Authentication]
 *     summary: Reenvía el email de verificación
 */
router.post(
  '/resend-verification',
  authRateLimit,
  validateResendVerification,
  authController.resendVerification
);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Inicia recuperación de contraseña
 */
router.post(
  '/forgot-password',
  authRateLimit,
  validateForgotPassword,
  authController.forgotPassword
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Resetea la contraseña
 */
router.post(
  '/reset-password',
  authRateLimit,
  validateResetPassword,
  authController.resetPassword
);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Obtiene el perfil del usuario
 */
router.get('/profile', validateJWT, authController.getProfile);

router.post(
  '/profile/picture',
  validateJWT,
  upload.single('profilePicture'),
  handleUploadError,
  authController.updateProfilePicture
);

router.post(
  '/profile/picture/avatar',
  validateJWT,
  upload.single('avatar'),
  handleUploadError,
  authController.updateProfilePicture
);

/**
 * @swagger
 * /api/v1/auth/profile/by-id:
 *   post:
 *     tags: [Profile]
 *     summary: Obtiene el perfil del usuario por ID
 */
router.post('/profile/by-id', requestLimit, authController.getProfileById);

/**
 * @swagger
 * /api/v1/auth/profile/by-username:
 *   post:
 *     tags: [Profile]
 *     summary: Obtiene el perfil del usuario por username
 */
router.post(
  '/profile/by-username',
  requestLimit,
  authController.getProfileByUsername
);

export default router;
