# Scooter Sharing Platform - Frontend


This is the frontend application for the Scooter Sharing Platform built with React + TypeScript + Vite.

## Features

- 🚀 Modern React with TypeScript
- 🔐 Authentication & Authorization
- 🛣️ Protected Routes with Role-based Access
- 🔄 React Query for Server State Management
- 📱 Responsive Design (to be implemented)
- 🔧 API Client with Token Injection & Error Handling

## Project Structure

```
src/
├── api/              # API layer (domain-specific)
├── components/       # Reusable UI components
├── context/         # React Context providers
├── pages/           # Page components
├── router/          # Routing configuration
├── types/           # TypeScript type definitions
├── utils/           # Utilities (axios client, query client)
└── hooks/           # Custom React hooks (to be added)
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the frontend directory with:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_DEBUG=true
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Architecture Overview

#### API Layer
- All API calls go through `src/api/` modules
- Axios client with automatic token injection
- Centralized error handling (401 redirects to login)

#### State Management
- **Server State**: React Query for API data
- **Client State**: React Context for auth/user data
- **UI State**: React hooks for component state

#### Routing
- Public routes: `/` (login/register)
- Protected routes: `/scooters`, `/my-bookings`
- Admin routes: `/admin` (requires MANAGER role)

#### Authentication Flow
1. User logs in via AuthPage
2. Token and user data stored in localStorage
3. Token automatically injected into API requests
4. 401 errors trigger automatic logout
5. Protected routes check authentication status

## Key Design Decisions

1. **React Query First**: Avoid manual loading/error state management
2. **API Layer Independence**: Components don't call axios directly
3. **Type Safety**: All API responses are typed
4. **Centralized Error Handling**: 401 errors handled globally
5. **Role-based Access Control**: Built into ProtectedRoute

## Next Steps

1. Implement AuthPage UI (login/register forms)
2. Add React Query hooks for data fetching
3. Implement UI components for scooter list and booking
4. Add toast notifications for user feedback
5. Implement responsive design with Tailwind CSS

## License

This project is part of the XJCO2913 Software Engineering coursework.