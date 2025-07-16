# 🔧 Troubleshooting Guide - App4KITAs

## 📋 Overview

This troubleshooting guide covers common issues and solutions for the App4KITAs platform. The guide is organized by component and severity level.

## 🚨 Critical Issues

### Backend Server Won't Start

#### **Error**: `ECONNREFUSED` or `Connection refused`
**Cause**: PostgreSQL database not running or incorrect connection string
**Solution**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql

# Verify connection string in .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/app4kitas"
```

#### **Error**: `JWT_SECRET is not defined`
**Cause**: Missing JWT secret in environment variables
**Solution**:
```bash
# Add to .env file
JWT_SECRET=your_super_secret_key_here

# Restart server
npm run dev
```

#### **Error**: `Port 4000 is already in use`
**Cause**: Another process is using port 4000
**Solution**:
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=4001
```

### Database Migration Issues

#### **Error**: `Migration failed`
**Cause**: Database schema conflicts or missing migrations
**Solution**:
```bash
# Reset database (WARNING: Data loss)
npx prisma migrate reset

# Or apply pending migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

#### **Error**: `Prisma client not generated`
**Cause**: Missing Prisma client generation
**Solution**:
```bash
# Generate Prisma client
npx prisma generate

# Restart server
npm run dev
```

## ⚠️ High Priority Issues

### Authentication Problems

#### **Error**: `Invalid JWT token`
**Cause**: Token expired or invalid
**Solution**:
1. Clear browser cookies
2. Log out and log back in
3. Check JWT_SECRET in backend .env
4. Verify token expiration settings

#### **Error**: `User not found`
**Cause**: User doesn't exist or wrong credentials
**Solution**:
1. Verify user exists in database
2. Check email/password combination
3. Reset user password if needed
4. Verify user role assignment

#### **Error**: `Insufficient permissions`
**Cause**: User doesn't have required role
**Solution**:
1. Check user role in database
2. Verify role-based access control
3. Assign correct role to user
4. Check institution assignment

### File Upload Issues

#### **Error**: `File too large`
**Cause**: File exceeds size limit
**Solution**:
1. Check file size limits in backend
2. Compress images before upload
3. Use smaller file formats
4. Update multer configuration

#### **Error**: `Invalid file type`
**Cause**: File type not allowed
**Solution**:
1. Check allowed file types
2. Convert file to supported format
3. Update file type validation
4. Verify MIME type detection

#### **Error**: `Upload directory not found`
**Cause**: Missing uploads directory
**Solution**:
```bash
# Create uploads directory
mkdir uploads

# Set proper permissions
chmod 755 uploads

# Restart server
npm run dev
```

### API Response Issues

#### **Error**: `500 Internal Server Error`
**Cause**: Server-side error
**Solution**:
1. Check server logs for details
2. Verify database connection
3. Check environment variables
4. Restart server

#### **Error**: `404 Not Found`
**Cause**: API endpoint doesn't exist
**Solution**:
1. Check API route definition
2. Verify HTTP method (GET, POST, etc.)
3. Check URL path
4. Verify route registration

#### **Error**: `401 Unauthorized`
**Cause**: Missing or invalid authentication
**Solution**:
1. Check JWT token
2. Verify authentication middleware
3. Check user session
4. Re-authenticate user

## 🔧 Medium Priority Issues

### Frontend Issues

#### **Error**: `React app won't start`
**Cause**: Missing dependencies or configuration
**Solution**:
```bash
# Install dependencies
npm install

# Clear cache
npm cache clean --force

# Start development server
npm start
```

#### **Error**: `Module not found`
**Cause**: Missing import or incorrect path
**Solution**:
1. Check import statements
2. Verify file paths
3. Check TypeScript configuration
4. Restart development server

#### **Error**: `TypeScript compilation errors`
**Cause**: Type errors in code
**Solution**:
1. Fix type annotations
2. Add missing interfaces
3. Update TypeScript configuration
4. Check for type conflicts

### Database Issues

#### **Error**: `Connection timeout`
**Cause**: Database connection issues
**Solution**:
1. Check database server status
2. Verify connection string
3. Check network connectivity
4. Increase connection timeout

#### **Error**: `Query timeout`
**Cause**: Slow database queries
**Solution**:
1. Add database indexes
2. Optimize query performance
3. Check query complexity
4. Monitor database performance

### Performance Issues

#### **Error**: `Slow API responses`
**Cause**: Performance bottlenecks
**Solution**:
1. Add database indexes
2. Optimize queries
3. Implement caching
4. Monitor server resources

