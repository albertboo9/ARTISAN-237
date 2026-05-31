import { PrismaClient, Role, UserStatus, JobStatus, EscrowStatus, QuoteStatus, DisputeStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du Seeding de la Base de Données ARTISAN-237...');

  const passwordHash = await bcrypt.hash('Password123!', 12);

  // 1. Purge (Optionnel - attention en prod !)
  // await prisma.job.deleteMany();
  // await prisma.artisanProfile.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.service.deleteMany();
  // await prisma.category.deleteMany();

  // 2. Création des Catégories et Services
  const catBatiment = await prisma.category.upsert({
    where: { slug: 'batiment' },
    update: {},
    create: {
      name: 'Bâtiment & Rénovation',
      slug: 'batiment',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048128.png',
    },
  });

  const srvPlomberie = await prisma.service.create({
    data: {
      categoryId: catBatiment.id,
      name: 'Plomberie Générale',
      basePrice: 5000,
    }
  });

  const srvElectricite = await prisma.service.create({
    data: {
      categoryId: catBatiment.id,
      name: 'Installation Électrique',
      basePrice: 10000,
    }
  });

  // 3. Création de l'Admin
  await prisma.user.upsert({
    where: { email: 'admin@artisan237.com' },
    update: {},
    create: {
      email: 'admin@artisan237.com',
      phoneNumber: '237600000000',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    }
  });

  // 4. Création des Clients (Douala)
  const client1 = await prisma.user.upsert({
    where: { email: 'jean.client@gmail.com' },
    update: {},
    create: {
      email: 'jean.client@gmail.com',
      phoneNumber: '237690000001',
      firstName: 'Jean',
      lastName: 'Dupont',
      passwordHash,
      role: Role.CLIENT,
      status: UserStatus.ACTIVE,
    }
  });

  // 5. Création des Artisans
  const artisan1 = await prisma.user.upsert({
    where: { email: 'paul.plombier@gmail.com' },
    update: {},
    create: {
      email: 'paul.plombier@gmail.com',
      phoneNumber: '237670000002',
      firstName: 'Paul',
      lastName: 'Tchuente',
      passwordHash,
      role: Role.ARTISAN,
      status: UserStatus.ACTIVE,
      artisanProfile: {
        create: {
          bio: 'Plombier expérimenté basé à Akwa. 10 ans de métier.',
          experienceYears: 10,
          rating: 4.8,
          totalJobs: 15,
          lastLat: 4.0511, // Akwa, Douala
          lastLng: 9.7085,
          skills: {
            create: [
              { serviceId: srvPlomberie.id }
            ]
          }
        }
      }
    }
  });

  const artisan2 = await prisma.user.upsert({
    where: { email: 'marc.electricien@gmail.com' },
    update: {},
    create: {
      email: 'marc.electricien@gmail.com',
      phoneNumber: '237670000003',
      firstName: 'Marc',
      lastName: 'Ndjonga',
      passwordHash,
      role: Role.ARTISAN,
      status: UserStatus.ACTIVE,
      artisanProfile: {
        create: {
          bio: 'Électricien qualifié résident à Deido.',
          experienceYears: 5,
          rating: 4.5,
          totalJobs: 8,
          lastLat: 4.0600, // Deido, Douala
          lastLng: 9.7100,
          skills: {
            create: [
              { serviceId: srvElectricite.id }
            ]
          }
        }
      }
    }
  });

  // 6. Création d'un Job avec Quote et Escrow
  const job1 = await prisma.job.create({
    data: {
      clientId: client1.id,
      serviceId: srvPlomberie.id,
      description: 'Fuite d\'eau sous l\'évier de la cuisine à Bonapriso.',
      lat: 4.0300, // Bonapriso
      lng: 9.6900,
      address: 'Rue des Palmiers, Bonapriso',
      status: JobStatus.IN_PROGRESS, // On simule un job déjà en cours
      quotes: {
        create: {
          artisanId: (await prisma.artisanProfile.findUnique({ where: { userId: artisan1.id } }))!.id,
          estimatedPrice: 15000,
          laborPrice: 10000,
          materialsPrice: 5000,
          description: 'Remplacement du siphon et main d\'oeuvre.',
          status: QuoteStatus.ACCEPTED,
        }
      },
      escrow: {
        create: {
          amount: 15000,
          status: EscrowStatus.FUNDED,
          stripePi: 'pi_mock_123456789',
          fundedAt: new Date(),
        }
      }
    }
  });

  console.log('✅ Base de données peuplée avec succès !');
  console.log('Données créées :');
  console.log(`- Admin: admin@artisan237.com / Password123!`);
  console.log(`- Client: jean.client@gmail.com / Password123!`);
  console.log(`- Artisan: paul.plombier@gmail.com / Password123!`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
