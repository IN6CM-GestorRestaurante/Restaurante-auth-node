import { saveRefreshToken } from './refresh-token.js';
import crypto from 'crypto';
import axios from 'axios';
import {
  checkUserExists,
  createNewUser,
  findUserByEmailOrUsername,
  updateEmailVerificationToken,
  markEmailAsVerified,
  findUserByEmail,
  updatePasswordResetToken,
  updateUserPassword,
  findUserByEmailVerificationToken,
  findUserByPasswordResetToken,
} from './user-db.js';
import { User } from '../src/users/user.model.js';
import {
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from '../utils/auth-helpers.js';
import { verifyPassword, hashPassword } from '../utils/password-utils.js';
import { buildUserResponse } from '../utils/user-helpers.js';
import { sendVerificationEmail } from './email-service.js';
import { generateJWT } from './generate-jwt.js';
import path from 'path';
import { uploadImage } from './cloudinary-service.js';
import { config } from '../configs/config.js';

export const registerUserHelper = async (userData) => {
  try {
    const { email, username, password, name, surname, phone, profilePicture, role } =
      userData;

    // Verificar si el usuario ya existe
    const userExists = await checkUserExists(email, username);
    if (userExists) {
      throw new Error(
        'Ya existe un usuario con este email o nombre de usuario'
      );
    }

    let profilePictureToStore = profilePicture;
    if (profilePicture) {
      const uploadPath = config.upload.uploadPath;

      // Detectar si es un archivo local
      const isLocalFile =
        profilePicture.includes('uploads/') ||
        profilePicture.includes(uploadPath) ||
        profilePicture.startsWith('./');

      if (isLocalFile) {
        try {
          const ext = path.extname(profilePicture);
          const randomHex = crypto.randomBytes(6).toString('hex');
          const cloudinaryFileName = `profile-${randomHex}${ext}`;

          profilePictureToStore = await uploadImage(
            profilePicture,
            cloudinaryFileName
          );
        } catch (err) {
          console.error(
            'Error uploading profile picture to Cloudinary during registration:',
            err
          );
          profilePictureToStore = null;
        }
      } else {
        try {
          const baseUrl = config.cloudinary.baseUrl || '';
          const folder = config.cloudinary.folder || '';
          let normalized = profilePicture;
          if (normalized.startsWith(baseUrl)) {
            normalized = normalized.slice(baseUrl.length);
          }
          if (folder && normalized.startsWith(`${folder}/`)) {
            normalized = normalized.slice(folder.length + 1);
          }
          profilePictureToStore = normalized.split('/').pop();
        } catch (normErr) {
          console.warn('Could not normalize profile picture path:', normErr);
          profilePictureToStore = null;
        }
      }
    }

    // Crear el usuario en Postgres (status: false, requiere verificación de email)
    const newUser = await createNewUser({
      name,
      surname,
      username,
      email,
      password,
      phone,
      profilePicture: profilePictureToStore,
      role: role || 'CLIENT',
    });

    // Sincronizar el usuario con MongoDB (ServerAdmin)
    let mongoId = null;
    try {
      console.log(`Syncing user ${email} with MongoDB...`);
      const syncUrl = `${config.app.adminServiceUrl}/restaurant/v1/users/sync`;
      const response = await axios.post(syncUrl, {
        email: newUser.Email,
        role: newUser.Role,
      });

      if (response.data && response.data.success) {
        // Mongoose toJSON() expone 'uid' como ID del usuario
        mongoId = response.data.user?.uid || response.data.user?._id;
        if (mongoId) {
          console.log(`User synced to MongoDB successfully. Mongo ID: ${mongoId}`);
          await User.update({ MongoId: mongoId }, { where: { Id: newUser.Id } });
          // Actualizar la instancia local del usuario
          newUser.MongoId = mongoId;
        }
      }
    } catch (syncErr) {
      console.error(
        `Warning: User created in Postgres, but failed to sync to Mongo: ${syncErr.message}`
      );
    }

    // Generar token de verificación de email
    const verificationToken = await generateEmailVerificationToken();
    const tokenExpiry = new Date(Date.now() + config.verification.emailTokenExpiry);

    // Guardar el token en la base de datos
    await updateEmailVerificationToken(
      newUser.Id,
      verificationToken,
      tokenExpiry
    );

    // Enviar email de verificación en background
    Promise.resolve()
      .then(() => sendVerificationEmail(email, name || username || email, verificationToken))
      .catch((err) =>
        console.error('Async email send (verification) failed:', err)
      );

    return {
      success: true,
      user: buildUserResponse(newUser),
      message:
        'Usuario registrado exitosamente. Por favor, verifica tu email para activar la cuenta.',
      emailVerificationRequired: true,
    };
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

export const loginUserHelper = async (emailOrUsername, password) => {
  try {
    // Buscar usuario por email o username
    const user = await findUserByEmailOrUsername(emailOrUsername);

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(user.Password, password);

    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si el email está verificado
    if (!user.EmailVerified) {
      throw new Error(
        'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada o reenvía el email de verificación.'
      );
    }

    // Verificar si el usuario está activo
    if (!user.Status) {
      throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
    }

    // Generar JWT con claim de rol plano (8 horas para compatibilidad con .NET)
    const role = user.Role || 'CLIENT';
    const accessToken = await generateJWT(
      user.Id.toString(),
      { role, email: user.Email }, // claims: role y email
      { expiresIn: config.jwt.expiresIn }
    );

    // Generar refresh token
    const { raw: refreshToken } = await saveRefreshToken(user.Id.toString());

    // Construir respuesta de detalles del usuario
    const fullUser = buildUserResponse(user);
    const userDetails = {
      id: fullUser.id,
      username: fullUser.username,
      email: fullUser.email,
      name: fullUser.name,
      surname: fullUser.surname,
      profilePicture: fullUser.profilePicture,
      role: fullUser.role,
      mongoId: fullUser.mongoId,
    };

    // Calcular segundos de expiración
    let expiresInSec = 28800; // 8h
    if (config.jwt.expiresIn === '15m') expiresInSec = 900;

    return {
      success: true,
      message: 'Login exitoso',
      accessToken,
      refreshToken,
      expiresIn: expiresInSec,
      userDetails,
    };
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const verifyEmailHelper = async (token) => {
  try {
    if (!token || typeof token !== 'string' || token.length < 6) {
      throw new Error('Token inválido para verificación de email');
    }

    const user = await findUserByEmailVerificationToken(token);
    if (!user) {
      throw new Error('Usuario no encontrado o token inválido');
    }

    if (user.EmailVerified) {
      throw new Error('El email ya ha sido verificado');
    }

    // Marcar el email como verificado y activar el usuario
    await markEmailAsVerified(user.Id);

    // Enviar email de bienvenida en background
    Promise.resolve()
      .then(async () => {
        const { sendWelcomeEmail } = await import('./email-service.js');
        return sendWelcomeEmail(user.Email, user.Name || user.Username || user.Email);
      })
      .catch((emailError) => {
        console.error('Async email send (welcome) failed:', emailError);
      });

    return {
      success: true,
      message: 'Email verificado exitosamente. Ya puedes iniciar sesión.',
      data: {
        email: user.Email,
        verified: true,
      },
    };
  } catch (error) {
    console.error('Error verificando email:', error);
    throw error;
  }
};

export const resendVerificationEmailHelper = async (email) => {
  try {
    const user = await findUserByEmail(email.toLowerCase());

    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado',
        data: { email, sent: false },
      };
    }

    if (user.EmailVerified) {
      return {
        success: false,
        message: 'El email ya ha sido verificado',
        data: { email: user.Email, verified: true },
      };
    }

    // Generar nuevo token de verificación
    const verificationToken = await generateEmailVerificationToken();
    const tokenExpiry = new Date(Date.now() + config.verification.emailTokenExpiry);

    await updateEmailVerificationToken(user.Id, verificationToken, tokenExpiry);

    try {
      await sendVerificationEmail(user.Email, user.Name || user.Username || user.Email, verificationToken);
      return {
        success: true,
        message: 'Email de verificación enviado exitosamente',
        data: { email: user.Email, sent: true },
      };
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return {
        success: false,
        message:
          'Error al enviar el email de verificación. Por favor, intenta nuevamente más tarde.',
        data: { email: user.Email, sent: false },
      };
    }
  } catch (error) {
    console.error('Error en resendVerificationEmailHelper:', error);
    return {
      success: false,
      message: 'Error interno del servidor',
      data: { email, sent: false },
    };
  }
};

export const forgotPasswordHelper = async (email) => {
  try {
    const user = await findUserByEmail(email.toLowerCase());

    if (!user) {
      return {
        success: true,
        message: 'Si el email existe, se ha enviado un enlace de recuperación',
        data: { email, initiated: true },
      };
    }

    // Generar token de reset
    const resetToken = await generatePasswordResetToken();
    const tokenExpiry = new Date(Date.now() + config.verification.passwordResetExpiry);

    await updatePasswordResetToken(user.Id, resetToken, tokenExpiry);

    const { sendPasswordResetEmail } = await import('./email-service.js');
    Promise.resolve()
      .then(() => sendPasswordResetEmail(user.Email, user.Name || user.Username || user.Email, resetToken))
      .catch((emailError) => {
        console.error(
          `Failed to send password reset email to ${email}:`,
          emailError
        );
      });

    return {
      success: true,
      message: 'Si el email existe, se ha enviado un enlace de recuperación',
      data: { email, initiated: true },
    };
  } catch (error) {
    console.error('Error en forgotPasswordHelper:', error);
    return {
      success: true,
      message: 'Si el email existe, se ha enviado un enlace de recuperación',
      data: { email, initiated: true },
    };
  }
};

export const resetPasswordHelper = async (token, newPassword) => {
  try {
    if (!token || typeof token !== 'string' || token.length < 40) {
      throw new Error('Token inválido para reset de contraseña');
    }

    const user = await findUserByPasswordResetToken(token);
    if (!user) {
      throw new Error('Usuario no encontrado o token inválido');
    }

    if (!user.PasswordResetToken) {
      throw new Error('Token de reset inválido o ya utilizado');
    }

    const hashedPassword = await hashPassword(newPassword);

    await updateUserPassword(user.Id, hashedPassword);

    try {
      const { sendPasswordChangedEmail } = await import('./email-service.js');
      Promise.resolve()
        .then(() => sendPasswordChangedEmail(user.Email, user.Name || user.Username || user.Email))
        .catch((emailError) => {
          console.error('Error sending password changed email:', emailError);
        });
    } catch (emailError) {
      console.error('Error scheduling password changed email:', emailError);
    }

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
      data: { email: user.Email, reset: true },
    };
  } catch (error) {
    console.error('Error en resetPasswordHelper:', error);
    throw error;
  }
};
