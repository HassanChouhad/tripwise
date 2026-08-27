import './globals.css';
import Sidebar from './components/layout/Sidebar';
import WebMCPRegistrar from './components/mcp/WebMCPRegistrar';
import ClientOnly from './components/layout/ClientOnly';
import { SavedTripsProvider } from './context/SavedTripsContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';

export const metadata = {
  title: 'TripWise — AI-Powered Travel Planner',
  description: 'Multi-city travel planning, flight & hotel booking with weather-aware packing suggestions.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <CartProvider>
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
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
