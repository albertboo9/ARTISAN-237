import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Artisan237 E2E Scenarios (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  let clientToken: string;
  let artisanToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    
    prisma = app.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('1. Authentication (Good & Bad Flows)', () => {
    it('/api/v1/auth/login (POST) - Success Client', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'jean.client@gmail.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      clientToken = response.body.accessToken;
    });

    it('/api/v1/auth/login (POST) - Success Artisan', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'paul.plombier@gmail.com',
          password: 'Password123!',
        })
        .expect(200);
        
      expect(response.body).toHaveProperty('accessToken');
      artisanToken = response.body.accessToken;
    });

    it('/api/v1/auth/login (POST) - Invalid Credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'jean.client@gmail.com',
          password: 'WrongPassword!',
        })
        .expect(401);
    });
  });

  describe('2. Authorization & RBAC', () => {
    it('/api/v1/users/me (GET) - Missing Token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('/api/v1/taxonomies/categories (POST) - Client Forbidden (Needs Admin)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/taxonomies/categories')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ name: 'Test Cat', slug: 'test-cat' })
        .expect(403); // Forbidden
    });
  });

  describe('3. Core Marketplace Flow (Job -> Quote -> Escrow)', () => {
    let jobId: string;
    let quoteId: string;
    let serviceId: string;

    it('Should fetch a service ID', async () => {
      const services = await prisma.service.findMany();
      expect(services.length).toBeGreaterThan(0);
      serviceId = services[0].id;
    });

    it('Client creates a Job', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          serviceId,
          description: 'Besoin urgent de réparation e2e',
          lat: 4.05,
          lng: 9.7,
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      jobId = response.body.id;
    });

    it('Artisan submits a Quote', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .set('Authorization', `Bearer ${artisanToken}`)
        .send({
          jobId,
          estimatedPrice: 20000,
          laborPrice: 15000,
          materialsPrice: 5000,
          description: 'Devis E2E',
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      quoteId = response.body.id;
    });

    it('Client accepts the Quote (Creates Escrow)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/quotes/${quoteId}/status`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          status: 'ACCEPTED'
        })
        .expect(200);
      
      expect(response.body.status).toBe('ACCEPTED');
      
      // Verification de l'Escrow
      const escrow = await prisma.escrowAccount.findUnique({ where: { jobId } });
      expect(escrow).not.toBeNull();
      expect(escrow?.status).toBe('PENDING');
    });

    it('Client tries to leave Review before Job is COMPLETED (Bad Flow)', async () => {
      // Find artisan userId
      const quote = await prisma.quote.findUnique({ where: { id: quoteId }, include: { artisan: true } });
      
      await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          jobId,
          targetId: quote!.artisan.userId,
          rating: 5,
          comment: 'Super !'
        })
        .expect(400); // BadRequestException
    });
  });
});
