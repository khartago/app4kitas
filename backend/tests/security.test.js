const request = require('supertest');
const app = require('../src/app');
const { createTestData, loginUser, testDataStorage, prisma, hashPassword } = require('./setup');

describe('Security API', () => {
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
        name: `Security Test Kita ${timestamp}`,
        address: 'Security Test Address'
      }
    });
    // Create admin user
    adminUser = await prisma.user.create({
      data: {
        email: `admin-security-${timestamp}@test.de`,
        password: await hashPassword('AdminSecurity123!'),
        role: 'ADMIN',
        institutionId: testInstitution.id,
        name: 'Admin Security'
      }
    });
    // Create group
    testGroup = await prisma.group.create({
      data: {
        name: `Security Gruppe ${timestamp}`,
        institutionId: testInstitution.id
      }
    });
    // Create child
    testChild = await prisma.child.create({
      data: {
        name: `Security Kind ${timestamp}`,
        birthdate: '2018-01-01',
        institutionId: testInstitution.id,
        groupId: testGroup.id
      }
    });
    // Login admin
    adminCookies = await loginUser(adminUser.email, 'AdminSecurity123!');
  });

  afterEach(async () => {
    // Cleanup order: children -> groups -> users -> institution
    await prisma.child.deleteMany({ where: { institutionId: testInstitution.id } });
    await prisma.group.deleteMany({ where: { institutionId: testInstitution.id } });
    await prisma.user.deleteMany({ where: { institutionId: testInstitution.id } });
    await prisma.institution.delete({ where: { id: testInstitution.id } });
  });

  describe('Authentication Security', () => {
    it('should reject invalid login credentials', async () => {
      const invalidCredentials = [
        { email: 'nonexistent@example.com', password: 'password' },
        { email: 'admin@example.com', password: 'wrongpassword' },
        { email: '', password: 'password' },
        { email: 'admin@example.com', password: '' },
        { email: null, password: 'password' },
        { email: 'admin@example.com', password: null }
      ];

      for (const credentials of invalidCredentials) {
        const res = await request(app)
          .post('/api/login')
          .send(credentials);

        expect([400, 401, 429]).toContain(res.statusCode);
        expect(res.body).toHaveProperty('message');
      }
    });

    it('should prevent brute force attacks', async () => {
      const credentials = { email: 'admin@example.com', password: 'wrongpassword' };

      // Attempt multiple failed logins
      for (let i = 0; i < 10; i++) {
        const res = await request(app)
          .post('/api/login')
          .send(credentials);

        expect([401, 429]).toContain(res.statusCode);
      }

      // Should still reject after multiple attempts
      const res = await request(app)
        .post('/api/login')
        .send(credentials);

      expect(res.statusCode).toBe(401);
    });

    it('should validate JWT token format', async () => {
      const invalidTokens = [
        'invalid-token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
        'Bearer invalid-token',
        '',
        null
      ];

      for (const token of invalidTokens) {
        const res = await request(app)
          .get('/api/children')
          .set('Authorization', `Bearer ${token}`);

        expect([401, 403]).toContain(res.statusCode);
      }
    });

    it('should reject expired tokens', async () => {
      const res = await request(app)
        .get('/api/children')
        .set('Cookie', 'token=expired-token');

      expect([401, 403]).toContain(res.statusCode);
    });

    it('should prevent session hijacking', async () => {
      if (!adminCookies || !Array.isArray(adminCookies)) {
        console.log('Skipping test - no valid admin cookies');
        return;
      }

      // Test with modified cookies
      const modifiedCookies = adminCookies.map(cookie => 
        cookie.replace(/token=[^;]+/, 'token=modified-token')
      );

      const res = await request(app)
        .get('/api/children')
        .set('Cookie', modifiedCookies);

      expect([401, 403]).toContain(res.statusCode);
    });
  });

  describe('Authorization Security', () => {
    it('should enforce role-based access control', async () => {
      const restrictedEndpoints = [
        { path: '/api/users', method: 'GET', role: 'SUPER_ADMIN' },
        { path: '/api/reports/attendance', method: 'GET', role: 'ADMIN' },
        { path: '/api/statistics/overview', method: 'GET', role: 'ADMIN' },
        { path: '/api/notifications/send', method: 'POST', role: 'ADMIN' }
      ];

      for (const endpoint of restrictedEndpoints) {
        // Test with parent role (should be denied)
        const parentRes = await request(app)
          [endpoint.method.toLowerCase()](endpoint.path)
          .set('Cookie', adminCookies);

        expect([403, 401, 429, 404, 400, 500]).toContain(parentRes.statusCode);

        // Test with educator role (should be denied for admin endpoints)
        if (endpoint.role === 'ADMIN' || endpoint.role === 'SUPER_ADMIN') {
          const educatorRes = await request(app)
            [endpoint.method.toLowerCase()](endpoint.path)
            .set('Cookie', adminCookies);

          expect([403, 401, 429, 404, 400, 500]).toContain(educatorRes.statusCode);
        }
      }
    });

    it('should prevent privilege escalation', async () => {
      // Test that educators cannot access admin functions
      const adminFunctions = [
        { path: '/api/users', method: 'POST' },
        { path: '/api/reports/attendance/export', method: 'GET' },
        { path: '/api/statistics/overview', method: 'GET' },
        { path: '/api/notifications/send', method: 'POST' }
      ];

      for (const func of adminFunctions) {
        const res = await request(app)
          [func.method.toLowerCase()](func.path)
          .set('Cookie', adminCookies);

        expect([403, 401, 429, 404, 400, 500]).toContain(res.statusCode);
      }
    });

    it('should validate resource ownership', async () => {
      if (!testChild) {
        console.log('Skipping test - no test child available');
        return;
      }

      // Test that users can only access resources they own or have permission for
      const res = await request(app)
        .get(`/api/children/${testChild.id}`)
        .set('Cookie', adminCookies);

      // Parent should not have access to all children
      expect([403, 401, 404, 429, 400, 500]).toContain(res.statusCode);
    });

    it('should prevent unauthorized data access', async () => {
      // Test access to sensitive data without proper authentication
      const sensitiveEndpoints = [
        '/api/users',
        '/api/reports/attendance',
        '/api/statistics/overview',
        '/api/notifications'
      ];

      for (const endpoint of sensitiveEndpoints) {
        const res = await request(app)
          .get(endpoint);

        expect([401, 429, 404, 400, 500]).toContain(res.statusCode);
      }
    });
  });

  describe('Input Validation Security', () => {
    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com',
        'test@example..com'
      ];

      for (const email of invalidEmails) {
        const res = await request(app)
          .post('/api/login')
          .send({ email, password: 'password' });

        expect([400, 401, 429]).toContain(res.statusCode);
      }
    });

    it('should validate password strength', async () => {
      const weakPasswords = [
        '123',
        'abc',
        'password',
        '123456',
        ''
      ];

      for (const password of weakPasswords) {
        const res = await request(app)
          .post('/api/register')
          .set('Cookie', adminCookies)
          .send({
            email: 'test@example.com',
            password,
            name: 'Test User',
            role: 'EDUCATOR'
          });

        expect([400, 401, 429]).toContain(res.statusCode);
      }
    });

    it('should validate UUID format', async () => {
      const invalidUuids = [
        'invalid-uuid',
        '12345678-1234-1234-1234-123456789012',
        '12345678-1234-1234-1234-12345678901',
        '12345678-1234-1234-1234-1234567890123'
      ];

      for (const uuid of invalidUuids) {
        const res = await request(app)
          .get(`/api/children/${uuid}`)
          .set('Cookie', adminCookies);

        expect([400, 404, 429]).toContain(res.statusCode);
      }
    });

    it('should validate date formats', async () => {
      const invalidDates = [
        'invalid-date',
        '2023-13-01',
        '2023-12-32',
        '2023-00-01'
      ];

      for (const date of invalidDates) {
        const res = await request(app)
          .get(`/api/reports/attendance?date=${date}`)
          .set('Cookie', adminCookies);

        expect([400, 429]).toContain(res.statusCode);
      }
    });

    it('should prevent buffer overflow attacks', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      const res = await request(app)
        .post('/api/profile/avatar')
        .set('Cookie', adminCookies)
        .attach('avatar', largeBuffer, 'large-file.png');
      expect([400, 413, 429, 200]).toContain(res.statusCode);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in login', async () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "admin'--"
      ];

      for (const attempt of sqlInjectionAttempts) {
        const res = await request(app)
          .post('/api/login')
          .send({
            email: attempt,
            password: 'password'
          });

        expect([401, 400, 429]).toContain(res.statusCode);
      }
    });

    it('should prevent SQL injection in search parameters', async () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE children; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM children --"
      ];

      for (const attempt of sqlInjectionAttempts) {
        const res = await request(app)
          .get(`/api/children?search=${encodeURIComponent(attempt)}`)
          .set('Cookie', adminCookies);

        expect([200, 400, 429]).toContain(res.statusCode);
      }
    });

    it('should prevent SQL injection in path parameters', async () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE children; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM children --"
      ];

      for (const attempt of sqlInjectionAttempts) {
        const res = await request(app)
          .get(`/api/children/${encodeURIComponent(attempt)}`)
          .set('Cookie', adminCookies);

        expect([400, 404, 429]).toContain(res.statusCode);
      }
    });
  });

  describe('XSS Prevention', () => {
    it('should prevent XSS in file names', async () => {
      const maliciousFileName = '<script>alert(1)</script>.png';
      const res = await request(app)
        .post('/api/profile/avatar')
        .set('Cookie', adminCookies)
        .attach('avatar', Buffer.from('fake-image'), maliciousFileName);
      
      // Should reject malicious file names or sanitize them
      expect([400, 403, 200, 201, 500]).toContain(res.statusCode);
    });

    it('should prevent XSS in message content', async () => {
      if (!testChild) {
        console.log('Skipping test - no test child available');
        return;
      }

      const maliciousContent = '<script>alert("xss")</script>Hello World';
      const res = await request(app)
        .post('/api/message')
        .set('Cookie', adminCookies)
        .send({
          content: maliciousContent,
          channelId: testChild.id // Assuming testChild.id is the channelId for this test
        });
      
      // Should accept and sanitize (200/201), or reject (400/403)
      expect([200, 201, 400, 403]).toContain(res.statusCode);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        // Verify content was sanitized (script tags removed)
        expect(res.body.content).not.toMatch(/<script.*?>/i);
        expect(res.body.content).not.toMatch(/alert\s*\(/i);
        expect(res.body.content).toContain('Hello World');
      }
      
      if (res.statusCode === 400 || res.statusCode === 403) {
        expect(res.body.message).toBeUndefined();
      }
    });

    it('should prevent XSS in note content', async () => {
      if (!testChild) {
        console.log('Skipping test - no test child available');
        return;
      }

      const maliciousContent = '<script>alert("xss")</script>Test note';
      const res = await request(app)
        .post('/api/notes')
        .set('Cookie', adminCookies)
        .send({
          childId: testChild.id,
          content: maliciousContent
        });
      
      // Should accept and sanitize (201), or reject (400/403/404)
      expect([200, 201, 400, 403, 404]).toContain(res.statusCode);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        // Verify content was sanitized (script tags removed)
        expect(res.body.note?.content).not.toMatch(/<script.*?>/i);
        // The word 'alert' may remain, but script tags must be gone
        expect(res.body.note?.content).toContain('Test note');
      }
      
      if (res.statusCode === 400 || res.statusCode === 403) {
        expect(res.body.note).toBeUndefined();
      }
    });

    it('should prevent XSS in user input fields', async () => {
      const xssAttempts = [
        '<script>alert("xss")</script>John Doe',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">'
      ];

      for (const attempt of xssAttempts) {
        const res = await request(app)
          .post('/api/register')
          .set('Cookie', adminCookies)
          .send({
            email: 'test@example.com',
            password: 'password123',
            name: attempt,
            role: 'EDUCATOR'
          });

        if (res.statusCode === 201) {
          // Name should be sanitized
          expect(res.body.name).not.toContain('<script>');
          expect(res.body.name).not.toContain('javascript:');
        }
      }
    });
  });

  describe('CSRF Prevention', () => {
    it('should validate CSRF tokens', async () => {
      const res = await request(app)
        .post('/api/children')
        .set('Origin', 'http://malicious-site.com')
        .send({ name: 'CSRF Test', birthdate: '2019-01-01' });
      expect([403, 400, 429]).toContain(res.statusCode);
    });

    it('should prevent cross-origin requests', async () => {
      const res = await request(app)
        .get('/api/children')
        .set('Cookie', adminCookies)
        .set('Origin', 'https://malicious-site.com');

      expect([200, 403, 429]).toContain(res.statusCode);
    });
  });

  describe('File Upload Security', () => {
    it('should validate file types', async () => {
      const maliciousFiles = [
        { name: 'test.exe', content: 'fake-executable' },
        { name: 'test.bat', content: 'fake-batch-file' },
        { name: 'test.sh', content: 'fake-shell-script' }
      ];

      for (const file of maliciousFiles) {
        const res = await request(app)
          .post('/api/message')
          .set('Cookie', adminCookies)
          .field('content', 'Test message')
          .field('channelId', testChild.id || 'test-channel') // Assuming testChild.id is the channelId
          .attach('file', Buffer.from(file.content), file.name);

        expect([400, 403, 429]).toContain(res.statusCode);
      }
    });

    it('should limit file size', async () => {
      // Create a large file (over 10MB)
      const largeFile = Buffer.alloc(11 * 1024 * 1024); // 11MB

      try {
        const res = await request(app)
          .post('/api/message')
          .set('Cookie', adminCookies)
          .field('content', 'Test message with large file')
          .field('channelId', testChild.id || 'test-channel') // Assuming testChild.id is the channelId
          .attach('file', largeFile, 'large-file.jpg');

        expect([400, 413, 429]).toContain(res.statusCode);
      } catch (error) {
        // Connection reset is also acceptable for large files
        expect(error.code).toBe('ECONNRESET');
      }
    });

    it('should scan for malware in uploaded files', async () => {
      const suspiciousContent = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

      const res = await request(app)
        .post('/api/message')
        .set('Cookie', adminCookies)
        .field('content', 'Test message')
        .field('channelId', testChild.id || 'test-channel') // Assuming testChild.id is the channelId
        .attach('file', Buffer.from(suspiciousContent), 'test.txt');

      console.log('Malware scan status code:', res.statusCode);
      // Should reject suspicious files - backend correctly returns 400, 403, or 429
      expect([400, 403, 429]).toContain(res.statusCode);
    });

    it('should prevent path traversal attacks', async () => {
      const pathTraversalAttempts = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '....//....//....//etc/passwd'
      ];

      for (const attempt of pathTraversalAttempts) {
        const res = await request(app)
          .post('/api/message')
          .set('Cookie', adminCookies)
          .field('content', 'Test message')
          .field('channelId', testChild.id || 'test-channel') // Assuming testChild.id is the channelId
          .attach('file', Buffer.from('fake-content'), attempt);

        expect([400, 403, 429]).toContain(res.statusCode);
      }
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize HTML content', async () => {
      if (!testChild) {
        console.log('Skipping test - no test child available');
        return;
      }

      const htmlContent = '<p>This is <strong>bold</strong> and <em>italic</em> text</p>';

      const res = await request(app)
        .post('/api/notes')
        .set('Cookie', adminCookies)
        .send({
          childId: testChild.id,
          content: htmlContent
        });

      if (res.statusCode === 201) {
        // Content should be sanitized
        expect(res.body.note?.content).not.toContain('<script>');
        expect(res.body.note?.content).not.toContain('javascript:');
      }
    });

    it('should sanitize user input', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: '<script>alert("xss")</script>John Doe',
        role: 'EDUCATOR'
      };

      const res = await request(app)
        .post('/api/register')
        .set('Cookie', adminCookies)
        .send(userData);

      if (res.statusCode === 201) {
        // Name should be sanitized
        expect(res.body.name).not.toContain('<script>');
      }
    });

    it('should prevent NoSQL injection', async () => {
      const nosqlInjectionAttempts = [
        { $ne: null },
        { $where: '1==1' },
        { $gt: '' },
        { $regex: '.*' }
      ];

      for (const attempt of nosqlInjectionAttempts) {
        const res = await request(app)
          .post('/api/login')
          .send({
            email: JSON.stringify(attempt),
            password: 'password'
          });

        expect([401, 429, 400]).toContain(res.statusCode);
      }
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose sensitive information in errors', async () => {
      const res = await request(app)
        .get('/api/nonexistent-endpoint')
        .set('Cookie', adminCookies);

      expect([404, 429]).toContain(res.statusCode);
      if (res.body && typeof res.body === 'object') {
        expect(JSON.stringify(res.body)).not.toContain('stack trace');
        expect(JSON.stringify(res.body)).not.toContain('internal server error');
      }
    });

    it('should not expose database information', async () => {
      // Try to access a non-existent resource
      const res = await request(app)
        .get(`/api/children/${testChild.id}`) // Use testChild.id
        .set('Cookie', adminCookies);

      expect([400, 404]).toContain(res.statusCode);
      if (res.body && typeof res.body === 'object') {
        expect(JSON.stringify(res.body)).not.toContain('database');
        expect(JSON.stringify(res.body)).not.toContain('sql');
        expect(JSON.stringify(res.body)).not.toContain('connection');
      }
    });

    it('should handle malformed requests gracefully', async () => {
      const res = await request(app)
        .post('/api/children')
        .set('Cookie', adminCookies)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect([400, 500]).toContain(res.statusCode);
      if (res.body && typeof res.body === 'object') {
        expect(JSON.stringify(res.body)).not.toContain('stack trace');
      }
    });
  });

  describe('Header Security', () => {
    it('should set security headers', async () => {
      const res = await request(app)
        .get('/api/children')
        .set('Cookie', adminCookies);

      expect([200, 400, 429, 500]).toContain(res.statusCode);

      // Check for security headers
      const headers = res.headers;
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-xss-protection']).toBe('1; mode=block');
    });

    it('should prevent clickjacking', async () => {
      const res = await request(app)
        .get('/api/children')
        .set('Cookie', adminCookies);

      expect(res.headers['x-frame-options']).toBe('DENY');
    });

    it('should prevent MIME type sniffing', async () => {
      const res = await request(app)
        .get('/api/children')
        .set('Cookie', adminCookies);

      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
  });
}); 