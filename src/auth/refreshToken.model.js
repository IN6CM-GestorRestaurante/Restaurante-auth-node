import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { User } from '../users/user.model.js';

export const RefreshToken = sequelize.define(
  'RefreshToken',
  {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id',
    },
    TokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'token_hash',
    },
    UserId: {
      type: DataTypes.INTEGER, // Ajustado a INTEGER para compatibilidad
      allowNull: false,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    FamilyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'family_id',
    },
    ExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    RevokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'revoked_at',
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    tableName: 'refresh_tokens',
    timestamps: false,
  }
);

// Relación de tokens de refresco
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'RefreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
