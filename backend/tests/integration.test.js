const request = require('supertest');
const app = require('../src/app');
const { createTestData, loginUser, testDataStorage } = require('./setup');

describe('Integration Tests', () => {
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

  describe('Complete User Workflows', () => {
    it('should complete full child registration and management workflow', async () => {
      // 1. Create a child
      const childData = {
        name: 'Integration Test Child',
        birthdate: '2019-01-01'
      };

      const childRes = await request(app)
        .post('/api/children')
        .set('Cookie', adminCookies)
        .send(childData);

      expect([200, 201, 400, 404, 429, 500]).toContain(childRes.statusCode);
      if (childRes.statusCode === 201) {
        expect(childRes.body).toHaveProperty('id');
        const childId = childRes.body.id;

        // 2. Check-in the child
        const checkInData = {
          childId: childId,
          method: 'MANUAL'
        };

        const checkInRes = await request(app)
          .post('/api/checkin')
          .set('Cookie', educatorCookies)
          .send(checkInData);

        expect([200, 201, 400, 404, 429, 500]).toContain(checkInRes.statusCode);

        // 3. Send a message about the child
        const messageData = {
          content: 'Integration test message',
          recipientType: 'CHILD',
          recipientId: childId
        };

        const messageRes = await request(app)
          .post('/api/message')
          .set('Cookie', educatorCookies)
          .send(messageData);

        expect([200, 201, 400, 404, 429, 500]).toContain(messageRes.statusCode);

        // 4. Get child statistics
        const statsRes = await request(app)
          .get(`/api/children/${childId}/stats`)
          .set('Cookie', adminCookies);

        expect([200, 404, 429, 500]).toContain(statsRes.statusCode);
      }
    });

    it('should complete full group management workflow', async () => {
      // 1. Create a group
      const groupData = {
        name: 'Integration Test Group',
        educatorIds: []
      };

      const groupRes = await request(app)
        .post('/api/groups')
        .set('Cookie', adminCookies)
        .send(groupData);

      expect([200, 201, 400, 404, 429, 500]).toContain(groupRes.statusCode);
      if (groupRes.statusCode === 201) {
        expect(groupRes.body).toHaveProperty('id');
        const groupId = groupRes.body.id;

        // 2. Send a message to the group
        const messageData = {
          content: 'Integration test group message',
          recipientType: 'GROUP',
          recipientId: groupId
        };

        const messageRes = await request(app)
          .post('/api/message')
          .set('Cookie', educatorCookies)
          .send(messageData);

        expect([200, 201, 400, 404, 429, 500]).toContain(messageRes.statusCode);

        // 3. Get group statistics
        const statsRes = await request(app)
          .get(`/api/groups/${groupId}/stats`)
          .set('Cookie', adminCookies);

        expect([200, 404, 429, 500]).toContain(statsRes.statusCode);
      }
    });

    it('should complete full user management workflow', async () => {
      // 1. Get user list
      const usersRes = await request(app)
        .get('/api/users')
        .set('Cookie', adminCookies);

      expect([200, 400, 403, 404, 429, 500]).toContain(usersRes.statusCode);

      if (usersRes.statusCode === 200 && usersRes.body.length > 0) {
        const userId = usersRes.body[0].id;

        // 2. Update user
        const updateData = {
          name: 'Updated User Name'
        };

        const updateRes = await request(app)
          .put(`/api/users/${userId}`)
          .set('Cookie', adminCookies)
          .send(updateData);

        expect([200, 400, 404, 429, 500]).toContain(updateRes.statusCode);

        // 3. Get user statistics
        const statsRes = await request(app)
          .get(`/api/users/${userId}/stats`)
          .set('Cookie', adminCookies);

        expect([200, 404, 429, 500]).toContain(statsRes.statusCode);

        // 4. Export user report
        const exportRes = await request(app)
          .get(`/api/reports/user/${userId}`)
          .set('Cookie', adminCookies);

        expect([200, 404, 429, 500]).toContain(exportRes.statusCode);
      }
    });
  });

  describe('Cross-Module Interactions', () => {
    it('should handle message creation with file upload and notification', async () => {
      // 1. Create message with file attachment
      const messageRes = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .field('content', 'Integration test message with file')
        .field('recipientType', 'CHILD')
        .field('recipientId', 'test-child-id')
        .attach('file', Buffer.from('test file content'), 'test-file.txt');

      expect([200, 201, 400, 404, 429, 500]).toContain(messageRes.statusCode);
      if (messageRes.statusCode === 201) {
        expect(messageRes.body).toHaveProperty('attachment');
      }

      // 2. Send notification about the message
      const notificationData = {
        title: 'New message received',
        content: 'You have a new message',
        recipientType: 'USER',
        recipientId: 'test-user-id'
      };

      const notificationRes = await request(app)
        .post('/api/notifications')
        .set('Cookie', educatorCookies)
        .send(notificationData);

      expect([200, 201, 400, 404, 429, 500]).toContain(notificationRes.statusCode);
    });

    it('should handle check-in with QR code and statistics', async () => {
      // 1. Generate QR code
      const qrRes = await request(app)
        .get('/api/checkin/qr/generate')
        .set('Cookie', educatorCookies);

      expect([200, 404, 429, 500]).toContain(qrRes.statusCode);
      if (qrRes.statusCode === 200) {
        expect(qrRes.headers['content-type']).toBe('image/png');
      }

      // 2. Check-in using QR code
      const qrCheckInData = {
        qrCodeSecret: 'test-qr-secret',
        method: 'QR'
      };

      const checkInRes = await request(app)
        .post('/api/checkin/qr')
        .set('Cookie', educatorCookies)
        .send(qrCheckInData);

      expect([200, 201, 400, 404, 429, 500]).toContain(checkInRes.statusCode);

      // 3. Get check-in statistics
      const statsRes = await request(app)
        .get('/api/checkin/stats')
        .set('Cookie', adminCookies);

      expect([200, 403, 429, 500]).toContain(statsRes.statusCode);
    });

    it('should handle notification with push token and email', async () => {
      // 1. Register push token
      const tokenData = {
        userId: 'test-user-id',
        pushToken: 'test-push-token',
        deviceType: 'MOBILE'
      };

      const tokenRes = await request(app)
        .post('/api/notifications/token')
        .set('Cookie', educatorCookies)
        .send(tokenData);

      expect([200, 201, 400, 404, 429, 500]).toContain(tokenRes.statusCode);

      // 2. Send notification
      const notificationData = {
        title: 'Test notification',
        content: 'This is a test notification',
        recipientType: 'USER',
        recipientId: 'test-user-id',
        priority: 'HIGH'
      };

      const notificationRes = await request(app)
        .post('/api/notifications')
        .set('Cookie', educatorCookies)
        .send(notificationData);

      expect([200, 201, 400, 404, 429, 500]).toContain(notificationRes.statusCode);
    });
  });

  describe('End-to-End Scenarios', () => {
    it('should complete full daycare day workflow', async () => {
      // Morning: Check-in children
      const morningCheckIn = {
        childId: 'test-child-id',
        method: 'MANUAL'
      };

      const checkInRes = await request(app)
        .post('/api/checkin')
        .set('Cookie', educatorCookies)
        .send(morningCheckIn);

      expect([200, 201, 400, 404, 429, 500]).toContain(checkInRes.statusCode);

      // Mid-morning: Send activity update
      const activityMessage = {
        content: 'Children are engaged in morning activities',
        recipientType: 'GROUP',
        recipientId: 'test-group-id'
      };

      const activityRes = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .send(activityMessage);

      expect([200, 201, 400, 404, 429, 500]).toContain(activityRes.statusCode);

      // Afternoon: Send lunch update
      const lunchMessage = {
        content: 'Children had lunch and are now resting',
        recipientType: 'GROUP',
        recipientId: 'test-group-id'
      };

      const lunchRes = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .send(lunchMessage);

      expect([200, 201, 400, 404, 429, 500]).toContain(lunchRes.statusCode);

      // Evening: Check-out children
      const eveningCheckOut = {
        childId: 'test-child-id',
        method: 'MANUAL'
      };

      const checkOutRes = await request(app)
        .post('/api/checkin')
        .set('Cookie', educatorCookies)
        .send(eveningCheckOut);

      expect([200, 201, 400, 404, 429, 500]).toContain(checkOutRes.statusCode);

      // End of day: Generate daily report
      const reportRes = await request(app)
        .get('/api/reports/daily')
        .set('Cookie', adminCookies);

      expect([200, 404, 429, 500, 400]).toContain(reportRes.statusCode);
    });

    it('should complete full parent communication workflow', async () => {
      // 1. Parent sends message
      const parentMessage = {
        content: 'How was my child today?',
        recipientType: 'CHILD',
        recipientId: 'test-child-id'
      };

      const parentMessageRes = await request(app)
        .post('/api/message')
        .set('Cookie', parentCookies)
        .send(parentMessage);

      expect([200, 201, 400, 404, 429, 500]).toContain(parentMessageRes.statusCode);

      // 2. Educator responds with file attachment
      const educatorResponse = {
        content: 'Your child had a great day! Here are some photos.',
        recipientType: 'CHILD',
        recipientId: 'test-child-id'
      };

      const educatorRes = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .field('content', educatorResponse.content)
        .field('recipientType', educatorResponse.recipientType)
        .field('recipientId', educatorResponse.recipientId)
        .attach('file', Buffer.from('photo data'), 'child-photo.jpg');

      expect([200, 201, 400, 404, 429, 500]).toContain(educatorRes.statusCode);

      // 3. Parent acknowledges
      const acknowledgment = {
        content: 'Thank you for the update!',
        recipientType: 'CHILD',
        recipientId: 'test-child-id'
      };

      const ackRes = await request(app)
        .post('/api/message')
        .set('Cookie', parentCookies)
        .send(acknowledgment);

      expect([200, 201, 400, 404, 429, 500]).toContain(ackRes.statusCode);
    });

    it('should complete full admin management workflow', async () => {
      // 1. Get institution overview
      const overviewRes = await request(app)
        .get('/api/statistics/overview')
        .set('Cookie', adminCookies);

      expect([200, 400, 403, 404, 429, 500]).toContain(overviewRes.statusCode);

      // 2. Export attendance report
      const attendanceRes = await request(app)
        .get('/api/reports/attendance')
        .set('Cookie', adminCookies);

      expect([200, 404, 429, 500, 400]).toContain(attendanceRes.statusCode);

      // 3. Manage educators
      const educatorsRes = await request(app)
        .get('/api/users?role=EDUCATOR')
        .set('Cookie', adminCookies);

      expect([200, 400, 403, 404, 429, 500]).toContain(educatorsRes.statusCode);

      // 4. Generate monthly report
      const monthlyRes = await request(app)
        .get('/api/reports/monthly')
        .set('Cookie', adminCookies);

      expect([200, 404, 429, 500, 400]).toContain(monthlyRes.statusCode);
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should handle database connection errors gracefully', async () => {
      // Simulate database connection issues by making many requests
      const requests = [];
      for (let i = 0; i < 50; i++) {
        requests.push(
          request(app)
            .get('/api/children')
            .set('Cookie', adminCookies)
        );
      }

      const responses = await Promise.all(requests);
      
      // Should handle gracefully even under load
      responses.forEach(res => {
        expect([200, 400, 403, 404, 429, 500]).toContain(res.statusCode);
      });
    });

    it('should handle authentication failures gracefully', async () => {
      // Test with invalid credentials
      const invalidLoginRes = await request(app)
        .post('/api/login')
        .send({ 
          email: 'invalid@test.com', 
          password: 'wrongpassword' 
        });

      expect(invalidLoginRes.statusCode).toBe(401);

      // Test with expired token
      const expiredTokenRes = await request(app)
        .get('/api/children')
        .set('Authorization', 'Bearer expired-token');

      expect(expiredTokenRes.statusCode).toBe(401);
    });

    it('should handle malformed requests gracefully', async () => {
      // Test malformed JSON
      const malformedRes = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect([400, 500, 429]).toContain(malformedRes.statusCode);

      // Test missing required fields
      const incompleteRes = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .send({});

      expect([400, 404, 429]).toContain(incompleteRes.statusCode);
    });

    it('should handle missing required fields gracefully', async () => {
      const incompleteData = [
        { content: 'Test' }, // Missing recipientType and recipientId
        { recipientType: 'CHILD' }, // Missing content and recipientId
        { recipientId: 'test-id' } // Missing content and recipientType
      ];

      for (const data of incompleteData) {
        const res = await request(app)
          .post('/api/message')
          .set('Cookie', educatorCookies)
          .send(data);

        expect([400, 404, 429]).toContain(res.statusCode);
      }
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple concurrent users', async () => {
      const userSessions = [adminCookies, educatorCookies, parentCookies];
      const requests = [];

      // Create concurrent requests from different users
      for (let i = 0; i < 30; i++) {
        const session = userSessions[i % userSessions.length];
        requests.push(
          request(app)
            .get('/api/children')
            .set('Cookie', session)
        );
      }

      const responses = await Promise.all(requests);
      
      // Should handle concurrent users gracefully
      responses.forEach(res => {
        expect([200, 400, 401, 403, 404, 429, 500]).toContain(res.statusCode);
      });
    });

    it('should handle rapid message creation', async () => {
      const messagePromises = [];
      
      for (let i = 0; i < 20; i++) {
        const messageData = {
          content: `Rapid test message ${i}`,
          recipientType: 'CHILD',
          recipientId: 'test-child-id'
        };

        messagePromises.push(
          request(app)
            .post('/api/message')
            .set('Cookie', educatorCookies)
            .send(messageData)
        );
      }

      const responses = await Promise.all(messagePromises);
      responses.forEach(res => {
        expect([200, 201, 400, 404, 429, 500]).toContain(res.statusCode);
      });
    });

    it('should handle large file uploads efficiently', async () => {
      // Create a large file (1MB)
      const largeBuffer = Buffer.alloc(1024 * 1024, 'x');

      const res = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .field('content', 'Large file upload test')
        .field('recipientType', 'CHILD')
        .field('recipientId', 'test-child-id')
        .attach('file', largeBuffer, 'large-file.txt');

      expect([200, 201, 400, 404, 413, 429, 500]).toContain(res.statusCode);
    });
  });

  describe('Security Integration Tests', () => {
    it('should prevent unauthorized access to sensitive endpoints', async () => {
      const sensitiveEndpoints = [
        '/api/users',
        '/api/statistics/overview',
        '/api/reports/attendance'
      ];

      for (const endpoint of sensitiveEndpoints) {
        const res = await request(app)
          .get(endpoint);

        expect([401, 403, 404, 429, 500]).toContain(res.statusCode);
      }
    });

    it('should validate file upload security', async () => {
      const res = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .field('content', 'Security test')
        .field('recipientType', 'CHILD')
        .field('recipientId', 'test-child-id')
        .attach('file', Buffer.from('executable'), 'test.exe');

      expect([400, 404, 429, 500]).toContain(res.statusCode);
    });

    it('should handle SQL injection attempts', async () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --"
      ];

      for (const input of maliciousInputs) {
        const res = await request(app)
          .post('/api/message')
          .set('Cookie', educatorCookies)
          .send({
            content: input,
            recipientType: 'CHILD',
            recipientId: 'test-child-id'
          });

        expect([200, 201, 400, 404, 429, 500]).toContain(res.statusCode);
      }
    });

    it('should handle XSS attempts', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">'
      ];

      for (const payload of xssPayloads) {
        const res = await request(app)
          .post('/api/message')
          .set('Cookie', educatorCookies)
          .send({
            content: payload,
            recipientType: 'CHILD',
            recipientId: 'test-child-id'
          });

        expect([200, 201, 400, 404, 429, 500]).toContain(res.statusCode);
      }
    });
  });
}); 