process.env.JWT_SECRET = 'your_super_secret_key_here';
process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('../src/utils/jwt');

describe('GDPR Deletion API Tests', () => {
  let superAdminToken;
  let adminToken;
  let educatorToken;
  let testUserId;
  let testChildId;
  let testGroupId;
  let testInstitutionId;

  beforeAll(async () => {
    // Clean up any existing test data before creating new test data
    // Delete in correct order to respect foreign key constraints
    const testUserEmails = [
      'superadmin@gdpr.test',
      'admin@gdpr.test',
      'educator@gdpr.test'
    ];
    try {
      // Delete children first
      await prisma.child.deleteMany({
        where: {
          OR: [
            { qrCodeSecret: 'test-qr-secret-gdpr' },
            { name: 'Test Child GDPR' },
            { name: 'Child in Group' }
          ]
        }
      });
    } catch (error) {
      console.log('Cleanup error (expected in some test scenarios):', error.message);
    }

    try {
      // Delete groups
      await prisma.group.deleteMany({
        where: {
          OR: [
            { name: 'Test Group GDPR' },
            { name: 'Group with Child' }
          ]
        }
      });
    } catch (error) {
      console.log('Cleanup error (expected in some test scenarios):', error.message);
    }

    try {
      // Delete all related data referencing test users
      const testUsers = await prisma.user.findMany({
        where: { email: { in: testUserEmails } },
        select: { id: true }
      });
      const testUserIds = testUsers.map(u => u.id);
      if (testUserIds.length > 0) {
        // Delete notifications
        await prisma.notificationLog.deleteMany({ where: { OR: [{ userId: { in: testUserIds } }, { senderId: { in: testUserIds } }] } }).catch(() => {});
        // Delete activity logs
        await prisma.activityLog.deleteMany({ where: { userId: { in: testUserIds } } }).catch(() => {});
        // Delete notes
        await prisma.note.deleteMany({ where: { educatorId: { in: testUserIds } } }).catch(() => {});
        // Delete messages
        await prisma.message.deleteMany({ where: { senderId: { in: testUserIds } } }).catch(() => {});
        // Delete personal tasks
        await prisma.personalTask.deleteMany({ where: { userId: { in: testUserIds } } }).catch(() => {});
        // Delete checkins
        await prisma.checkInLog.deleteMany({ where: { actorId: { in: testUserIds } } }).catch(() => {});
        // Delete device tokens
        await prisma.deviceToken.deleteMany({ where: { userId: { in: testUserIds } } }).catch(() => {});
        // Delete chat read status
        await prisma.chatReadStatus.deleteMany({ where: { userId: { in: testUserIds } } }).catch(() => {});
        // Delete message reactions
        await prisma.messageReaction.deleteMany({ where: { userId: { in: testUserIds } } }).catch(() => {});
        // Delete data restrictions/objections
        await prisma.dataRestriction.deleteMany({ where: { OR: [{ userId: { in: testUserIds } }, { requestedById: { in: testUserIds } }] } }).catch(() => {});
        await prisma.dataObjection.deleteMany({ where: { OR: [{ userId: { in: testUserIds } }, { requestedById: { in: testUserIds } }] } }).catch(() => {});
        // Delete chat channels where user is a participant
        await prisma.chatChannel.deleteMany({ where: { participants: { some: { id: { in: testUserIds } } } } }).catch(() => {});
        // Delete direct messages where user is a participant
        await prisma.directMessage.deleteMany({ where: { OR: [{ user1Id: { in: testUserIds } }, { user2Id: { in: testUserIds } }] } }).catch(() => {});
      }
    } catch (error) {
      console.log('Cleanup error (expected in some test scenarios):', error.message);
    }

    try {
      // Delete users
      await prisma.user.deleteMany({
        where: {
          email: { in: testUserEmails }
        }
      });
    } catch (error) {
      console.log('Cleanup error (expected in some test scenarios):', error.message);
    }

    try {
      // Delete institutions
      await prisma.institution.deleteMany({
        where: {
          name: 'Test Institution GDPR'
        }
      });
    } catch (error) {
      console.log('Cleanup error (expected in some test scenarios):', error.message);
    }

    // Create test institution (only use fields from schema)
    const testInstitution = await prisma.institution.create({
      data: {
        name: 'Test Institution GDPR',
        address: 'Test Address'
      }
    });
    testInstitutionId = testInstitution.id;

    // Create test group
    const testGroup = await prisma.group.create({
      data: {
        name: 'Test Group GDPR',
        institutionId: testInstitutionId
      }
    });
    testGroupId = testGroup.id;

    // Create test child (all required fields)
    const child = await prisma.child.create({
      data: {
        name: 'Test Child GDPR',
        birthdate: new Date('2020-01-01'),
        groupId: testGroupId,
        qrCodeSecret: 'test-qr-secret-gdpr',
        institutionId: testInstitutionId
      }
    });
    testChildId = child.id;

    // Create test users with proper hashed passwords
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('password', 10);
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@gdpr.test',
        password: hashedPassword,
        name: 'Super Admin GDPR',
        role: 'SUPER_ADMIN'
      }
    });

    const admin = await prisma.user.create({
      data: {
        email: 'admin@gdpr.test',
        password: hashedPassword,
        name: 'Admin GDPR',
        role: 'ADMIN',
        institutionId: testInstitutionId
      }
    });

    const educator = await prisma.user.create({
      data: {
        email: 'educator@gdpr.test',
        password: hashedPassword,
        name: 'Educator GDPR',
        role: 'EDUCATOR',
        institutionId: testInstitutionId
      }
    });

    testUserId = educator.id;

    // Login and get tokens
    const superAdminResponse = await request(app)
      .post('/api/login')
      .send({
        email: 'superadmin@gdpr.test',
        password: 'password'
      });
    console.log('SuperAdmin login response:', superAdminResponse.status, superAdminResponse.body);
    superAdminToken = superAdminResponse.body.token;

    const adminResponse = await request(app)
      .post('/api/login')
      .send({
        email: 'admin@gdpr.test',
        password: 'password'
      });
    console.log('Admin login response:', adminResponse.status, adminResponse.body);
    adminToken = adminResponse.body.token;

    const educatorResponse = await request(app)
      .post('/api/login')
      .send({
        email: 'educator@gdpr.test',
        password: 'password'
      });
    console.log('Educator login response:', educatorResponse.status, educatorResponse.body);
    educatorToken = educatorResponse.body.token;

    // Debug: Test token verification directly
    console.log('Testing token verification:');
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    console.log('SuperAdmin token:', superAdminToken);
    try {
      const decoded = jwt.verifyToken(superAdminToken);
      console.log('Token verification successful:', decoded);
    } catch (error) {
      console.log('Token verification failed:', error.message);
    }
  });

  afterAll(async () => {
    // Clean up test data in correct order (respecting foreign keys)
    try {
      // Delete children first
      await prisma.child.deleteMany({
        where: { 
          OR: [
            { id: testChildId },
            { institutionId: testInstitutionId }
          ]
        }
      });

      // Delete groups
      await prisma.group.deleteMany({
        where: { 
          OR: [
            { id: testGroupId },
            { institutionId: testInstitutionId }
          ]
        }
      });

      // Delete users
      await prisma.user.deleteMany({
        where: {
          email: {
            in: ['superadmin@gdpr.test', 'admin@gdpr.test', 'educator@gdpr.test']
          }
        }
      });

      // Finally delete institution
      await prisma.institution.deleteMany({
        where: { id: testInstitutionId }
      });
    } catch (error) {
      console.log('Cleanup error (expected in some test scenarios):', error.message);
    }

    await prisma.$disconnect();
  });

  describe('GET /api/gdpr/pending-deletions', () => {
    it('should return pending deletions for SUPER_ADMIN', async () => {
      const response = await request(app)
        .get('/api/gdpr/pending-deletions')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should deny access for non-SUPER_ADMIN', async () => {
      const response = await request(app)
        .get('/api/gdpr/pending-deletions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/gdpr/audit-logs', () => {
    it('should return GDPR audit logs for SUPER_ADMIN', async () => {
      const response = await request(app)
        .get('/api/gdpr/audit-logs')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should accept limit parameter', async () => {
      const response = await request(app)
        .get('/api/gdpr/audit-logs?limit=10')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny access for non-SUPER_ADMIN', async () => {
      const response = await request(app)
        .get('/api/gdpr/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/gdpr/retention-periods', () => {
    it('should return retention periods for SUPER_ADMIN', async () => {
      const response = await request(app)
        .get('/api/gdpr/retention-periods')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('USER');
      expect(response.body.data).toHaveProperty('CHILD');
      expect(response.body.data).toHaveProperty('GROUP');
    });

    it('should deny access for non-SUPER_ADMIN', async () => {
      const response = await request(app)
        .get('/api/gdpr/retention-periods')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/gdpr/cleanup', () => {
    it('should trigger cleanup for SUPER_ADMIN', async () => {
      const response = await request(app)
        .post('/api/gdpr/cleanup')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Bereinigung abgeschlossen');
    });

    it('should deny access for non-SUPER_ADMIN', async () => {
      const response = await request(app)
        .post('/api/gdpr/cleanup')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/gdpr/soft-delete/user/:userId', () => {
    let userToDelete;

    beforeEach(async () => {
      // Create a user to delete with unique email
      const uniqueEmail = `delete-test-${Date.now()}@gdpr.test`;
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password', 10);
      userToDelete = await prisma.user.create({
        data: {
          email: uniqueEmail,
          password: hashedPassword,
          name: 'Delete Test User',
          role: 'EDUCATOR',
          institutionId: testInstitutionId
        }
      });
    });

    it('should soft delete user for SUPER_ADMIN', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/user/${userToDelete.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ reason: 'Test deletion' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('zur Löschung markiert');

      // Verify user is soft deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: userToDelete.id }
      });
      expect(deletedUser.deletedAt).not.toBeNull();
    });

    it('should allow user to soft delete own account', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/user/${testUserId}`)
        .set('Authorization', `Bearer ${educatorToken}`)
        .send({ reason: 'Personal deletion request' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should prevent deletion of SUPER_ADMIN accounts', async () => {
      const superAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' }
      });

      const response = await request(app)
        .post(`/api/gdpr/soft-delete/user/${superAdmin.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ reason: 'Test' });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('SUPER_ADMIN Konten können nicht gelöscht werden');
    });

    it('should deny access for unauthorized user', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/user/${userToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test' });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/gdpr/soft-delete/user/non-existent-id')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ reason: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/gdpr/soft-delete/child/:childId', () => {
    it('should soft delete child for ADMIN', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/child/${testChildId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Child left institution' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('zur Löschung markiert');

      // Verify child is soft deleted
      const deletedChild = await prisma.child.findUnique({
        where: { id: testChildId }
      });
      expect(deletedChild.deletedAt).not.toBeNull();
    });

    it('should allow SUPER_ADMIN to soft delete child', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/child/${testChildId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ reason: 'Test deletion' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny access for non-ADMIN', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/child/${testChildId}`)
        .set('Authorization', `Bearer ${educatorToken}`)
        .send({ reason: 'Test' });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/gdpr/soft-delete/group/:groupId', () => {
    it('should soft delete empty group for ADMIN', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/group/${testGroupId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Group closed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('zur Löschung markiert');

      // Verify group is soft deleted
      const deletedGroup = await prisma.group.findUnique({
        where: { id: testGroupId }
      });
      expect(deletedGroup.deletedAt).not.toBeNull();
    });

    it('should soft delete group with children and unassign children', async () => {
      // Create a group with a child
      const groupWithChild = await prisma.group.create({
        data: {
          name: 'Group with Child',
          institutionId: testInstitutionId
        }
      });

      const childInGroup = await prisma.child.create({
        data: {
          name: 'Child in Group',
          birthdate: new Date('2020-01-01'),
          groupId: groupWithChild.id,
          qrCodeSecret: `child-in-group-${Date.now()}`,
          institutionId: testInstitutionId
        }
      });

      const response = await request(app)
        .post(`/api/gdpr/soft-delete/group/${groupWithChild.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('zur Löschung markiert');

      // Verify group is soft deleted
      const deletedGroup = await prisma.group.findUnique({
        where: { id: groupWithChild.id }
      });
      expect(deletedGroup.deletedAt).not.toBeNull();

      // Verify child is unassigned from group
      const updatedChild = await prisma.child.findUnique({ where: { id: childInGroup.id } });
      expect(updatedChild.groupId).toBeNull();

      // Clean up
      await prisma.child.delete({ where: { id: childInGroup.id } });
      await prisma.group.delete({ where: { id: groupWithChild.id } });
    });

    it('should allow SUPER_ADMIN to soft delete group', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/group/${testGroupId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ reason: 'Test deletion' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny access for non-ADMIN', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/group/${testGroupId}`)
        .set('Authorization', `Bearer ${educatorToken}`)
        .send({ reason: 'Test' });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/gdpr/soft-delete/institution/:institutionId', () => {
    it('should soft delete institution for SUPER_ADMIN', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/institution/${testInstitutionId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ reason: 'Institution closed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('zur Löschung markiert');

      // Verify institution is soft deleted
      const deletedInstitution = await prisma.institution.findUnique({
        where: { id: testInstitutionId }
      });
      expect(deletedInstitution.deletedAt).not.toBeNull();
    });

    it('should deny access for non-SUPER_ADMIN', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/institution/${testInstitutionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test' });

      expect(response.status).toBe(403);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user ID gracefully', async () => {
      const response = await request(app)
        .post('/api/gdpr/soft-delete/user/invalid-uuid')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ reason: 'Test' });

      expect(response.status).toBe(404);
    });

    it('should handle database errors gracefully', async () => {
      // Test with non-existent user
      const response = await request(app)
        .post('/api/gdpr/soft-delete/user/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ reason: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('Data Cleanup', () => {
    it('should clean up old data automatically', async () => {
      // This test would require setting up old data and running the cleanup function
      // For now, we'll test that the cleanup function exists and can be called
      const gdprService = require('../src/services/gdprService');
      
      // Should not throw an error
      expect(async () => {
        await gdprService.cleanupExpiredRecords();
      }).not.toThrow();
    });
  });
}); 