Sistem Informasi Praktikum PWA - Akademi Kebidanan Mega Buana
Progressive Web Application untuk manajemen praktikum kebidanan dengan sistem quiz interaktif, booking peralatan, dan manajemen inventaris.
🎯 PROJECT OVERVIEW
Institution: Akademi Kebidanan Mega Buana
Timeline: 3.5 bulan development (110 hari)
Target: Demo-ready untuk ujian skripsi 17 Desember 2025
Users: Admin, Dosen, Mahasiswa, Laboran
Features: 9 laboratorium kebidanan + 1 depo alat + quiz system + equipment booking + inventory management
🛠️ TECHNOLOGY STACK
Frontend

Framework: React 18 + TypeScript + Vite
UI Library: Shadcn/ui + Tailwind CSS v4.1
State Management: React Context + Custom Hooks
Forms: React Hook Form + Zod validation
Routing: React Router DOM v7

Backend & Database

Backend: Supabase (PostgreSQL + Auth + Storage + Realtime)
Database: PostgreSQL with 27 tables
Authentication: Supabase Auth + Row Level Security (RLS)
Storage: Supabase Storage (materi, profiles, documents)

PWA Features

Service Worker: Offline support + background sync
Manifest: Installable web app
Push Notifications: Real-time updates
Caching Strategy: Workbox for optimal performance

Testing & Development

Unit Testing: Vitest + React Testing Library
E2E Testing: Playwright
Code Quality: ESLint + Prettier + TypeScript strict mode
Git Hooks: Husky + lint-staged

📋 PREREQUISITES

Node.js: 18+ (recommended: 20+)
Package Manager: npm atau yarn
Git: For version control
Supabase Account: For backend services
Browser: Chrome/Firefox/Safari (latest versions)

🚀 QUICK START
1. Clone & Install Dependencies
bashgit clone <repository-url>
cd sistem-praktikum-pwa
npm install
2. Environment Setup
bashcp .env.example .env.local
Configure your .env.local:
env# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
VITE_APP_NAME="Sistem Praktikum AKBID"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENV="development"

# Optional: Analytics & Monitoring
VITE_ANALYTICS_ID=your_analytics_id
3. Database Setup

Create Supabase Project

Visit Supabase Dashboard
Create new project
Copy project URL and anon key


Run Database Migrations

bash   # Navigate to Supabase SQL Editor
   # Execute scripts in order from supabase/sql/tables/

Setup Storage Buckets

bash   # Create buckets in Supabase Storage:
   # - materi (for course materials)
   # - profiles (for user avatars)
   # - documents (for general documents)
4. Development Server
bashnpm run dev
# Application runs on http://localhost:5173
5. Build & Preview
bash# Production build
npm run build

# Preview production build
npm run preview
# Preview runs on http://localhost:4173
📁 PROJECT STRUCTURE
sistem-praktikum-pwa/
├── public/                    # Static assets & PWA files
│   ├── icons/                # PWA icons (192x192, 512x512)
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service Worker
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Shadcn/ui base components
│   │   ├── layout/          # Layout components
│   │   ├── common/          # Common components
│   │   └── forms/           # Form components
│   ├── pages/               # Role-based pages
│   │   ├── admin/          # Admin dashboard & features
│   │   ├── dosen/          # Lecturer features
│   │   ├── mahasiswa/      # Student features
│   │   └── laboran/        # Lab technician features
│   ├── context/            # React Context providers
│   │   ├── AuthContext.tsx # Authentication state
│   │   ├── ThemeContext.tsx# Theme management
│   │   └── NotificationContext.tsx
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities & configurations
│   │   ├── supabase.ts     # Supabase client
│   │   ├── validations.ts  # Zod schemas
│   │   └── utils.ts        # Helper functions
│   ├── types/              # TypeScript definitions
│   └── __tests__/          # Test suites
├── tests/e2e/              # Playwright E2E tests
├── supabase/               # Database schema & configs
└── testing/                # Test documentation
👥 USER ROLES & FEATURES
🔑 Administrator

User Management: CRUD operations for all users
Role Assignment: Manage user roles and permissions
System Configuration: Laboratory setup, equipment management
Analytics & Reports: Usage statistics, performance metrics
Security Management: Access control, audit logs

👨‍🏫 Dosen (Lecturer)

Course Management: Create and manage mata kuliah
Quiz System:

Interactive quiz creation with multiple question types
Automated grading and feedback
Student progress tracking


Equipment Booking: Reserve laboratory equipment
Student Assessment: Grade assignments and practical work
Material Upload: Share course materials and resources

👨‍🎓 Mahasiswa (Student)

Course Enrollment: Join available courses
Interactive Quiz System:

Take quizzes with time limits
Instant feedback and results
Review mode for learning


Schedule Management: View class and laboratory schedules
Grade Tracking: Monitor academic progress
Material Access: Download course materials
Notification Center: Receive important updates

🔬 Laboran (Lab Technician)

