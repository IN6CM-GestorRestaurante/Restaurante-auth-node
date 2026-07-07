import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';

// Modelo User monolítico unificado
export const User = sequelize.define(
  'User',
  {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id',
    },
    Email: {
      type: DataTypes.STRING(256),
      allowNull: false,
      unique: true,
      field: 'email',
    },
    Password: {
      type: DataTypes.STRING(512),
      allowNull: false,
      field: 'password_hash',
    },
    Role: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: 'CLIENT',
      field: 'role',
    },
    Status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'is_active',
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    MongoId: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'mongo_id',
    },
    Username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      field: 'username',
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'name',
    },
    Surname: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'surname',
    },
    Phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'phone',
    },
    EmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'email_verified',
    },
    EmailVerificationToken: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'email_verification_token',
    },
    EmailVerificationTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'email_verification_token_expiry',
    },
    PasswordResetToken: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'password_reset_token',
    },
    PasswordResetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'password_reset_token_expiry',
    },
    RefreshToken: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'refresh_token',
    },
    RefreshTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'refresh_token_expiry',
    },
    CompanyMongoId: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'company_mongo_id',
    },
    BranchMongoId: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'branch_mongo_id',
    },
    VerificationOtp: {
      type: DataTypes.STRING(6),
      allowNull: true,
      field: 'verification_otp',
    },
    VerificationOtpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'verification_otp_expiry',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // .NET no maneja updated_at
  }
);
