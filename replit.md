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

### October 10, 2025
- **Export Functionality Implementation**: Added missing export data feature to dashboard
  - Integrated ExportModal component that was previously built but not connected
  - Added "Export Data" button above Transaction Details table with emerald green styling
  - Connected export flow: button → modal → form validation → Google Sheets logging → CSV download
  - Export modal includes name, email, organisation fields with disclaimer acceptance requirement
  - CSV export uses exportFilteredData utility respecting current dashboard filters
  - Added error handling and success toast notifications
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