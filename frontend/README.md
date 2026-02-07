# 🎨 Frontend - AI Interview Assistant

React-based frontend for the AI Interview Assistant application.

## 🛠️ Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests

## 📦 Installation

```bash
npm install
```

## 🚀 Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable React components
│   ├── services/         # API service layer
│   ├── hooks/            # Custom React hooks
│   ├── assets/           # Static assets
│   ├── App.jsx           # Main application component
│   └── main.jsx          # Application entry point
├── public/               # Public static files
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # TailwindCSS configuration
└── package.json          # Dependencies and scripts
```

## 🔧 Configuration

### Vite Config
The Vite configuration includes:
- React plugin for Fast Refresh
- Development server on port 5173
- Proxy configuration for backend API

### Tailwind Config
Custom Tailwind configuration with:
- Extended color palette
- Custom animations
- Responsive breakpoints

## 🌐 API Integration

The frontend connects to the Flask backend at `http://localhost:5000`

API endpoints:
- `GET /api/health` - Health check
- `POST /api/analyze-pose` - Body language analysis

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Styling

This project uses TailwindCSS for styling. Custom styles can be added in:
- `src/index.css` - Global styles
- `src/App.css` - Component-specific styles

## 🔌 Environment Variables

Create a `.env` file in the frontend directory if needed:

```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Deployment

Build the production bundle:

```bash
npm run build
```

The `dist` folder will contain the production-ready files.

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
