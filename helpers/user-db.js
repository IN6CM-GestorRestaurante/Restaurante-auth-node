import { User } from '../src/users/user.model.js';
import { hashPassword } from '../utils/password-utils.js';
import { Op } from 'sequelize';

export const findUserByEmailOrUsername = async (emailOrUsername) => {
  try {
    const searchVal = emailOrUsername.toLowerCase();
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { Email: searchVal },
          { Username: searchVal },
        ],
      },
    });

    return user;
  } catch (error) {
    console.error('Error buscando usuario:', error);
    throw new Error('Error al buscar usuario');
  }
};

export const findUserById = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    return user;
  } catch (error) {
    console.error('Error buscando usuario por ID:', error);
    throw new Error('Error al buscar usuario');
  }
};

export const checkUserExists = async (email, username) => {
  try {
    const whereConditions = [{ Email: email.toLowerCase() }];
    if (username) {
      whereConditions.push({ Username: username.toLowerCase() });
    }
    const existingUser = await User.findOne({
      where: {
        [Op.or]: whereConditions,
      },
    });

    return !!existingUser;
  } catch (error) {
    console.error('Error verificando si el usuario existe:', error);
    throw new Error('Error al verificar usuario');
  }
};

export const createNewUser = async (userData) => {
  try {
    const { name, surname, username, email, password, phone, role } = userData;

    const hashedPassword = await hashPassword(password);

    // Crear el usuario monolítico
    const user = await User.create({
      Name: name || null,
      Surname: surname || null,
      Username: username ? username.toLowerCase() : null,
      Email: email.toLowerCase(),
      Password: hashedPassword,
      Phone: phone,
      Role: (role || 'CLIENT').toUpperCase(),
      Status: false, // Empieza desactivado hasta que verifique el email
      EmailVerified: false,
    });

    return user;
  } catch (error) {
    console.error('Error creando usuario:', error);
    throw new Error('Error al crear usuario');
  }
};

export const updateEmailVerificationToken = async (userId, token, expiry) => {
  try {
    await User.update(
      {
        VerificationOtp: token,
        VerificationOtpExpiry: expiry,
      },
      {
        where: { Id: userId },
      }
    );
  } catch (error) {
    console.error('Error actualizando token de verificación:', error);
    throw new Error('Error al actualizar token de verificación');
  }
};

export const markEmailAsVerified = async (userId) => {
  try {
    await User.update(
      {
        EmailVerified: true,
        VerificationOtp: null,
        VerificationOtpExpiry: null,
        Status: true,
      },
      {
        where: { Id: userId },
      }
    );
  } catch (error) {
    console.error('Error marcando email como verificado:', error);
    throw new Error('Error al verificar email');
  }
};

export const updatePasswordResetToken = async (userId, token, expiry) => {
  try {
    await User.update(
      {
        PasswordResetToken: token,
        PasswordResetTokenExpiry: expiry,
      },
      {
        where: { Id: userId },
      }
    );
  } catch (error) {
    console.error('Error actualizando token de reset:', error);
    throw new Error('Error al actualizar token de reset');
  }
};

export const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({
      where: { Email: email.toLowerCase() },
    });
    return user;
  } catch (error) {
    console.error('Error buscando usuario por email:', error);
    throw new Error('Error al buscar usuario');
  }
};

export const findUserByEmailVerificationToken = async (token) => {
  try {
    const user = await User.findOne({
      where: {
        VerificationOtp: token,
        VerificationOtpExpiry: {
          [Op.gt]: new Date(), // Token no expirado
        },
      },
    });
    return user;
  } catch (error) {
    console.error('Error buscando usuario por token de verificación:', error);
    throw new Error('Error al buscar usuario');
  }
};

export const findUserByPasswordResetToken = async (token) => {
  try {
    const user = await User.findOne({
      where: {
        PasswordResetToken: token,
        PasswordResetTokenExpiry: {
          [Op.gt]: new Date(), // Token no expirado
        },
      },
    });
    return user;
  } catch (error) {
    console.error('Error buscando usuario por token de reset:', error);
    throw new Error('Error al buscar usuario');
  }
};

export const updateUserPassword = async (userId, hashedPassword) => {
  try {
    await User.update(
      {
        Password: hashedPassword,
        PasswordResetToken: null,
        PasswordResetTokenExpiry: null,
      },
      {
        where: { Id: userId },
      }
    );
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    throw new Error('Error al actualizar contraseña');
  }
};

export const updateUserProfilePicture = async (userId, profilePicture) => {
  try {
    console.warn("UserProfilePicture is not currently supported in flat table schema, ignoring.");
  } catch (error) {
    console.error('Error actualizando foto de perfil:', error);
    throw new Error('Error al actualizar foto de perfil');
  }
};

export const deactivateUser = async (userId) => {
  try {
    await User.update({ Status: false }, { where: { Id: userId } });
  } catch (error) {
    console.error('Error desactivando usuario:', error);
    throw new Error('Error al desactivar usuario');
  }
};
