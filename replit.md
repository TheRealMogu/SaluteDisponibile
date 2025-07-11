# SaluteDisponibile.it - Healthcare Appointment Notification System

## Overview

SaluteDisponibile.it is a healthcare appointment notification service designed for Italian users. The application monitors healthcare system availability (ASL websites) and sends notifications via WhatsApp or email when medical appointments become available. The system targets a broad user base, including less tech-savvy users, with a focus on simplicity and accessibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Security and GDPR Compliance Implementation (January 11, 2025)
- **Rate Limiting**: Added express-rate-limit and express-slow-down for API protection
- **Trust Proxy**: Configured for Replit environment to handle X-Forwarded-For headers
- **Unsubscribe System**: Complete unsubscribe functionality with token-based links
- **Privacy Controls**: Added privacy policy page with GDPR compliance details
- **Consent Management**: Enhanced registration form with explicit privacy consent
- **Status Monitoring**: Added system status tracking and admin endpoints
- **Email Updates**: Include unsubscribe links in all notification emails
- **WhatsApp STOP**: Handle STOP commands for WhatsApp unsubscription

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React icons

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints under `/api` prefix
- **Data Storage**: Currently using in-memory storage with interface for future database integration
- **Database ORM**: Drizzle ORM configured for PostgreSQL (ready for database integration)
- **Session Management**: Basic session handling for user tracking

### Key Components

#### User Registration System
- Dual-channel registration (WhatsApp/Email)
- Dynamic form validation based on selected notification channel
- Region, ASL, and visit type selection with cascading dropdowns
- Form validation using Zod schemas

#### Notification Services
- **WhatsApp Service**: Integration with Meta's WhatsApp Business API
- **Email Service**: Nodemailer-based email notifications
- **Monitoring Service**: Background service that checks appointment availability every 15 minutes
- **Scraping Service**: Dedicated service for region-specific website monitoring without login requirements

#### UI Components
- Responsive design optimized for mobile devices
- Accessibility-focused components using Radix UI primitives
- Modal-based registration flow
- Success confirmation screens
- Toast notifications for user feedback

## Data Flow

1. **User Registration**: Users select notification channel → fill form → data validated → stored in memory/database
2. **Monitoring**: Background service polls ASL websites → checks for appointment availability → identifies users to notify
3. **Scraping**: Dedicated scraping service handles region-specific website monitoring without login requirements
4. **Notification**: When availability found → appropriate service (WhatsApp/Email) sends notification → user status updated
5. **API Endpoints**: Frontend communicates with backend via REST APIs for regions, ASL data, and user registration

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for Neon
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM
- **nodemailer**: Email sending functionality
- **react-hook-form**: Form state management
- **zod**: Runtime type validation and schema definition

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Environment variables for external service configuration
- Replit-optimized development experience with error overlays

### Production Build
- Frontend: Vite build process creates optimized static assets
- Backend: esbuild bundles server code for Node.js execution
- Static file serving integrated with Express server
- Environment-based configuration for production vs development

### Database Integration
- Drizzle ORM configured for PostgreSQL with migration support
- Schema defined in shared directory for type safety across frontend/backend
- Ready for Neon PostgreSQL or other PostgreSQL providers
- Migration system using drizzle-kit

### External Service Integration
- WhatsApp Business API integration (requires Facebook Developer account)
- Email service configuration (supports various SMTP providers)
- Environment variable-based configuration for API keys and credentials

### Monitoring and Reliability
- Background service with configurable polling intervals
- Error handling and logging throughout the application
- User state management for preventing duplicate notifications
- Graceful degradation when external services are unavailable
- Region-specific scraping service focusing on publicly accessible websites
- Support for Lombardia, Lazio, Piemonte, and Veneto regions without login requirements

### Security and Privacy Features
- Rate limiting and slow-down middleware to prevent abuse
- Express trust proxy configuration for Replit deployment
- Complete unsubscribe system with secure token-based links
- GDPR-compliant privacy policy and consent management
- System status monitoring with admin endpoints
- Error tracking and health monitoring services
- WhatsApp STOP command handling for unsubscription