# MangaVault - Modern Manga Reading Platform

## Overview

MangaVault is a full-stack manga reading platform built with React, Express, and PostgreSQL. The application provides a modern, responsive interface for browsing and reading manga with features like adult content filtering, advanced search, and an immersive reading experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with `/api` prefix
- **Middleware**: Express JSON parsing, custom logging middleware
- **Error Handling**: Centralized error handling middleware

### Database Architecture
- **Primary Database**: MongoDB for manga metadata and statistics
- **Fallback Storage**: In-memory storage for development
- **External APIs**: MangaDx API for manga metadata and chapter information
- **File Storage**: AWS S3 for manga images and pages
- **Schema Location**: `shared/schema.ts` for type sharing between frontend and backend

## Key Components

### Design System
- **Theme**: Dark-first design with purple/manga-themed color palette
- **Typography**: Custom CSS variables for consistent theming
- **Components**: Comprehensive UI component library based on Radix UI
- **Responsive**: Mobile-first design with Tailwind breakpoints

### Data Management
- **Schema Sharing**: Common types between frontend and backend via `shared/` directory
- **Validation**: Zod schemas for runtime type checking
- **Storage Interface**: Abstracted storage layer with in-memory fallback

### User Interface Features
- **Manga Discovery**: Featured, popular, and recent manga sections
- **Search Functionality**: Real-time search with genre filtering
- **Content Filtering**: Adult content toggle (R/A mode switching)
- **Reading Experience**: Full-screen manga reader with page navigation
- **Responsive Design**: Optimized for desktop and mobile viewing

## Data Flow

### Request Flow
1. Client makes API request to Express server
2. Server validates request and processes business logic
3. Storage layer handles data persistence (MongoDB with in-memory fallback)
4. External APIs (MangaDx) provide metadata and content
5. S3 provides manga image storage with signed URLs
6. Response sent back to client with appropriate error handling

### State Management
1. TanStack Query manages server state and caching
2. React hooks handle local UI state
3. Context providers manage global application state (themes, user preferences)

### Content Management
1. Sample manga data structure includes chapters, pages, and metadata
2. Adult content filtering applied at both data and UI levels
3. Search functionality filters across titles, genres, and metadata

## External Dependencies

### Core Dependencies
- **mongodb**: MongoDB database driver
- **@aws-sdk/client-s3**: AWS S3 operations
- **@aws-sdk/s3-request-presigner**: S3 signed URL generation
- **axios**: HTTP client for external APIs
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **class-variance-authority**: Type-safe component variants

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **next-themes**: Theme management

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Requirements
- `MONGODB_URI`: MongoDB connection string
- `AWS_ACCESS_KEY_ID`: AWS access key for S3
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for S3
- `S3_BUCKET_NAME`: S3 bucket for manga storage
- `AWS_REGION`: AWS region (default: us-east-1)
- `NODE_ENV`: Environment mode (development/production)

### Development Workflow
- Hot module replacement via Vite in development
- Automatic TypeScript checking
- Fallback storage for development without external dependencies
- MangaDx API integration for real manga data

### Production Considerations
- Static file serving handled by Express
- MongoDB for production data persistence
- S3 for scalable image storage with signed URLs
- Environment-specific configuration via environment variables
- Graceful fallbacks for external service failures
- Replit-specific optimizations included (error overlay, cartographer)

The application is structured as a monorepo with clear separation between client, server, and shared code, making it maintainable and scalable for future enhancements.