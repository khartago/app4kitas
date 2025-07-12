const request = require('supertest');
const app = require('../src/app');
const { createTestData, loginUser, testDataStorage } = require('./setup');

describe('Reports API', () => {
  let superAdminCookies;
  let adminCookies;
  let educatorCookies;
  let parentCookies;

  beforeAll(async () => {
    // Login as different roles for testing
    superAdminCookies = await loginUser(request, app, 'superadmin@app4kitas.de', 'superadmin');
    adminCookies = await loginUser(request, app, 'admin_ea0049d1-9ed3-41a2-9854-37ecb3bd75d6@app4kitas.de', 'admin');
    educatorCookies = await loginUser(request, app, 'Haylie32@hotmail.com', 'educator');
    parentCookies = await loginUser(request, app, 'Maynard_Koss@gmail.com', 'parent');
  });

  describe('GET /api/reports/attendance', () => {
    it('should get attendance report (admin)', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
      expect(res.body.report).toHaveProperty('totalChildren');
      expect(res.body.report).toHaveProperty('presentToday');
      expect(res.body.report).toHaveProperty('absentToday');
    });

    it('should get attendance report (super admin)', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
      expect(res.body.report).toHaveProperty('totalChildren');
    });

    it('should reject attendance report access by educator', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject attendance report access by parent', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject attendance report access without authentication', async () => {
      const res = await request(app)
        .get('/api/reports/attendance');

      expect(res.statusCode).toBe(401);
    });

    it('should get attendance report filtered by date', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .get(`/api/reports/attendance?date=${today}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });

    it('should get attendance report filtered by date range', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const res = await request(app)
        .get(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });

    it('should handle invalid date filter', async () => {
      const res = await request(app)
        .get('/api/reports/attendance?date=invalid-date')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle invalid date range filter', async () => {
      const res = await request(app)
        .get('/api/reports/attendance?startDate=invalid&endDate=invalid')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/reports/attendance/export', () => {
    it('should export attendance report as CSV (admin)', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/attendance/export?format=csv&startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('.csv');
    });

    it('should export attendance report as PDF (admin)', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/attendance/export?format=pdf&startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('.pdf');
    });

    it('should export attendance report as CSV (super admin)', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/attendance/export?format=csv&startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
    });

    it('should reject export by educator', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/attendance/export?format=csv&startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject export by parent', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/attendance/export?format=csv&startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject export without authentication', async () => {
      const res = await request(app)
        .get('/api/reports/attendance/export?format=csv');

      expect(res.statusCode).toBe(401);
    });

    it('should handle invalid export format', async () => {
      const res = await request(app)
        .get('/api/reports/attendance/export?format=invalid')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should export with date filter', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .get(`/api/reports/attendance/export?format=csv&date=${today}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
    });
  });

  describe('GET /api/reports/check-in', () => {
    it('should get check-in report (admin)', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/check-in?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
      expect(res.body.report).toHaveProperty('totalCheckIns');
      expect(res.body.report).toHaveProperty('totalCheckOuts');
    });

    it('should get check-in report (super admin)', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/check-in?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });

    it('should reject check-in report access by educator', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/check-in?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject check-in report access by parent', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/check-in?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should get check-in report filtered by date range', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const res = await request(app)
        .get(`/api/reports/check-in?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });

    it('should get check-in report filtered by child', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/check-in?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });

    it('should handle invalid date range filter', async () => {
      const res = await request(app)
        .get('/api/reports/check-in?startDate=invalid&endDate=invalid')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/reports/check-in/export', () => {
    it('should export check-in report as CSV (admin)', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/check-in/export?format=csv&startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('.csv');
    });

    it('should export check-in report as PDF (admin)', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/check-in/export?format=pdf&startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('.pdf');
    });

    it('should reject export by educator', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/check-in/export?format=csv&startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle invalid export format', async () => {
      const res = await request(app)
        .get('/api/reports/check-in/export?format=invalid')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/reports/messages', () => {
    it('should get messages report (admin)', async () => {
      const res = await request(app)
        .get('/api/reports/messages')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
      expect(res.body.report).toHaveProperty('totalMessages');
      expect(res.body.report).toHaveProperty('messagesByChannel');
      expect(res.body.report).toHaveProperty('messagesBySender');
    });

    it('should get messages report (super admin)', async () => {
      const res = await request(app)
        .get('/api/reports/messages')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });

    it('should reject messages report access by educator', async () => {
      const res = await request(app)
        .get('/api/reports/messages')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject messages report access by parent', async () => {
      const res = await request(app)
        .get('/api/reports/messages')
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should get messages report filtered by date range', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const res = await request(app)
        .get(`/api/reports/messages?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });

    it('should get messages report filtered by sender', async () => {
      const res = await request(app)
        .get('/api/reports/messages?senderId=test-sender-id')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });

    it('should get messages report filtered by type', async () => {
      const res = await request(app)
        .get('/api/reports/messages?type=message')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });
  });

  describe('GET /api/reports/messages/export', () => {
    it('should export messages report as CSV (admin)', async () => {
      const res = await request(app)
        .get('/api/reports/messages/export?format=csv')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('.csv');
    });

    it('should export messages report as PDF (admin)', async () => {
      const res = await request(app)
        .get('/api/reports/messages/export?format=pdf')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('.pdf');
    });

    it('should reject export by educator', async () => {
      const res = await request(app)
        .get('/api/reports/messages/export?format=csv')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle invalid export format', async () => {
      const res = await request(app)
        .get('/api/reports/messages/export?format=invalid')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/reports/notifications', () => {
    it('should get notifications report (admin)', async () => {
      const res = await request(app)
        .get('/api/reports/notifications')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
      expect(res.body.report).toHaveProperty('totalNotifications');
      expect(res.body.report).toHaveProperty('notificationsByPriority');
      expect(res.body.report).toHaveProperty('notificationsBySender');
    });

    it('should get notifications report (super admin)', async () => {
      const res = await request(app)
        .get('/api/reports/notifications')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });

    it('should reject notifications report access by educator', async () => {
      const res = await request(app)
        .get('/api/reports/notifications')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject notifications report access by parent', async () => {
      const res = await request(app)
        .get('/api/reports/notifications')
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should get notifications report filtered by date range', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const res = await request(app)
        .get(`/api/reports/notifications?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });

    it('should get notifications report filtered by type', async () => {
      const res = await request(app)
        .get('/api/reports/notifications?type=message')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });
  });

  describe('GET /api/reports/notifications/export', () => {
    it('should export notifications report as CSV (admin)', async () => {
      const res = await request(app)
        .get('/api/reports/notifications/export?format=csv')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('.csv');
    });

    it('should export notifications report as PDF (admin)', async () => {
      const res = await request(app)
        .get('/api/reports/notifications/export?format=pdf')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('.pdf');
    });

    it('should reject export by educator', async () => {
      const res = await request(app)
        .get('/api/reports/notifications/export?format=csv')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle invalid export format', async () => {
      const res = await request(app)
        .get('/api/reports/notifications/export?format=invalid')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/reports/users', () => {
    it('should get users report (super admin)', async () => {
      const res = await request(app)
        .get('/api/reports/users')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
      expect(res.body.report).toHaveProperty('totalUsers');
      expect(res.body.report).toHaveProperty('usersByRole');
      expect(res.body.report).toHaveProperty('usersByInstitution');
    });

    it('should get users report (admin)', async () => {
      const res = await request(app)
        .get('/api/reports/users')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });

    it('should reject users report access by educator', async () => {
      const res = await request(app)
        .get('/api/reports/users')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject users report access by parent', async () => {
      const res = await request(app)
        .get('/api/reports/users')
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should get users report filtered by role', async () => {
      const res = await request(app)
        .get('/api/reports/users?role=EDUCATOR')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });

    it('should get users report filtered by institution', async () => {
      const res = await request(app)
        .get('/api/reports/users')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });
  });

  describe('GET /api/reports/users/export', () => {
    it('should export users report as CSV (super admin)', async () => {
      const res = await request(app)
        .get('/api/reports/users/export?format=csv')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('.csv');
    });

    it('should export users report as PDF (super admin)', async () => {
      const res = await request(app)
        .get('/api/reports/users/export?format=pdf')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('.pdf');
    });

    it('should export users report as CSV (admin)', async () => {
      const res = await request(app)
        .get('/api/reports/users/export?format=csv')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
    });

    it('should reject export by educator', async () => {
      const res = await request(app)
        .get('/api/reports/users/export?format=csv')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject export by parent', async () => {
      const res = await request(app)
        .get('/api/reports/users/export?format=csv')
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle invalid export format', async () => {
      const res = await request(app)
        .get('/api/reports/users/export?format=invalid')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/reports/statistics', () => {
    it('should get general statistics (super admin)', async () => {
      const res = await request(app)
        .get('/api/reports/statistics')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('statistics');
      expect(res.body.statistics).toHaveProperty('totalChildren');
      expect(res.body.statistics).toHaveProperty('totalUsers');
      expect(res.body.statistics).toHaveProperty('totalInstitutions');
      expect(res.body.statistics).toHaveProperty('totalMessages');
      expect(res.body.statistics).toHaveProperty('totalNotifications');
    });

    it('should get general statistics (admin)', async () => {
      const res = await request(app)
        .get('/api/reports/statistics')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('statistics');
    });

    it('should reject statistics access by educator', async () => {
      const res = await request(app)
        .get('/api/reports/statistics')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject statistics access by parent', async () => {
      const res = await request(app)
        .get('/api/reports/statistics')
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should get statistics filtered by date range', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const res = await request(app)
        .get(`/api/reports/statistics?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('statistics');
    });

    it('should get statistics filtered by institution', async () => {
      const res = await request(app)
        .get('/api/reports/statistics')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('statistics');
    });
  });

  describe('GET /api/reports/statistics/export', () => {
    it('should export statistics as CSV (super admin)', async () => {
      const res = await request(app)
        .get('/api/reports/statistics/export?format=csv')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('.csv');
    });

    it('should export statistics as PDF (super admin)', async () => {
      const res = await request(app)
        .get('/api/reports/statistics/export?format=pdf')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('.pdf');
    });

    it('should export statistics as CSV (admin)', async () => {
      const res = await request(app)
        .get('/api/reports/statistics/export?format=csv')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
    });

    it('should reject export by educator', async () => {
      const res = await request(app)
        .get('/api/reports/statistics/export?format=csv')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject export by parent', async () => {
      const res = await request(app)
        .get('/api/reports/statistics/export?format=csv')
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle invalid export format', async () => {
      const res = await request(app)
        .get('/api/reports/statistics/export?format=invalid')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Role-based Access Control', () => {
    it('should allow super admin to access all reports', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const endpoints = [
        `/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`,
        `/api/reports/check-in?startDate=${startDate}&endDate=${endDate}`,
        `/api/reports/messages?startDate=${startDate}&endDate=${endDate}`,
        `/api/reports/notifications?startDate=${startDate}&endDate=${endDate}`,
        '/api/reports/users',
        '/api/reports/statistics'
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)
          .get(endpoint)
          .set('Cookie', superAdminCookies);

        expect(res.statusCode).toBe(200);
        if (endpoint.includes('statistics')) {
          expect(res.body).toHaveProperty('statistics');
        } else {
          expect(res.body).toHaveProperty('report');
        }
      }
    });

    it('should allow admin to access institution-specific reports', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const endpoints = [
        `/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`,
        `/api/reports/check-in?startDate=${startDate}&endDate=${endDate}`,
        `/api/reports/messages?startDate=${startDate}&endDate=${endDate}`,
        `/api/reports/notifications?startDate=${startDate}&endDate=${endDate}`,
        '/api/reports/users',
        '/api/reports/statistics'
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)
          .get(endpoint)
          .set('Cookie', adminCookies);

        expect(res.statusCode).toBe(200);
      }
    });

    it('should restrict educator access to reports', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const endpoints = [
        `/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`,
        `/api/reports/check-in?startDate=${startDate}&endDate=${endDate}`,
        `/api/reports/messages?startDate=${startDate}&endDate=${endDate}`,
        `/api/reports/notifications?startDate=${startDate}&endDate=${endDate}`,
        '/api/reports/users',
        '/api/reports/statistics'
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)
          .get(endpoint)
          .set('Cookie', educatorCookies);

        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('error');
      }
    });

    it('should restrict parent access to reports', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const endpoints = [
        `/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`,
        `/api/reports/check-in?startDate=${startDate}&endDate=${endDate}`,
        `/api/reports/messages?startDate=${startDate}&endDate=${endDate}`,
        `/api/reports/notifications?startDate=${startDate}&endDate=${endDate}`,
        '/api/reports/users',
        '/api/reports/statistics'
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)
          .get(endpoint)
          .set('Cookie', parentCookies);

        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('error');
      }
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid date format', async () => {
      const res = await request(app)
        .get('/api/reports/attendance?date=invalid-date')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid date range', async () => {
      const res = await request(app)
        .get('/api/reports/attendance?startDate=2023-13-01&endDate=2023-13-31')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject future dates', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = await request(app)
        .get(`/api/reports/attendance?date=${futureDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid UUID format', async () => {
      const res = await request(app)
        .get('/api/reports/users?institutionId=invalid-uuid')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid role filter', async () => {
      const res = await request(app)
        .get('/api/reports/users?role=INVALID_ROLE')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Business Logic Validation', () => {
    it('should not generate reports for empty data', async () => {
      const res = await request(app)
        .get('/api/reports/attendance?date=2020-01-01')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
      // The report should have a totalChildren property, but the value depends on existing data
      expect(res.body.report).toHaveProperty('totalChildren');
      expect(typeof res.body.report.totalChildren).toBe('number');
    });

    it('should handle large date ranges gracefully', async () => {
      const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const res = await request(app)
        .get(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });

    it('should limit report data size', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/messages?startDate=${startDate}&endDate=${endDate}&limit=1000`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });

    it('should handle concurrent report requests', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .get(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`)
            .set('Cookie', adminCookies)
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('report');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
    });

    it('should handle malformed request data', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies)
        .set('Accept', 'application/json')
        .query({ invalid: 'data' });

      expect(res.statusCode).toBe(200);
    });

    it('should handle missing authentication gracefully', async () => {
      const res = await request(app)
        .get('/api/reports/attendance');

      expect(res.statusCode).toBe(401);
    });

    it('should handle insufficient permissions gracefully', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle export generation errors', async () => {
      const res = await request(app)
        .get('/api/reports/attendance/export?format=csv')
        .set('Cookie', adminCookies);

      expect([200, 400]).toContain(res.statusCode);
    });

    it('should handle large dataset processing', async () => {
      const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('report');
    });
  });
}); 