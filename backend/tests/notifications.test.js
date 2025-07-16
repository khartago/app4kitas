const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

describe('Notifications API', () => {
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
        name: `Notifications Test Kita ${timestamp}`,
        address: 'Notifications Test Address'
      }
    });
    // Create admin user
    adminUser = await prisma.user.create({
      data: {
        email: `admin-notifications-${timestamp}@test.de`,
        password: await bcrypt.hash('AdminNotifications123!', 10),
        role: 'ADMIN',
        institutionId: testInstitution.id,
        name: 'Admin Notifications'
      }
    });
    // Create group
    testGroup = await prisma.group.create({
      data: {
        name: `Notifications Gruppe ${timestamp}`,
        institutionId: testInstitution.id
      }
    });
    // Create child
    testChild = await prisma.child.create({
      data: {
        name: `Notifications Kind ${timestamp}`,
        birthdate: '2018-01-01',
        institutionId: testInstitution.id,
        groupId: testGroup.id,
        qrCodeSecret: `test-qr-secret-${timestamp}`
      }
    });
    // Login admin
    adminCookies = await request(app)
      .post('/api/login')
      .send({ 
        email: adminUser.email, 
        password: 'AdminNotifications123!' 
      });
  });

  afterEach(async () => {
    // Cleanup order: children -> groups -> users -> institution
    await prisma.child.deleteMany({ where: { institutionId: testInstitution.id } });
    await prisma.group.deleteMany({ where: { institutionId: testInstitution.id } });
    await prisma.user.deleteMany({ where: { institutionId: testInstitution.id } });
    await prisma.institution.delete({ where: { id: testInstitution.id } });
  });

  describe('GET /api/notifications/:userId', () => {
    it('should get notifications for educator', async () => {
      const res = await request(app)
        .get(`/api/notifications/${testChild.id}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('notifications');
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });

    it('should get notifications for admin', async () => {
      const res = await request(app)
        .get(`/api/notifications/${adminUser.id}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('notifications');
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });

    it('should get notifications for parent', async () => {
      const res = await request(app)
        .get(`/api/notifications/${adminUser.id}`)
        .set('Cookie', adminCookies);

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
        .get(`/api/notifications/${adminUser.id}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Keine Berechtigung/);
    });
  });

  describe('POST /api/notifications/send', () => {
    it('should create notification for educator', async () => {
      const notificationData = {
        recipientType: 'single_educator',
        recipientId: testChild.id,
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
        recipientId: testChild.id,
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
        recipientId: adminUser.id,
        title: 'Message from Admin',
        body: 'You have a new message',
        priority: 'normal'
      };

      const res = await request(app)
        .post('/api/notifications/send')
        .set('Cookie', adminCookies)
        .send(notificationData);

      expect(res.statusCode).toBe(201);
      expect(res.body.notifications[0].userId).toBe(adminUser.id);
    });

    it('should return 400 for invalid notification data', async () => {
      const invalidData = {
        recipientType: 'single_admin',
        recipientId: adminUser.id,
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
        recipientId: adminUser.id,
        title: 'Test Notification',
        body: 'This is a test notification'
      };

      const res = await request(app)
        .post('/api/notifications/send')
        .set('Cookie', adminCookies);

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
          userId: testChild.id,
          title: 'Test Notification',
          body: 'This is a test notification',
          priority: 'normal',
          read: false,
          institutionId: testInstitution.id
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
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.notification.read).toBe(true);
    });

    it('should return 403 for unauthorized access', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${testNotification.id}`)
        .set('Cookie', adminCookies);

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
          userId: testChild.id,
          title: 'Test Notification',
          body: 'This is a test notification',
          priority: 'normal',
          institutionId: testInstitution.id
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
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Benachrichtigung gelöscht/);
    });

    it('should return 403 for unauthorized access', async () => {
      const res = await request(app)
        .delete(`/api/notifications/${testNotification.id}`)
        .set('Cookie', adminCookies);

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
            userId: testChild.id,
            title: 'Unread Notification 1',
            body: 'This is unread',
            read: false,
            institutionId: testInstitution.id
          },
          {
            userId: testChild.id,
            title: 'Read Notification',
            body: 'This is read',
            read: true,
            institutionId: testInstitution.id
          },
          {
            userId: testChild.id,
            title: 'Unread Notification 2',
            body: 'This is also unread',
            read: false,
            institutionId: testInstitution.id
          }
        ]
      });
    });

    afterEach(async () => {
      // Clean up test notifications
      await prisma.notificationLog.deleteMany({
        where: {
          userId: testChild.id,
          title: {
            in: ['Unread Notification 1', 'Read Notification', 'Unread Notification 2']
          }
        }
      });
    });

    it('should get unread notifications count', async () => {
      const res = await request(app)
        .get(`/api/notifications/stats/${testChild.id}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('stats');
      expect(typeof res.body.stats.unread).toBe('number');
      expect(res.body.stats.unread).toBeGreaterThanOrEqual(2);
    });

    it('should return 403 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/notifications/stats/non-existent-id')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Keine Berechtigung/);
    });
  });
}); 