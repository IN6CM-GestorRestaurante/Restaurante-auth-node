import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { findUserById } from '../../helpers/user-db.js';
import { User } from './user.model.js';
import { ALLOWED_ROLES, ADMIN } from '../../helpers/role-constants.js';
import { buildUserResponse } from '../../utils/user-helpers.js';

const ensureAdmin = async (req) => {
  return req.user?.Role === ADMIN;
};

export const updateUserRole = [
  validateJWT,
  asyncHandler(async (req, res) => {
    if (!(await ensureAdmin(req))) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { userId } = req.params;
    const { roleName } = req.body || {};

    const normalized = (roleName || '').trim().toUpperCase();
    if (!ALLOWED_ROLES.includes(normalized)) {
      return res.status(400).json({
        success: false,
        message: `Role not allowed. Allowed roles: ${ALLOWED_ROLES.join(', ')}`,
      });
    }

    const user = await findUserById(parseInt(userId, 10));
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Actualizar rol plano directamente
    user.Role = normalized;
    await user.save();

    return res.status(200).json(buildUserResponse(user));
  }),
];

export const getUserRoles = [
  validateJWT,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await findUserById(parseInt(userId, 10));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Devolvemos como array para mantener compatibilidad con el formato esperado
    return res.status(200).json([user.Role]);
  }),
];

export const getUsersByRole = [
  validateJWT,
  asyncHandler(async (req, res) => {
    if (!(await ensureAdmin(req))) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { roleName } = req.params;
    const normalized = (roleName || '').trim().toUpperCase();
    if (!ALLOWED_ROLES.includes(normalized)) {
      return res.status(400).json({
        success: false,
        message: `Role not allowed. Allowed roles: ${ALLOWED_ROLES.join(', ')}`,
      });
    }

    const users = await User.findAll({
      where: { Role: normalized },
      include: [
        { model: User.associations.UserProfile.target, as: 'UserProfile' },
        { model: User.associations.UserEmail.target, as: 'UserEmail' },
        { model: User.associations.UserPasswordReset.target, as: 'UserPasswordReset' },
      ],
    });
    
    const payload = users.map(buildUserResponse);
    return res.status(200).json(payload);
  }),
];
