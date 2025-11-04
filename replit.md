# Africa Carbon Credits Analytics Dashboard

## Overview
This project provides a comprehensive analytics dashboard for African carbon credits data. Built with React, Express.js, and PostgreSQL, it offers real-time insights into carbon credit transactions, buyer profiles, and market trends across African countries. The dashboard features interactive visualizations, advanced filtering, data export functionality, and aims to provide crucial business intelligence for the carbon market.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Library**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and dark theme, responsive design with glass morphism elements
- **Charts**: Recharts for data visualizations
- **Animations**: Framer Motion
- **Features**: Interactive dashboard with multiple visualization types (maps, charts, tables), advanced filtering, data export, theme system, and an interactive tooltip system with a Carbon Glossary.

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL 16 (local), Neon Database (production)
- **Key Components**:
    - **Data Models**: Transactions, Buyer Profiles, Dashboard Metrics.
    - **API Endpoints**: For dashboard metrics, transactions, geographical data, sector breakdowns, time-series data, and top buyers.

### System Design
- **Data Flow**: Data flows from PostgreSQL via Drizzle ORM, through Express.js APIs, managed by React Query on the client, updating the UI in real-time.
- **Deployment**: Frontend builds to `dist/public`, backend to `dist/index.js`, served by Express.js. Utilizes Replit modules for Node.js, Web server, and PostgreSQL.

## External Dependencies

### Core Libraries
- **Database**: `@neondatabase/serverless`
- **ORM**: `drizzle-orm`, `drizzle-kit`
- **UI Components**: Radix UI primitives (`@radix-ui/*`)
- **Visualization**: `recharts`, `embla-carousel-react`
- **Forms**: `react-hook-form`, `@hookform/resolvers`
- **Utilities**: `date-fns`, `clsx`, `tailwind-merge`
- **Icons**: Lord-Icon for animated icons

### Development Tools
- **TypeScript**: For type safety.
- **Vite**: Development server and build tool.
- **ESBuild**: Production bundling for server-side code.
- **Tailwind CSS**: Utility-first CSS framework.

### Integrations
- **Google Sheets**: For logging export and contact form submissions.

## Recent Changes

### November 4, 2025
- **Light Mode Implementation**: Implemented comprehensive light/dark theme system following Material Design 3 principles
  - **Material Design 3 Token System**: Expanded CSS variables with semantic color tokens (surface, on-surface, outline, etc.) for both light and dark themes
  - **Theme Toggle**: Added sun/moon icon toggle button to Header with localStorage persistence and accessibility attributes
  - **Semantic Color Migration**: Migrated all components from hard-coded colors (text-white, bg-gray-*, etc.) to theme-aware semantic tokens
  - **Chart Adaptations**: Updated all chart components with theme-optimized colors (brighter for dark, darker for light) while maintaining WCAG AA contrast
  - **Project Type Colors**: Created semantic color system for project types (forestry, renewable, waste, cookstoves) with theme-adaptive backgrounds
  - **Glass Effect**: Updated glass-effect utility to use theme-aware tokens with backdrop-filter for both light and dark modes
  - **Component Coverage**: Migrated 20+ components including Header, MetricsCards, DataTable, FiltersBar, all charts, mobile components, and modals
  - **Accessibility**: Ensured WCAG 2.1 AA contrast ratios (4.5:1 for text, 3:1 for UI elements) in both themes
  - **PWA Compatibility**: Light mode fully compatible with existing PWA features (navigation drawer, filter bottom sheet)
  - **No Breaking Changes**: Desktop and mobile layouts preserved, all functionality maintained, theme switching seamless
  - **Modified Files**: client/src/index.css (expanded token system), tailwind.config.ts (added semantic tokens), client/src/components/Header.tsx (theme toggle), plus 20+ component files migrated to semantic tokens