#### **Error**: `Memory leaks`
**Cause**: Unreleased resources
**Solution**:
1. Check for unclosed connections
2. Monitor memory usage
3. Implement proper cleanup
4. Use connection pooling

## 📊 Common Workflows

### Setting Up Development Environment

#### **Step 1**: Clone Repository
```bash
git clone <repository-url>
cd app4kitas
```

#### **Step 2**: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npx prisma generate
npx prisma migrate dev --name init
mkdir uploads
npm test  # Run all 427 tests
npm run dev
```

#### **Step 3**: Frontend Setup
```bash
cd ../dashboard
npm install
npm start
```

### Database Management

#### **Reset Database**
```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

#### **Apply Migrations**
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

#### **View Database**
```bash
cd backend
npx prisma studio
```

### Testing

#### **Run All Tests**
```bash
cd backend
npm test
```

#### **Run Specific Test Categories**
```bash
npm run test:auth          # Authentication tests
npm run test:security      # Security tests
npm run test:integration   # Integration tests
npm run test:gdpr          # GDPR compliance tests
```

#### **Frontend Testing** (Not Implemented)
```bash
cd dashboard
npm test  # Returns "No tests found"
```

## 🔍 Debugging Tools

### Backend Debugging

#### **Enable Debug Logging**
```bash
# Add to .env
DEBUG=app:*
NODE_ENV=development
```

#### **Database Debugging**
```bash
# Enable Prisma debug logging
DEBUG=prisma:*

# View database logs
npx prisma studio
```

#### **API Debugging**
```bash
# Use Postman or curl for API testing
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer <token>"
```

### Frontend Debugging

#### **React Developer Tools**
1. Install React Developer Tools extension
2. Open browser developer tools
3. Check Components and Profiler tabs

#### **Network Debugging**
1. Open browser developer tools
2. Check Network tab for API calls
3. Verify request/response data
4. Check for CORS issues

#### **Console Debugging**
```javascript
// Add to components for debugging
console.log('Debug data:', data);
console.error('Error:', error);
```

## 📞 Getting Help

### **Before Asking for Help**
1. Check this troubleshooting guide
2. Search existing issues
3. Check server logs
4. Verify environment setup
5. Test with minimal reproduction

### **Information to Provide**
- **Error Message**: Exact error text
- **Steps to Reproduce**: Detailed steps
- **Environment**: OS, Node.js version, database version
- **Logs**: Relevant error logs
- **Screenshots**: UI issues if applicable

### **Support Channels**
- **GitHub Issues**: For bugs and problems
- **Documentation**: Check existing docs
- **Community**: Developer community
- **Email**: support@app4kitas.de

## 🚀 Performance Optimization

### **Backend Optimization**
- **Database Indexing**: Add indexes for frequent queries
- **Connection Pooling**: Optimize database connections
- **Caching**: Implement Redis caching
- **Query Optimization**: Optimize slow queries

### **Frontend Optimization**
- **Code Splitting**: Implement lazy loading
- **Bundle Optimization**: Reduce bundle size
- **Image Optimization**: Compress images
- **Caching**: Implement service worker caching

## 🔐 Security Issues

### **Common Security Problems**

#### **Error**: `XSS detected`
**Cause**: Malicious script injection
**Solution**:
1. Sanitize all user inputs
2. Use Content Security Policy
3. Validate file uploads
4. Implement proper encoding

#### **Error**: `SQL injection detected`
**Cause**: Malicious SQL injection
**Solution**:
1. Use Prisma ORM (prevents SQL injection)
2. Validate all inputs
3. Use parameterized queries
4. Implement input sanitization

#### **Error**: `CSRF token missing`
**Cause**: Missing CSRF protection
**Solution**:
1. Implement CSRF tokens
2. Validate request origin
3. Use HttpOnly cookies
4. Implement proper session management

## 📋 Maintenance Checklist

### **Daily Tasks**
- [ ] Check server logs for errors
- [ ] Monitor database performance
- [ ] Verify backup completion
- [ ] Check API response times

### **Weekly Tasks**
- [ ] Review error logs
- [ ] Update dependencies
- [ ] Check security alerts
- [ ] Monitor disk space

### **Monthly Tasks**
- [ ] Performance review
- [ ] Security audit
- [ ] Backup verification
- [ ] Documentation updates

---

**App4KITAs Troubleshooting Guide** - Comprehensive guide for resolving common issues.

**Last Updated**: July 2025  
**Version**: 1.0 