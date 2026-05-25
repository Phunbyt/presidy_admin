import { useState } from 'react';
import { Home, Mail, CreditCard, Users, ShieldCheck, UserPlus, LogOut, ChevronRight, Sun, Moon, Menu, X } from 'lucide-react';
import presidyLogo from '../../imports/presidy.jpg';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { t, theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard',   label: 'Overview',         icon: Home },
    { id: 'emails',      label: 'Email Center',     icon: Mail },
    { id: 'payments',    label: 'Payments',         icon: CreditCard },
    { id: 'users',       label: 'Users',            icon: Users },
    { id: 'moderators',  label: 'Moderators',       icon: ShieldCheck },
    { id: 'add-offline', label: 'Add Offline Users',icon: UserPlus },
  ];

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg transition-colors"
        style={{ 
          background: t.surface,
          border: `1px solid ${t.border}`,
          color: t.text
        }}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className="fixed md:relative w-60 flex flex-col h-full flex-shrink-0 z-40 transition-transform duration-300 md:translate-x-0 md:block"
        style={{
          background: t.sidebarBg,
          borderRight: `1px solid ${t.sidebarBorder}`,
          transition: 'background 0.2s, border-color 0.2s',
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
      {/* Logo — stacked so the image can breathe */}
      <div className="px-6 pt-7 pb-5 flex flex-col items-start gap-2">
        <div
          className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
          style={{ boxShadow: `0 0 0 1px rgba(212,168,67,0.15), 0 4px 20px rgba(0,0,0,${t.isDark ? '0.4' : '0.12'})` }}
        >
          <img src={presidyLogo} alt="Presidy" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: t.text, letterSpacing: '-0.02em', transition: 'color 0.2s' }}>
            Presidy
          </span>
          <span
            className="px-1.5 py-0.5 rounded text-[9px] font-medium"
            style={{ background: 'rgba(212,168,67,0.15)', color: '#D4A843', letterSpacing: '0.05em' }}
          >
            ADMIN
          </span>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-6 pb-2">
        <span className="text-[10px] font-semibold tracking-widest" style={{ color: t.textFaint, transition: 'color 0.2s' }}>
          NAVIGATION
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative"
              style={{
                background: isActive ? t.navActive : 'transparent',
                color: isActive ? t.navActiveText : t.navInactiveText,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = t.navHover;
                  (e.currentTarget as HTMLElement).style.color = t.textSub;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = t.navInactiveText;
                }
              }}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                  style={{ background: '#D4A843' }}
                />
              )}
              <Icon size={15} strokeWidth={isActive ? 2 : 1.7} />
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && <ChevronRight size={12} className="ml-auto opacity-60" />}
            </button>
          );
        })}
      </nav>
      </div>
    </>
  );
}
