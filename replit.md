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
-   **Utilities**: `date-fns`, `clsx`, `tailwind-merge`, `node-cache`
-   **Icons**: Lord-Icon
-   **Integrations**: Google Sheets

## Recent Changes

### November 10, 2025 - Lord Icon Optimization with React Player Component
Switched to `@lordicon/react` Player component for better control over animations and one-time playback:

- **NPM Package Migration**: Replaced `@lordicon/element` with `@lordicon/react`
  - Installed `@lordicon/react` package
  - Removed CDN script and `@lordicon/element` initialization
  - Uses React Player component with ref-based API control

- **LazyLordIcon Component Refactor**:
  - Fetches JSON animation data from public folder using fetch()
  - Tracks hover state and hasPlayed state for one-time animation
  - Uses `playerRef.current?.playFromBeginning()` on first hover only
  - Sets `hasPlayed=true` in onComplete callback to prevent replay
  - Shows skeleton placeholder while loading icon data
  - Properly handles colors as string prop (e.g., "primary:#10b981,secondary:#059669")

- **Component Updates**:
  - MetricsCards: Simplified to use size prop instead of style width/height
  - Header: Replaced raw `<lord-icon>` element with LazyLordIcon component
  - All icons load from local JSON files in client/public/

- **Performance Benefits**:
  - No external CDN dependency for better reliability
  - Icons play only once on first interaction
  - Smooth loading experience with skeleton states
  - Better control over animation lifecycle

### November 10, 2025 - Performance Optimization (Backend + Frontend)
Addressed performance bottleneck (Performance Score: 43/100, LCP: 10.7s, TBT: 690ms) with comprehensive backend and frontend optimizations:

#### Backend Optimizations (Highest Impact)
- **Database Indexes**: Added composite B-tree indexes on transactions table
  - `idx_transactions_year_country` on (retirement_year, country)
  - `idx_transactions_year_buyer_location` on (retirement_year, buyer_hq_location)
  - `idx_transactions_year_buyer_sector` on (retirement_year, buyer_sector)
  - `idx_transactions_year_scope` on (retirement_year, scope)
  - `idx_transactions_year_type` on (retirement_year, type)
  - retirement_year is the leading column to optimize default dashboard queries
  - Accelerates WHERE/GROUP BY clauses and aggregations in dashboard queries
  - Expected to reduce /api/dashboard/metrics from 5.6s → <1s

- **Response Caching**: Implemented in-memory caching with node-cache (server/cache.ts)
  - TTL: 5 minutes (300s) for all dashboard endpoints
  - Normalized filter keys: sorted arrays, bounded year ranges
  - Cached endpoints: /api/dashboard/metrics, /countries, /sectors, /scopes, /timeseries, /top-buyers
  - Cache invalidation: Automatic on /api/import-latest (manual CSV refresh)
  - Observed 304 responses with <1ms response times for cached data

#### Frontend Optimizations
- **Code Splitting**: Lazy-loaded Recharts library via React.lazy + Suspense
  - Created TimeSeriesChartLazy wrapper component
  - Reduces initial bundle by ~100KB+
  - Skeleton fallback during load prevents layout shift

- **Lazy Load Animations**: Created LazyLordIcon component with Intersection Observer
  - Defers 28KB Lord Icon JSON files until visible
  - Applied to MetricsCards, BilateralAgreements, BilateralSankeyDiagram
  - 50px rootMargin for smooth preload
  - Placeholder fallback prevents CLS

- **Static Asset Caching**: Cache-Control headers (server/index.ts)
  - Immutable assets: 1 year, JSON animations: 1 day, HTML: no-cache

#### Performance Expectations
- **LCP**: 10.7s → ~4-5s (backend caching + database indexes)
- **TBT**: 690ms → ~200ms (code splitting + lazy loading)
- **Performance Score**: 43 → ~75+
- First visit: Full database queries (slower), subsequent: cached responses (<1ms)

#### Architecture Preservation
All functionality intact: filters, analytics tracking, mobile UI, dark theme, PWA, CSP headers, search, bilateral agreements