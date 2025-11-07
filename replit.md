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

### November 7, 2025 - Google Analytics Integration
- **Comprehensive Event Tracking System**: Implemented end-to-end Google Analytics (GA4) tracking with measurement ID G-B5F1JWSXTZ
  - **Analytics Utility Module** (client/src/lib/analytics.ts): Created type-safe tracking functions with 8 event categories:
    - `engagement`: Time-on-page milestones (30s, 2min, 5min) and first user interaction
    - `filter`: Filter selection changes with result counts
    - `chart_interaction`: Chart element clicks (line points, treemap countries, buyer cards)
    - `search`: Search query submissions with term and result count
    - `data_selection`: Individual data point clicks (transactions, buyers, bilateral agreements)
    - `comparison`: Comparison feature usage
    - `conversion`: High-value actions (contact form submissions, CSV exports)
    - `entry_point`: Referrer tracking for campaign attribution
  - **Custom Engagement Hook** (client/src/hooks/useAnalytics.ts): React hook for automatic engagement tracking with cleanup on unmount
  - **Integration Points**: Analytics tracking added to:
    - App.tsx: useAnalytics hook for page engagement and Catalyst Fund referrer detection
    - use-dashboard.ts: trackFilter on filter state changes with result counts
    - Header.tsx: trackSearch on search submissions with query term and result count
    - TimeSeriesChart.tsx: trackChartInteraction on line chart data point clicks
    - AfricaTreemap.tsx: trackChartInteraction on country tile clicks
    - TopBuyers.tsx: trackDataPointSelection for buyer cards, trackChartInteraction for country/sector tabs
    - DataTable.tsx: trackDataPointSelection on transaction row clicks
    - BilateralAgreements.tsx: trackDataPointSelection on agreement card clicks, trackExternalLink on source link clicks
    - ContactModal.tsx: trackConversion on successful form submission
  - **Google Analytics Setup**: GA4 script configured in client/index.html with preconnect for performance optimization
  - **TypeScript Safety**: All tracking functions strongly typed with parameter interfaces, no runtime errors or TypeScript diagnostics

### November 5, 2025 (Session 5 - Filter Data Flow Fixes)
- **Filter System Refactoring**: Fixed critical data flow inconsistencies and type mismatches in filter system
  - **Single Source of Truth**: Moved all toggle logic to use-dashboard.ts updateFilter function; FilterBottomSheet now simply passes values to hook without manipulation
  - **Type Consistency**: Removed mixed types (string | string[]), filters now consistently use arrays throughout codebase
  - **Deduplication at Source**: Added Array.from(new Set(...)) in updateFilter to prevent duplicates from ever entering state
  - **Stable Keys**: Fixed React key generation - removed index from FilterSection keys (now `${title}-${option}`), changed active filter badges to use `${filter.key}-${filter.value}` for uniqueness
  - **Search State Management**: Added searchInputs reset in handleApply to prevent stale UI when FilterBottomSheet reopens
  - **FiltersBar Compatibility**: Updated desktop filter dropdowns to handle array-based filters, showing count when multiple values selected
  - **Simplified Code**: Removed 20+ lines of redundant type checking, normalization, and string conversion logic from FilterBottomSheet
  - Architect review: Pass rating, confirmed data flow maintains consistent array-based state with no regressions in request construction or UI synchronization

### November 5, 2025 (Session 4 - Architectural Fixes)
- **Theme & Stacking Context Resolution**: Fixed critical architectural issues preventing proper mobile UI display
  - **Theme Default Fix**: Changed App.tsx defaultTheme from "dark" to "light" (line 27) to align with ThemeProvider initialState; new users now see light mode by default while localStorage overrides are preserved
  - **Component Restructuring**: Lifted NavigationDrawer and FilterBottomSheet out of Header component to Dashboard level, making them siblings instead of children
  - **Stacking Context Fix**: Resolved CSS stacking context trap where drawer/sheet (z-[80]/z-[100]) were stuck inside Header's sticky z-40 context, preventing proper layering above page content
  - **State Management**: Moved isDrawerOpen state from Header to Dashboard, added onOpenDrawer and onOpenFilters props to Header interface, following React best practices (lift state up)
  - **Architecture Impact**: Mobile overlays now inherit independent fixed positioning with proper z-index hierarchy: FilterBottomSheet (100) > NavigationDrawer (80) > Search dropdown (60) > Header (40)
  - **Header Cleanup**: Removed internal drawer/sheet state, removed component rendering, kept only trigger buttons and handlers
  - Architect review: Pass rating, confirmed restructuring resolves defects with no performance concerns or regressions

### November 5, 2025 (Session 3 - Final Mobile Fixes)
- **Final Mobile UI Refinements**: Resolved persistent theme, scroll lock, and layout issues
  - **Theme Default Fix**: Changed ThemeProvider initialState from "dark" to "light" (line 20) to align context default with defaultTheme prop; new users now properly see light mode on first visit
  - **Centralized Scroll Lock Management**: Created useBodyScrollLock hook with reference counting to prevent document.body overflow conflicts when NavigationDrawer and FilterBottomSheet open/close simultaneously
  - **FilterBottomSheet ScrollArea Fix**: Wrapped ScrollArea in flex-1 parent container, added explicit h-full to ScrollArea, removed conflicting overflow-y-auto class to eliminate top clipping issues
  - **Hook Integration**: Updated both NavigationDrawer and FilterBottomSheet to use useBodyScrollLock hook instead of direct body.style.overflow manipulation
  - Architect review: Pass rating, all mobile UI regressions resolved without functional issues; suggested hardening useBodyScrollLock for non-browser environments

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