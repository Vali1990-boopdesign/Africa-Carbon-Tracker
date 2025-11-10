# Africa Carbon Credits Analytics Dashboard

## Overview
This project delivers a comprehensive analytics dashboard for African carbon credits data, providing real-time insights into transactions, buyer profiles, and market trends across African countries. It offers interactive visualizations, advanced filtering, and data export, aiming to be a crucial business intelligence tool for the carbon market with significant market potential.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The frontend utilizes React 18 with TypeScript, Vite, Wouter for routing, and TanStack Query for state management. The UI is built with shadcn/ui (Radix UI primitives) and styled with Tailwind CSS, featuring a custom design system, responsive layouts, a dark theme with glass morphism elements, and a mobile-first PWA approach. Data visualizations are powered by Recharts, and animations by Framer Motion. Key UI features include interactive dashboards, advanced filtering, data export, a theme system, and an interactive tooltip system with a Carbon Glossary.

### Technical Implementation
The backend is developed with Node.js and Express.js, providing a REST API. Data is persisted using PostgreSQL 16 (local) or Neon Database (production) with Drizzle ORM. Core data models include Transactions, Buyer Profiles, and Dashboard Metrics. API endpoints serve various data types such as dashboard metrics, transactional data, geographical data, sector breakdowns, time-series data, and top buyer information.

### System Design
Data flows from PostgreSQL via Drizzle ORM, through Express.js APIs, and is managed by React Query on the client for real-time UI updates. The application employs a clear deployment strategy, with both frontend and backend served by Express.js. Replit modules are used for Node.js, web server, and PostgreSQL environments. Security measures include progressive rate limiting, heuristic-based bot detection, IP blocking, CAPTCHA, and input validation. All number formatting is standardized to the US locale.

## External Dependencies

-   **Database**: `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`
-   **UI Components**: `@radix-ui/*`
-   **Visualization**: `recharts`, `embla-carousel-react`
-   **Forms**: `react-hook-form`, `@hookform/resolvers`
-   **Utilities**: `date-fns`, `clsx`, `tailwind-merge`
-   **Icons**: Lord-Icon
-   **Integrations**: Google Sheets