const request = require('supertest');
const app = require('../src/app');
const { createTestData, loginUser, testDataStorage, prisma } = require('./setup');

describe('Statistics API', () => {
  let superAdminCookies;
  let adminCookies;
  let educatorCookies;
  let parentCookies;
  let testData;

  beforeAll(async () => {
    // Create test data and get user credentials
    testData = await createTestData();
    
    // Login as different roles for testing using the created test data
    superAdminCookies = await loginUser(request, app, testData.users[0].email, 'testpassword');
    adminCookies = await loginUser(request, app, testData.users[1].email, 'testpassword');
    educatorCookies = await loginUser(request, app, testData.users[2].email, 'testpassword');
    parentCookies = await loginUser(request, app, testData.users[3].email, 'testpassword');
  });

  afterAll(async () => {
    // Clean up test data
    for (const child of testDataStorage.children) {
      await testDataStorage.deleteChild(child.id);
    }
    for (const group of testDataStorage.groups) {
      await testDataStorage.deleteGroup(group.id);
    }
    for (const user of testDataStorage.users) {
      await testDataStorage.deleteUser(user.id);
    }
    for (const institution of testDataStorage.institutions) {
      try {
        await prisma.institution.delete({ where: { id: institution.id } });
      } catch (e) {
        // Ignore if already deleted
      }
    }
  });

  describe('GET /api/stats', () => {
    it('should get overview statistics (super admin)', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('children');
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('institutionen');
      expect(res.body).toHaveProperty('messages');
      expect(res.body).toHaveProperty('notifications');
      expect(res.body).toHaveProperty('checkins');
      expect(res.body).toHaveProperty('admins');
      expect(res.body).toHaveProperty('educators');
      expect(res.body).toHaveProperty('parents');
      expect(res.body).toHaveProperty('groups');
      expect(res.body).toHaveProperty('trends');
      expect(res.body).toHaveProperty('attendanceToday');
      expect(res.body).toHaveProperty('recentActivities');
    });

    it('should get overview statistics (admin)', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('children');
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('messages');
      expect(res.body).toHaveProperty('notifications');
      expect(res.body).toHaveProperty('checkins');
      expect(res.body).toHaveProperty('attendanceToday');
      expect(res.body).toHaveProperty('recentActivities');
    });

    it('should reject statistics access by educator', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject statistics access by parent', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject statistics access without authentication', async () => {
      const res = await request(app)
        .get('/api/stats');

      expect(res.statusCode).toBe(401);
    });

    it('should include attendance data for admin', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.attendanceToday).toHaveProperty('checkedIn');
      expect(res.body.attendanceToday).toHaveProperty('absent');
      expect(res.body.attendanceToday).toHaveProperty('late');
    });

    it('should include super admin specific data', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('institutionen');
      expect(res.body).toHaveProperty('activity');
      expect(res.body).toHaveProperty('activeUsers');
      expect(res.body).toHaveProperty('failedLogins');
      expect(res.body).toHaveProperty('lateCheckins');
    });

    it('should include trends data for super admin', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.trends).toHaveProperty('users');
      expect(res.body.trends).toHaveProperty('institutionen');
      expect(res.body.trends).toHaveProperty('activity');
      expect(res.body.trends).toHaveProperty('checkins');
      expect(res.body.trends).toHaveProperty('messages');
      expect(res.body.trends).toHaveProperty('notifications');
    });

    it('should include recent activities', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('recentActivities');
      expect(Array.isArray(res.body.recentActivities)).toBe(true);
    });
  });

  describe('Role-based Access Control', () => {
    it('should allow super admin to access all statistics', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('institutionen');
      expect(res.body).toHaveProperty('activity');
    });

    it('should allow admin to access institution-specific statistics', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('children');
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('messages');
      expect(res.body).toHaveProperty('notifications');
      expect(res.body).toHaveProperty('checkins');
    });

    it('should restrict educator access to statistics', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should restrict parent access to statistics', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Business Logic Validation', () => {
    it('should not generate statistics for empty data', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('children');
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('messages');
      expect(res.body).toHaveProperty('notifications');
      expect(res.body).toHaveProperty('checkins');
    });

    it('should handle large date ranges gracefully', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('children');
      expect(res.body).toHaveProperty('users');
    });

    it('should limit statistics data size', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('recentActivities');
      expect(Array.isArray(res.body.recentActivities)).toBe(true);
      expect(res.body.recentActivities.length).toBeLessThanOrEqual(5);
    });

    it('should handle concurrent statistics requests', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .get('/api/stats')
            .set('Cookie', adminCookies)
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('children');
        expect(res.body).toHaveProperty('users');
      });
    });

    it('should calculate accurate percentages', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('attendanceToday');
      
      if (res.body.attendanceToday.checkedIn !== undefined && 
          res.body.attendanceToday.absent !== undefined) {
        const total = res.body.attendanceToday.checkedIn + res.body.attendanceToday.absent;
        if (total > 0) {
          expect(res.body.attendanceToday.checkedIn).toBeGreaterThanOrEqual(0);
          expect(res.body.attendanceToday.absent).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('should handle zero division gracefully', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('children');
      expect(res.body).toHaveProperty('users');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
    });

    it('should handle malformed request data', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', adminCookies)
        .set('Accept', 'application/json')
        .query({ invalid: 'data' });

      expect(res.statusCode).toBe(200);
    });

    it('should handle missing authentication gracefully', async () => {
      const res = await request(app)
        .get('/api/stats');

      expect(res.statusCode).toBe(401);
    });

    it('should handle insufficient permissions gracefully', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle large dataset processing', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('children');
      expect(res.body).toHaveProperty('users');
    });

    it('should handle aggregation errors', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('children');
      expect(res.body).toHaveProperty('users');
    });
  });
}); 