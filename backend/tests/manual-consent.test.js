const request = require('supertest');
const app = require('../src/app');
const { createTestData, loginUser, maybeSetCookie, prisma } = require('./setup');

describe('Manual Consent Tests', () => {
  let testData;
  let adminCookies;
  let superAdminCookies;
  let parentCookies;
  let educatorCookies;

  beforeEach(async () => {
    // Create unique test data for each test
    testData = await createTestData({
      institutionName: `Manual Consent Test Kita ${Date.now()}`,
      adminEmail: `admin-manual-consent-${Date.now()}@test.de`,
      parentEmail: `parent-manual-consent-${Date.now()}@test.de`,
      educatorEmail: `educator-manual-consent-${Date.now()}@test.de`,
      childName: `Manual Consent Child ${Date.now()}`,
      groupName: `Manual Consent Group ${Date.now()}`
    });

    // Create super admin user
    const superAdminUser = await prisma.user.create({
      data: {
        email: `superadmin-manual-consent-${Date.now()}@test.de`,
        password: await require('bcrypt').hash('testpass123', 10),
        name: 'Super Admin Manual Consent',
        role: 'SUPER_ADMIN'
      }
    });

    // Login all users
    adminCookies = await loginUser(testData.adminUser.email, 'testpass123');
    superAdminCookies = await loginUser(superAdminUser.email, 'testpass123');
    parentCookies = await loginUser(testData.parentUser.email, 'testpass123');
    educatorCookies = await loginUser(testData.educatorUser.email, 'testpass123');

    // Clean up super admin after test
    testData.superAdminUser = superAdminUser;
  });

  afterEach(async () => {
    // Clean up test data
    if (testData.superAdminUser) {
      await prisma.user.delete({ where: { id: testData.superAdminUser.id } });
    }
  });

  describe('Manual Consent Management', () => {
    test('should allow SUPER_ADMIN to set manual consent for any child', async () => {
      const response = await request(app)
        .post(`/children/${testData.child.id}/manual-consent`)
        .set('Cookie', superAdminCookies)
        .send({
          manualConsentGiven: true,
          manualConsentDate: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.manualConsentGiven).toBe(true);
      expect(response.body.manualConsentDate).toBeTruthy();
    });

    test('should allow ADMIN to set manual consent for child in their institution', async () => {
      const response = await request(app)
        .post(`/children/${testData.child.id}/manual-consent`)
        .set('Cookie', adminCookies)
        .send({
          manualConsentGiven: true,
          manualConsentDate: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.manualConsentGiven).toBe(true);
    });

    test('should not allow ADMIN to set manual consent for child in different institution', async () => {
      // Create another institution and child
      const otherInstitution = await prisma.institution.create({
        data: {
          name: `Other Institution ${Date.now()}`,
          address: 'Other Address'
        }
      });

      const otherChild = await prisma.child.create({
        data: {
          name: `Other Child ${Date.now()}`,
          birthdate: new Date('2018-01-01T00:00:00.000Z'),
          institutionId: otherInstitution.id,
          qrCodeSecret: `other-qr-secret-${Date.now()}`
        }
      });

      const response = await request(app)
        .post(`/children/${otherChild.id}/manual-consent`)
        .set('Cookie', adminCookies)
        .send({
          manualConsentGiven: true,
          manualConsentDate: new Date().toISOString()
        });

      expect(response.status).toBe(403);

      // Clean up
      await prisma.child.delete({ where: { id: otherChild.id } });
      await prisma.institution.delete({ where: { id: otherInstitution.id } });
    });

    test('should not allow non-admin users to set manual consent', async () => {
      const response = await request(app)
        .post(`/children/${testData.child.id}/manual-consent`)
        .set('Cookie', educatorCookies)
        .send({
          manualConsentGiven: true,
          manualConsentDate: new Date().toISOString()
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Consent Enforcement', () => {
    test('should block check-in without consent', async () => {
      const response = await request(app)
        .post('/checkin')
        .set('Cookie', educatorCookies)
        .send({
          childId: testData.child.id,
          method: 'MANUAL'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Einwilligung');
    });

    test('should allow check-in with manual consent', async () => {
      // Set manual consent first
      await request(app)
        .post(`/children/${testData.child.id}/manual-consent`)
        .set('Cookie', adminCookies)
        .send({
          manualConsentGiven: true,
          manualConsentDate: new Date().toISOString()
        });

      const response = await request(app)
        .post('/checkin')
        .set('Cookie', educatorCookies)
        .send({
          childId: testData.child.id,
          method: 'MANUAL'
        });

      expect(response.status).toBe(201);
    });

    test('should allow check-in with parent app consent', async () => {
      // Set parent consent
      await prisma.user.update({
        where: { id: testData.parentUser.id },
        data: {
          consentGiven: true,
          consentDate: new Date()
        }
      });

      const response = await request(app)
        .post('/checkin')
        .set('Cookie', educatorCookies)
        .send({
          childId: testData.child.id,
          method: 'MANUAL'
        });

      expect(response.status).toBe(201);
    });

    test('should block note creation without consent', async () => {
      const response = await request(app)
        .post('/notes')
        .set('Cookie', educatorCookies)
        .send({
          childId: testData.child.id,
          content: 'Test note content'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Einwilligung');
    });

    test('should allow note creation with manual consent', async () => {
      // Set manual consent first
      await request(app)
        .post(`/children/${testData.child.id}/manual-consent`)
        .set('Cookie', adminCookies)
        .send({
          manualConsentGiven: true,
          manualConsentDate: new Date().toISOString()
        });

      const response = await request(app)
        .post('/notes')
        .set('Cookie', educatorCookies)
        .send({
          childId: testData.child.id,
          content: 'Test note content'
        });

      expect(response.status).toBe(201);
    });
  });

  describe('Activity Logging', () => {
    test('should log manual consent activity', async () => {
      const response = await request(app)
        .post(`/children/${testData.child.id}/manual-consent`)
        .set('Cookie', adminCookies)
        .send({
          manualConsentGiven: true,
          manualConsentDate: new Date().toISOString()
        });

      expect(response.status).toBe(200);

      // Check activity log
      const activities = await prisma.activityLog.findMany({
        where: {
          userId: testData.adminUser.id,
          action: 'MANUAL_CONSENT_SET'
        }
      });

      expect(activities.length).toBeGreaterThan(0);
      expect(activities[0].entityType).toBe('Child');
      expect(activities[0].entityId).toBe(testData.child.id);
    });
  });

  describe('Consent Status Integration', () => {
    test('should return consent status in child details', async () => {
      // Set manual consent
      await request(app)
        .post(`/children/${testData.child.id}/manual-consent`)
        .set('Cookie', adminCookies)
        .send({
          manualConsentGiven: true,
          manualConsentDate: new Date().toISOString()
        });

      const response = await request(app)
        .get(`/children/${testData.child.id}`)
        .set('Cookie', adminCookies);

      expect(response.status).toBe(200);
      expect(response.body.manualConsentGiven).toBe(true);
      expect(response.body.manualConsentDate).toBeTruthy();
    });

    test('should show consent status in child list', async () => {
      // Set manual consent
      await request(app)
        .post(`/children/${testData.child.id}/manual-consent`)
        .set('Cookie', adminCookies)
        .send({
          manualConsentGiven: true,
          manualConsentDate: new Date().toISOString()
        });

      const response = await request(app)
        .get('/children')
        .set('Cookie', adminCookies);

      expect(response.status).toBe(200);
      const child = response.body.find(c => c.id === testData.child.id);
      expect(child.manualConsentGiven).toBe(true);
    });
  });
}); 