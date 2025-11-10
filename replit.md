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

### November 10, 2025 - Performance Optimization (Batched API + Lazy Loading)
Implemented comprehensive performance optimizations targeting LCP and TBT improvements:

#### Backend Optimizations
- **Batched Dashboard Endpoint**: Created `/api/dashboard/initial` endpoint (server/routes.ts)
  - Combines 6 separate API calls (metrics, countries, sectors, scopes, timeseries, top-buyers) into 1 request
  - Reduces HTTP round trips by 85% on initial dashboard load
  - Uses Promise.all() for parallel database queries
  - Response time: ~1.9s (first load), <100ms (cached)
  - Expected LCP improvement: 10.7s → ~4-5s

- **Stale-While-Revalidate Caching**: Enhanced HTTP caching strategy
  - Cache-Control: public, max-age=60, stale-while-revalidate=300
  - Applied to ALL dashboard endpoints (both cache hits and misses)
  - Browser serves stale content immediately while fetching fresh data in background
  - Improves perceived performance on repeat visits
  - Works in conjunction with existing node-cache in-memory caching (TTL: 5 minutes)

- **Database Indexes**: Composite B-tree indexes on transactions table (server/migrate.ts)
  - retirement_year as leading column for optimal query performance
  - Accelerates WHERE/GROUP BY clauses in dashboard aggregations
  - Indexes: year+country, year+buyer_location, year+buyer_sector, year+scope, year+type

#### Frontend Optimizations
- **Batched Data Hook**: Refactored useDashboard hook (client/src/hooks/use-dashboard.ts)
  - Uses batched `/api/dashboard/initial` endpoint by default
  - Individual endpoints kept as fallback (disabled by default)
  - Reduces waterfall loading pattern
  - staleTime: 60s, gcTime: 5 minutes for optimal cache behavior

- **Lazy Loading D3 Library**: BilateralSankeyDiagram component (client/src/components/BilateralAgreements.tsx)
  - Wrapped in React.lazy() + Suspense boundary
  - Defers ~100KB+ D3 library (d3, d3-sankey) until component visible
  - Skeleton fallback prevents layout shift
  - Desktop-only component (not loaded on mobile)
  - Expected TBT improvement: 690ms → ~200ms

- **Resource Hints & Font Optimization**: (client/index.html, client/src/index.css)
  - DNS prefetch for Google Analytics
  - Font preloading for Stack Sans (Text + Notch variants)
  - font-display: swap for instant text rendering
  - Compression middleware (gzip/brotli) for all responses

#### Performance Impact
- **HTTP Requests**: 6-8 requests → 1 batched request (85% reduction)
- **Initial Load Time**: Expected LCP 10.7s → ~4-5s (55% improvement)
- **JavaScript Execution**: Expected TBT 690ms → ~200ms (71% improvement)
- **Cache Hit Rate**: Improved with stale-while-revalidate strategy
- **Bundle Size**: Reduced initial JS by ~100KB+ via lazy loading

#### Architecture Preservation
All functionality intact: filters, analytics tracking, mobile UI, dark theme, PWA, CSP headers, search, bilateral agreements, Lord Icon animations