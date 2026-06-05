import { PrismaClient, Role, UserStatus, JobStatus, EscrowStatus, QuoteStatus, MediaType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { fakerFR as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du Seeding de la Base de Données ARTISAN-237...');

  const passwordHash = await bcrypt.hash('Password123!', 12);

  // 1. Purge (Optionnel - décommenter pour réinitialiser la DB à chaque seed)
  // await prisma.jobMedia.deleteMany();
  // await prisma.invoiceItem.deleteMany();
  // await prisma.invoice.deleteMany();
  // await prisma.escrowAccount.deleteMany();
  // await prisma.quote.deleteMany();
  // await prisma.job.deleteMany();
  // await prisma.artisanSkill.deleteMany();
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

  const catCleaning = await prisma.category.upsert({
    where: { slug: 'nettoyage' },
    update: {},
    create: {
      name: 'Nettoyage & Entretien',
      slug: 'nettoyage',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2006/2006450.png',
    },
  });

  const services = [
    await prisma.service.create({ data: { categoryId: catBatiment.id, name: 'Plomberie Générale', basePrice: 5000 } }),
    await prisma.service.create({ data: { categoryId: catBatiment.id, name: 'Installation Électrique', basePrice: 10000 } }),
    await prisma.service.create({ data: { categoryId: catBatiment.id, name: 'Peinture', basePrice: 3000 } }),
    await prisma.service.create({ data: { categoryId: catBatiment.id, name: 'Menuiserie', basePrice: 7000 } }),
    await prisma.service.create({ data: { categoryId: catCleaning.id, name: 'Ménage à domicile', basePrice: 4000 } }),
    await prisma.service.create({ data: { categoryId: catCleaning.id, name: 'Jardinage', basePrice: 6000 } }),
  ];

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

  // 4. Génération Massive des Clients
  const clients: any[] = [];
  console.log('Création de 15 clients...');
  for (let i = 0; i < 15; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = `client${i}@artisan237.com`;
    
    const client = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        phoneNumber: `23769${faker.string.numeric(7)}`,
        firstName,
        lastName,
        avatarUrl: faker.image.avatar(),
        passwordHash,
        role: Role.CLIENT,
        status: UserStatus.ACTIVE,
      }
    });
    clients.push(client);
  }

  // 5. Génération Massive des Artisans
  const artisans: any[] = [];
  console.log('Création de 30 artisans...');
  for (let i = 0; i < 30; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = `artisan${i}@artisan237.com`;
    // Douala coordinates range: lat 4.0 ~ 4.1, lng 9.65 ~ 9.8
    const lat = 4.0 + Math.random() * 0.1;
    const lng = 9.65 + Math.random() * 0.15;
    const totalJobs = faker.number.int({ min: 0, max: 50 });
    
    // Pick 1-3 random services
    const artisanServices = faker.helpers.arrayElements(services, faker.number.int({ min: 1, max: 3 }));
    
    const artisan = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        phoneNumber: `23767${faker.string.numeric(7)}`,
        firstName,
        lastName,
        avatarUrl: faker.image.avatar(),
        passwordHash,
        role: Role.ARTISAN,
        status: UserStatus.ACTIVE,
        artisanProfile: {
          create: {
            bio: faker.person.bio(),
            experienceYears: faker.number.int({ min: 1, max: 20 }),
            rating: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
            totalJobs,
            lastLat: lat,
            lastLng: lng,
            skills: {
              create: artisanServices.map(s => ({ serviceId: s.id }))
            }
          }
        },
        ...(Math.random() > 0.5 && {
          kycVerifications: {
            create: {
              provider: 'DIDIT',
              externalId: `did_mock_${faker.string.alphanumeric(10)}`,
              status: 'VERIFIED',
              verifiedAt: new Date(),
            }
          }
        })
      },
    });
    // Re-fetch artisan with profile since upsert doesn't support include
    const artisanWithProfile = await prisma.user.findUnique({
      where: { email },
      include: { artisanProfile: true }
    });
    if (artisanWithProfile) artisans.push(artisanWithProfile);
  }

  // 6. Création de Jobs aléatoires
  console.log('Création de 40 missions (jobs)...');
  for (let i = 0; i < 40; i++) {
    const client = faker.helpers.arrayElement(clients)!;
    const service = faker.helpers.arrayElement(services);
    
    const lat = 4.0 + Math.random() * 0.1;
    const lng = 9.65 + Math.random() * 0.15;
    
    const status = faker.helpers.arrayElement([
      JobStatus.SEARCHING, JobStatus.QUOTE_ACCEPTED, JobStatus.IN_PROGRESS, JobStatus.COMPLETED
    ]);

    const job = await prisma.job.create({
      data: {
        clientId: client.id,
        serviceId: service.id,
        description: faker.lorem.paragraph(),
        lat,
        lng,
        address: `${faker.location.streetAddress()}, Douala`,
        status,
        createdAt: faker.date.recent({ days: 30 }),
      }
    });

    // Generate quotes for the job
    const numQuotes = faker.number.int({ min: 1, max: 4 });
    const jobArtisans = faker.helpers.arrayElements(artisans, numQuotes).filter(Boolean);
    
    let acceptedQuoteId: string | null = null;
    
    for (let j = 0; j < numQuotes; j++) {
      const isAccepted = status !== JobStatus.SEARCHING && j === 0;
      const quoteStatus = isAccepted ? QuoteStatus.ACCEPTED : 
                         status !== JobStatus.SEARCHING ? QuoteStatus.REJECTED : QuoteStatus.PENDING;
                         
      const estPrice = faker.number.int({ min: 5000, max: 150000 });
      const labor = Math.floor(estPrice * 0.6);
      const materials = estPrice - labor;
      
      const quote = await prisma.quote.create({
        data: {
          jobId: job.id,
          artisanId: jobArtisans[j].artisanProfile!.id,
          estimatedPrice: estPrice,
          laborPrice: labor,
          materialsPrice: materials,
          description: faker.lorem.sentence(),
          status: quoteStatus,
          createdAt: faker.date.recent({ days: 5 }),
        }
      });
      
      if (isAccepted) acceptedQuoteId = quote.id;
    }
    
    // Create Escrow if quote is accepted
    if (acceptedQuoteId) {
      const quote = await prisma.quote.findUnique({ where: { id: acceptedQuoteId } });
      await prisma.escrowAccount.create({
        data: {
          jobId: job.id,
          amount: quote!.estimatedPrice,
          status: status === JobStatus.COMPLETED ? EscrowStatus.RELEASED : EscrowStatus.FUNDED,
          stripePi: `pi_mock_${faker.string.alphanumeric(15)}`,
          fundedAt: faker.date.recent({ days: 3 }),
        }
      });
    }
  }

  // 7. Ensure test accounts exist for the user
  await prisma.user.upsert({
    where: { email: 'artisan@artisan237.com' },
    update: {},
    create: {
      email: 'artisan@artisan237.com',
      phoneNumber: '237670000999',
      firstName: 'Test',
      lastName: 'Artisan',
      passwordHash,
      role: Role.ARTISAN,
      status: UserStatus.ACTIVE,
      avatarUrl: faker.image.avatar(),
      artisanProfile: {
        create: {
          bio: 'Compte de test artisan.',
          experienceYears: 5,
          rating: 5.0,
          totalJobs: 10,
          lastLat: 4.0511,
          lastLng: 9.7085,
          skills: { create: [{ serviceId: services[0].id }] }
        }
      }
    }
  });

  await prisma.user.upsert({
    where: { email: 'client@artisan237.com' },
    update: {},
    create: {
      email: 'client@artisan237.com',
      phoneNumber: '237690000999',
      firstName: 'Test',
      lastName: 'Client',
      passwordHash,
      role: Role.CLIENT,
      status: UserStatus.ACTIVE,
      avatarUrl: faker.image.avatar(),
    }
  });

  console.log('✅ Base de données peuplée avec succès !');
  console.log('Données de test principales :');
  console.log(`- Admin: admin@artisan237.com / Password123!`);
  console.log(`- Client: client@artisan237.com / Password123!`);
  console.log(`- Artisan: artisan@artisan237.com / Password123!`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