### October 28, 2025
- **Progressive Web App (PWA) Implementation**: Transformed dashboard into a mobile-friendly Progressive Web App
  - **PWA Foundation**: Created manifest.json with app metadata, icons, and iOS support; implemented service worker with network-first caching strategy and offline fallback
  - **Responsive Breakpoint System**: Created useMediaQuery hook with mobile (<768px), tablet (768px-1024px), and desktop (>1024px) breakpoints
  - **Mobile Navigation Drawer**: Material Design 3 drawer component with hamburger menu, contact form integration, partner logos, and swipe-to-close gestures
  - **Filter Bottom Sheet**: Material Design 3 bottom sheet for mobile filter selection with FAB trigger button, searchable filter options, and active filter count badge
  - **Responsive Layouts**: Verified all components use responsive grid systems (1-column mobile, 2-column tablet, 4-column desktop for metrics cards)
  - **Mobile Data Table**: Horizontal scroll enabled for data table on mobile devices with overflow-x-auto
  - **Touch-Friendly UI**: All interactive elements meet Material Design 3 guidelines for touch targets
  - **Desktop Preservation**: Desktop layout remains unchanged; mobile features layer on top without disrupting existing UX
  - **New Files**: client/public/manifest.json, client/public/service-worker.js, client/src/lib/registerServiceWorker.ts, client/src/hooks/useMediaQuery.ts, client/src/components/NavigationDrawer.tsx, client/src/components/FilterBottomSheet.tsx
  - **Modified Files**: client/index.html (PWA meta tags), client/src/main.tsx (SW registration), client/src/components/Header.tsx (hamburger menu), client/src/pages/dashboard.tsx (filter sheet integration)

### October 20, 2025
- **Project Type Multi-Select Filtering**: Implemented multi-select functionality for the "All Project Types" dropdown filter in the header
  - Changed projectType from single string to string array throughout the application (DashboardFilters interface)
  - Updated Header.tsx to display dynamic count when multiple project types selected (e.g., "2 Project Types")
  - Enhanced updateFilter function to support toggle behavior for project types, matching country/sector/scope filters
  - Added empty string check to properly clear all selections when "All Project Types" is selected
  - Updated backend validateFilters to parse comma-separated project type values into string arrays
  - Modified storage layer (MemStorage and DatabaseStorage) to use array filtering with inArray/includes checks
  - Users can now select multiple project types simultaneously (e.g., Cookstoves + Afforestation)
  - Filter badges display for each selected project type with individual removal capability
  - End-to-end testing confirmed: multi-select works correctly, "All" option clears filters, metrics update properly
  - Consistent implementation across all array-based filters (country, buyerCountry, sector, projectType, scope)

### October 14, 2025
- **Export Functionality Removed**: Removed all export sheets functionality from the dashboard
  - Removed "Export Data" button from UI
  - Removed ExportModal component and all related code
  - Removed Google Sheets logging integration for exports
  - Removed CSV export utilities and handlers
  - Cleaned up unused imports (useState, useMutation, useToast, Button, Download icon)
  - Deleted orphaned files: client/src/components/ExportModal.tsx and client/src/utils/csvExport.ts
  - Dashboard now operates without export functionality
- **Contact Modal Improvements**: Enhanced user experience for contact form submissions
  - Removed dialog description from contact modal header
  - Added success state modal that displays after form submission
  - Success modal shows animated green checkmark, confirmation message, and close button
  - Form no longer closes immediately after submission - shows success state first

### October 10, 2025
- **Content Security Policy Fix**: Resolved critical CSP blocking issue for external form submissions
  - Updated connect-src directive to allow https://script.google.com and https://script.googleusercontent.com
  - Fixes previously blocked requests to Google Sheets webhooks for export and contact forms
  - Both export logging and contact form submissions now work without CSP violations
  - No "Failed to fetch" errors in browser console
- **Number Formatting Standardization**: Fixed all number displays to use US format instead of Indian format
  - Created `formatNumber()` utility function in `client/src/lib/formatNumber.ts` that enforces en-US locale
  - Replaced all `.toLocaleString()` calls throughout the application with `formatNumber()`
  - Numbers now consistently display with US separators: 1,000,000 instead of Indian format (10,00,000 lakhs)
  - Updated components: MetricsCards, DataTable, TopBuyers, AfricaTreemap, Intermediaries, TimeSeriesChart, and chart.tsx
  - Ensures consistent number formatting across all metrics, tables, charts, and visualizations
  - No more lakhs (1,00,000) or crores (1,00,00,000) - all numbers use thousands, millions, billions format
- **Comprehensive Testing**: Conducted end-to-end testing of all dashboard features
  - Verified metrics cards, filters, search, date ranges, visualizations work correctly
  - Confirmed interactive elements (treemap clicks, buyer selections, tabs) apply filters properly
  - Tested data table sorting, pagination, and row selection functionality
  - Validated Carbon Glossary modal and search functionality
  - Verified bilateral agreements section displays correctly with Sankey diagram
  - All core dashboard features functional and ready for public use