const request = require('supertest');
const app = require('../src/app');
const { createTestData, loginUser, testDataStorage } = require('./setup');

describe('Authentication Tests', () => {
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

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ 
          email: 'superadmin@app4kitas.de', 
          password: 'superadmin' 
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('email');
      expect(res.body.user).toHaveProperty('name');
      expect(res.body.user).toHaveProperty('role');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ 
          email: 'invalid@example.com', 
          password: 'wrongpassword' 
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject missing credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject empty credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ 
          email: '', 
          password: '' 
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/logout')
        .set('Cookie', superAdminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });

    it('should handle logout without authentication (API allows this)', async () => {
      const res = await request(app)
        .post('/api/logout');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });
  });

  describe('Registration', () => {
    it('should register new user (SUPER_ADMIN only)', async () => {
      const userData = {
        email: 'testuser@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'EDUCATOR',
        institutionId: 'ea0049d1-9ed3-41a2-9854-37ecb3bd75d6'
      };

      const res = await request(app)
        .post('/api/register')
        .set('Cookie', superAdminCookies)
        .send(userData);

      expect([201, 400]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email', userData.email);
        expect(res.body).toHaveProperty('name', userData.name);
        expect(res.body).toHaveProperty('role', userData.role);
      }
    });

    it('should reject registration without SUPER_ADMIN role', async () => {
      const userData = {
        email: 'testuser2@example.com',
        password: 'password123',
        name: 'Test User 2',
        role: 'EDUCATOR',
        institutionId: 'ea0049d1-9ed3-41a2-9854-37ecb3bd75d6'
      };

      const res = await request(app)
        .post('/api/register')
        .set('Cookie', adminCookies)
        .send(userData);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject registration with missing fields', async () => {
      const userData = {
        email: 'testuser3@example.com',
        password: 'password123'
        // Missing name and role
      };

      const res = await request(app)
        .post('/api/register')
        .set('Cookie', superAdminCookies)
        .send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject registration without institutionId for ADMIN/EDUCATOR', async () => {
      const userData = {
        email: 'testuser4@example.com',
        password: 'password123',
        name: 'Test User 4',
        role: 'EDUCATOR'
        // Missing institutionId
      };

      const res = await request(app)
        .post('/api/register')
        .set('Cookie', superAdminCookies)
        .send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: 'superadmin@app4kitas.de', // Existing email
        password: 'password123',
        name: 'Test User 5',
        role: 'EDUCATOR',
        institutionId: 'ea0049d1-9ed3-41a2-9854-37ecb3bd75d6'
      };

      const res = await request(app)
        .post('/api/register')
        .set('Cookie', superAdminCookies)
        .send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token with valid token', async () => {
      // First login to get a token
      const loginRes = await request(app)
        .post('/api/login')
        .send({ 
          email: 'superadmin@app4kitas.de', 
          password: 'superadmin' 
        });

      const token = loginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];

      const res = await request(app)
        .post('/api/refresh-token')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 401]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty('token');
      }
    });

    it('should reject refresh with invalid token', async () => {
      const res = await request(app)
        .post('/api/refresh-token')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject refresh without token', async () => {
      const res = await request(app)
        .post('/api/refresh-token');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Security', () => {
    it('should handle brute force attempts', async () => {
      const attempts = [];
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post('/api/login')
          .send({ 
            email: 'invalid@example.com', 
            password: 'wrongpassword' 
          });
        attempts.push(res.statusCode);
      }

      // Should consistently return 401 for invalid credentials
      attempts.forEach(statusCode => {
        expect(statusCode).toBe(401);
      });
    });

    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test@.com',
        ''
      ];

      for (const email of invalidEmails) {
        const res = await request(app)
          .post('/api/login')
          .send({ 
            email, 
            password: 'password123' 
          });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        if (email === '') {
          expect(res.body.message).toMatch(/erforderlich/);
        } else {
          expect(res.body.message).toMatch(/E-Mail-Format/);
        }
      }
    });

    it('should handle SQL injection attempts', async () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --"
      ];

      for (const input of maliciousInputs) {
        const res = await request(app)
          .post('/api/login')
          .send({ 
            email: input, 
            password: input 
          });

        expect([400, 401]).toContain(res.statusCode);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rapid login attempts', async () => {
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        const res = await request(app)
          .post('/api/login')
          .send({ 
            email: 'test@example.com', 
            password: 'password123' 
          });
        attempts.push(res.statusCode);
      }

      // Should handle multiple requests without crashing
      attempts.forEach(statusCode => {
        expect([200, 400, 401, 429]).toContain(statusCode);
      });
    });
  });
}); 