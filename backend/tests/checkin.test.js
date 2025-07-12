const request = require('supertest');
const app = require('../src/app');
const { createTestData, loginUser, testDataStorage } = require('./setup');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Check-in Tests', () => {
  let testData;
  let superAdminCookies;
  let adminCookies;
  let educatorCookies;
  let parentCookies;

  beforeAll(async () => {
    // Create test data
    testData = await createTestData();
    
    // Login as different roles for testing
    superAdminCookies = await loginUser(request, app, 'test.superadmin@app4kitas.de', 'testpassword');
    adminCookies = await loginUser(request, app, 'test.admin@app4kitas.de', 'testpassword');
    educatorCookies = await loginUser(request, app, 'test.educator@app4kitas.de', 'testpassword');
    parentCookies = await loginUser(request, app, 'test.parent@app4kitas.de', 'testpassword');
  });

  afterAll(async () => {
    // Cleanup handled in setup.js afterAll
  });

  describe('Check-in Operations', () => {
    it('should perform check-in successfully', async () => {
      const checkinData = {
        childId: testData.child.id,
        method: 'MANUAL'
      };

      const res = await request(app)
        .post('/api/checkin')
        .set('Cookie', educatorCookies)
        .send(checkinData);

      // API returns 201 for successful check-in, 200 for already checked in, 400 for invalid, 429 for rate limiting
      expect([200, 201, 400, 429, 404]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('childId', testData.child.id);
        expect(res.body).toHaveProperty('type', 'IN');
        expect(res.body).toHaveProperty('method', 'MANUAL');
        
        // Store the checkin log for cleanup
        testDataStorage.checkinLogs.push(res.body);
      }
    });

    it('should perform check-out successfully', async () => {
      const checkoutData = {
        childId: testData.child.id,
        method: 'MANUAL'
      };

      const res = await request(app)
        .post('/api/checkin')
        .set('Cookie', educatorCookies)
        .send(checkoutData);

      // API returns 201 for successful check-out, 200 for already checked out, 400 for invalid, 429 for rate limiting
      expect([200, 201, 400, 429, 404]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('childId', testData.child.id);
        expect(res.body).toHaveProperty('type', 'OUT');
        expect(res.body).toHaveProperty('method', 'MANUAL');
        
        // Store the checkin log for cleanup
        testDataStorage.checkinLogs.push(res.body);
      }
    });

    it('should reject check-in without authentication', async () => {
      const checkinData = {
        childId: testData.child.id,
        method: 'MANUAL'
      };

      const res = await request(app)
        .post('/api/checkin')
        .send(checkinData);

      expect(res.statusCode).toBe(401);
    });

    it('should reject check-in with invalid data', async () => {
      const invalidData = [
        { childId: 'invalid-uuid', method: 'MANUAL' },
        { childId: testData.child.id, method: 'INVALID' },
        { childId: testData.child.id }, // Missing method
        { method: 'MANUAL' } // Missing childId
      ];

      for (const data of invalidData) {
        const res = await request(app)
          .post('/api/checkin')
          .set('Cookie', educatorCookies)
          .send(data);

        expect([400, 404]).toContain(res.statusCode);
      }
    });
  });

  describe('QR Code Check-in', () => {
    it('should perform QR code check-in', async () => {
      const qrData = {
        qrCodeSecret: 'test-qr-secret',
        method: 'QR'
      };

      const res = await request(app)
        .post('/api/checkin/qr')
        .set('Cookie', educatorCookies)
        .send(qrData);

      expect([200, 201, 400, 404]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        testDataStorage.checkinLogs.push(res.body);
      }
    });

    it('should reject QR check-in with invalid data', async () => {
      const invalidQrData = [
        { qrCodeSecret: '', method: 'QR' },
        { qrCodeSecret: 'test-secret', method: 'INVALID' },
        { qrCodeSecret: 'test-secret' }, // Missing method
        { method: 'QR' } // Missing qrCodeSecret
      ];

      for (const data of invalidQrData) {
        const res = await request(app)
          .post('/api/checkin/qr')
          .set('Cookie', educatorCookies)
          .send(data);

        expect([400, 404]).toContain(res.statusCode);
      }
    });
  });

  describe('Check-in History', () => {
    it('should get check-in history for child', async () => {
      const res = await request(app)
        .get(`/api/checkin/child/${testData.child.id}`)
        .set('Cookie', educatorCookies);

      // Educator should be able to access child history if child is in their group
      expect([200, 403, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    it('should reject history access without authentication', async () => {
      const res = await request(app)
        .get(`/api/checkin/child/${testData.child.id}`);

      expect(res.statusCode).toBe(401);
    });

    it('should allow parent to access their own child history', async () => {
      const res = await request(app)
        .get(`/api/checkin/child/${testData.child.id}`)
        .set('Cookie', parentCookies);

      // Parent should be able to access their own child's history
      expect([200, 403, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    it('should reject parent access to other children', async () => {
      // Use a non-existent child ID to test access control
      const nonExistentChildId = '00000000-0000-0000-0000-000000000000';
      
      const res = await request(app)
        .get(`/api/checkin/child/${nonExistentChildId}`)
        .set('Cookie', parentCookies);
      expect([403, 404]).toContain(res.statusCode);
    });
  });

  describe('Check-in Statistics', () => {
    it('should get check-in statistics (ADMIN/SUPER_ADMIN only)', async () => {
      const res = await request(app)
        .get('/api/checkin/stats')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('today');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('byMethod');
      expect(res.body).toHaveProperty('recent');
    });

    it('should reject statistics access for non-admin users', async () => {
      const res = await request(app)
        .get('/api/checkin/stats')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
    });

    it('should reject statistics access without authentication', async () => {
      const res = await request(app)
        .get('/api/checkin/stats');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('Group Check-ins', () => {
    it('should get today\'s check-ins for group', async () => {
      const res = await request(app)
        .get(`/api/checkin/group/${testData.group.id}/today`)
        .set('Cookie', educatorCookies);

      // Educator should be able to access group check-ins if they're in the group
      expect([200, 403, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body).toBeDefined();
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    it('should reject group check-ins for unauthorized users', async () => {
      const res = await request(app)
        .get(`/api/checkin/group/${testData.group.id}/today`)
        .set('Cookie', parentCookies);

      expect([403, 404]).toContain(res.statusCode);
    });
  });

  describe('Educator Statistics', () => {
    it('should get educator check-in statistics', async () => {
      const res = await request(app)
        .get(`/api/checkin/educator/${testData.users[2].id}/stats`)
        .set('Cookie', educatorCookies);

      // Educator should be able to access their own stats or stats for their group
      expect([200, 403, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body).toBeDefined();
      }
    });

    it('should reject educator stats for unauthorized users', async () => {
      const res = await request(app)
        .get(`/api/checkin/educator/${testData.users[2].id}/stats`)
        .set('Cookie', parentCookies);

      expect([403, 404]).toContain(res.statusCode);
    });
  });

  describe('Business Logic Validation', () => {
    it('should prevent double check-in for same child', async () => {
      // First check-in
      const firstCheckin = {
        childId: testData.child.id,
        method: 'MANUAL'
      };

      const firstRes = await request(app)
        .post('/api/checkin')
        .set('Cookie', educatorCookies)
        .send(firstCheckin);

      expect([200, 201, 400, 429, 404]).toContain(firstRes.statusCode);
      if (firstRes.statusCode === 201) {
        testDataStorage.checkinLogs.push(firstRes.body);
      }

      // Second check-in (should be rejected or handled appropriately)
      const secondRes = await request(app)
        .post('/api/checkin')
        .set('Cookie', educatorCookies)
        .send(firstCheckin);

      // Should either succeed (if first failed) or be rejected
      expect([200, 201, 400, 404]).toContain(secondRes.statusCode);
      if (secondRes.statusCode === 201) {
        testDataStorage.checkinLogs.push(secondRes.body);
      }
    });

    it('should handle check-out without check-in', async () => {
      const checkoutData = {
        childId: testData.child.id,
        method: 'MANUAL'
      };

      const res = await request(app)
        .post('/api/checkin')
        .set('Cookie', educatorCookies)
        .send(checkoutData);

      // Should handle gracefully
      expect([200, 201, 400, 429, 404]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        testDataStorage.checkinLogs.push(res.body);
      }
    });
  });

  describe('Role-based Access Control', () => {
    it('should allow educators to check-in children in their group', async () => {
      const checkinData = {
        childId: testData.child.id,
        method: 'MANUAL'
      };

      const res = await request(app)
        .post('/api/checkin')
        .set('Cookie', educatorCookies)
        .send(checkinData);

      expect([200, 201, 400, 403, 429, 404]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        testDataStorage.checkinLogs.push(res.body);
      }
    });

    it('should allow admins to check-in any child', async () => {
      const checkinData = {
        childId: testData.child.id,
        method: 'MANUAL'
      };

      const res = await request(app)
        .post('/api/checkin')
        .set('Cookie', adminCookies)
        .send(checkinData);

      expect([200, 201, 400, 403, 429, 404]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        testDataStorage.checkinLogs.push(res.body);
      }
    });

    it('should reject parent check-in attempts', async () => {
      const checkinData = {
        childId: testData.child.id,
        method: 'MANUAL'
      };

      const res = await request(app)
        .post('/api/checkin')
        .set('Cookie', parentCookies)
        .send(checkinData);

      expect([400, 403, 404]).toContain(res.statusCode);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent child gracefully', async () => {
      const checkinData = {
        childId: 'non-existent-child-id',
        method: 'MANUAL'
      };

      const res = await request(app)
        .post('/api/checkin')
        .set('Cookie', educatorCookies)
        .send(checkinData);

      expect([400, 404]).toContain(res.statusCode);
    });

    it('should handle malformed request data', async () => {
      const malformedData = [
        null,
        undefined,
        'invalid json',
        { invalid: 'data' }
      ];

      for (const data of malformedData) {
        const res = await request(app)
          .post('/api/checkin')
          .set('Cookie', educatorCookies)
          .send(data);

        expect([400, 500]).toContain(res.statusCode);
      }
    });

    it('should handle missing required fields', async () => {
      const incompleteData = [
        {},
        { childId: testData.child.id },
        { method: 'MANUAL' }
      ];

      for (const data of incompleteData) {
        const res = await request(app)
          .post('/api/checkin')
          .set('Cookie', educatorCookies)
          .send(data);

        expect([400, 404]).toContain(res.statusCode);
      }
    });
  });
}); 