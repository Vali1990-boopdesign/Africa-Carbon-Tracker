# Africa Carbon Credits Analytics Dashboard

## Overview
This project delivers a comprehensive analytics dashboard for African carbon credits data. It provides real-time insights into transactions, buyer profiles, and market trends across African countries. The dashboard offers interactive visualizations, advanced filtering, and data export, aiming to be a crucial business intelligence tool for the carbon market.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The frontend uses React 18 with TypeScript, Vite, and Wouter for routing. State management is handled by TanStack Query. The UI is built with shadcn/ui (Radix UI primitives) and styled with Tailwind CSS, featuring a custom design system, responsive layouts, and a dark theme with glass morphism elements. Data visualizations are powered by Recharts, and animations by Framer Motion. Key UI features include interactive dashboards with various visualization types (maps, charts, tables), advanced filtering, data export, a theme system, and an interactive tooltip system with a Carbon Glossary. A mobile-first approach is implemented with a PWA, including a navigation drawer and filter bottom sheet.

### Technical Implementation
The backend is built with Node.js and Express.js, exposing a REST API. Data persistence is managed using PostgreSQL 16 (local) or Neon Database (production) with Drizzle ORM. Core data models include Transactions, Buyer Profiles, and Dashboard Metrics. API endpoints serve dashboard metrics, transactional data, geographical data, sector breakdowns, time-series data, and top buyer information.

### System Design
Data flows from PostgreSQL via Drizzle ORM, through Express.js APIs, and is managed by React Query on the client, enabling real-time UI updates. The application adheres to a clear deployment strategy with the frontend building to `dist/public` and the backend to `dist/index.js`, both served by Express.js. Replit modules are utilized for Node.js, web server, and PostgreSQL environments. Security measures include progressive rate limiting, heuristic-based bot detection, IP blocking, CAPTCHA, and input validation to prevent database overload and ensure data integrity. All number formatting is standardized to the US locale.

## External Dependencies

-   **Database**: `@neondatabase/serverless` (for Neon Database), `drizzle-orm`, `drizzle-kit`
-   **UI Components**: `@radix-ui/*` (Radix UI primitives)
-   **Visualization**: `recharts`, `embla-carousel-react`
-   **Forms**: `react-hook-form`, `@hookform/resolvers`
-   **Utilities**: `date-fns`, `clsx`, `tailwind-merge`
-   **Icons**: Lord-Icon
-   **Integrations**: Google Sheets (for logging contact form submissions)