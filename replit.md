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

## Recent Changes

### November 5, 2025 (Session 2 - Bug Fixes)
- **Mobile UI Bug Fixes**: Resolved 3 critical bugs reported after initial mobile improvements
  - **FilterFAB Removal**: Removed duplicate green FAB filter button from dashboard.tsx; FilterBottomSheet now exclusively controlled by Header "Filters" button
  - **Default Theme Fix**: Modified ThemeProvider initialization to validate localStorage theme value (dark/light) before use, properly falling back to defaultTheme="light" on first visit
  - **FilterBottomSheet Layout**: Fixed clipping issues by reducing max-height from 85vh to 80vh, added shrink-0 to drag handle/header/footer, consolidated nested divs, improved scrolling with flex-1 overflow-y-auto
  - Architect review: Pass rating, all bugs resolved without introducing new blockers

### November 5, 2025 (Session 1 - Initial Mobile Improvements)
- **Comprehensive Mobile UX Improvements**: Resolved all reported mobile viewport issues with viewport-conditional rendering and proper z-index hierarchy
  - **Z-Index Hierarchy Established**: Implemented coherent stacking order: Toast(100) > FilterBottomSheet(80/75) > SearchDropdown(70/65) > NavigationDrawer(60/55) > Header(50)
  - **Viewport-Conditional Theme Toggle**: Added theme toggle to Header for desktop/tablet (≥768px) using useMediaQuery hook; mobile users access toggle only via NavigationDrawer, eliminating duplicates
  - **Mobile Filter Solution**: Wrapped all Header filter dropdowns in desktop/tablet conditional; added "Filters" button for mobile that opens FilterBottomSheet component with active filter count badge
  - **Footer Text Consistency**: Updated NavigationDrawer to include full legal disclaimer matching Footer.tsx verbatim, including micro-transactions, compliance programs, pre-purchases details
  - **FilterBottomSheet Z-Index Fix**: Increased backdrop from z-50 to z-[75] and sheet from z-50 to z-[80] to ensure it appears above all components including navigation drawer
  - **Search Dropdown Z-Index Fix**: Lowered dropdown from z-[99999] to z-[70] and backdrop from z-[9998] to z-[65] to resolve navigation drawer overlay conflict
  - **Mobile Sankey Hiding**: Added useMediaQuery hook to BilateralAgreements component to conditionally hide Sankey diagram on mobile (<768px), showing only agreement cards grid
  - **Footer Removal**: Removed Footer component from dashboard.tsx to eliminate duplicate content
  - **Partner Logo Error Handling**: Added onError handlers to all partner logos in NavigationDrawer to hide gracefully on load failure
  - Architect reviews: All changes validated with pass ratings, following React best practices and Material Design 3 mobile patterns