Equipment Inventory: Track and manage laboratory equipment
Booking Approval: Approve/reject equipment booking requests
Maintenance Tracking: Schedule and record equipment maintenance
Laboratory Management: Monitor laboratory usage and capacity
Report Generation: Create utilization and maintenance reports

🧪 TESTING
Unit & Integration Tests
bash# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
End-to-End Tests
bash# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
Test Coverage Goals

Unit Tests: >85% code coverage
Integration Tests: Critical user workflows
E2E Tests: Complete user journeys
Performance Tests: Lighthouse scores >90

📱 PWA FEATURES
Offline Functionality

Service Worker: Cache static assets and API responses
Background Sync: Queue operations when offline
Offline Pages: Graceful offline experience

Native App Experience

Install Prompt: Add to home screen
Full Screen Mode: Standalone app experience
App Icons: Custom icons for different screen sizes

Push Notifications

Quiz Reminders: Notify students about upcoming quizzes
Booking Confirmations: Equipment booking status updates
System Announcements: Important notifications

Performance Optimizations

Code Splitting: Lazy load routes and components
Image Optimization: WebP format with fallbacks
Bundle Analysis: Optimized chunk sizes

🔐 AUTHENTICATION & SECURITY
Authentication System

Supabase Auth: Email/password authentication
Email Verification: Secure account activation
Password Reset: Secure password recovery flow
Session Management: Automatic token refresh

Role-Based Access Control (RBAC)

4 User Roles: Admin, Dosen, Mahasiswa, Laboran
Granular Permissions: Feature-level access control
Dynamic Role Switching: Support for multiple roles
Route Protection: Authenticated and authorized routes

Security Features

Row Level Security (RLS): Database-level access control
SQL Injection Prevention: Parameterized queries
XSS Protection: Input sanitization and validation
CSRF Protection: Token-based request validation
Audit Logging: Track user actions and system changes

📊 DATABASE SCHEMA
Core Tables (27 total)
sql-- Authentication & Authorization
users_profile, roles, permissions, user_roles, role_permissions

-- Academic Management
mata_kuliah, enrollments, materi, nilai

-- Quiz System
kuis, kuis_questions, kuis_attempts, kuis_answers, question_options

-- Laboratory Management
laboratories, equipments, inventaris, equipment_maintenance

-- Booking & Scheduling
jadwal, peminjaman, booking, equipment_bookings

-- Communication
notifications, pengumuman

-- System Management
audit_logs, stock_movements, system_settings
Database Features

Normalized Design: Efficient data structure
Foreign Key Constraints: Data integrity
Indexes: Optimized query performance
Triggers: Automated data validation
Views: Simplified complex queries

🚀 DEPLOYMENT
Supabase Setup

Create Project: New Supabase project
Database Migration: Run SQL scripts
Storage Setup: Create and configure buckets
RLS Policies: Enable row-level security
API Keys: Configure environment variables

Frontend Deployment (Netlify/Vercel)
bash# Build command
npm run build

# Output directory
dist

# Environment variables
VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_ANON_KEY=your_production_key
PWA Deployment Checklist

 HTTPS enabled
 Service Worker registered
 Manifest.json configured
 Icons optimized
 Offline functionality tested

📖 DEVELOPMENT PHASES
Completed Phases

✅ Phase 1 (4-8 Aug): Project Setup & Configuration
✅ Phase 2 (9-15 Aug): Design & Architecture

Upcoming Phases

📅 Phase 3 (16-22 Aug): Database Implementation
📅 Phase 4 (23-29 Aug): Authentication & RBAC
📅 Phase 5 (30 Aug-5 Sep): Admin Dashboard
📅 Phase 6 (6-12 Sep): Dosen Features
📅 Phase 7 (13-19 Sep): Quiz System
📅 Phase 8 (20-26 Sep): Mahasiswa Features
📅 Phase 9 (27 Sep-3 Oct): Laboratory Management
📅 Phase 10 (4-10 Oct): PWA Integration
📅 Phase 11 (11-17 Oct): White-box Testing
📅 Phase 12 (18-24 Oct): Black-box Testing
📅 Phase 13 (25-31 Oct): Bug Fixes & Optimization
📅 Phase 14 (1-10 Nov): Deployment & Documentation

🤝 CONTRIBUTING
Development Guidelines

TypeScript: Use strict mode, define proper types
Components: Use Shadcn/ui components consistently
Testing: Write tests for new features
Commits: Follow conventional commit messages
Code Style: Use Prettier and ESLint configurations

Git Workflow
bash# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
Code Quality Standards

TypeScript: No any types, strict mode enabled
Testing: Minimum 85% code coverage
Performance: Lighthouse scores >90
Accessibility: WCAG 2.1 AA compliance
PWA: Passes PWA checklist

📄 LICENSE
MIT License - see LICENSE file for details.
📞 SUPPORT

Documentation: Check this README and project wiki
Issues: Create GitHub issues for bugs and feature requests
Discussions: Use GitHub discussions for questions


Built with ❤️ for Akademi Kebidanan Mega Buana