import axios from 'axios';
import { config } from '../configs/config.js';

// Vercel bloquea las conexiones SMTP salientes en el plan gratuito, por lo que
// nodemailer nunca podia conectar (ETIMEDOUT). Resend usa una API HTTP normal,
// que si funciona en serverless.
const RESEND_API_URL = 'https://api.resend.com/emails';

const sendViaResend = async ({ to, subject, html }) => {
  if (!config.resend.apiKey) {
    console.warn('RESEND_API_KEY no configurada. La funcionalidad de email no funcionara.');
    throw new Error('Resend no esta configurado');
  }

  try {
    await axios.post(
      RESEND_API_URL,
      {
        from: `${config.smtp.fromName} <${config.resend.fromEmail}>`,
        to,
        subject,
        html,
      },
      {
        headers: {
          Authorization: `Bearer ${config.resend.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
  } catch (error) {
    console.error('Error enviando email via Resend:', error.response?.data || error.message);
    throw error;
  }
};

export const sendVerificationEmail = async (email, name, verificationToken) => {
  await sendViaResend({
    to: email,
    subject: 'Verifica tu correo electrónico',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #8c2a11; text-align: center;">Verifica tu correo electrónico</h2>
        <p style="color: #333; font-size: 16px;">Hola <strong>${name}</strong>,</p>
        <p style="color: #555; font-size: 14px; line-height: 1.5;">
          Gracias por registrarte en nuestra plataforma de administración de restaurantes. Para
          completar tu registro y activar tu cuenta, por favor introduce el siguiente código de
          verificación de 6 dígitos:
        </p>
        <div style="background-color: #fff4ea; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #7b1e06;">
            ${verificationToken}
          </span>
        </div>
        <p style="color: #777; font-size: 12px; margin-top: 20px;">
          Este código de un solo uso (OTP) es válido por los próximos 15 minutos.
        </p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="color: #999; font-size: 11px; text-align: center;">
          Si no solicitaste esta cuenta, puedes ignorar este correo de forma segura.
        </p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email, name, resetToken) => {
  const frontendUrl = config.app.frontendUrl || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  await sendViaResend({
    to: email,
    subject: 'Restablece tu contraseña - Gestor de Restaurante',
    html: `
      <h2>Solicitud de restablecimiento de contraseña - Gestor de Restaurante</h2>
      <p>Hola ${name},</p>
      <p>Este mensaje es de Gestor de Restaurante.</p>
      <p>Solicitaste restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla:</p>
      <a href='${resetUrl}' style='background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
          Restablecer contraseña
      </a>
      <p>Si no puedes hacer clic en el enlace, copia y pega esta URL en tu navegador:</p>
      <p>${resetUrl}</p>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste esto, ignora este correo y tu contraseña permanecerá sin cambios.</p>
    `,
  });
};

export const sendWelcomeEmail = async (email, name) => {
  await sendViaResend({
    to: email,
    subject: '¡Bienvenido a Gestor de Restaurante!',
    html: `
      <h2>¡Bienvenido a Gestor de Restaurante, ${name}!</h2>
      <p>Tu cuenta ha sido verificada y activada exitosamente.</p>
      <p>Ahora puedes disfrutar de todas las funciones de nuestra plataforma.</p>
      <p>Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.</p>
      <p>¡Gracias por unirte a nosotros!</p>
    `,
  });
};

export const sendPasswordChangedEmail = async (email, name) => {
  await sendViaResend({
    to: email,
    subject: 'Contraseña Cambiada Exitosamente',
    html: `
      <h2>Contraseña Cambiada</h2>
      <p>Hola ${name},</p>
      <p>Tu contraseña ha sido actualizada exitosamente.</p>
      <p>Si no realizaste este cambio, por favor contacta a soporte de inmediato.</p>
      <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
    `,
  });
};
