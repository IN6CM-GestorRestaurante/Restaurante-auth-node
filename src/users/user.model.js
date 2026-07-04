import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateUserId } from '../../helpers/uuid-generator.js';

// Modelo User principal (equivalente a User.cs en .NET) - usando snake_case
export const User = sequelize.define(
  'User',
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    Name: {
      type: DataTypes.STRING(25),
      allowNull: true, // Nullable para que .NET no falle al insertar sin este campo
      field: 'name',
      validate: {
        len: {
          args: [0, 25],
          msg: 'El nombre no puede tener más de 25 caracteres.',
        },
      },
    },
    Surname: {
      type: DataTypes.STRING(25),
      allowNull: true, // Nullable
      field: 'surname',
      validate: {
        len: {
          args: [0, 25],
          msg: 'El apellido no puede tener más de 25 caracteres.',
        },
      },
    },
    Username: {
      type: DataTypes.STRING(50),
      allowNull: true, // Nullable
      unique: true,
      field: 'username',
      validate: {
        len: {
          args: [0, 50],
          msg: 'El nombre de usuario no puede tener más de 50 caracteres.',
        },
      },
    },
    Email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      field: 'email',
      validate: {
        notEmpty: { msg: 'El correo electrónico es obligatorio.' },
        isEmail: { msg: 'El correo electrónico no tiene un formato válido.' },
        len: {
          args: [1, 150],
          msg: 'El correo electrónico no puede tener más de 150 caracteres.',
        },
      },
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash', // Mapeado a la columna 'password_hash' de .NET
    },
    Role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'CLIENT', // CLIENT, WAITER, CHEF, CASHIER, ADMIN
      field: 'role',
    },
    Status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Activo por defecto en restaurantes
      allowNull: false,
      field: 'is_active', // Mapeado a la columna 'is_active' de .NET
    },
    MongoId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'mongo_id', // Enlace con MongoDB
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true, // Permite nulo porque .NET no lo define
      field: 'updated_at',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Modelo UserProfile (solo lectura en .NET o ignorado)
export const UserProfile = sequelize.define(
  'UserProfile',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
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
    ProfilePicture: {
      type: DataTypes.STRING(512),
      defaultValue: '',
      field: 'profile_picture',
    },
    Phone: {
      type: DataTypes.STRING(8),
      allowNull: false,
      field: 'phone',
      validate: {
        notEmpty: { msg: 'El número de teléfono es obligatorio.' },
        len: {
          args: [8, 8],
          msg: 'El número de teléfono debe tener exactamente 8 dígitos.',
        },
        isNumeric: { msg: 'El teléfono solo debe contener números.' },
      },
    },
  },
  {
    tableName: 'user_profiles',
    timestamps: false,
  }
);

// Modelo UserEmail (verificaciones, ignorado por .NET)
export const UserEmail = sequelize.define(
  'UserEmail',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
    },
    UserId: {
      type: DataTypes.INTEGER, // Ajustado a INTEGER
      allowNull: false,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
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
  },
  {
    tableName: 'user_emails',
    timestamps: false,
  }
);

// Modelo UserPasswordReset (recuperación de contraseña, ignorado por .NET)
export const UserPasswordReset = sequelize.define(
  'UserPasswordReset',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
    },
    UserId: {
      type: DataTypes.INTEGER, // Ajustado a INTEGER
      allowNull: false,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
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
  },
  {
    tableName: 'user_password_resets',
    timestamps: false,
  }
);

// Definir las relaciones
User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'UserProfile', onDelete: 'CASCADE' });
UserProfile.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasOne(UserEmail, { foreignKey: 'user_id', as: 'UserEmail', onDelete: 'CASCADE' });
UserEmail.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasOne(UserPasswordReset, {
  foreignKey: 'user_id',
  as: 'UserPasswordReset',
  onDelete: 'CASCADE',
});
UserPasswordReset.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
