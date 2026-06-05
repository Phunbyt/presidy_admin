import { Home, Mail, CreditCard, Users, ShieldCheck, UserPlus, LogOut, ChevronRight, Sun, Moon } from 'lucide-react';
import presidyLogo from '../../imports/presidy.jpg';
import { useTheme } from '../contexts/ThemeContext';
import { LoginPage } from './LoginPage';

function getAdminEmail(): string {
    const token = localStorage.getItem('admin_token');
    if (!token) return 'admin@presidy.com';
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.email ?? 'admin@presidy.com';
    } catch {
        return 'admin@presidy.com';
    }
}
interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { t, theme, toggleTheme } = useTheme();
  const adminEmail = getAdminEmail()
  const menuItems = [
    { id: 'dashboard',   label: 'Overview',         icon: Home },
    { id: 'emails',      label: 'Email Center',     icon: Mail },
 //   { id: 'payments',    label: 'Payments',         icon: CreditCard },
    { id: 'users',       label: 'Users',            icon: Users },
    { id: 'moderators',  label: 'Moderators',       icon: ShieldCheck },
    { id: 'add-offline', label: 'Add Offline Users',icon: UserPlus },
  ];

  return (
    <div
      className="w-60 flex flex-col h-full flex-shrink-0"
      style={{
        background: t.sidebarBg,
        borderRight: `1px solid ${t.sidebarBorder}`,
        transition: 'background 0.2s, border-color 0.2s',
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
              onClick={() => onNavigate(item.id)}
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

      {/* Theme toggle */}
      <div className="px-4 pb-3">
        <div
          className="flex items-center justify-between px-3 py-2.5 rounded-xl"
          style={{ background: t.surfaceHover, border: `1px solid ${t.borderSub}` }}

          
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon size={13} style={{ color: '#D4A843' }} />
            ) : (
              <Sun size={13} style={{ color: '#D4A843' }} />
            )}
            <span className="text-xs font-medium" style={{ color: t.textMuted }}>
              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </span>
          </div>

          {/* Pill toggle */}
          <button
            onClick={toggleTheme}
            className="relative flex-shrink-0 rounded-full transition-all duration-300 focus:outline-none"
            style={{
              width: '38px',
              height: '22px',
              background: theme === 'dark'
                ? 'rgba(212,168,67,0.15)'
                : 'linear-gradient(135deg, #D4A843, #C49830)',
              border: theme === 'dark' ? '1px solid rgba(212,168,67,0.3)' : '1px solid transparent',
              boxShadow: theme === 'light' ? '0 2px 8px rgba(212,168,67,0.35)' : 'none',
            }}
            aria-label="Toggle theme"
          >
            <span
              className="absolute top-0.5 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                width: '18px',
                height: '18px',
                left: theme === 'dark' ? '1px' : '17px',
                background: theme === 'dark' ? 'rgba(212,168,67,0.8)' : '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }}
            >
              {theme === 'dark' ? (
                <Moon size={9} style={{ color: '#0C0C0E' }} />
              ) : (
                <Sun size={9} style={{ color: '#C49830' }} />
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="mx-4 mb-3" style={{ borderTop: `1px solid ${t.borderSub}` }} />

      {/* Admin profile */}
      <div className="px-4 pb-6">
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
          style={{ background: t.surfaceHover }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #D4A843, #B8882A)' }}
          >
            <span className="text-xs font-bold text-black">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: t.text }}>Admin </p>
            <p className="text-xs truncate" style={{ color: t.textFaint }}>{adminEmail}</p>
          </div>
          <LogOut size={13} style={{ color: t.textFaint, flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
