const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

describe('Notifications API', () => {
  let testData = {};
  let superAdminCookies;
  let adminCookies;
  let educatorCookies;
  let parentCookies;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.notificationLog.deleteMany({
      where: {
        title: {
          in: ['Test Notification', 'Urgent Notification', 'Message from Admin', 'Unread Notification 1', 'Read Notification', 'Unread Notification 2']
        }
      }
    });

    await prisma.child.deleteMany({
      where: {
        name: 'Test Child'
      }
    });

    await prisma.group.deleteMany({
      where: {
        name: 'Test Group'
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'superadmin@test.com',
            'admin@test.com', 
            'educator@test.com',
            'parent@test.com'
          ]
        }
      }
    });

    await prisma.institution.deleteMany({
      where: {
        name: 'Test Institution'
      }
    });

    // Create robust test data
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create test institution
    testData.institution = await prisma.institution.create({
      data: {
        name: 'Test Institution',
        address: 'Test Address'
      }
    });

    // Create test users with unique emails
    testData.superAdmin = await prisma.user.create({
      data: {
        name: 'Test Super Admin',
        email: `superadmin-${Date.now()}@test.com`,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        phone: '123456789'
      }
    });

    testData.admin = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: `admin-${Date.now()}@test.com`,
        password: hashedPassword,
        role: 'ADMIN',
        institutionId: testData.institution.id,
        phone: '123456789'
      }
    });

    testData.educator = await prisma.user.create({
      data: {
        name: 'Test Educator',
        email: `educator-${Date.now()}@test.com`,
        password: hashedPassword,
        role: 'EDUCATOR',
        institutionId: testData.institution.id,
        phone: '123456789'
      }
    });

    testData.parent = await prisma.user.create({
      data: {
        name: 'Test Parent',
        email: `parent-${Date.now()}@test.com`,
        password: hashedPassword,
        role: 'PARENT',
        institutionId: testData.institution.id,
        phone: '123456789'
      }
    });

    // Create test group
    testData.group = await prisma.group.create({
      data: {
        name: 'Test Group',
        institutionId: testData.institution.id
      }
    });

    // Create test child
    testData.child = await prisma.child.create({
      data: {
        name: 'Test Child',
        birthdate: new Date('2020-01-01'),
        groupId: testData.group.id,
        institutionId: testData.institution.id,
        qrCodeSecret: `test-qr-secret-${Date.now()}`
      }
    });

    // Link parent to child using the correct relation
    await prisma.user.update({
      where: { id: testData.parent.id },
      data: {
        children: {
          connect: { id: testData.child.id }
        }
      }
    });

    // Link educator to group using the correct relation
    await prisma.user.update({
      where: { id: testData.educator.id },
      data: {
        groups: {
          connect: { id: testData.group.id }
        }
      }
    });

    // Login as different roles
    const superAdminRes = await request(app)
      .post('/api/login')
      .send({ 
        email: testData.superAdmin.email, 
        password: 'password123' 
      });
    superAdminCookies = superAdminRes.headers['set-cookie'];

    const adminRes = await request(app)
      .post('/api/login')
      .send({ 
        email: testData.admin.email, 
        password: 'password123' 
      });
    adminCookies = adminRes.headers['set-cookie'];

    const educatorRes = await request(app)
      .post('/api/login')
      .send({ 
        email: testData.educator.email, 
        password: 'password123' 
      });
    educatorCookies = educatorRes.headers['set-cookie'];

    const parentRes = await request(app)
      .post('/api/login')
      .send({ 
        email: testData.parent.email, 
        password: 'password123' 
      });
    parentCookies = parentRes.headers['set-cookie'];
  });

  afterAll(async () => {
    // Clean up in reverse order to respect foreign key constraints
    // First, delete all notifications for test users
    await prisma.notificationLog.deleteMany({
      where: {
        userId: {
          in: [
            testData.superAdmin?.id,
            testData.admin?.id,
            testData.educator?.id,
            testData.parent?.id
          ].filter(Boolean)
        }
      }
    });

    // Delete any device tokens for test users
    await prisma.deviceToken.deleteMany({
      where: {
        userId: {
          in: [
            testData.superAdmin?.id,
            testData.admin?.id,
            testData.educator?.id,
            testData.parent?.id
          ].filter(Boolean)
        }
      }
    });

    // Delete any activity logs for test users
    await prisma.activityLog.deleteMany({
      where: {
        userId: {
          in: [
            testData.superAdmin?.id,
            testData.admin?.id,
            testData.educator?.id,
            testData.parent?.id
          ].filter(Boolean)
        }
      }
    });

    // Delete any personal tasks for test users
    await prisma.personalTask.deleteMany({
      where: {
        userId: {
          in: [
            testData.superAdmin?.id,
            testData.admin?.id,
            testData.educator?.id,
            testData.parent?.id
          ].filter(Boolean)
        }
      }
    });

    // Delete any notes for test child
    if (testData.child?.id) {
      await prisma.note.deleteMany({
        where: {
          childId: testData.child.id
        }
      });
    }

    // Delete any messages for test child
    if (testData.child?.id) {
      await prisma.message.deleteMany({
        where: {
          childId: testData.child.id
        }
      });
    }

    // Delete any check-in logs for test child
    if (testData.child?.id) {
      await prisma.checkInLog.deleteMany({
        where: {
          childId: testData.child.id
        }
      });
    }

    // Delete test child
    if (testData.child?.id) {
      try {
        await prisma.child.delete({
          where: { id: testData.child.id }
        });
      } catch (error) {
        // Child may already be deleted, ignore error
        console.log('Child already deleted or not found');
      }
    }

    // Delete test group
    if (testData.group?.id) {
      try {
        await prisma.group.delete({
          where: { id: testData.group.id }
        });
      } catch (error) {
        // Group may already be deleted, ignore error
        console.log('Group already deleted or not found');
      }
    }

    // Delete any chat channels for test institution
    if (testData.institution?.id) {
      await prisma.chatChannel.deleteMany({
        where: {
          institutionId: testData.institution.id
        }
      });
    }

    // Delete any closed days for test institution
    if (testData.institution?.id) {
      await prisma.closedDay.deleteMany({
        where: {
          institutionId: testData.institution.id
        }
      });
    }

    // Delete test users
    if (testData.superAdmin?.id || testData.admin?.id || testData.educator?.id || testData.parent?.id) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: [
              testData.superAdmin?.id,
              testData.admin?.id,
              testData.educator?.id,
              testData.parent?.id
            ].filter(Boolean)
          }
        }
      });
    }

    // Delete test institution
    if (testData.institution?.id) {
      await prisma.institution.delete({
        where: { id: testData.institution.id }
      });
    }

    await prisma.$disconnect();
  });

  describe('GET /api/notifications/:userId', () => {
    it('should get notifications for educator', async () => {
      const res = await request(app)
        .get(`/api/notifications/${testData.educator.id}`)
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('notifications');
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });

    it('should get notifications for admin', async () => {
      const res = await request(app)
        .get(`/api/notifications/${testData.admin.id}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('notifications');
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });

    it('should get notifications for parent', async () => {
      const res = await request(app)
        .get(`/api/notifications/${testData.parent.id}`)
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('notifications');
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });

    it('should return 403 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/notifications/non-existent-id')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Keine Berechtigung/);
    });

    it('should return 403 for unauthorized access', async () => {
      const res = await request(app)
        .get(`/api/notifications/${testData.admin.id}`)
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Keine Berechtigung/);
    });
  });

  describe('POST /api/notifications/send', () => {
    it('should create notification for educator', async () => {
      const notificationData = {
        recipientType: 'single_educator',
        recipientId: testData.educator.id,
        title: 'Test Notification',
        body: 'This is a test notification',
        priority: 'normal'
      };

      const res = await request(app)
        .post('/api/notifications/send')
        .set('Cookie', adminCookies)
        .send(notificationData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('notifications');
      expect(Array.isArray(res.body.notifications)).toBe(true);
      expect(res.body.notifications[0].title).toBe(notificationData.title);
      expect(res.body.notifications[0].body).toBe(notificationData.body);
      expect(res.body.notifications[0].priority).toBe(notificationData.priority);
      expect(res.body.notifications[0].read).toBe(false);
    });

    it('should create high priority notification', async () => {
      const notificationData = {
        recipientType: 'single_educator',
        recipientId: testData.educator.id,
        title: 'Urgent Notification',
        body: 'This is an urgent notification',
        priority: 'high'
      };

      const res = await request(app)
        .post('/api/notifications/send')
        .set('Cookie', adminCookies)
        .send(notificationData);

      expect(res.statusCode).toBe(201);
      expect(res.body.notifications[0].priority).toBe('high');
    });

    it('should create notification with sender', async () => {
      const notificationData = {
        recipientType: 'single_parent',
        recipientId: testData.parent.id,
        title: 'Message from Admin',
        body: 'You have a new message',
        priority: 'normal'
      };

      const res = await request(app)
        .post('/api/notifications/send')
        .set('Cookie', adminCookies)
        .send(notificationData);

      expect(res.statusCode).toBe(201);
      expect(res.body.notifications[0].userId).toBe(testData.parent.id);
    });

    it('should return 400 for invalid notification data', async () => {
      const invalidData = {
        recipientType: 'single_admin',
        recipientId: testData.admin.id,
        // Missing title and body
        priority: 'normal'
      };

      const res = await request(app)
        .post('/api/notifications/send')
        .set('Cookie', adminCookies)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/erforderlich/);
    });

    it('should return 403 for unauthorized sender', async () => {
      const notificationData = {
        recipientType: 'single_admin',
        recipientId: testData.admin.id,
        title: 'Test Notification',
        body: 'This is a test notification'
      };

      const res = await request(app)
        .post('/api/notifications/send')
        .set('Cookie', educatorCookies)
        .send(notificationData);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Keine Berechtigung/);
    });
  });

  describe('PATCH /api/notifications/:id', () => {
    let testNotification;

    beforeEach(async () => {
      // Create a test notification
      testNotification = await prisma.notificationLog.create({
        data: {
          userId: testData.educator.id,
          title: 'Test Notification',
          body: 'This is a test notification',
          priority: 'normal',
          read: false,
          institutionId: testData.institution.id
        }
      });
    });

    afterEach(async () => {
      // Clean up test notification
      if (testNotification) {
        await prisma.notificationLog.delete({
          where: { id: testNotification.id }
        });
      }
    });

    it('should mark notification as read', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${testNotification.id}`)
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.notification.read).toBe(true);
    });

    it('should return 403 for unauthorized access', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${testNotification.id}`)
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Keine Berechtigung/);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    let testNotification;

    beforeEach(async () => {
      // Create a test notification
      testNotification = await prisma.notificationLog.create({
        data: {
          userId: testData.educator.id,
          title: 'Test Notification',
          body: 'This is a test notification',
          priority: 'normal',
          institutionId: testData.institution.id
        }
      });
    });

    afterEach(async () => {
      // Clean up test notification if it still exists
      if (testNotification) {
        try {
          await prisma.notificationLog.delete({
            where: { id: testNotification.id }
          });
        } catch (error) {
          // Notification might already be deleted by the test
        }
      }
    });

    it('should delete notification', async () => {
      const res = await request(app)
        .delete(`/api/notifications/${testNotification.id}`)
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Benachrichtigung gelöscht/);
    });

    it('should return 403 for unauthorized access', async () => {
      const res = await request(app)
        .delete(`/api/notifications/${testNotification.id}`)
        .set('Cookie', parentCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Keine Berechtigung/);
    });
  });

  describe('GET /api/notifications/stats/:userId', () => {
    beforeEach(async () => {
      // Create some test notifications
      await prisma.notificationLog.createMany({
        data: [
          {
            userId: testData.educator.id,
            title: 'Unread Notification 1',
            body: 'This is unread',
            read: false,
            institutionId: testData.institution.id
          },
          {
            userId: testData.educator.id,
            title: 'Read Notification',
            body: 'This is read',
            read: true,
            institutionId: testData.institution.id
          },
          {
            userId: testData.educator.id,
            title: 'Unread Notification 2',
            body: 'This is also unread',
            read: false,
            institutionId: testData.institution.id
          }
        ]
      });
    });

    afterEach(async () => {
      // Clean up test notifications
      await prisma.notificationLog.deleteMany({
        where: {
          userId: testData.educator.id,
          title: {
            in: ['Unread Notification 1', 'Read Notification', 'Unread Notification 2']
          }
        }
      });
    });

    it('should get unread notifications count', async () => {
      const res = await request(app)
        .get(`/api/notifications/stats/${testData.educator.id}`)
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('stats');
      expect(typeof res.body.stats.unread).toBe('number');
      expect(res.body.stats.unread).toBeGreaterThanOrEqual(2);
    });

    it('should return 403 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/notifications/stats/non-existent-id')
        .set('Cookie', educatorCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Keine Berechtigung/);
    });
  });
}); 