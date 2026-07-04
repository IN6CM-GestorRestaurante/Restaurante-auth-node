import bcrypt from 'bcryptjs';
import { config } from '../configs/config.js';

export const hashPassword = async (password) => {
  try {
    const saltRounds = config.security.saltRounds || 10;
    return await bcrypt.hash(password, saltRounds);
  } catch {
    throw new Error('Error al hashear la contraseña');
  }
};

export const verifyPassword = async (hashedPassword, plainPassword) => {
  try {
    // Verificar usando bcryptjs
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error.message);
    return false;
  }
};

export const validatePasswordStrength = (password) => {
  const errors = [];
  const minLength = config.security.passwordMinLength || 6;

  if (password.length < minLength) {
    errors.push(
      `La contraseña debe tener al menos ${minLength} caracteres`
    );
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una letra mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe tener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
