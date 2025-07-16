# App4KITAs Dashboard

**Last Updated: July 2025**

## Overview
App4KITAs Dashboard is a modern, multi-tenant web application for kindergarten management. It provides dedicated dashboards and workflows for three main roles:

- **Super Admin**: System-wide management of institutions, users, and analytics
- **Einrichtungsleitung**: Institution-level management of children, groups, staff, and daily operations
- **Educator (Erzieher)**: Daily tools for child management, check-in/out, notes, and communication

All dashboards are built with React, TypeScript, and styled-components, and follow the App4KITAs design system.

## 🆕 GDPR Dashboard Features
- **Compliance Reports**: Automatische DSGVO-Berichte
- **Backup Verification**: Überprüfung der Datensicherungen
- **Privacy-by-Design**: Datenschutz als Standard
- **Real-time Monitoring**: Echtzeitüberwachung der Compliance
- **Compliance Scoring**: Automatische Bewertung der DSGVO-Konformität
- **Recommendation Engine**: Empfehlungen zur Verbesserung der Compliance

Alle Features sind vollständig integriert und nutzen das neue Design Token System (`styles_app4kitas_MODERN.json`).

## 🗂️ Dashboard Roles & Main Pages

| Role         | Dashboard Pages (German)                                                                                 |
|--------------|---------------------------------------------------------------------------------------------------------|
| Super Admin  | Dashboard, Institutionen, Educators, Parents, Reports, Statistiken                                      |
| Einrichtungsleitung | Dashboard, Children, Groups, Notifications, Reports, Settings, Personal                                 |
| Educator     | Dashboard, Kinder, Checkin, Notizen, Chat                                                               |

- Each role sees only the pages and data relevant to their permissions.
- All dashboards support dark mode, responsive design, and German UI text.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Styled Components with custom design system
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: React Icons (FontAwesome)
- **Build Tool**: Create React App

### Project Structure
```
dashboard/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components
│   │   ├── Header.tsx     # Navigation header
│   │   ├── Sidebar.tsx    # Navigation sidebar
│   │   └── UserContext.tsx # Global user state
│   ├── pages/             # Page components
│   │   ├── educator/      # Educator-specific pages
│   │   ├── admin/         # Admin-specific pages
│   │   └── super_admin/   # Super admin pages
│   ├── services/          # API service layer
│   ├── routes/            # Route configurations
│   ├── styles/            # Global styles and theme
│   └── hooks/             # Custom React hooks
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16.0 or higher
- npm or yarn package manager
- Backend API server running (see backend documentation)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd kita-app/dashboard

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Variables
Create a `.env` file in the dashboard root:
```env
REACT_APP_BACKEND_URL=http://localhost:4000
REACT_APP_ENVIRONMENT=development
```

## 🎨 Design System

### Theme Configuration
The application uses a comprehensive design system with:
- **Color Palette**: Primary, secondary, and semantic colors
- **Typography**: Consistent font families and sizes
- **Spacing**: Standardized spacing scale
- **Components**: Reusable UI components
- **Dark Mode**: Full dark mode support

### Key Components
- **ModernModal**: Modal dialog system
- **LoadingSpinner**: Loading states with mascots
- **SearchableDropdown**: Enhanced dropdown with search
- **FloatingActionButton**: Modern action buttons
- **NoteCard**: Rich note display with file attachments

## 📱 Role-Based Interfaces

### 👨‍💼 Super Admin
- **Dashboard**: System-wide statistics and overview
- **Institutionen**: Manage multiple institutions
- **Educators**: Manage educator accounts
- **Parents**: Manage parent accounts
- **Reports**: System-wide reporting
- **Statistics**: Global analytics

### 👨‍💻 Einrichtungsleitung
- **Dashboard**: Institution-specific overview
- **Children**: Child management and registration
- **Groups**: Group organization
- **Notifications**: Communication system
- **Reports**: Institution-specific reports
- **Settings**: Institution configuration
- **Personal**: Personal task management

### 👩‍🏫 Educator
- **Dashboard**: Daily overview and quick actions
- **Kinder**: Child management with parent information
- **Checkin**: Check-in/check-out system
- **Notizen**: Note-taking with file attachments
- **Chat**: Messaging system

## 🔧 Development

### Available Scripts
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App
npm run eject
```

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Styled Components**: CSS-in-JS styling

### File Naming Conventions
- **Components**: PascalCase (e.g., `ChildCard.tsx`)
- **Pages**: PascalCase (e.g., `Dashboard.tsx`)
- **Services**: camelCase (e.g., `educatorApi.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useChatEnhancements.ts`)

## 🌐 API Integration

### Service Layer
All API calls are centralized in the `services/` directory:
- `authApi.ts`: Authentication and user management
- `educatorApi.ts`: Educator-specific operations
- `adminApi.ts`: Admin-specific operations
- `superAdminApi.ts`: Super admin operations
- `messagingApi.ts`: Chat and messaging
- `notificationApi.ts`: Notification system

### Error Handling
- Centralized error handling
- User-friendly German error messages
- Retry mechanisms for failed requests

## 🧪 Testing

### Current Status
- **Frontend Tests**: 0% coverage (critical - no tests implemented)
- **Backend Tests**: 427/427 tests passing ✅
- **Manual Testing**: Required for all features

### Testing Requirements
- Unit tests for components
- Integration tests for API calls
- E2E tests for critical workflows
- Accessibility testing

## 🚀 Deployment

### Production Build
```bash
# Create production build
npm run build

# Test production build locally
npx serve -s build
```

### Environment Configuration
- **Development**: `http://localhost:3000`
- **Production**: Configured via environment variables
- **Backend URL**: Configurable via `REACT_APP_BACKEND_URL`

## 📚 Documentation

### Additional Documentation
- [Educator Pages](./src/pages/educator/README.md)
- [Admin Pages](./src/pages/admin/README.md)
- [Super Admin Pages](./src/pages/super_admin/README.md)
- [API Documentation](../shared/api_routes_reference.md)
- [Design System](./src/styles/theme.tsx)
- [Component Library](./src/components/ui/)

### Code Documentation
- Inline TypeScript comments
- JSDoc for complex functions
- Component prop documentation
- API endpoint documentation

## 🤝 Contributing

### Development Workflow
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and approval
6. Merge to main branch

### Code Standards
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error boundaries
- Write comprehensive tests
- Update documentation

### Git Commit Convention
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

## 🐛 Troubleshooting

### Common Issues
- **Build Errors**: Check TypeScript compilation
- **API Errors**: Verify backend server is running
- **Styling Issues**: Check theme configuration
- **Performance**: Monitor bundle size and loading times

### Debug Tools
- React Developer Tools
- Redux DevTools (if applicable)
- Browser developer tools
- Network tab for API debugging

## 📞 Support

### Getting Help
- Check existing documentation
- Review component library
- Examine API documentation
- Consult design system guidelines

### Reporting Issues
- Use GitHub issues
- Provide detailed error information
- Include browser and environment details
- Attach relevant screenshots or logs

---

**App4KITAs Dashboard** - Modern, responsive, and user-friendly web interface for kindergarten management. 