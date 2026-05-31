import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Basic health check query
  const result = await prisma.$queryRaw`SELECT 1 as health`;
  console.log('Database health check:', result);

  // Count tables
  const userCount = await prisma.user.count();
  const artisanCount = await prisma.artisanProfile.count();
  const missionCount = await prisma.mission.count();
  const reviewCount = await prisma.review.count();

  console.log(`Users: ${userCount}`);
  console.log(`Artisan Profiles: ${artisanCount}`);
  console.log(`Missions: ${missionCount}`);
  console.log(`Reviews: ${reviewCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());