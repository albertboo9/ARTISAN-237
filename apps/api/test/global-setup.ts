// ===== Global Test Setup =====
import { PrismaService } from '../src/prisma/prisma.service';

const prisma = new PrismaService();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});