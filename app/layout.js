import './globals.css';
import Sidebar from './components/layout/Sidebar';
import WebMCPRegistrar from './components/mcp/WebMCPRegistrar';

export const metadata = {
  title: 'TripWise — AI-Powered Travel Planner',
  description: 'Plan multi-city trips with optimized flights, hotels, weather forecasts, and smart packing suggestions. Powered by AI and WebMCP.',
  keywords: 'travel, flights, hotels, trip planner, AI, multi-city, weather, packing',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WebMCPRegistrar />
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
