import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500];

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.xPLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.job.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.artisanProfile.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('Creating users...');
  const users = await Promise.all([
    // Admin
    prisma.user.create({
      data: {
        email: 'admin@artisan237.com',
        passwordHash: await bcrypt.hash('Admin123!', 12),
        firstName: 'Admin',
        lastName: 'Artisan237',
        role: 'ADMIN',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    }),
    // Artisan users
    prisma.user.create({
      data: {
        email: 'electricien1@artisan.com',
        passwordHash: await bcrypt.hash('Artisan123!', 12),
        firstName: 'Jean',
        lastName: 'Baptiste',
        phone: '+237612345678',
        role: 'ARTISAN',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'plombier1@artisan.com',
        passwordHash: await bcrypt.hash('Artisan123!', 12),
        firstName: 'Paul',
        lastName: 'Moukouri',
        phone: '+237698765432',
        role: 'ARTISAN',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'menuisier1@artisan.com',
        passwordHash: await bcrypt.hash('Artisan123!', 12),
        firstName: 'Marie-Claire',
        lastName: 'Ngono',
        phone: '+237677123456',
        role: 'ARTISAN',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'tailleur1@artisan.com',
        passwordHash: await bcrypt.hash('Artisan123!', 12),
        firstName: 'Ahmed',
        lastName: 'Boubakar',
        phone: '+237633445566',
        role: 'ARTISAN',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    }),
    // Client users
    prisma.user.create({
      data: {
        email: 'client1@gmail.com',
        passwordHash: await bcrypt.hash('Client123!', 12),
        firstName: 'Alice',
        lastName: 'Nkemakolam',
        phone: '+237611223344',
        role: 'USER',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'client2@gmail.com',
        passwordHash: await bcrypt.hash('Client123!', 12),
        firstName: 'Bob',
        lastName: 'Essomba',
        phone: '+237655667788',
        role: 'USER',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'client3@gmail.com',
        passwordHash: await bcrypt.hash('Client123!', 12),
        firstName: 'Chantal',
        lastName: 'Meyong',
        phone: '+237699887766',
        role: 'USER',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    }),
    // Unverified user
    prisma.user.create({
      data: {
        email: 'unverified@test.com',
        passwordHash: await bcrypt.hash('Test123!', 12),
        firstName: 'New',
        lastName: 'User',
        role: 'USER',
        emailVerified: false,
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create artisan profiles
  console.log('Creating artisan profiles...');
  const artisanProfiles = await Promise.all([
    prisma.artisanProfile.create({
      data: {
        userId: users[1].id,
        businessName: 'Baptiste Électricité',
        category: 'ELECTRICIAN',
        subCategory: 'Installation électrique',
        description: 'Électricien certifié avec 15 ans d\'expérience. Spécialisé en installations résidentielles et commerciales.',
        address: 'Akwa, Douala',
        city: 'Douala',
        latitude: '4.0511',
        longitude: '9.7679',
        yearsExperience: 15,
        hourlyRate: '5000',
        isVerified: true,
        verifiedAt: new Date(),
        availability: {
          mon: [8, 17],
          tue: [8, 17],
          wed: [8, 17],
          thu: [8, 17],
          fri: [8, 17],
          sat: [9, 14],
        },
        coverImageUrl: 'https://via.placeholder.com/800x400',
        portfolio: [
          { url: 'https://via.placeholder.com/400', title: 'Installation maison Bonamoussadi', description: 'Installation complète du réseau électrique' },
          { url: 'https://via.placeholder.com/400', title: 'Rénovation bureau Akwa', description: 'Mise aux normes du tableau électrique' },
        ],
        skills: ['installation', 'réparation', 'mise aux normes', 'câblage', 'dépannage'],
        rating: '4.8',
        totalReviews: 25,
        xp: 1250,
        level: 5,
        isOnline: true,
      },
    }),
    prisma.artisanProfile.create({
      data: {
        userId: users[2].id,
        businessName: 'Moukouri Plomberie',
        category: 'PLUMBER',
        subCategory: 'Débouchage et installation',
        description: 'Plombier professionnel spécialisé en débouchage, installation de tuyauterie et travaux sanitaires.',
        address: 'Bonabéri, Douala',
        city: 'Douala',
        latitude: '4.0600',
        longitude: '9.7000',
        yearsExperience: 10,
        hourlyRate: '4000',
        isVerified: true,
        verifiedAt: new Date(),
        availability: {
          mon: [7, 18],
          tue: [7, 18],
          wed: [7, 18],
          thu: [7, 18],
          fri: [7, 18],
        },
        coverImageUrl: 'https://via.placeholder.com/800x400',
        portfolio: [
          { url: 'https://via.placeholder.com/400', title: 'Rénovation salle de bain', description: 'Installation complète de la plomberie' },
        ],
        skills: ['débouchage', 'installation', 'soudure', 'maintenance'],
        rating: '4.5',
        totalReviews: 18,
        xp: 890,
        level: 4,
        isOnline: true,
      },
    }),
    prisma.artisanProfile.create({
      data: {
        userId: users[3].id,
        businessName: 'Ngono Menuiserie',
        category: 'CARPENTER',
        subCategory: 'Menuiserie sur mesure',
        description: 'Artisan menuisier expérimenté. Création de meubles sur mesure, travaux de rénovation intérieure.',
        address: 'Bessengué, Douala',
        city: 'Douala',
        latitude: '4.0480',
        longitude: '9.7050',
        yearsExperience: 8,
        hourlyRate: '3500',
        isVerified: true,
        verifiedAt: new Date(),
        availability: {
          mon: [8, 16],
          wed: [8, 16],
          fri: [8, 16],
          sat: [8, 13],
        },
        coverImageUrl: 'https://via.placeholder.com/800x400',
        portfolio: [
          { url: 'https://via.placeholder.com/400', title: 'Cuisine sur mesure', description: 'Cuisine en bois massif personnalisée' },
        ],
        skills: ['menuiserie', 'ébénisterie', 'fabrication meubles', 'rénovation'],
        rating: '4.6',
        totalReviews: 12,
        xp: 650,
        level: 3,
        isOnline: false,
      },
    }),
    prisma.artisanProfile.create({
      data: {
        userId: users[4].id,
        businessName: 'Boubakar Confection',
        category: 'TAILOR',
        description: 'Tailleur traditionnel et moderne. Confection de vêtements sur mesure pour hommes et femmes.',
        address: 'New Deido, Douala',
        city: 'Douala',
        latitude: '4.0550',
        longitude: '9.7100',
        yearsExperience: 12,
        hourlyRate: '2500',
        isVerified: false,
        isOnline: true,
        skills: ['couture', 'broderie', 'confection sur mesure'],
        rating: '4.2',
        totalReviews: 8,
        xp: 320,
        level: 2,
      },
    }),
  ]);

  console.log(`Created ${artisanProfiles.length} artisan profiles`);

  // Create jobs
  console.log('Creating jobs...');
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: 'Installation électrique complète',
        description: 'Besoin d\'un électricien pour installation complète dans maison neuve de 4 chambres à Bonamoussadi.',
        category: 'ELECTRICIAN',
        budgetMin: '150000',
        budgetMax: '300000',
        location: 'Bonamoussadi, Douala',
        latitude: '4.0650',
        longitude: '9.7200',
        clientId: users[5].id,
        status: 'OPEN',
      },
    }),
    prisma.job.create({
      data: {
        title: 'Débouchage canalisation',
        description: 'Canalisation bouchée dans la cuisine. Besoin d\'un plombier urgent.',
        category: 'PLUMBER',
        budgetMin: '15000',
        budgetMax: '50000',
        location: 'Akwa, Douala',
        latitude: '4.0520',
        longitude: '9.7060',
        clientId: users[6].id,
        status: 'OPEN',
      },
    }),
    prisma.job.create({
      data: {
        title: 'Fabrication placard sur mesure',
        description: 'Besoin d\'un menuisier pour fabrication d\'un placard walk-in dans la chambre principale.',
        category: 'CARPENTER',
        budgetMin: '100000',
        budgetMax: '250000',
        location: 'Bessengué, Douala',
        latitude: '4.0490',
        longitude: '9.7060',
        clientId: users[7].id,
        status: 'OPEN',
      },
    }),
    prisma.job.create({
      data: {
        title: 'Réparation robinetterie',
        description: 'Robinet qui fuit dans la salle de bain.',
        category: 'PLUMBER',
        budgetMin: '5000',
        budgetMax: '20000',
        location: 'New Bell, Douala',
        latitude: '4.0580',
        longitude: '9.6800',
        clientId: users[5].id,
        status: 'OPEN',
      },
    }),
  ]);

  console.log(`Created ${jobs.length} jobs`);

  // Assign artisans to jobs (missions)
  console.log('Creating missions...');
  const missions = await Promise.all([
    prisma.mission.create({
      data: {
        jobId: jobs[0].id,
        artisanId: users[1].id, // Jean Baptiste - Electrician
        status: 'ACCEPTED',
        price: 200000,
      },
    }),
    prisma.mission.create({
      data: {
        jobId: jobs[1].id,
        artisanId: users[2].id, // Paul Moukouri - Plumber
        status: 'IN_PROGRESS',
        price: 35000,
        startedAt: new Date(Date.now() - 3600000),
      },
    }),
    prisma.mission.create({
      data: {
        jobId: jobs[2].id,
        artisanId: users[3].id, // Marie-Claire Ngono - Carpenter
        status: 'PENDING',
      },
    }),
    prisma.mission.create({
      data: {
        jobId: jobs[3].id,
        artisanId: users[2].id, // Paul Moukouri - Plumber
        status: 'COMPLETED',
        price: 15000,
        startedAt: new Date(Date.now() - 86400000 * 3),
        completedAt: new Date(Date.now() - 86400000 * 2),
      },
    }),
  ]);

  console.log(`Created ${missions.length} missions`);

  // Create reviews
  console.log('Creating reviews...');
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        missionId: missions[3].id,
        reviewerId: users[5].id,
        artisanId: users[2].id,
        rating: 5,
        comment: 'Excellent travail! Le plombier était ponctuel et professionnel. Je recommande vivement.',
        isVerified: true,
        helpfulCount: 12,
      },
    }),
    prisma.review.create({
      data: {
        missionId: missions[0].id,
        reviewerId: users[5].id,
        artisanId: users[1].id,
        rating: 5,
        comment: 'Installation parfaite, tout fonctionne impeccablement. Très satisfait!',
        isVerified: true,
        helpfulCount: 8,
      },
    }),
    prisma.review.create({
      data: {
        missionId: missions[1].id,
        reviewerId: users[6].id,
        artisanId: users[2].id,
        rating: 4,
        comment: 'Bon travail de débouchage. Prix raisonnable. Recommandé.',
        isVerified: true,
        helpfulCount: 5,
      },
    }),
  ]);

  console.log(`Created ${reviews.length} reviews`);

  // Update artisan ratings
  console.log('Updating artisan ratings...');
  for (const artisan of [users[1], users[2], users[3]]) {
    const artisanReviews = await prisma.review.findMany({
      where: { artisanId: artisan.id },
    });
    const rating = artisanReviews.length > 0
      ? artisanReviews.reduce((sum, r) => sum + r.rating, 0) / artisanReviews.length
      : 0;

    await prisma.artisanProfile.update({
      where: { userId: artisan.id },
      data: {
        rating: parseFloat(rating.toFixed(2)),
        totalReviews: artisanReviews.length,
      },
    });
  }

  // Create XP logs
  console.log('Creating XP logs...');
  await prisma.xPLog.createMany({
    data: [
      { userId: users[1].id, action: 'PROFILE_CREATED', points: 50 },
      { userId: users[1].id, action: 'PROFILE_VERIFIED', points: 200 },
      { userId: users[1].id, action: 'MISSION_ACCEPTED', points: 100, metadata: { mission: 'Mission 1' } },
      { userId: users[1].id, action: 'MISSION_COMPLETED', points: 250, metadata: { mission: 'Mission 1' } },
      { userId: users[1].id, action: 'REVIEW_RECEIVED', points: 30 },
      { userId: users[1].id, action: 'PROFILE_CREATED', points: 50 },
      { userId: users[1].id, action: 'MISSION_ACCEPTED', points: 100, metadata: { mission: 'Mission 2' } },
      { userId: users[1].id, action: 'MISSION_COMPLETED', points: 250, metadata: { mission: 'Mission 2' } },
      { userId: users[2].id, action: 'PROFILE_CREATED', points: 50 },
      { userId: users[2].id, action: 'PROFILE_VERIFIED', points: 200 },
      { userId: users[2].id, action: 'MISSION_ACCEPTED', points: 100, metadata: { mission: 'Mission 1' } },
      { userId: users[2].id, action: 'MISSION_COMPLETED', points: 250, metadata: { mission: 'Mission 1' } },
      { userId: users[2].id, action: 'REVIEW_RECEIVED', points: 30 },
      { userId: users[2].id, action: 'PROFILE_CREATED', points: 50 },
      { userId: users[2].id, action: 'MISSION_ACCEPTED', points: 100, metadata: { mission: 'Mission 2' } },
      { userId: users[2].id, action: 'MISSION_COMPLETED', points: 250, metadata: { mission: 'Mission 2' } },
      { userId: users[3].id, action: 'PROFILE_CREATED', points: 50 },
      { userId: users[3].id, action: 'PROFILE_VERIFIED', points: 200 },
      { userId: users[3].id, action: 'MISSION_ACCEPTED', points: 100, metadata: { mission: 'Mission 1' } },
    ],
  });

  console.log('Created XP logs');

  // Create badges
  console.log('Creating badges...');
  const badges = await prisma.badge.createMany({
    data: [
      { name: 'Premier Pas', description: 'Créer son premier profil', icon: '👣', xpRequired: 0, rarity: 'COMMON' },
      { name: 'Électricien Confirmé', description: 'Compléter 5 missions en électricité', icon: '⚡', xpRequired: 500, rarity: 'RARE' },
      { name: 'Plombier Expert', description: 'Compléter 10 missions en plomberie', icon: '🔧', xpRequired: 1000, rarity: 'RARE' },
      { name: 'Artisan Vérifié', description: 'Passer la vérification', icon: '✅', xpRequired: 200, rarity: 'COMMON' },
      { name: 'Maître Artisan', description: 'Atteindre le niveau 10', icon: '👑', xpRequired: 7500, rarity: 'LEGENDARY' },
      { name: '5 Étoiles', description: 'Maintenir une note de 4.5+', icon: '⭐', xpRequired: 200, rarity: 'EPIC' },
      { name: 'Actif', description: 'Compléter une mission en 24h', icon: '⚡', xpRequired: 100, rarity: 'COMMON' },
    ],
  });

  console.log(`Created ${(badges as any).count} badges`);

  // Create notifications
  console.log('Creating notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: users[1].id,
        type: 'MISSION_REQUEST',
        title: 'Nouvelle demande',
        message: 'Un client a posté une demande pour installation électrique.',
      },
      {
        userId: users[5].id,
        type: 'NEW_REVIEW',
        title: 'Nouvel avis',
        message: 'Paul Moukouri a laissé un avis 5 étoiles sur votre plombier.',
      },
      {
        userId: users[2].id,
        type: 'LEVEL_UP',
        title: 'Niveau supérieur!',
        message: 'Félicitations! Vous avez atteint le niveau 4.',
      },
    ],
  });

  console.log('Created notifications');

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });