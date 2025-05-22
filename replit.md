# Africa Carbon Credits Analytics Dashboard

## Overview

This is a comprehensive analytics dashboard for African carbon credits data built with React, Express.js, and PostgreSQL. The application provides real-time insights into carbon credit transactions, buyer profiles, and market trends across African countries. It features interactive visualizations, advanced filtering capabilities, and data export functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and dark theme
- **Charts**: Recharts for data visualizations
- **Animations**: Framer Motion for smooth UI transitions

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL 16 (configured via Replit modules)
- **Data Provider**: Neon Database serverless for production
- **Development**: In-memory storage fallback for development

### Key Components

#### Data Models
- **Transactions**: Core carbon credit transaction records with buyer, project, and retirement details
- **Buyer Profiles**: Aggregated buyer information with cumulative retirement statistics
- **Dashboard Metrics**: Computed analytics for real-time insights

#### API Endpoints
- `/api/dashboard/metrics` - Aggregate dashboard statistics
- `/api/transactions` - Filtered transaction data with search capabilities
- `/api/dashboard/countries` - Geographic distribution data for map visualization
- `/api/dashboard/sectors` - Sector breakdown for pie charts
- `/api/dashboard/time-series` - Historical trend data
- `/api/dashboard/top-buyers` - Leading carbon credit purchasers

#### Frontend Features
- **Interactive Dashboard**: Multiple visualization types (maps, charts, tables)
- **Advanced Filtering**: Real-time filters for country, sector, project type, date ranges, and search
- **Responsive Design**: Mobile-first approach with glass morphism design elements
- **Data Export**: CSV/Excel export functionality for filtered datasets
- **Theme System**: Dark/light theme toggle with system preference detection

## Data Flow

1. **Data Ingestion**: Transaction data flows through the Drizzle ORM schema into PostgreSQL
2. **API Layer**: Express.js routes handle data aggregation and filtering queries
3. **Client Queries**: React Query manages API calls with caching and background updates
4. **UI Updates**: Real-time dashboard updates based on filter changes and data refreshes
5. **User Interactions**: Filter selections trigger API calls and update visualizations

## External Dependencies

### Core Libraries
- **Database**: `@neondatabase/serverless` for production database connectivity
- **ORM**: `drizzle-orm` and `drizzle-kit` for database operations and migrations
- **UI Components**: Radix UI primitives (`@radix-ui/*`) for accessible component foundations
- **Visualization**: `recharts` for charts and `embla-carousel-react` for carousels
- **Forms**: `react-hook-form` with `@hookform/resolvers` for form validation
- **Utilities**: `date-fns` for date manipulation, `clsx` and `tailwind-merge` for styling

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Development server and build tool with hot module replacement
- **ESBuild**: Production bundling for server-side code
- **Tailwind CSS**: Utility-first CSS framework with PostCSS

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles Node.js server code to `dist/index.js`
- **Assets**: Static files served by Express in production mode

### Environment Configuration
- **Development**: `npm run dev` - TSX for server, Vite dev server for client
- **Production**: `npm run build && npm run start` - Compiled assets and server
- **Database**: Environment variable `DATABASE_URL` for PostgreSQL connection

### Replit Configuration
- **Modules**: Node.js 20, Web server, PostgreSQL 16
- **Deployment**: Autoscale deployment target with build and run commands
- **Port**: Internal port 5000 mapped to external port 80
- **Development**: Live reload and error overlay integration

The application is designed for scalability with a clear separation between client and server concerns, efficient data caching strategies, and optimized build processes for both development and production environments.