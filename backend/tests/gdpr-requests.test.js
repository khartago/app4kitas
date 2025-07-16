const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/app');
const { createTestData, prisma } = require('./setup');

describe('GDPR Requests Endpoints', () => {
  let superAdminToken;
  let adminToken;
  let educatorToken;
  let parentToken;
  let testUser;
  let testChild;
  let gdprRequest;
  let testData;

  beforeAll(async () => {
    // Create test data
    testData = await createTestData();
    
    // Extract users from test data
    const [superAdmin, admin, educator, parent] = testData.users;

    // Get tokens for each role
    const superAdminResponse = await request(app)
      .post('/api/login')
      .send({
        email: superAdmin.email,
        password: 'testpassword'
      });
    superAdminToken = superAdminResponse.body.token;

    const adminResponse = await request(app)
      .post('/api/login')
      .send({
        email: admin.email,
        password: 'testpassword'
      });
    adminToken = adminResponse.body.token;

    const educatorResponse = await request(app)
      .post('/api/login')
      .send({
        email: educator.email,
        password: 'testpassword'
      });
    educatorToken = educatorResponse.body.token;

    const parentResponse = await request(app)
      .post('/api/login')
      .send({
        email: parent.email,
        password: 'testpassword'
      });
    parentToken = parentResponse.body.token;

    // Create a test user for GDPR requests
    testUser = await prisma.user.create({
      data: {
        email: `test.gdpr.user.${Date.now()}@app4kitas.de`,
        password: await require('bcryptjs').hash('testpassword', 10),
        name: 'Test GDPR User',
        role: 'PARENT',
        phone: '+49123456785',
        institutionId: testData.institution.id
      }
    });

    testChild = await prisma.child.create({
      data: {
        name: `Test GDPR Child ${Date.now()}`,
        birthdate: new Date('2020-01-01'),
        institutionId: testData.institution.id,
        qrCodeSecret: `test-gdpr-qr-${Date.now()}`,
        parents: {
          connect: [{ id: testUser.id }]
        }
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.gDPRRequest.deleteMany({
      where: {
        userId: testUser.id
      }
    });

    await prisma.user.deleteMany({
      where: {
        id: testUser.id
      }
    });

    await prisma.$disconnect();
  });

  describe('POST /api/gdpr/request-delete/:userId', () => {
    it('should create a GDPR deletion request (Super Admin only)', async () => {
      const response = await request(app)
        .post(`/api/gdpr/request-delete/${testUser.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          reason: 'Benutzer hat um Löschung seiner Daten gebeten'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('GDPR Löschanfrage erfolgreich erstellt');
      expect(response.body.data.userId).toBe(testUser.id);
      expect(response.body.data.reason).toBe('Benutzer hat um Löschung seiner Daten gebeten');
      expect(response.body.data.status).toBe('PENDING');

      gdprRequest = response.body.data;
    });

    it('should reject request without reason', async () => {
      const response = await request(app)
        .post(`/api/gdpr/request-delete/${testUser.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Grund für die Löschung ist erforderlich');
    });

    it('should reject request for non-existent user', async () => {
      const nonExistentUserId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post(`/api/gdpr/request-delete/${nonExistentUserId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          reason: 'Test reason'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Benutzer nicht gefunden');
    });

    it('should reject duplicate pending request', async () => {
      const response = await request(app)
        .post(`/api/gdpr/request-delete/${testUser.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          reason: 'Another request'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Es existiert bereits eine ausstehende Löschanfrage für diesen Benutzer');
    });

    it('should reject request from non-Super Admin users', async () => {
      const tokens = [adminToken, educatorToken, parentToken];
      
      for (const token of tokens) {
        const response = await request(app)
          .post(`/api/gdpr/request-delete/${testUser.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            reason: 'Test reason'
          });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Nur Super Admin kann auf diese Funktion zugreifen');
      }
    });
  });

  describe('GET /api/gdpr/requests', () => {
    it('should list all GDPR requests (Super Admin only)', async () => {
      const response = await request(app)
        .get('/api/gdpr/requests')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBeGreaterThan(0);
    });

    it('should filter requests by status', async () => {
      const response = await request(app)
        .get('/api/gdpr/requests?status=PENDING')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(request => {
        expect(request.status).toBe('PENDING');
      });
    });

    it('should reject access from non-Super Admin users', async () => {
      const tokens = [adminToken, educatorToken, parentToken];
      
      for (const token of tokens) {
        const response = await request(app)
          .get('/api/gdpr/requests')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Nur Super Admin kann auf diese Funktion zugreifen');
      }
    });
  });

  describe('GET /api/gdpr/requests/:requestId', () => {
    it('should get a specific GDPR request', async () => {
      const response = await request(app)
        .get(`/api/gdpr/requests/${gdprRequest.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(gdprRequest.id);
      expect(response.body.data.userId).toBe(testUser.id);
      expect(response.body.data.status).toBe('PENDING');
    });

    it('should return 404 for non-existent request', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/gdpr/requests/${nonExistentId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('GDPR Anfrage nicht gefunden');
    });
  });

  describe('POST /api/gdpr/requests/:requestId/approve', () => {
    it('should approve a GDPR request and soft delete user', async () => {
      const response = await request(app)
        .post(`/api/gdpr/requests/${gdprRequest.id}/approve`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('GDPR Anfrage genehmigt und Benutzer gelöscht');
      expect(response.body.data.status).toBe('APPROVED');
      expect(response.body.data.reviewedBy).toBeDefined();
      expect(response.body.data.reviewedAt).toBeDefined();

      // Verify user is soft deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });
      expect(deletedUser.deletedAt).toBeDefined();
    });

    it('should reject approval of non-pending request', async () => {
      // Create another request
      const anotherUser = await prisma.user.create({
        data: {
          email: `test.another.user.${Date.now()}@app4kitas.de`,
          password: await require('bcryptjs').hash('testpassword', 10),
          name: 'Test Another User',
          role: 'PARENT',
          phone: '+49123456784',
          institutionId: testData.institution.id
        }
      });

      const anotherRequest = await prisma.gDPRRequest.create({
        data: {
          userId: anotherUser.id,
          reason: 'Test reason',
          status: 'REJECTED'
        }
      });

      const response = await request(app)
        .post(`/api/gdpr/requests/${anotherRequest.id}/approve`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Anfrage kann nur genehmigt werden, wenn sie ausstehend ist');

      // Clean up
      await prisma.gDPRRequest.delete({ where: { id: anotherRequest.id } });
      await prisma.user.delete({ where: { id: anotherUser.id } });
    });
  });

  describe('POST /api/gdpr/requests/:requestId/reject', () => {
    it('should reject a GDPR request', async () => {
      // Create a new request for rejection test
      const rejectUser = await prisma.user.create({
        data: {
          email: `test.reject.user.${Date.now()}@app4kitas.de`,
          password: await require('bcryptjs').hash('testpassword', 10),
          name: 'Test Reject User',
          role: 'PARENT',
          phone: '+49123456783',
          institutionId: testData.institution.id
        }
      });

      const rejectRequest = await prisma.gDPRRequest.create({
        data: {
          userId: rejectUser.id,
          reason: 'Test reason for rejection',
          status: 'PENDING'
        }
      });

      const response = await request(app)
        .post(`/api/gdpr/requests/${rejectRequest.id}/reject`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          reason: 'Insufficient grounds for deletion'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('GDPR Anfrage abgelehnt');
      expect(response.body.data.status).toBe('REJECTED');
      expect(response.body.data.reviewedBy).toBeDefined();
      expect(response.body.data.reviewedAt).toBeDefined();
      expect(response.body.data.reason).toContain('ABGELEHNT: Insufficient grounds for deletion');

      // Clean up
      await prisma.gDPRRequest.delete({ where: { id: rejectRequest.id } });
      await prisma.user.delete({ where: { id: rejectUser.id } });
    });

    it('should reject request without reason', async () => {
      const rejectUser = await prisma.user.create({
        data: {
          email: `test.reject.noreason.user.${Date.now()}@app4kitas.de`,
          password: await require('bcryptjs').hash('testpassword', 10),
          name: 'Test Reject No Reason User',
          role: 'PARENT',
          phone: '+49123456782',
          institutionId: testData.institution.id
        }
      });

      const rejectRequest = await prisma.gDPRRequest.create({
        data: {
          userId: rejectUser.id,
          reason: 'Test reason',
          status: 'PENDING'
        }
      });

      const response = await request(app)
        .post(`/api/gdpr/requests/${rejectRequest.id}/reject`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Grund für die Ablehnung ist erforderlich');

      // Clean up
      await prisma.gDPRRequest.delete({ where: { id: rejectRequest.id } });
      await prisma.user.delete({ where: { id: rejectUser.id } });
    });

    it('should reject approval of non-pending request', async () => {
      const rejectUser = await prisma.user.create({
        data: {
          email: `test.reject.approved.user.${Date.now()}@app4kitas.de`,
          password: await require('bcryptjs').hash('testpassword', 10),
          name: 'Test Reject Approved User',
          role: 'PARENT',
          phone: '+49123456781',
          institutionId: testData.institution.id
        }
      });

      const rejectRequest = await prisma.gDPRRequest.create({
        data: {
          userId: rejectUser.id,
          reason: 'Test reason',
          status: 'APPROVED'
        }
      });

      const response = await request(app)
        .post(`/api/gdpr/requests/${rejectRequest.id}/reject`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          reason: 'Test rejection'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Anfrage kann nur abgelehnt werden, wenn sie ausstehend ist');

      // Clean up
      await prisma.gDPRRequest.delete({ where: { id: rejectRequest.id } });
      await prisma.user.delete({ where: { id: rejectUser.id } });
    });
  });

  describe('Activity Log Verification', () => {
    it('should create activity log entries for GDPR operations', async () => {
      const logs = await prisma.activityLog.findMany({
        where: {
          action: {
            in: ['GDPR_DELETE_REQUEST_CREATED', 'GDPR_DELETE_USER', 'GDPR_DELETE_REQUEST_REJECTED']
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      expect(logs.length).toBeGreaterThan(0);
      
      const gdprActions = logs.map(log => log.action);
      expect(gdprActions).toContain('GDPR_DELETE_REQUEST_CREATED');
      expect(gdprActions).toContain('GDPR_DELETE_USER');
    });
  });
}); 