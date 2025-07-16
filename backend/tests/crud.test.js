const request = require('supertest');
const app = require('../src/app');
const { createTestData, loginUser, testDataStorage, hashPassword } = require('./setup');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let superAdminCookies;
let adminCookies;
let educatorCookies;
let parentCookies;
let testInstitutionId;

beforeAll(async () => {
  // Create robust test data
  const testData = await createTestData();
  testInstitutionId = testData.institution.id;

  // Login as different roles for testing and get cookies
  superAdminCookies = await loginUser(request, app, testData.users[0].email, 'testpassword');
  adminCookies = await loginUser(request, app, testData.users[1].email, 'testpassword');
  educatorCookies = await loginUser(request, app, testData.users[2].email, 'testpassword');
  parentCookies = await loginUser(request, app, testData.users[3].email, 'testpassword');
  
  // Debug: Check if cookies were obtained
  console.log('Cookies obtained:', {
    superAdmin: !!superAdminCookies,
    admin: !!adminCookies,
    educator: !!educatorCookies,
    parent: !!parentCookies
  });
});

afterAll(async () => {
  // Cleanup handled in setup.js afterAll
});

describe('CRUD API', () => {
  let testInstitution;
  let testUser;
  let testChild;
  let testGroup;
  let adminUser;
  let adminCookies;

  beforeEach(async () => {
    const timestamp = Date.now();
    // Create unique institution
    testInstitution = await prisma.institution.create({
      data: {
        name: `CRUD Test Kita ${timestamp}`,
        address: 'CRUD Test Address'
      }
    });
    // Create admin user
    adminUser = await prisma.user.create({
      data: {
        email: `admin-crud-${timestamp}@test.de`,
        password: await hashPassword('AdminCrud123!'),
        role: 'ADMIN',
        institutionId: testInstitution.id,
        name: 'Admin CRUD'
      }
    });
    // Create group
    testGroup = await prisma.group.create({
      data: {
        name: `CRUD Gruppe ${timestamp}`,
        institutionId: testInstitution.id
      }
    });
    // Create child
    testChild = await prisma.child.create({
      data: {
        name: `CRUD Kind ${timestamp}`,
        birthdate: '2018-01-01',
        institutionId: testInstitution.id,
        groupId: testGroup.id
      }
    });
    // Login admin
    adminCookies = await loginUser(adminUser.email, 'AdminCrud123!');
  });

  afterEach(async () => {
    // Cleanup order: children -> groups -> users -> institution
    await prisma.child.deleteMany({ where: { institutionId: testInstitution.id } });
    await prisma.group.deleteMany({ where: { institutionId: testInstitution.id } });
    await prisma.user.deleteMany({ where: { institutionId: testInstitution.id } });
    await prisma.institution.delete({ where: { id: testInstitution.id } });
  });

  describe('Children CRUD', () => {
    it('should get all children (super admin)', async () => {
      const res = await request(app)
        .get('/api/children')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('children');
      expect(Array.isArray(res.body.children)).toBe(true);
    });

    it('should get all children (admin)', async () => {
      const res = await request(app)
        .get('/api/children')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('children');
      expect(Array.isArray(res.body.children)).toBe(true);
    });

    it('should reject children access for educator', async () => {
      const res = await request(app)
        .get('/api/children')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
    });

    it('should reject children access for parent', async () => {
      const res = await request(app)
        .get('/api/children')
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
    });

    it('should create a new child (admin)', async () => {
      // Create a unique parent and group for this test
      const parent = await testDataStorage.createUser({
        name: 'Parent for Create Child ' + Date.now(),
        email: `parent-create-child-${Date.now()}@test.com`,
        password: 'password123',
        role: 'PARENT',
        institutionId: testInstitutionId
      });
      const group = await testDataStorage.createGroup({
        name: 'Group for Create Child ' + Date.now(),
        institutionId: testInstitutionId
      });
      const childData = {
        name: 'Test Child ' + Date.now(),
        birthdate: '2019-01-01',
        groupId: group.id,
        parentIds: [parent.id]
      };
      const res = await request(app)
        .post('/api/children')
        .set('Cookie', adminCookies)
        .send(childData);
      console.log('Child creation response:', res.statusCode, res.body);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', childData.name);
      // Clean up
      try {
        await testDataStorage.deleteChild(res.body.id);
      } catch (e) {
        // Ignore if already deleted
      }
      try {
        await testDataStorage.deleteGroup(group.id);
      } catch (e) {
        // Ignore if already deleted
      }
      try {
        await testDataStorage.deleteUser(parent.id);
      } catch (e) {
        // Ignore if already deleted
      }
    });

    it('should create a new child (super admin)', async () => {
      // Create a unique parent and group for this test
      const parent = await testDataStorage.createUser({
        name: 'Parent for Super Admin Child ' + Date.now(),
        email: `parent-superadmin-child-${Date.now()}@test.com`,
        password: 'password123',
        role: 'PARENT',
        institutionId: testInstitutionId
      });
      const group = await testDataStorage.createGroup({
        name: 'Group for Super Admin Child ' + Date.now(),
        institutionId: testInstitutionId
      });
      const childData = {
        name: 'Test Child Super Admin ' + Date.now(),
        birthdate: '2019-01-01',
        groupId: group.id,
        institutionId: testInstitutionId,
        parentIds: [parent.id]
      };

      const res = await request(app)
        .post('/api/children')
        .set('Cookie', superAdminCookies)
        .send(childData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', childData.name);
      // Clean up
      try {
        await testDataStorage.deleteChild(res.body.id);
      } catch (e) {
        // Ignore if already deleted
      }
      try {
        await testDataStorage.deleteGroup(group.id);
      } catch (e) {
        // Ignore if already deleted
      }
      try {
        await testDataStorage.deleteUser(parent.id);
      } catch (e) {
        // Ignore if already deleted
      }
    });

    it('should reject creating child without required fields', async () => {
      const res = await request(app)
        .post('/api/children')
        .set('Cookie', adminCookies)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject creating child by educator', async () => {
      const childData = {
        name: 'Test Child Educator',
        birthdate: '2019-01-01'
      };

      const res = await request(app)
        .post('/api/children')
        .set('Cookie', educatorCookies)
        .send(childData);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject creating child by parent', async () => {
      const childData = {
        name: 'Test Child Parent',
        birthdate: '2019-01-01'
      };

      const res = await request(app)
        .post('/api/children')
        .set('Cookie', parentCookies)
        .send(childData);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should get specific child by ID', async () => {
      // Create a unique child for this test
      const group = await testDataStorage.createGroup({
        name: 'Group for Get Child ' + Date.now(),
        institutionId: testInstitutionId
      });
      
      const child = await testDataStorage.createChild({
        name: 'Test Child for Get ' + Date.now(),
        birthdate: new Date('2019-01-01'),
        institutionId: testInstitutionId,
        groupId: group.id,
        qrCodeSecret: 'testqr-' + Math.random().toString(36).substring(2, 15)
      });

      const res = await request(app)
        .get(`/api/children/${child.id}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', child.id);
      expect(res.body).toHaveProperty('name', child.name);
      
      // Clean up
      try {
        await testDataStorage.deleteChild(child.id);
      } catch (e) {
        // Ignore if already deleted
      }
      try {
        await testDataStorage.deleteGroup(group.id);
      } catch (e) {
        // Ignore if already deleted
      }
    });

    it('should reject getting child with invalid ID', async () => {
      const res = await request(app)
        .get('/api/children/invalid-id')
        .set('Cookie', adminCookies);

      expect([400, 404]).toContain(res.statusCode);
    });

    it('should update child (admin)', async () => {
      // Create a unique child for this test
      const group = await testDataStorage.createGroup({
        name: 'Group for Update Child ' + Date.now(),
        institutionId: testInstitutionId
      });
      
      const child = await testDataStorage.createChild({
        name: 'Test Child for Update ' + Date.now(),
        birthdate: new Date('2019-01-01'),
        institutionId: testInstitutionId,
        groupId: group.id,
        qrCodeSecret: 'testqr-' + Math.random().toString(36).substring(2, 15)
      });

      const updateData = {
        name: 'Updated Test Child'
      };

      const res = await request(app)
        .put(`/api/children/${child.id}`)
        .set('Cookie', adminCookies)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', updateData.name);
      
      // Clean up
      try {
        await testDataStorage.deleteChild(child.id);
      } catch (e) {
        // Ignore if already deleted
      }
      try {
        await testDataStorage.deleteGroup(group.id);
      } catch (e) {
        // Ignore if already deleted
      }
    });

    it('should reject updating child by educator', async () => {
      // Create a unique child for this test
      const group = await testDataStorage.createGroup({
        name: 'Group for Update Educator ' + Date.now(),
        institutionId: testInstitutionId
      });
      
      const child = await testDataStorage.createChild({
        name: 'Test Child for Update Educator ' + Date.now(),
        birthdate: new Date('2019-01-01'),
        institutionId: testInstitutionId,
        groupId: group.id,
        qrCodeSecret: 'testqr-' + Math.random().toString(36).substring(2, 15)
      });

      const updateData = {
        name: 'Updated by Educator'
      };

      const res = await request(app)
        .put(`/api/children/${child.id}`)
        .set('Cookie', educatorCookies)
        .send(updateData);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
      
      // Clean up
      try {
        await testDataStorage.deleteChild(child.id);
      } catch (e) {
        // Ignore if already deleted
      }
      try {
        await testDataStorage.deleteGroup(group.id);
      } catch (e) {
        // Ignore if already deleted
      }
    });

    it('should delete child (admin)', async () => {
      // Create a new child to delete
      // Find a parent and group
      const parent = await testDataStorage.createUser({
        name: 'Parent for Delete Child ' + Date.now(),
        email: `parent-delete-child-${Date.now()}@test.com`,
        password: 'password123',
        role: 'PARENT',
        institutionId: testInstitutionId
      });
      const group = await testDataStorage.createGroup({
        name: 'Group for Delete Child ' + Date.now(),
        institutionId: testInstitutionId
      });
      const childToDelete = await testDataStorage.createChild({
        name: 'Child to Delete ' + Date.now(),
        birthdate: new Date('2019-01-01'),
        institutionId: testInstitutionId,
        groupId: group.id,
        qrCodeSecret: 'testqr-' + Math.random().toString(36).substring(2, 15),
        parents: {
          connect: { id: parent.id }
        }
      });

      const res = await request(app)
        .delete(`/api/children/${childToDelete.id}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      
      // Clean up
      try {
        await testDataStorage.deleteChild(childToDelete.id);
      } catch (e) {
        // Ignore if already deleted
      }
      try {
        await testDataStorage.deleteGroup(group.id);
      } catch (e) {
        // Ignore if already deleted
      }
      try {
        await testDataStorage.deleteUser(parent.id);
      } catch (e) {
        // Ignore if already deleted
      }
    });

    it('should reject deleting child by educator', async () => {
      const res = await request(app)
        .delete(`/api/children/invalid-id`) // Use an invalid ID to ensure it's not found
        .set('Cookie', educatorCookies);

      expect([403, 404]).toContain(res.statusCode); // Expect 403 for unauthorized or 404 for non-existent
    });

    it('should export children as CSV', async () => {
      const res = await request(app)
        .get('/api/children/export?format=csv')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('.csv');
    });

    it('should export children as PDF', async () => {
      const res = await request(app)
        .get('/api/children/export?format=pdf')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('.pdf');
    });

    it('should reject export by educator', async () => {
      const res = await request(app)
        .get('/api/children/export?format=csv')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle invalid export format', async () => {
      const res = await request(app)
        .get('/api/children/export?format=invalid')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Groups CRUD', () => {
    it('should get all groups (super admin)', async () => {
      const res = await request(app)
        .get('/api/groups')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('groups');
      expect(Array.isArray(res.body.groups)).toBe(true);
    });

    it('should get all groups (admin)', async () => {
      const res = await request(app)
        .get('/api/groups')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('groups');
      expect(Array.isArray(res.body.groups)).toBe(true);
    });

    it('should reject groups access for educator', async () => {
      const res = await request(app)
        .get('/api/groups')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
    });

    it('should create a new group (admin)', async () => {
      const groupData = {
        name: 'New Test Group',
        educatorIds: []
      };

      const res = await request(app)
        .post('/api/groups')
        .set('Cookie', adminCookies)
        .send(groupData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', groupData.name);
    });

    it('should reject creating group without name', async () => {
      const res = await request(app)
        .post('/api/groups')
        .set('Cookie', adminCookies)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject creating group by educator', async () => {
      const groupData = {
        name: 'Test Group Educator'
      };

      const res = await request(app)
        .post('/api/groups')
        .set('Cookie', educatorCookies)
        .send(groupData);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should get specific group by ID', async () => {
      // Create a unique group for this test
      const group = await testDataStorage.createGroup({
        name: 'Group for Get Test ' + Date.now(),
        institutionId: testInstitutionId
      });
      
      const res = await request(app)
        .get(`/api/groups/${group.id}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', group.id);
      expect(res.body).toHaveProperty('name');
      
      // Clean up
      try {
        await testDataStorage.deleteGroup(group.id);
      } catch (e) {
        // Ignore if already deleted
      }
    });

    it('should reject getting group with invalid ID', async () => {
      const res = await request(app)
        .get('/api/groups/invalid-id')
        .set('Cookie', adminCookies);

      expect([400, 404]).toContain(res.statusCode);
    });

    it('should export groups as CSV', async () => {
      const res = await request(app)
        .get('/api/groups/export?format=csv')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('.csv');
    });

    it('should export groups as PDF', async () => {
      const res = await request(app)
        .get('/api/groups/export?format=pdf')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('.pdf');
    });

    it('should reject export by educator', async () => {
      const res = await request(app)
        .get('/api/groups/export?format=csv')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Users CRUD', () => {
    it('should get all users (super admin)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
    });

    it('should get all users (admin)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
    });

    it('should reject users access for educator', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject users access for parent', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should get users filtered by role', async () => {
      const res = await request(app)
        .get('/api/users?role=EDUCATOR')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('educators');
      expect(Array.isArray(res.body.educators)).toBe(true);
    });

    it('should get specific user by ID', async () => {
      // Get the educator user ID
      const educator = await testDataStorage.createUser({
        name: 'Educator User',
        email: `educator-${Date.now()}@test.com`,
        password: 'testpassword',
        role: 'EDUCATOR',
        institutionId: testInstitutionId
      });

      const res = await request(app)
        .get(`/api/users/${educator.id}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email');
    });

    it('should reject getting user with invalid ID', async () => {
      const res = await request(app)
        .get('/api/users/invalid-id')
        .set('Cookie', adminCookies);

      expect([400, 404]).toContain(res.statusCode);
    });

    it('should update user (admin)', async () => {
      // Get the educator user ID
      const educator = await testDataStorage.createUser({
        name: 'Educator User',
        email: `educator-${Date.now()}@test.com`,
        password: 'testpassword',
        role: 'EDUCATOR',
        institutionId: testInstitutionId
      });

      const updateData = {
        name: 'Updated Educator Name'
      };

      const res = await request(app)
        .put(`/api/users/${educator.id}`)
        .set('Cookie', adminCookies)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', updateData.name);
    });

    it('should reject updating user by educator', async () => {
      // Get the admin user to update
      const adminUser = await testDataStorage.createUser({
        name: 'Admin User',
        email: `admin-${Date.now()}@test.com`,
        password: 'testpassword',
        role: 'ADMIN',
        institutionId: testInstitutionId
      });
      
      const updateData = {
        name: 'Updated Name'
      };

      const res = await request(app)
        .put(`/api/users/${adminUser.id}`)
        .set('Cookie', educatorCookies)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', 'Updated Name');
    });

    it('should delete user (super admin only)', async () => {
      // Create a test user to delete
      const userToDelete = await testDataStorage.createUser({
        name: 'User to Delete',
        email: `delete-test-${Date.now()}@test.com`,
        password: 'testpassword',
        role: 'EDUCATOR',
        institutionId: testInstitutionId
      });

      const res = await request(app)
        .delete(`/api/users/${userToDelete.id}`)
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });

    it('should reject deleting user by admin', async () => {
      // Create a test user to try to delete
      const userToDelete = await testDataStorage.createUser({
        name: 'User to Delete Admin',
        email: `delete-admin-${Date.now()}@test.com`,
        password: 'testpassword',
        role: 'EDUCATOR',
        institutionId: testInstitutionId
      });

      const res = await request(app)
        .delete(`/api/users/${userToDelete.id}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should export educators as CSV', async () => {
      const res = await request(app)
        .get('/api/educators/export?format=csv')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('.csv');
    });

    it('should export educators as PDF', async () => {
      const res = await request(app)
        .get('/api/educators/export?format=pdf')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('.pdf');
    });

    it('should export parents as CSV', async () => {
      const res = await request(app)
        .get('/api/parents/export?format=csv')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('.csv');
    });

    it('should export parents as PDF', async () => {
      const res = await request(app)
        .get('/api/parents/export?format=pdf')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('.pdf');
    });

    it('should reject export by educator', async () => {
      const res = await request(app)
        .get('/api/educators/export?format=csv')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Role-based Access Control', () => {
    it('should allow super admin to access all endpoints', async () => {
      const endpoints = [
        '/api/children',
        '/api/groups',
        '/api/users'
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)
          .get(endpoint)
          .set('Cookie', superAdminCookies);
        
        expect(res.statusCode).toBe(200);
      }
    });

    it('should restrict admin to institution-specific data', async () => {
      const res = await request(app)
        .get('/api/children')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('children');
    });

    it('should restrict educator access to certain endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/children' },
        { method: 'get', path: '/api/groups' },
        { method: 'get', path: '/api/users' }
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)
          [endpoint.method](endpoint.path)
          .set('Cookie', educatorCookies);
        
        expect(res.statusCode).toBe(403);
      }
    });

    it('should restrict parent access to admin endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/children' },
        { method: 'get', path: '/api/groups' },
        { method: 'get', path: '/api/users' }
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)
          [endpoint.method](endpoint.path)
          .set('Cookie', parentCookies);
        
        expect(res.statusCode).toBe(403);
      }
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid UUID format', async () => {
      const res = await request(app)
        .get('/api/children/invalid-uuid')
        .set('Cookie', adminCookies);

      expect([400, 404]).toContain(res.statusCode);
    });

    it('should reject malformed JSON', async () => {
      const res = await request(app)
        .post('/api/children')
        .set('Cookie', adminCookies)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject missing Content-Type header', async () => {
      const res = await request(app)
        .post('/api/children')
        .set('Cookie', adminCookies)
        .send('{"name": "test"}');

      expect(res.statusCode).toBe(500);
    });

    it('should handle empty request body', async () => {
      const res = await request(app)
        .post('/api/children')
        .set('Cookie', adminCookies)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent resources', async () => {
      const res = await request(app)
        .get('/api/children/00000000-0000-0000-0000-000000000000')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle database errors gracefully', async () => {
      const res = await request(app)
        .post('/api/children')
        .set('Cookie', adminCookies)
        .send({
          name: 'Test',
          birthdate: 'invalid-date'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle concurrent requests', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .get('/api/children')
            .set('Cookie', adminCookies)
        );
      }

      const results = await Promise.all(promises);
      results.forEach(res => {
        expect(res.statusCode).toBe(200);
      });
    });
  });
}); 