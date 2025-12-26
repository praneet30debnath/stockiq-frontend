# StockIQ Frontend

Modern, stylish React + TypeScript frontend for Indian Stock Portfolio Tracker.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Material-UI (MUI)** for UI components
- **Redux Toolkit** for state management
- **React Router** for routing
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Axios** for API calls

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── api/              # API client and endpoints
├── components/       # Reusable components
├── features/         # Feature-based modules
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── routes/          # Routing configuration
├── store/           # Redux store
├── styles/          # Global styles and theme
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## Features

- ✅ Stylish login page with animations
- ✅ Modern dashboard layout with sidebar and header
- ✅ Responsive design
- ✅ Redux state management
- ✅ Custom Material-UI theme
- ✅ Gradient designs and smooth animations
- 🚧 Portfolio management
- 🚧 Stock charts and visualizations
- 🚧 Tax reports
- 🚧 Stock screener

## Design System

### Colors

- **Primary**: #6366f1 (Indigo)
- **Secondary**: #8b5cf6 (Purple)
- **Success**: #10b981 (Green)
- **Error**: #ef4444 (Red)
- **Warning**: #f59e0b (Amber)

### Typography

- **Font Family**: Inter
- **Headings**: Bold/Semi-bold
- **Body**: Regular/Medium

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Variables

Create a `.env` file:

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080
VITE_APP_NAME=StockIQ
```

## Demo Credentials

- **Username**: demo
- **Password**: demo123

## License

MIT
