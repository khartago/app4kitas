const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/app');
const { createTestData, prisma } = require('./setup');

describe('GDPR Export Endpoint', () => {
  let superAdminToken;
  let adminToken;
  let educatorToken;
  let parentToken;
  let testUser;
  let testChild;
  let testMessage;
  let testNote;
  let testData;

  beforeAll(async () => {
    // Create test data
    testData = await createTestData();
    const { users } = testData;
    const [superAdmin, admin, educator, parent] = users;

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

    testUser = parent; // Use parent as test user for export
    testChild = testData.child;
  });

  beforeEach(async () => {
    // Create test message for the user
    testMessage = await prisma.message.create({
      data: {
        content: 'Test message for GDPR export',
        senderId: testUser.id,
        childId: testChild.id,
        institutionId: testData.institution.id
      }
    });

    // Create test note for the child
    testNote = await prisma.note.create({
      data: {
        content: 'Test note for GDPR export',
        childId: testChild.id,
        educatorId: testUser.id
      }
    });
  });

  afterEach(async () => {
    // Clean up test data
    if (testNote) {
      await prisma.note.deleteMany({ where: { id: testNote.id } });
    }
    if (testMessage) {
      await prisma.message.deleteMany({ where: { id: testMessage.id } });
    }
  });

  describe('GET /api/gdpr/export/:userId', () => {
    it('should export user data successfully for SUPER_ADMIN', async () => {
      const response = await request(app)
        .get(`/api/gdpr/export/${testUser.id}?inline=true`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Datenexport erfolgreich abgeschlossen');
      expect(response.body.data).toBeDefined();
      expect(response.body.exportDate).toBeDefined();

      // Verify user data structure
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.name).toBe(testUser.name);
      expect(response.body.data.user.role).toBe(testUser.role);

      // Verify children data
      expect(response.body.data.children).toBeDefined();
      expect(Array.isArray(response.body.data.children)).toBe(true);
      expect(response.body.data.children.length).toBeGreaterThan(0);

      const child = response.body.data.children[0];
      expect(child.id).toBe(testChild.id);
      expect(child.name).toBe(testChild.name);
      expect(child.checkIns).toBeDefined();
      expect(child.notes).toBeDefined();

      // Verify messages data
      expect(response.body.data.messages).toBeDefined();
      expect(Array.isArray(response.body.data.messages)).toBe(true);
      expect(response.body.data.messages.length).toBeGreaterThan(0);

      const message = response.body.data.messages[0];
      expect(message.id).toBe(testMessage.id);
      expect(message.content).toBe(testMessage.content);

      // Verify notes data
      expect(response.body.data.notes).toBeDefined();
      expect(Array.isArray(response.body.data.notes)).toBe(true);
      expect(response.body.data.notes.length).toBeGreaterThan(0);

      const note = response.body.data.notes[0];
      expect(note.id).toBe(testNote.id);
      expect(note.content).toBe(testNote.content);

      // Verify other data structures
      expect(response.body.data.notifications).toBeDefined();
      expect(response.body.data.activityLogs).toBeDefined();
      expect(response.body.data.personalTasks).toBeDefined();
    });

    it('should reject access for non-SUPER_ADMIN roles', async () => {
      const roles = [
        { token: adminToken, role: 'ADMIN' },
        { token: educatorToken, role: 'EDUCATOR' },
        { token: parentToken, role: 'PARENT' }
      ];

      for (const { token, role } of roles) {
        const response = await request(app)
          .get(`/api/gdpr/export/${testUser.id}?inline=true`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Nur Super Admin kann auf diese Funktion zugreifen');
      }
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentUserId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .get(`/api/gdpr/export/${nonExistentUserId}?inline=true`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Benutzer nicht gefunden');
    });

    it('should return 404 for invalid UUID format', async () => {
      const invalidUserId = 'invalid-uuid';
      
      const response = await request(app)
        .get(`/api/gdpr/export/${invalidUserId}?inline=true`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Benutzer nicht gefunden');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/gdpr/export/${testUser.id}?inline=true`);

      expect(response.status).toBe(401);
    });

    it('should create audit log entry for successful export', async () => {
      const response = await request(app)
        .get(`/api/gdpr/export/${testUser.id}?inline=true`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);

      // Verify audit log was created
      const auditLog = await prisma.activityLog.findFirst({
        where: {
          action: 'EXPORT_PERSONAL_DATA',
          entityId: testUser.id
        }
      });

      expect(auditLog).toBeDefined();
      expect(auditLog.action).toBe('EXPORT_PERSONAL_DATA');
      expect(auditLog.entity).toBe('User');
      expect(auditLog.entityId).toBe(testUser.id);
      expect(auditLog.details).toContain('Datenexport für Benutzer');
      expect(auditLog.details).toContain(testUser.email);
    });

    it('should exclude soft-deleted data from export', async () => {
      // Soft delete a child
      await prisma.child.update({
        where: { id: testChild.id },
        data: { deletedAt: new Date() }
      });

      const response = await request(app)
        .get(`/api/gdpr/export/${testUser.id}?inline=true`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.children.length).toBe(0); // Should not include soft-deleted child

      // Restore the child for cleanup
      await prisma.child.update({
        where: { id: testChild.id },
        data: { deletedAt: null }
      });
    });

    it('should include all related data in the export', async () => {
      // Create additional test data
      const additionalChild = await prisma.child.create({
        data: {
          name: 'Additional Test Child',
          birthdate: new Date('2021-01-01'),
          groupId: testData.group.id,
          institutionId: testData.institution.id,
          qrCodeSecret: 'additional-test-qr-secret',
          parents: {
            connect: [{ id: testUser.id }]
          }
        }
      });

      const additionalMessage = await prisma.message.create({
        data: {
          content: 'Additional test message for GDPR export',
          senderId: testUser.id,
          childId: additionalChild.id,
          institutionId: testData.institution.id
        }
      });

      const additionalNote = await prisma.note.create({
        data: {
          content: 'Additional test note for GDPR export',
          childId: additionalChild.id,
          educatorId: testUser.id
        }
      });

      const response = await request(app)
        .get(`/api/gdpr/export/${testUser.id}?inline=true`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      
      // Verify all children are included
      const childIds = response.body.data.children.map(child => child.id);
      expect(childIds).toContain(testChild.id);
      expect(childIds).toContain(additionalChild.id);

      // Verify all messages are included
      const messageIds = response.body.data.messages.map(message => message.id);
      expect(messageIds).toContain(testMessage.id);
      expect(messageIds).toContain(additionalMessage.id);

      // Verify all notes are included
      const noteIds = response.body.data.notes.map(note => note.id);
      expect(noteIds).toContain(testNote.id);
      expect(noteIds).toContain(additionalNote.id);

      // Clean up additional test data
      await prisma.note.deleteMany({ where: { id: additionalNote.id } });
      await prisma.message.deleteMany({ where: { id: additionalMessage.id } });
      await prisma.child.deleteMany({ where: { id: additionalChild.id } });
    });
  });
}); 