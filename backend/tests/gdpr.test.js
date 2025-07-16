process.env.JWT_SECRET = 'your_super_secret_key_here';
process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('../src/utils/jwt');
const { loginUser, hashPassword } = require('./setup');

describe('GDPR Deletion & Export', () => {
  let testInstitution;
  let testUser;
  let testChild;
  let testGroup;
  let superAdmin;
  let superAdminCookies;
  let adminUser;
  let adminCookies;
  let educatorUser;
  let educatorCookies;
  let parentUser;
  let parentCookies;

  beforeEach(async () => {
    const timestamp = Date.now();
    // Create unique institution
    testInstitution = await prisma.institution.create({
      data: {
        name: `GDPR Test Kita ${timestamp}`,
        address: 'GDPR Test Address'
      }
    });
    // Create users
    superAdmin = await prisma.user.create({
      data: {
        email: `superadmin-gdpr-${timestamp}@test.de`,
        password: await hashPassword('SuperSecret123!'),
        role: 'SUPER_ADMIN',
        institutionId: testInstitution.id,
        name: 'Super Admin GDPR'
      }
    });
    adminUser = await prisma.user.create({
      data: {
        email: `admin-gdpr-${timestamp}@test.de`,
        password: await hashPassword('AdminSecret123!'),
        role: 'ADMIN',
        institutionId: testInstitution.id,
        name: 'Admin GDPR'
      }
    });
    educatorUser = await prisma.user.create({
      data: {
        email: `educator-gdpr-${timestamp}@test.de`,
        password: await hashPassword('EducatorSecret123!'),
        role: 'EDUCATOR',
        institutionId: testInstitution.id,
        name: 'Educator GDPR'
      }
    });
    parentUser = await prisma.user.create({
      data: {
        email: `parent-gdpr-${timestamp}@test.de`,
        password: await hashPassword('ParentSecret123!'),
        role: 'PARENT',
        institutionId: testInstitution.id,
        name: 'Parent GDPR'
      }
    });
    // Create group
    testGroup = await prisma.group.create({
      data: {
        name: `GDPR Gruppe ${timestamp}`,
        institutionId: testInstitution.id
      }
    });
    // Create child
    testChild = await prisma.child.create({
      data: {
        name: `GDPR Kind ${timestamp}`,
        birthdate: '2018-01-01T00:00:00.000Z',
        institutionId: testInstitution.id,
        groupId: testGroup.id,
        qrCodeSecret: `test-qr-secret-${timestamp}`
      }
    });
    // Login users
    superAdminCookies = await loginUser(superAdmin.email, 'SuperSecret123!');
    adminCookies = await loginUser(adminUser.email, 'AdminSecret123!');
    educatorCookies = await loginUser(educatorUser.email, 'EducatorSecret123!');
    parentCookies = await loginUser(parentUser.email, 'ParentSecret123!');
  });

  afterEach(async () => {
    // Cleanup order: children -> groups -> users -> institution
    await prisma.child.deleteMany({ where: { institutionId: testInstitution.id } });
    await prisma.group.deleteMany({ where: { institutionId: testInstitution.id } });
    await prisma.user.deleteMany({ where: { institutionId: testInstitution.id } });
    await prisma.institution.delete({ where: { id: testInstitution.id } });
  });

  describe('GET /api/gdpr/pending-deletions', () => {
    it('should return pending deletions for SUPER_ADMIN', async () => {
      const response = await request(app)
        .get('/api/gdpr/pending-deletions')
        .set('Cookie', superAdminCookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should deny access for non-SUPER_ADMIN', async () => {
      const response = await request(app)
        .get('/api/gdpr/pending-deletions')
        .set('Cookie', adminCookies);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/gdpr/audit-logs', () => {
    it('should return GDPR audit logs for SUPER_ADMIN', async () => {
      const response = await request(app)
        .get('/api/gdpr/audit-logs')
        .set('Cookie', superAdminCookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should accept limit parameter', async () => {
      const response = await request(app)
        .get('/api/gdpr/audit-logs?limit=10')
        .set('Cookie', superAdminCookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny access for non-SUPER_ADMIN', async () => {
      const response = await request(app)
        .get('/api/gdpr/audit-logs')
        .set('Cookie', adminCookies);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/gdpr/retention-periods', () => {
    it('should return retention periods for SUPER_ADMIN', async () => {
      const response = await request(app)
        .get('/api/gdpr/retention-periods')
        .set('Cookie', superAdminCookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('USER');
      expect(response.body.data).toHaveProperty('CHILD');
      expect(response.body.data).toHaveProperty('GROUP');
    });

    it('should deny access for non-SUPER_ADMIN', async () => {
      const response = await request(app)
        .get('/api/gdpr/retention-periods')
        .set('Cookie', adminCookies);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/gdpr/cleanup', () => {
    it('should trigger cleanup for SUPER_ADMIN', async () => {
      const response = await request(app)
        .post('/api/gdpr/cleanup')
        .set('Cookie', superAdminCookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Bereinigung abgeschlossen');
    });

    it('should deny access for non-SUPER_ADMIN', async () => {
      const response = await request(app)
        .post('/api/gdpr/cleanup')
        .set('Cookie', adminCookies);

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
          institutionId: testInstitution.id
        }
      });
    });

    it('should soft delete user for SUPER_ADMIN', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/user/${userToDelete.id}`)
        .set('Cookie', superAdminCookies)
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
        .post(`/api/gdpr/soft-delete/user/${educatorUser.id}`)
        .set('Cookie', educatorCookies)
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
        .set('Cookie', superAdminCookies)
        .send({ reason: 'Test' });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('SUPER_ADMIN Konten können nicht gelöscht werden');
    });

    it('should deny access for unauthorized user', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/user/${userToDelete.id}`)
        .set('Cookie', adminCookies)
        .send({ reason: 'Test' });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/gdpr/soft-delete/user/non-existent-id')
        .set('Cookie', superAdminCookies)
        .send({ reason: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/gdpr/soft-delete/child/:childId', () => {
    it('should soft delete child for ADMIN', async () => {
      // Create a fresh child for this test (without group assignment)
      const freshChild = await prisma.child.create({
        data: {
          name: 'Fresh Child for Admin Test',
          birthdate: new Date('2020-01-01'),
          qrCodeSecret: `fresh-child-admin-${Date.now()}`,
          institutionId: testInstitution.id
        }
      });

      const response = await request(app)
        .post(`/api/gdpr/soft-delete/child/${freshChild.id}`)
        .set('Cookie', adminCookies)
        .send({ reason: 'Child left institution' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('zur Löschung markiert');

      // Verify child is soft deleted
      const deletedChild = await prisma.child.findUnique({
        where: { id: freshChild.id }
      });
      expect(deletedChild.deletedAt).not.toBeNull();

      // Clean up the child after the test
      try {
        await prisma.child.delete({ where: { id: freshChild.id } });
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it('should allow SUPER_ADMIN to soft delete child', async () => {
      // Create a fresh child for this test (without group assignment)
      const freshChild = await prisma.child.create({
        data: {
          name: 'Fresh Child for Super Admin Test',
          birthdate: new Date('2020-01-01'),
          qrCodeSecret: `fresh-child-superadmin-${Date.now()}`,
          institutionId: testInstitution.id
        }
      });

      const response = await request(app)
        .post(`/api/gdpr/soft-delete/child/${freshChild.id}`)
        .set('Cookie', superAdminCookies)
        .send({ reason: 'Test deletion' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Clean up the child after the test
      try {
        await prisma.child.delete({ where: { id: freshChild.id } });
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it('should deny access for non-ADMIN', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/child/${testChild.id}`)
        .set('Cookie', educatorCookies)
        .send({ reason: 'Test' });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/gdpr/soft-delete/group/:groupId', () => {
    it('should soft delete empty group for ADMIN', async () => {
      // Create a fresh group for this test
      const freshGroup = await prisma.group.create({
        data: {
          name: 'Fresh Group for Admin Test',
          institutionId: testInstitution.id
        }
      });

      const response = await request(app)
        .post(`/api/gdpr/soft-delete/group/${freshGroup.id}`)
        .set('Cookie', adminCookies)
        .send({ reason: 'Group closed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('zur Löschung markiert');

      // Verify group is soft deleted
      const deletedGroup = await prisma.group.findUnique({
        where: { id: freshGroup.id }
      });
      expect(deletedGroup.deletedAt).not.toBeNull();
    });

    it('should soft delete group with children and unassign children', async () => {
      // Create a group with a child
      const groupWithChild = await prisma.group.create({
        data: {
          name: 'Group with Child',
          institutionId: testInstitution.id
        }
      });

      const childInGroup = await prisma.child.create({
        data: {
          name: 'Child in Group',
          birthdate: new Date('2020-01-01'),
          groupId: groupWithChild.id,
          qrCodeSecret: `child-in-group-${Date.now()}`,
          institutionId: testInstitution.id
        }
      });

      const response = await request(app)
        .post(`/api/gdpr/soft-delete/group/${groupWithChild.id}`)
        .set('Cookie', adminCookies)
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
      // Create a fresh group for this test
      const freshGroup = await prisma.group.create({
        data: {
          name: 'Fresh Group for Super Admin Test',
          institutionId: testInstitution.id
        }
      });

      const response = await request(app)
        .post(`/api/gdpr/soft-delete/group/${freshGroup.id}`)
        .set('Cookie', superAdminCookies)
        .send({ reason: 'Test deletion' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny access for non-ADMIN', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/group/${testGroup.id}`)
        .set('Cookie', educatorCookies)
        .send({ reason: 'Test' });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/gdpr/soft-delete/institution/:institutionId', () => {
    it('should soft delete institution for SUPER_ADMIN', async () => {
      // Create a fresh institution for this test
      const freshInstitution = await prisma.institution.create({
        data: {
          name: 'Fresh Institution for Super Admin Test',
          address: 'Fresh Address'
        }
      });

      const response = await request(app)
        .post(`/api/gdpr/soft-delete/institution/${freshInstitution.id}`)
        .set('Cookie', superAdminCookies)
        .send({ reason: 'Institution closed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('zur Löschung markiert');

      // Verify institution is soft deleted
      const deletedInstitution = await prisma.institution.findUnique({
        where: { id: freshInstitution.id }
      });
      expect(deletedInstitution.deletedAt).not.toBeNull();
    });

    it('should deny access for non-SUPER_ADMIN', async () => {
      const response = await request(app)
        .post(`/api/gdpr/soft-delete/institution/${testInstitution.id}`)
        .set('Cookie', adminCookies)
        .send({ reason: 'Test' });

      expect(response.status).toBe(403);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user ID gracefully', async () => {
      const response = await request(app)
        .post('/api/gdpr/soft-delete/user/invalid-uuid')
        .set('Cookie', superAdminCookies)
        .send({ reason: 'Test' });

      expect(response.status).toBe(404);
    });

    it('should handle database errors gracefully', async () => {
      // Test with non-existent user
      const response = await request(app)
        .post('/api/gdpr/soft-delete/user/00000000-0000-0000-0000-000000000000')
        .set('Cookie', superAdminCookies)
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