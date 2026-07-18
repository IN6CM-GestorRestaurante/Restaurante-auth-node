import {
  getFullImageUrl,
  getDefaultAvatarPath,
} from '../helpers/cloudinary-service.js';

export const buildUserResponse = (user) => {
  // Obtener la URL de la imagen de perfil
  const profilePictureUrl =
    user.UserProfile && user.UserProfile.ProfilePicture
      ? getFullImageUrl(user.UserProfile.ProfilePicture)
      : getFullImageUrl(getDefaultAvatarPath());

  return {
    id: user.Id,
    name: user.Name || '',
    surname: user.Surname || '',
    username: user.Username || '',
    email: user.Email,
    phone:
      user.UserProfile && user.UserProfile.Phone ? user.UserProfile.Phone : '',
    profilePicture: profilePictureUrl,
    role: user.Role || 'CLIENT', // Uso de rol plano directamente
    status: user.Status, // Mapeado a is_active
    mongoId: user.MongoId || '', // Enlace a MongoDB
    companyId: user.CompanyMongoId || '', // Enlace a Empresa
    branchId: user.BranchMongoId || '', // Enlace a Sucursal
    isEmailVerified: user.UserEmail ? user.UserEmail.EmailVerified : false,
    createdAt: user.CreatedAt,
    updatedAt: user.UpdatedAt,
  };
};
