# Restaurante - Auth Service (Node.js)

Este repositorio contiene un **Microservicio de Autenticación** del ecosistema del Restaurante. Creado con Node.js, Express y PostgreSQL, este servicio se encarga de gestionar de forma centralizada y segura el acceso de usuarios, administradores y personal, proporcionando tokens de autenticación válidos.

## 🚀 Características Principales
- **Base de Datos Relacional:** Utiliza PostgreSQL a través del ORM Sequelize para asegurar la integridad de los datos de los usuarios.
- **Seguridad en Contraseñas:** Encriptación de alto nivel utilizando Bcryptjs.
- **Gestión de Identidad:** Emisión y validación de JSON Web Tokens (JWT).
- **Control de Peticiones:** Limita los intentos de acceso mediante `express-rate-limit` para evitar ataques de fuerza bruta.
- **Protección HTTP:** Configuración de cabeceras de seguridad con Helmet.

## 🛠 Tecnologías Utilizadas
- **Entorno de Ejecución:** Node.js
- **Web Framework:** Express.js (v5.1.0)
- **Base de Datos:** PostgreSQL (pg)
- **ORM:** Sequelize (v6)
- **Criptografía & Auth:** Bcryptjs, JSON Web Tokens
- **Seguridad y Middlewares:** Cors, Helmet, Morgan, Express Validator
- **Calidad de Código:** ESLint, Prettier, Husky, Commitizen

## 📁 Estructura del Directorio
```
Restaurante-auth-node/
├── src/             # Carpeta principal de código fuente
│   ├── config/      # Archivos de conexión a PostgreSQL
│   ├── controllers/ # Lógica para inicio de sesión, registro, etc.
│   ├── middlewares/ # Validadores y filtros de seguridad
│   ├── models/      # Definiciones de los esquemas de Sequelize (PostgreSQL)
│   └── routes/      # Definición de los endpoints expuestos
├── .env.example     # Plantilla para variables de entorno
├── index.js         # Entry point del servidor
└── package.json     # Scripts y dependencias npm
```

## 📋 Requisitos del Entorno
Para poder ejecutar este servicio necesitas:
- Node.js (v18+)
- Gestor de Base de Datos PostgreSQL localmente o un clúster en la nube.
- npm, yarn o pnpm.

## ⚙️ Configuración e Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/IN6CM-GestorRestaurante/Restaurante-auth-node.git
   cd Restaurante-auth-node
   ```

2. **Instalar paquetes:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Renombra o copia el archivo `.env.example` a `.env` y ajusta los valores de la conexión a tu base de datos:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=tu_password
   DB_NAME=restaurante_auth
   JWT_SECRET=tu_clave_secreta_aqui
   ```

4. **Ejecutar el microservicio en desarrollo:**
   ```bash
   npm run dev
   ```
   El ORM Sequelize se encargará de sincronizar los modelos con la base de datos automáticamente (dependiendo de la configuración interna).

## 🔒 Endpoints Clave
- `POST /api/auth/login`: Verifica credenciales y devuelve un token JWT.
- `POST /api/auth/register`: Crea un nuevo usuario en la base de datos de PostgreSQL.
