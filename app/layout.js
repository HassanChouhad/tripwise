import './globals.css';
import Sidebar from './components/layout/Sidebar';
import WebMCPRegistrar from './components/mcp/WebMCPRegistrar';
import ClientOnly from './components/layout/ClientOnly';
import { SavedTripsProvider } from './context/SavedTripsContext';

export const metadata = {
  title: 'TripWise — AI-Powered Travel Planner',
  description: 'Multi-city travel planning, flight & hotel booking with weather-aware packing suggestions.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SavedTripsProvider>
          <WebMCPRegistrar />
          <div className="app-layout">
            <ClientOnly>
              <Sidebar />
            </ClientOnly>
            <main className="main-content">
              {children}
            </main>
          </div>
        </SavedTripsProvider>
      </body>
    </html>
  );
}
