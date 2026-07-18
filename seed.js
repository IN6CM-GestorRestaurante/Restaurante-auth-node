import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from './configs/db.js';
import { User } from './src/users/user.model.js';

const seedDatabase = async () => {
  if (process.env.SEED_ENABLED === 'false') {
    console.log('⏭️  Seeder desactivado (SEED_ENABLED=false)');
    return;
  }

  try {
    console.log('🚀 Iniciando DataSeeder para Auth-Node (PostgreSQL)...');
    
    // Solo reconectamos si es llamado directamente (standalone)
    // Si viene desde db.js, sequelize ya está autenticado.

    // Obtener emails existentes para no duplicar
    const existingUsers = await User.findAll({ attributes: ['Email'] });
    const existingEmails = existingUsers.map((u) => u.Email);

    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
    const defaultUserPass = 'Password123!';

    const defaultAdminPassHash = await bcrypt.hash(adminPassword, 10);
    const defaultUserPassHash = await bcrypt.hash(defaultUserPass, 10);

    const users = [];

    // 1. Super Admin
    users.push({
      Username: 'superadmin',
      Email: 'admin@restaurante.local',
      Password: defaultAdminPassHash,
      Role: 'SUPER_ADMIN',
      Status: true,
      EmailVerified: true,
    });

    // IDs estáticos de MongoDB (para correlación cruzada)
    const camperoCompanyId = 'c00000000000000000000001';
    const camperoBranch1Id = 'b00000000000000000000011';
    const camperoBranch2Id = 'b00000000000000000000012';

    const mcdoCompanyId = 'c00000000000000000000002';
    const mcdoBranch1Id = 'b00000000000000000000021';
    const mcdoBranch2Id = 'b00000000000000000000022';

    const createUser = (mongoId, name, surname, username, email, phone, role, companyMongoId, branchMongoId, passwordHash) => ({
      MongoId: mongoId,
      Name: name,
      Surname: surname,
      Username: username,
      Email: email,
      Phone: phone,
      Role: role,
      CompanyMongoId: companyMongoId,
      BranchMongoId: branchMongoId,
      Password: passwordHash,
      Status: true,
      EmailVerified: true,
    });

    // POLLO CAMPERO
    users.push(createUser('e00000000000000000000010', 'Juan', 'Bautista', 'jbautista', 'admin@campero.com', '55511111', 'COMPANY_ADMIN', camperoCompanyId, null, defaultAdminPassHash));
    users.push(createUser('e00000000000000000000011', 'Luis', 'Perez', 'lperez', 'manager1@campero.com', '55511112', 'BRANCH_MANAGER', camperoCompanyId, camperoBranch1Id, defaultUserPassHash));
    users.push(createUser('e00000000000000000000012', 'Sofia', 'Castro', 'scastro', 'waiter1@campero.com', '55511113', 'WAITER', camperoCompanyId, camperoBranch1Id, defaultUserPassHash));
    users.push(createUser('e00000000000000000000013', 'Mario', 'Ruiz', 'mruiz', 'chef1@campero.com', '55511114', 'CHEF', camperoCompanyId, camperoBranch1Id, defaultUserPassHash));
    users.push(createUser('e00000000000000000000014', 'Ana', 'Lopez', 'alopez', 'cashier1@campero.com', '55511115', 'CASHIER', camperoCompanyId, camperoBranch1Id, defaultUserPassHash));

    users.push(createUser('e00000000000000000000015', 'Carlos', 'Giron', 'cgiron', 'manager2@campero.com', '55511116', 'BRANCH_MANAGER', camperoCompanyId, camperoBranch2Id, defaultUserPassHash));
    users.push(createUser('e00000000000000000000016', 'Diana', 'Morales', 'dmorales', 'waiter2@campero.com', '55511117', 'WAITER', camperoCompanyId, camperoBranch2Id, defaultUserPassHash));
    users.push(createUser('e00000000000000000000017', 'Pedro', 'Gomez', 'pgomez', 'chef2@campero.com', '55511118', 'CHEF', camperoCompanyId, camperoBranch2Id, defaultUserPassHash));
    users.push(createUser('e00000000000000000000018', 'Maria', 'Sosa', 'msosa', 'cashier2@campero.com', '55511119', 'CASHIER', camperoCompanyId, camperoBranch2Id, defaultUserPassHash));

    users.push(createUser('e00000000000000000000019', 'Cliente', 'Campero', 'ccampero', 'cliente@campero.com', '55511120', 'CLIENT', camperoCompanyId, null, defaultUserPassHash));
    users.push(createUser('e0000000000000000000001a', 'Fernando', 'Alvarez', 'falvarez', 'cliente.vip@campero.com', '55511121', 'CLIENT', camperoCompanyId, camperoBranch1Id, defaultUserPassHash));
    users.push(createUser('e0000000000000000000001b', 'Gabriela', 'Mendoza', 'gmendoza', 'cliente.frecuente@campero.com', '55511122', 'CLIENT', camperoCompanyId, camperoBranch2Id, defaultUserPassHash));

    // MC DONALDS
    users.push(createUser('e00000000000000000000020', 'Ronald', 'Mac', 'rmac', 'admin@mcdonalds.com', '55522221', 'COMPANY_ADMIN', mcdoCompanyId, null, defaultAdminPassHash));
    users.push(createUser('e00000000000000000000021', 'Oscar', 'Pinto', 'opinto', 'manager1@mcdonalds.com', '55522222', 'BRANCH_MANAGER', mcdoCompanyId, mcdoBranch1Id, defaultUserPassHash));
    users.push(createUser('e00000000000000000000022', 'Elena', 'Cruz', 'ecruz', 'waiter1@mcdonalds.com', '55522223', 'WAITER', mcdoCompanyId, mcdoBranch1Id, defaultUserPassHash));
    users.push(createUser('e00000000000000000000023', 'Hugo', 'Leon', 'hleon', 'chef1@mcdonalds.com', '55522224', 'CHEF', mcdoCompanyId, mcdoBranch1Id, defaultUserPassHash));
    users.push(createUser('e00000000000000000000024', 'Rosa', 'Mendez', 'rmendez', 'cashier1@mcdonalds.com', '55522225', 'CASHIER', mcdoCompanyId, mcdoBranch1Id, defaultUserPassHash));

    users.push(createUser('e00000000000000000000025', 'Ivan', 'Salas', 'isalas', 'manager2@mcdonalds.com', '55522226', 'BRANCH_MANAGER', mcdoCompanyId, mcdoBranch2Id, defaultUserPassHash));
    users.push(createUser('e00000000000000000000026', 'Laura', 'Vargas', 'lvargas', 'waiter2@mcdonalds.com', '55522227', 'WAITER', mcdoCompanyId, mcdoBranch2Id, defaultUserPassHash));
    users.push(createUser('e00000000000000000000027', 'Julio', 'Rios', 'jrios', 'chef2@mcdonalds.com', '55522228', 'CHEF', mcdoCompanyId, mcdoBranch2Id, defaultUserPassHash));
    users.push(createUser('e00000000000000000000028', 'Sara', 'Vega', 'svega', 'cashier2@mcdonalds.com', '55522229', 'CASHIER', mcdoCompanyId, mcdoBranch2Id, defaultUserPassHash));

    users.push(createUser('e00000000000000000000029', 'Cliente', 'McDo', 'cmcdo', 'cliente@mcdonalds.com', '55522230', 'CLIENT', mcdoCompanyId, null, defaultUserPassHash));
    users.push(createUser('e0000000000000000000002a', 'Rodrigo', 'Paz', 'rpaz', 'cliente.vip@mcdonalds.com', '55522231', 'CLIENT', mcdoCompanyId, mcdoBranch1Id, defaultUserPassHash));
    users.push(createUser('e0000000000000000000002b', 'Valeria', 'Solano', 'vsolano', 'cliente.frecuente@mcdonalds.com', '55522232', 'CLIENT', mcdoCompanyId, mcdoBranch2Id, defaultUserPassHash));

    users.push(createUser('e00000000000000000000030', 'Martin', 'Garces', 'mgarces', 'cliente@restaurante.local', '55533333', 'CLIENT', camperoCompanyId, null, defaultUserPassHash));

    // Filtrar usuarios que ya existen
    const newUsers = users.filter((u) => !existingEmails.includes(u.Email));

    if (newUsers.length > 0) {
      console.log(`Insertando ${newUsers.length} usuarios nuevos...`);
      await User.bulkCreate(newUsers);
      console.log('✅ Usuarios creados exitosamente.');
    } else {
      console.log('⚠️  Todos los usuarios ya existen, no se insertó ninguno nuevo.');
    }
    
    return;
  } catch (error) {
    console.error('❌ Error en el seeder de Auth-Node:', error);
    throw error;
  }
};

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
    seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

export { seedDatabase };
