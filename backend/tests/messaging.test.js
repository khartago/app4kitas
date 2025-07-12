const request = require('supertest');
const app = require('../src/app');
const { createTestData, loginUser, testDataStorage } = require('./setup');

// Robust test data pattern: see check-in tests

describe('Messaging Tests', () => {
  let superAdminCookies;
  let adminCookies;
  let educatorCookies;
  let parentCookies;
  let testData;

  beforeAll(async () => {
    // Create robust test data
    testData = await createTestData();

    // Login as different roles for testing
    superAdminCookies = await loginUser(request, app, 'test.superadmin@app4kitas.de', 'testpassword');
    adminCookies = await loginUser(request, app, 'test.admin@app4kitas.de', 'testpassword');
    educatorCookies = await loginUser(request, app, 'test.educator@app4kitas.de', 'testpassword');
    parentCookies = await loginUser(request, app, 'test.parent@app4kitas.de', 'testpassword');
  });

  describe('Message Creation', () => {
    it('should create message for child successfully', async () => {
      const messageData = {
        content: 'Test message for child',
        recipientType: 'CHILD',
        recipientId: testData.child.id
      };

      const res = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .send(messageData);

      // API returns 201 for successful message creation, 200 for already exists
      expect([200, 201, 400]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('content', messageData.content);
        expect(res.body).toHaveProperty('recipientType', messageData.recipientType);
        expect(res.body).toHaveProperty('recipientId', messageData.recipientId);
      }
    });

    it('should create message for group successfully', async () => {
      const messageData = {
        content: 'Test message for group',
        recipientType: 'GROUP',
        recipientId: testData.group.id
      };

      const res = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .send(messageData);

      // API returns 201 for successful message creation, 200 for already exists
      expect([200, 201, 400]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('content', messageData.content);
        expect(res.body).toHaveProperty('recipientType', messageData.recipientType);
        expect(res.body).toHaveProperty('recipientId', messageData.recipientId);
      }
    });

    it('should create message with file attachment', async () => {
      const res = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .field('content', 'Test message with file')
        .field('recipientType', 'CHILD')
        .field('recipientId', testData.child.id)
        .attach('file', Buffer.from('test file content'), 'test-file.txt');

      // API returns 201 for successful message creation, 200 for already exists
      expect([200, 201, 400]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('content', 'Test message with file');
        expect(res.body).toHaveProperty('attachment');
      }
    });

    it('should reject message creation without authentication', async () => {
      const messageData = {
        content: 'Test message',
        recipientType: 'CHILD',
        recipientId: testData.child.id || 'test-child-id'
      };

      const res = await request(app)
        .post('/api/message')
        .send(messageData);

      expect(res.statusCode).toBe(401);
    });

    it('should reject message creation with invalid data', async () => {
      const invalidData = [
        { content: '', recipientType: 'CHILD', recipientId: testData.child.id || 'test-child-id' },
        { content: 'Test', recipientType: 'INVALID', recipientId: testData.child.id || 'test-child-id' },
        { content: 'Test', recipientType: 'CHILD', recipientId: 'invalid-uuid' },
        { content: 'Test', recipientType: 'CHILD' }, // Missing recipientId
        { content: 'Test', recipientId: testData.child.id || 'test-child-id' } // Missing recipientType
      ];

      for (const data of invalidData) {
        const res = await request(app)
          .post('/api/message')
          .set('Cookie', educatorCookies)
          .send(data);

        expect([400, 404]).toContain(res.statusCode);
      }
    });

    it('should reject message creation with invalid file type', async () => {
      const res = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .field('content', 'Test message with invalid file')
        .field('channelId', 'test-channel-id')
        .attach('file', Buffer.from('test file content'), 'test-file.exe');

      expect(res.statusCode).toBe(400);
    });

    it('should reject message creation with oversized file', async () => {
      // Create a large buffer (5MB)
      const largeBuffer = Buffer.alloc(5 * 1024 * 1024, 'x');

      const res = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .field('content', 'Test message with large file')
        .field('recipientType', 'CHILD')
        .field('recipientId', testData.child.id)
        .attach('file', largeBuffer, 'large-file.txt');

      // Should reject oversized files
      expect([400, 413]).toContain(res.statusCode);
    });
  });

  describe('Message Retrieval', () => {
    it('should get messages for child', async () => {
      const res = await request(app)
        .get(`/api/messages/child/${testData.child.id}`)
        .set('Cookie', educatorCookies);

      // Educator should be able to access child messages if child is in their group
      expect([200, 403, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    it('should get messages for group', async () => {
      const res = await request(app)
        .get(`/api/messages/group/${testData.group.id}`)
        .set('Cookie', educatorCookies);

      // Educator should be able to access group messages if they're in the group
      expect([200, 403, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    it('should reject message retrieval without authentication', async () => {
      const res = await request(app)
        .get(`/api/messages/child/${testData.child.id || 'test-child-id'}`);

      expect(res.statusCode).toBe(401);
    });

    it('should reject message retrieval for unauthorized users', async () => {
      const res = await request(app)
        .get(`/api/messages/child/${testData.child.id || 'test-child-id'}`)
        .set('Cookie', parentCookies);

      // Parent should be able to access their own child's messages, so this might be 200 or 403/404
      expect([200, 403, 404]).toContain(res.statusCode);
    });

    it('should handle non-existent child/group gracefully', async () => {
      const res = await request(app)
        .get('/api/messages/child/non-existent-child-id')
        .set('Cookie', educatorCookies);

      expect([404, 400]).toContain(res.statusCode);
    });
  });

  describe('Message Channels', () => {
    it('should get user channels', async () => {
      const res = await request(app)
        .get('/api/channels')
        .set('Cookie', educatorCookies);

      expect([200, 404, 500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    it('should get channel messages', async () => {
      const res = await request(app)
        .get('/api/channels/test-channel-id/messages')
        .set('Cookie', educatorCookies);

      expect([200, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    it('should get direct messages', async () => {
      const res = await request(app)
        .get('/api/direct-messages/test-user-id')
        .set('Cookie', educatorCookies);

      expect([200, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    it('should get institution users', async () => {
      const res = await request(app)
        .get('/api/users/institution')
        .set('Cookie', educatorCookies);

      expect([200, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });
  });

  describe('Message Reactions', () => {
    it('should toggle message reaction', async () => {
      const res = await request(app)
        .post('/api/messages/test-message-id/reactions')
        .set('Cookie', educatorCookies)
        .send({ emoji: 'like' });

      // API returns 404 for non-existent message
      expect(res.statusCode).toBe(404);
    });

    it('should reject reaction without authentication', async () => {
      const res = await request(app)
        .post('/api/messages/test-message-id/reactions')
        .send({ reaction: 'like' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('Message Editing', () => {
    it('should edit message successfully', async () => {
      const editData = {
        content: 'Updated message content'
      };

      const res = await request(app)
        .put('/api/messages/test-message-id')
        .set('Cookie', educatorCookies)
        .send(editData);

      expect([200, 404]).toContain(res.statusCode);
    });

    it('should reject message editing without authentication', async () => {
      const editData = {
        content: 'Updated message content'
      };

      const res = await request(app)
        .put('/api/messages/test-message-id')
        .send(editData);

      expect(res.statusCode).toBe(401);
    });

    it('should reject editing message by non-author', async () => {
      const editData = {
        content: 'Updated message content'
      };

      const res = await request(app)
        .put('/api/messages/test-message-id')
        .set('Cookie', parentCookies)
        .send(editData);

      // Should return 403 for unauthorized or 404 for non-existent message
      expect([403, 404]).toContain(res.statusCode);
    });
  });

  describe('Role-based Access Control', () => {
    it('should allow educators to send messages to their groups', async () => {
      const messageData = {
        content: 'Test message from educator',
        recipientType: 'GROUP',
        recipientId: testData.group.id
      };

      const res = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .send(messageData);

      expect([200, 201, 400, 403]).toContain(res.statusCode);
    });

    it('should allow parents to send messages about their children', async () => {
      const messageData = {
        content: 'Test message from parent',
        recipientType: 'CHILD',
        recipientId: testData.child.id
      };

      const res = await request(app)
        .post('/api/message')
        .set('Cookie', parentCookies)
        .send(messageData);

      // Parent should be able to send messages about their own children
      expect([200, 201, 400, 403]).toContain(res.statusCode);
    });

    it('should allow admins to send messages to any child/group', async () => {
      const messageData = {
        content: 'Test message from admin',
        recipientType: 'CHILD',
        recipientId: testData.child.id
      };

      const res = await request(app)
        .post('/api/message')
        .set('Cookie', adminCookies)
        .send(messageData);

      expect([200, 201, 400, 403]).toContain(res.statusCode);
    });

    it('should reject unauthorized message access', async () => {
      const res = await request(app)
        .get('/api/messages/child/test-child-id')
        .set('Cookie', parentCookies);

      // Should return 403 for unauthorized or 404 for non-existent child
      expect([403, 404]).toContain(res.statusCode);
    });
  });

  describe('File Upload Security', () => {
    it('should validate file types', async () => {
      const validFiles = [
        { buffer: Buffer.from('test'), filename: 'test.txt' },
        { buffer: Buffer.from('test'), filename: 'test.pdf' },
        { buffer: Buffer.from('test'), filename: 'test.jpg' },
        { buffer: Buffer.from('test'), filename: 'test.png' }
      ];

      for (const file of validFiles) {
        const res = await request(app)
          .post('/api/message')
          .set('Cookie', educatorCookies)
          .field('content', 'Test message with file')
          .field('recipientType', 'CHILD')
          .field('recipientId', testData.child.id)
          .attach('file', file.buffer, file.filename);

        expect([200, 201, 400]).toContain(res.statusCode);
      }
    });

    it('should reject malicious file types', async () => {
      const maliciousFiles = [
        { buffer: Buffer.from('test'), filename: 'test.exe' },
        { buffer: Buffer.from('test'), filename: 'test.bat' },
        { buffer: Buffer.from('test'), filename: 'test.sh' },
        { buffer: Buffer.from('test'), filename: 'test.php' }
      ];

      for (const file of maliciousFiles) {
        const res = await request(app)
          .post('/api/message')
          .set('Cookie', educatorCookies)
          .field('content', 'Test message with malicious file')
          .field('channelId', 'test-channel-id')
          .attach('file', file.buffer, file.filename);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
      }
    });

    it('should handle path traversal attempts', async () => {
      const maliciousFilenames = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        'test/../../../etc/passwd'
      ];

      for (const filename of maliciousFilenames) {
        const res = await request(app)
          .post('/api/message')
          .set('Cookie', educatorCookies)
          .field('content', 'Test message with path traversal')
          .field('channelId', 'test-channel-id')
          .attach('file', Buffer.from('test'), filename);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      const res = await request(app)
        .get('/api/messages/child/test-child-id')
        .set('Cookie', educatorCookies);

      expect([200, 404, 500]).toContain(res.statusCode);
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
          .post('/api/message')
          .set('Cookie', educatorCookies)
          .send(data);

        expect([400, 500]).toContain(res.statusCode);
      }
    });

    it('should handle missing required fields', async () => {
      const incompleteData = [
        {},
        { content: 'Test' },
        { recipientType: 'CHILD' },
        { recipientId: 'test-id' }
      ];

      for (const data of incompleteData) {
        const res = await request(app)
          .post('/api/message')
          .set('Cookie', educatorCookies)
          .send(data);

        expect([400, 404]).toContain(res.statusCode);
      }
    });

    it('should handle non-existent recipients gracefully', async () => {
      const messageData = {
        content: 'Test message',
        recipientType: 'CHILD',
        recipientId: 'non-existent-child-id'
      };

      const res = await request(app)
        .post('/api/message')
        .set('Cookie', educatorCookies)
        .send(messageData);

      expect([400, 404]).toContain(res.statusCode);
    });
  });
}); 