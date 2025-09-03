# Calculator App

## Overview

This is a full-stack web calculator application built with modern technologies. The frontend provides a clean, responsive calculator interface using React and shadcn/ui components, while the backend offers a REST API for mathematical operations. The application features input validation, error handling, and a professional UI design with toast notifications for user feedback.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and better developer experience
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS variables for consistent theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express framework for REST API endpoints
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Validation**: Zod for runtime type validation and schema definitions
- **Storage**: In-memory storage implementation with interface for future database integration
- **Development**: Hot reload support with tsx for TypeScript execution

### Data Storage Solutions
- **Current**: In-memory storage using Map data structures for development
- **Future-Ready**: Drizzle ORM configured for PostgreSQL with Neon database support
- **Migrations**: Database schema management through Drizzle Kit
- **Session**: Prepared for PostgreSQL session storage with connect-pg-simple

### Authentication and Authorization
- **Infrastructure**: Session-based authentication setup ready for implementation
- **Security**: Cookie-based sessions with PostgreSQL session store configuration
- **User Management**: User schema defined with username/password authentication model

### External Dependencies
- **Database**: Neon serverless PostgreSQL (configured but not actively used)
- **UI Components**: Radix UI primitives for accessible component foundation
- **Development**: Replit-specific tooling for development environment integration
- **Fonts**: Google Fonts integration (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)

The architecture follows a monorepo structure with shared schemas between client and server, ensuring type safety across the full stack. The application is containerized for easy deployment and uses modern development practices like path aliases and absolute imports.