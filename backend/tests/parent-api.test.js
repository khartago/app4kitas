const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const { createTestData, prisma } = require('./setup');

describe('Parent API Tests', () => {
  let testData;
  let parentUser;
  let adminUser;
  let testChild;
  let parentCookies;
  let adminCookies;

  beforeAll(async () => {
    testData = await createTestData();
    
    // Use the test data from setup
    parentUser = testData.users.find(u => u.role === 'PARENT');
    adminUser = testData.users.find(u => u.role === 'ADMIN');
    testChild = testData.child;
    
    // Get authentication cookies
    const parentLogin = await request(app)
      .post('/api/login')
      .send({ email: parentUser.email, password: 'testpassword' });
    parentCookies = parentLogin.headers['set-cookie'];

    const adminLogin = await request(app)
      .post('/api/login')
      .send({ email: adminUser.email, password: 'testpassword' });
    adminCookies = adminLogin.headers['set-cookie'];
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/parent/children', () => {
    it('should return all children for authenticated parent', async () => {
      const response = await request(app)
        .get('/api/parent/children')
        .set('Cookie', parentCookies);

      expect(response.status).toBe(200);
      expect(response.body.children).toBeDefined();
      expect(Array.isArray(response.body.children)).toBe(true);
      expect(response.body.children.length).toBeGreaterThan(0);
      
      const child = response.body.children.find(c => c.id === testChild.id);
      expect(child).toBeDefined();
      expect(child.name).toContain('Test Child');
    });

    it('should reject access for non-parent users', async () => {
      const response = await request(app)
        .get('/api/parent/children')
        .set('Cookie', adminCookies);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Nur Eltern können auf diese Route zugreifen');
    });

    it('should reject access without authentication', async () => {
      const response = await request(app)
        .get('/api/parent/children');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/parent/children/:id', () => {
    it('should return specific child details for parent', async () => {
      const response = await request(app)
        .get(`/api/parent/children/${testChild.id}`)
        .set('Cookie', parentCookies);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testChild.id);
      expect(response.body.name).toContain('Test Child');
      expect(response.body.parents).toBeDefined();
      expect(Array.isArray(response.body.parents)).toBe(true);
    });

    it('should reject access to child not linked to parent', async () => {
      // Create another child not linked to parent
      const otherChild = await prisma.child.create({
        data: {
          name: 'Other Child',
          birthdate: new Date('2020-01-01'),
          institutionId: testData.institution.id,
          qrCodeSecret: 'other-qr-secret'
        }
      });
      
      const response = await request(app)
        .get(`/api/parent/children/${otherChild.id}`)
        .set('Cookie', parentCookies);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Kind nicht gefunden oder keine Berechtigung');
      
      // Clean up
      await prisma.child.delete({ where: { id: otherChild.id } });
    });

    it('should reject access for non-parent users', async () => {
      const response = await request(app)
        .get(`/api/parent/children/${testChild.id}`)
        .set('Cookie', adminCookies);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/parent/consent', () => {
    it('should allow parent to give consent', async () => {
      const response = await request(app)
        .put('/api/parent/consent')
        .set('Cookie', parentCookies)
        .send({ consentGiven: true });

      expect(response.status).toBe(200);
      expect(response.body.consentGiven).toBe(true);
      expect(response.body.consentDate).toBeDefined();
    });

    it('should allow parent to withdraw consent', async () => {
      const response = await request(app)
        .put('/api/parent/consent')
        .set('Cookie', parentCookies)
        .send({ consentGiven: false });

      expect(response.status).toBe(200);
      expect(response.body.consentGiven).toBe(false);
      expect(response.body.consentDate).toBeNull();
    });

    it('should reject invalid consent value', async () => {
      const response = await request(app)
        .put('/api/parent/consent')
        .set('Cookie', parentCookies)
        .send({ consentGiven: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('consentGiven (Boolean) erforderlich');
    });

    it('should reject access for non-parent users', async () => {
      const response = await request(app)
        .put('/api/parent/consent')
        .set('Cookie', adminCookies)
        .send({ consentGiven: true });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/parent/consent-status', () => {
    it('should return consent status for all children', async () => {
      const response = await request(app)
        .get('/api/parent/consent-status')
        .set('Cookie', parentCookies);

      expect(response.status).toBe(200);
      expect(response.body.consentStatus).toBeDefined();
      expect(Array.isArray(response.body.consentStatus)).toBe(true);
      
      const childStatus = response.body.consentStatus.find(c => c.childId === testChild.id);
      expect(childStatus).toBeDefined();
      expect(childStatus.childName).toContain('Test Child');
      expect(typeof childStatus.consentGiven).toBe('boolean');
      expect(response.body.parentConsent).toBeDefined();
      expect(typeof response.body.parentConsent).toBe('boolean');
    });

    it('should reject access for non-parent users', async () => {
      const response = await request(app)
        .get('/api/parent/consent-status')
        .set('Cookie', adminCookies);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/parent/notifications', () => {
    it('should return notifications for parent', async () => {
      const response = await request(app)
        .get('/api/parent/notifications')
        .set('Cookie', parentCookies);

      expect(response.status).toBe(200);
      expect(response.body.notifications).toBeDefined();
      expect(Array.isArray(response.body.notifications)).toBe(true);
    });

    it('should reject access for non-parent users', async () => {
      const response = await request(app)
        .get('/api/parent/notifications')
        .set('Cookie', adminCookies);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/parent/request-consent/:childId', () => {
    it('should allow admin to request consent', async () => {
      const response = await request(app)
        .post(`/api/parent/request-consent/${testChild.id}`)
        .set('Cookie', adminCookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Einwilligungsanfrage an');
    });

    it('should reject access for non-admin users', async () => {
      const response = await request(app)
        .post(`/api/parent/request-consent/${testChild.id}`)
        .set('Cookie', parentCookies);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Nur Admins können Einwilligungsanfragen senden');
    });

    it('should reject request for child not in admin institution', async () => {
      // Create child in different institution
      const otherInstitution = await prisma.institution.create({
        data: {
          name: 'Other Institution',
          address: 'Other Address'
        }
      });
      
      const otherChild = await prisma.child.create({
        data: {
          name: 'Other Child',
          birthdate: new Date('2020-01-01'),
          institutionId: otherInstitution.id,
          qrCodeSecret: 'other-qr-secret'
        }
      });
      
      const response = await request(app)
        .post(`/api/parent/request-consent/${otherChild.id}`)
        .set('Cookie', adminCookies);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Kind nicht gefunden oder keine Berechtigung');
      
      // Clean up
      await prisma.child.delete({ where: { id: otherChild.id } });
      await prisma.institution.delete({ where: { id: otherInstitution.id } });
    });

    it('should reject request for child without parents', async () => {
      const childWithoutParents = await prisma.child.create({
        data: {
          name: 'Child Without Parents',
          birthdate: new Date('2020-01-01'),
          institutionId: testData.institution.id,
          qrCodeSecret: 'child-without-parents-secret'
        }
      });
      
      const response = await request(app)
        .post(`/api/parent/request-consent/${childWithoutParents.id}`)
        .set('Cookie', adminCookies);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Kind hat keine zugeordneten Eltern');
      
      // Clean up
      await prisma.child.delete({ where: { id: childWithoutParents.id } });
    });
  });

  describe('Activity Logging', () => {
    it('should log consent changes', async () => {
      // Give consent
      await request(app)
        .put('/api/parent/consent')
        .set('Cookie', parentCookies)
        .send({ consentGiven: true });

      // Check activity log
      const activities = await prisma.activityLog.findMany({
        where: {
          userId: parentUser.id,
          action: 'GDPR_PARENT_CONSENT_CHANGED'
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      });

      expect(activities.length).toBeGreaterThan(0);
      expect(activities[0].details).toContain('Elternteil');
      // Check that it contains either 'gegeben' or 'entzogen'
      expect(activities[0].details).toMatch(/gegeben|entzogen/);
    });

    it('should log consent requests', async () => {
      // Request consent
      await request(app)
        .post(`/api/parent/request-consent/${testChild.id}`)
        .set('Cookie', adminCookies);

      // Check activity log
      const activities = await prisma.activityLog.findMany({
        where: {
          userId: adminUser.id,
          action: 'GDPR_CONSENT_REQUEST_SENT'
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      });

      expect(activities.length).toBeGreaterThan(0);
      expect(activities[0].details).toContain('Einwilligungsanfrage für');
    });
  });

  describe('Notification System', () => {
    it('should create consent request notifications', async () => {
      // Request consent
      await request(app)
        .post(`/api/parent/request-consent/${testChild.id}`)
        .set('Cookie', adminCookies);

      // Check notifications
      const notifications = await prisma.notificationLog.findMany({
        where: {
          userId: parentUser.id,
          title: 'DSGVO Einwilligung erforderlich'
        }
      });

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].body).toContain('Test Child');
      expect(notifications[0].priority).toBe('high');
    });
  });
}); 