// Set test environment
process.env.NODE_ENV = 'test';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Test data storage
let testDataStorage = {
  users: [],
  institutions: [],
  groups: [],
  children: [],
  checkinLogs: [],
  messages: [],
  notifications: [],
  notes: [],
  activities: [],
  channels: [], // Added for chat channels
  
  // Helper functions for creating test data
  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password || 'testpassword', 10);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    });
    this.users.push(user);
    return user;
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
  
  async deleteUser(userId) {
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (e) {
      // Ignore if already deleted
    }
  },
  
  async deleteGroup(groupId) {
    try {
      await prisma.group.delete({ where: { id: groupId } });
    } catch (e) {
      // Ignore if already deleted
    }
  },
  
  async deleteChild(childId) {
    try {
      await prisma.child.delete({ where: { id: childId } });
    } catch (e) {
      // Ignore if already deleted
    }
  },

  async deleteChannel(channelId) {
    try {
      await prisma.chatChannel.delete({ where: { id: channelId } });
    } catch (e) {
      // Ignore if already deleted
    }
  },

  async deleteInstitution(institutionId) {
    try {
      await prisma.institution.delete({ where: { id: institutionId } });
    } catch (e) {
      // Ignore if already deleted
    }
  }
};

// Global test setup
beforeAll(async () => {
  // Ensure database is connected
  await prisma.$connect();
});

// Global test teardown
afterAll(async () => {
  await prisma.$disconnect();
});

// Helper function to create test data
async function createTestData() {
  // Generate unique identifiers to avoid conflicts
  const timestamp = Date.now();
  const uniqueSuffix = `-${timestamp}`;
  
  // Clean up any existing test data in correct order
  try {
    await prisma.checkInLog.deleteMany({});
  } catch (e) {
    // Ignore if already deleted
  }
  
  try {
    await prisma.message.deleteMany({});
  } catch (e) {
    // Ignore if already deleted
  }
  
  try {
    await prisma.notificationLog.deleteMany({});
  } catch (e) {
    // Ignore if already deleted
  }
  
  try {
    await prisma.note.deleteMany({});
  } catch (e) {
    // Ignore if already deleted
  }
  
  try {
    await prisma.activityLog.deleteMany({});
  } catch (e) {
    // Ignore if already deleted
  }
  
  try {
    await prisma.child.deleteMany({});
  } catch (e) {
    // Ignore if already deleted
  }
  
  try {
    await prisma.group.deleteMany({});
  } catch (e) {
    // Ignore if already deleted
  }
  
  try {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '-test@app4kitas.de'
        }
      }
    });
  } catch (e) {
    // Ignore if already deleted
  }
  
  try {
    await prisma.institution.deleteMany({
      where: {
        name: {
          contains: 'Test Kita'
        }
      }
    });
  } catch (e) {
    // Ignore if already deleted
  }

  // Create test institution
  const testInstitution = await prisma.institution.create({
    data: {
      name: `Test Kita ${uniqueSuffix}`,
      address: 'Test Address 123'
    }
  });
  testDataStorage.institutions.push(testInstitution);

  // Create test users with hashed passwords
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  
  // Create users one by one to avoid race conditions
  const superAdmin = await prisma.user.create({
    data: {
      email: `test.superadmin${uniqueSuffix}@app4kitas.de`,
      password: hashedPassword,
      name: 'Test Super Admin',
      role: 'SUPER_ADMIN',
      phone: '+49123456789'
    }
  });
  
  const admin = await prisma.user.create({
    data: {
      email: `test.admin${uniqueSuffix}@app4kitas.de`,
      password: hashedPassword,
      name: 'Test Admin',
      role: 'ADMIN',
      phone: '+49123456788',
      institutionId: testInstitution.id
    }
  });
  
  const educator = await prisma.user.create({
    data: {
      email: `test.educator${uniqueSuffix}@app4kitas.de`,
      password: hashedPassword,
      name: 'Test Educator',
      role: 'EDUCATOR',
      phone: '+49123456787',
      institutionId: testInstitution.id
    }
  });
  
  const parent = await prisma.user.create({
    data: {
      email: `test.parent${uniqueSuffix}@app4kitas.de`,
      password: hashedPassword,
      name: 'Test Parent',
      role: 'PARENT',
      phone: '+49123456786',
      institutionId: testInstitution.id
    }
  });
  
  const testUsers = [superAdmin, admin, educator, parent];
  testDataStorage.users.push(...testUsers);

  // Create test group with educator
  const testGroup = await prisma.group.create({
    data: {
      name: `Test Group ${uniqueSuffix}`,
      institutionId: testInstitution.id,
      educators: {
        connect: [{ id: educator.id }] // Connect the educator to the group
      }
    }
  });
  testDataStorage.groups.push(testGroup);

  // Create test child
  const testChild = await prisma.child.create({
    data: {
      name: `Test Child ${uniqueSuffix}`,
      birthdate: new Date('2020-01-01'),
      groupId: testGroup.id,
      institutionId: testInstitution.id,
      qrCodeSecret: `test-qr-secret-${timestamp}`,
      parents: {
        connect: [{ id: parent.id }]
      }
    }
  });
  testDataStorage.children.push(testChild);

  // Create test channel for the group
  const testChannel = await prisma.chatChannel.create({
    data: {
      name: `Test Channel ${uniqueSuffix}`,
      type: 'GROUP_CHAT',
      groupId: testGroup.id,
      institutionId: testInstitution.id
    }
  });
  testDataStorage.channels = testDataStorage.channels || [];
  testDataStorage.channels.push(testChannel);

  return {
    institution: testInstitution,
    users: testUsers,
    group: testGroup,
    child: testChild,
    channel: testChannel
  };
}

// Helper function to login and get cookies
async function loginUser(request, app, email, password) {
  try {
    const res = await request(app)
      .post('/api/login')
      .send({ email, password });
    
    if (res.statusCode === 200) {
      return res.headers['set-cookie'];
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

module.exports = { 
  prisma, 
  createTestData, 
  loginUser,
  testDataStorage 
}; 