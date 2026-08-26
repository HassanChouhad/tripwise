'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Compass, Map, Plane, Building2, Route, CloudSun,
  Backpack, Tag, User, Settings, Sparkles, Menu, X, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import styles from './Sidebar.module.css';
import AiPlannerModal from '../ai/AiPlannerModal';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Compass, label: 'Explore', href: '/explore' },
  { icon: Map, label: 'Trips', href: '/trips' },
  { icon: Plane, label: 'Flights', href: '/flights' },
  { icon: Building2, label: 'Hotels', href: '/hotels' },
  { icon: Route, label: 'Itineraries', href: '/itinerary' },
  { divider: true },
  { icon: CloudSun, label: 'Weather', href: '/weather' },
  { icon: Backpack, label: 'Packing Guide', href: '/packing' },
  { icon: Tag, label: 'Deals', href: '/deals' },
  { divider: true },
  { icon: User, label: 'Account', href: '/account' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <button
        className={styles.mobileToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
        id="mobile-nav-toggle"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {isOpen && (
        <div
          className={`${styles.mobileOverlay} ${styles.mobileOverlayOpen}`}
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>✈</div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>TripWise</span>
            <span className={styles.logoSubtitle}>Plan better. Travel smarter.</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item, index) => {
            if (item.divider) {
              return <div key={`div-${index}`} className={styles.navDivider} />;
            }

            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setIsOpen(false)}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className={styles.navIcon} size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          id="theme-toggle-btn"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className={styles.aiPlanner}>
          <div className={styles.aiPlannerBadge}>
            <Sparkles size={10} /> BETA
          </div>
          <div className={styles.aiPlannerTitle}>AI Trip Planner</div>
          <div className={styles.aiPlannerDesc}>
            Tell us your dream trip and our AI will plan it for you.
          </div>
          <button
            className={styles.aiPlannerBtn}
            id="plan-with-ai-btn"
            onClick={() => setIsAiModalOpen(true)}
          >
            <Sparkles size={16} />
            Plan with AI
          </button>
        </div>
      </aside>

      <AiPlannerModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </>
  );
}
