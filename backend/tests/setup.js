// Set test environment
process.env.NODE_ENV = 'test';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../src/app');

const prisma = new PrismaClient();

// Global test data storage
const testDataStorage = {
  users: [],
  children: [],
  groups: [],
  institutions: [],
  notes: [],
  checkIns: [],
  messages: [],
  notifications: [],
  activityLogs: [],
  personalTasks: [],
  gdprRequests: [],
  dataRestrictions: [],
  dataObjections: [],
  dataBreaches: [],
  closedDays: [],
  deviceTokens: [],
  failedLogins: [],
  chatChannels: [],
  directMessages: [],
  messageReactions: [],
  chatReadStatus: [],
  notes: [],
  
  // Helper to create test data
  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password || 'testpass123', 10);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    });
    this.users.push(user);
    return user;
  },

  async createInstitution(institutionData) {
    const institution = await prisma.institution.create({
      data: institutionData
    });
    this.institutions.push(institution);
    return institution;
  },

  async createGroup(groupData) {
    const group = await prisma.group.create({
      data: groupData
    });
    this.groups.push(group);
    return group;
  },

  async createChild(childData) {
    const child = await prisma.child.create({
      data: childData
    });
    this.children.push(child);
    return child;
  },

  // Cleanup function - delete in correct order to avoid foreign key constraints
  async cleanup() {
    try {
      // Delete in reverse dependency order
      await prisma.messageReaction.deleteMany({});
      await prisma.chatReadStatus.deleteMany({});
      await prisma.directMessage.deleteMany({});
      await prisma.chatChannel.deleteMany({});
      await prisma.note.deleteMany({});
      await prisma.personalTask.deleteMany({});
      await prisma.activityLog.deleteMany({});
      await prisma.notificationLog.deleteMany({});
      await prisma.message.deleteMany({});
      await prisma.checkInLog.deleteMany({});
      await prisma.deviceToken.deleteMany({});
      await prisma.failedLogin.deleteMany({});
      await prisma.closedDay.deleteMany({});
      await prisma.dataRestriction.deleteMany({});
      await prisma.dataObjection.deleteMany({});
      await prisma.dataBreach.deleteMany({});
      await prisma.gDPRRequest.deleteMany({});
      await prisma.child.deleteMany({});
      await prisma.group.deleteMany({});
      await prisma.user.deleteMany({});
      await prisma.institution.deleteMany({});
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
};

// Helper to create complete test data for a test
async function createTestData(options = {}) {
  const timestamp = Date.now();
  const {
    institutionName = `Test Kita ${timestamp}`,
    adminEmail = `admin-${timestamp}@test.de`,
    parentEmail = `parent-${timestamp}@test.de`,
    educatorEmail = `educator-${timestamp}@test.de`,
    childName = `Test Child ${timestamp}`,
    groupName = `Test Group ${timestamp}`,
    adminRole = 'ADMIN',
    parentRole = 'PARENT',
    educatorRole = 'EDUCATOR'
  } = options;

  // Create institution
  const institution = await testDataStorage.createInstitution({
    name: institutionName,
    address: 'Test Address'
  });

  // Create admin user
  const adminUser = await testDataStorage.createUser({
    email: adminEmail,
    password: 'testpass123',
    name: 'Test Admin',
    role: adminRole,
    institutionId: institution.id
  });

  // Create parent user
  const parentUser = await testDataStorage.createUser({
    email: parentEmail,
    password: 'testpass123',
    name: 'Test Parent',
    role: parentRole
  });

  // Create educator user
  const educatorUser = await testDataStorage.createUser({
    email: educatorEmail,
    password: 'testpass123',
    name: 'Test Educator',
    role: educatorRole,
    institutionId: institution.id
  });

  // Create group
  const group = await testDataStorage.createGroup({
    name: groupName,
    institutionId: institution.id
  });

  // Connect educator to group
  await prisma.group.update({
    where: { id: group.id },
    data: {
      educators: {
        connect: { id: educatorUser.id }
      }
    }
  });

  // Create child
  const child = await testDataStorage.createChild({
    name: childName,
    birthdate: new Date('2018-01-01T00:00:00.000Z'),
    institutionId: institution.id,
    groupId: group.id,
    qrCodeSecret: `test-qr-secret-${timestamp}`,
    manualConsentGiven: false,
    manualConsentDate: null
  });

  // Connect parent to child
  await prisma.child.update({
    where: { id: child.id },
    data: {
      parents: {
        connect: { id: parentUser.id }
      }
    }
  });

  return {
    institution,
    adminUser,
    parentUser,
    educatorUser,
    group,
    child,
    timestamp
  };
}

// Helper to login user and get cookies
async function loginUser(email, password) {
  const response = await request(app)
    .post('/auth/login')
    .send({ email, password });
  
  if (response.status === 200) {
    return response.headers['set-cookie'];
  }
  return null;
}

// Helper to set cookie header only if defined
function maybeSetCookie(request, cookies) {
  if (cookies) {
    request.set('Cookie', cookies);
  }
}

// Helper to hash passwords for test data
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Global setup and teardown
beforeAll(async () => {
  // Ensure clean database before all tests
  await testDataStorage.cleanup();
});

afterAll(async () => {
  // Clean up after all tests
  await testDataStorage.cleanup();
  await prisma.$disconnect();
});

module.exports = {
  prisma,
  createTestData,
  testDataStorage,
  createUser: testDataStorage.createUser.bind(testDataStorage),
  loginUser,
  maybeSetCookie,
  hashPassword,
}; 