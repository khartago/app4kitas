# 🤝 Contributing to App4KITAs

## 📋 Overview

Thank you for your interest in contributing to App4KITAs! This guide will help you get started with development, testing, and contributing to the project.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Git
- npm or yarn

### Setup Development Environment
```bash
# Clone the repository
git clone https://github.com/your-org/app4kitas.git
cd app4kitas

# Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma generate
npx prisma migrate dev --name init
npm test  # Run all 427 tests

# Frontend Setup
cd ../dashboard
npm install
npm start
```

## 🏗️ Project Structure

```
app4kitas/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── controllers/    # Business Logic
│   │   ├── routes/         # API Endpoints
│   │   ├── middlewares/    # Auth & Security
│   │   └── utils/          # Utilities
│   ├── tests/              # 427 Test Suite
│   └── prisma/             # Database Schema
├── dashboard/               # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Page Components
│   │   ├── services/       # API Services
│   │   └── styles/         # Styling
│   └── public/             # Static Assets
└── shared/                 # Shared Documentation
    ├── api_routes_reference.md
    ├── TESTING_CHECKLIST.md
    └── styles_app4kitas_MODERN.json
```

## 🧪 Testing

For comprehensive testing information, see `shared/TESTING_CHECKLIST.md`.

### Quick Test Commands
```bash
# Backend Tests (427 tests)
cd backend && npm test

# Frontend Tests (0% coverage - CRITICAL)
cd dashboard && npm test  # No tests implemented yet
```

## 👥 Roles & Permissions

### 👑 Super Admin
- **Platform-wide access** to all data and functions
- **Institution management**: Create, edit, delete KITAs
- **User management**: Manage Einrichtungsleiter, educators, and parents
- **System statistics**: Platform-wide analytics and reports
- **Export functions**: CSV/PDF export for all data
- **GDPR management**: Soft delete, audit logs, data retention

### 👨‍💼 Einrichtungsleitung (ADMIN)
- **Institution-specific access** to own KITA
- **Child management**: Create, edit, photos, export
- **Group management**: Create groups, assign educators
- **Staff management**: Manage and assign educators
- **Check-in/out**: QR code generation and management
- **Reports**: Daily and monthly reports with export
- **Notifications**: Send messages to groups/educators
- **Institution settings**: Opening hours, holidays, addresses

### 👩‍🏫 Educator (EDUCATOR)
- **Group-specific access** to assigned children
- **Dashboard**: Daily overview and quick actions
- **Children**: Manage assigned children
- **Check-in/out**: QR scan and manual check-ins
- **Notes**: Child-specific notes with file attachments
- **Chat**: Group and direct messages
- **Personal tasks**: Own to-do list

### 👨‍👩‍👧‍👦 Parent (PARENT)
- **Child-specific access** to own children (planned)
- **Self-registration**: Parents register independently
- **Child assignment**: Einrichtungsleitung assigns parents to children
- **Check-in status**: View attendance of their children
- **Communication**: Messages with educators
- **Reports**: Access to reports of their children

## 🔧 Development Guidelines

### Code Style
- **Backend**: Follow ESLint configuration
- **Frontend**: Use TypeScript with strict mode
- **Database**: Use Prisma ORM for all database operations
- **API**: RESTful design with proper HTTP status codes
- **Security**: Implement role-based access control

### Git Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Create** a Pull Request

### Commit Convention
```
type(scope): description

feat: new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 🔐 Security Guidelines

### Backend Security
- **Input Validation**: Validate all user inputs
- **XSS Protection**: Sanitize all user-generated content
- **SQL Injection**: Use Prisma ORM (prevents SQL injection)
- **Authentication**: Use JWT with HttpOnly cookies
- **Authorization**: Implement role-based access control
- **File Uploads**: Validate file types and scan for malware

### Frontend Security
- **XSS Prevention**: Never render user input directly
- **CSRF Protection**: Use HttpOnly cookies
- **Input Validation**: Validate on both client and server
- **Error Handling**: Don't expose sensitive information

## 🧪 Testing Guidelines

### Backend Testing
- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints and database operations
- **Security Tests**: Test authentication, authorization, and input validation
- **Performance Tests**: Test response times and memory usage

### Frontend Testing (TODO)
- **Unit Tests**: Test individual components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Accessibility Tests**: Test screen reader compatibility

## 📚 Documentation Standards

### Code Documentation
- **JSDoc**: Document all public functions and classes
- **README Files**: Keep component READMEs up to date
- **API Documentation**: Document all API endpoints
- **Inline Comments**: Add comments for complex logic

### Project Documentation
- **README Files**: Comprehensive project overview
- **API Reference**: Complete endpoint documentation
- **Setup Guides**: Step-by-step installation instructions
- **Troubleshooting**: Common issues and solutions

## 🚨 Critical Areas

### Frontend Testing (URGENT)
- **Status**: 0% test coverage
- **Priority**: Critical for production readiness
- **Action**: Implement comprehensive test suite

### Mobile App Development
- **Status**: Not started
- **Priority**: High for market penetration
- **Action**: Begin Flutter development

### Production Deployment
- **Status**: Backend ready, frontend needs testing
- **Priority**: High for production launch
- **Action**: Complete frontend testing and deployment setup

## 🔧 Development Commands

### Backend Development
```bash
cd backend

# Development server
npm run dev

# Run tests
npm test

# Database operations
npx prisma studio
npx prisma migrate dev
npx prisma generate

# Code quality
npm run lint
npm run lint:fix
```

### Frontend Development
```bash
cd dashboard

# Development server
npm start

# Build for production
npm run build

# Code quality
npm run lint
npm run lint:fix
```

## 📞 Getting Help

### Resources
- **[Backend README](./backend/README.md)**: Complete backend documentation
- **[Dashboard README](./dashboard/README.md)**: Frontend documentation
- **[API Documentation](./shared/api_routes_reference.md)**: API reference
- **[Testing Checklist](./shared/TESTING_CHECKLIST.md)**: Testing guide

### Communication Channels
- **GitHub Issues**: For bugs and problems
- **GitHub Discussions**: For questions and help
- **Documentation**: For setup and usage

## 🎯 Contribution Areas

### High Priority
1. **Frontend Testing**: Implement comprehensive test suite
2. **Mobile App**: Begin Flutter development
3. **Production Deployment**: Complete deployment setup
4. **Performance Optimization**: Optimize frontend performance

### Medium Priority
1. **Documentation**: Improve and expand documentation
2. **Accessibility**: Enhance accessibility features
3. **Internationalization**: Add multi-language support
4. **Advanced Features**: Implement advanced analytics

### Low Priority
1. **Code Refactoring**: Improve code structure
2. **UI/UX Enhancements**: Improve user experience
3. **Additional Integrations**: Add third-party integrations
4. **Advanced Reporting**: Implement advanced reporting features

---

**Remember**: Most issues can be resolved by following the troubleshooting steps above. If you're still having problems, please provide detailed information about your environment and the specific error you're encountering. 