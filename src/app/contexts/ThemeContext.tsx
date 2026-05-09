import { createContext, useContext, useState, ReactNode } from 'react';

export type Theme = 'dark' | 'light';

export interface ThemeTokens {
  isDark: boolean;
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceHover: string;
  border: string;
  borderSub: string;
  text: string;
  textSub: string;
  textMuted: string;
  textFaint: string;
  inputBg: string;
  inputBgFocus: string;
  inputBorder: string;
  inputBorderFocus: string;
  inputText: string;
  sidebarBg: string;
  sidebarBorder: string;
  tableStripe: string;
  selectOptionBg: string;
  chartGrid: string;
  chartTick: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  tooltipSub: string;
  navActive: string;
  navHover: string;
  navActiveText: string;
  navInactiveText: string;
}

export const darkTokens: ThemeTokens = {
  isDark: true,
  bg: '#0C0C0E',
  surface: '#141416',
  surfaceAlt: '#1A1A1D',
  surfaceHover: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.07)',
  borderSub: 'rgba(255,255,255,0.05)',
  text: '#F2F2F2',
  textSub: 'rgba(255,255,255,0.55)',
  textMuted: 'rgba(255,255,255,0.35)',
  textFaint: 'rgba(255,255,255,0.2)',
  inputBg: 'rgba(255,255,255,0.04)',
  inputBgFocus: 'rgba(255,255,255,0.06)',
  inputBorder: 'rgba(255,255,255,0.08)',
  inputBorderFocus: 'rgba(212,168,67,0.4)',
  inputText: '#F2F2F2',
  sidebarBg: '#080809',
  sidebarBorder: 'rgba(255,255,255,0.06)',
  tableStripe: 'rgba(255,255,255,0.02)',
  selectOptionBg: '#1A1A1D',
  chartGrid: 'rgba(255,255,255,0.05)',
  chartTick: 'rgba(255,255,255,0.3)',
  tooltipBg: '#1C1C1F',
  tooltipBorder: 'rgba(255,255,255,0.08)',
  tooltipText: '#F2F2F2',
  tooltipSub: 'rgba(255,255,255,0.45)',
  navActive: 'rgba(212,168,67,0.1)',
  navHover: 'rgba(255,255,255,0.04)',
  navActiveText: '#D4A843',
  navInactiveText: 'rgba(255,255,255,0.45)',
};

export const lightTokens: ThemeTokens = {
  isDark: false,
  bg: '#F4F3EF',
  surface: '#FFFFFF',
  surfaceAlt: '#F9F8F5',
  surfaceHover: 'rgba(0,0,0,0.03)',
  border: 'rgba(0,0,0,0.08)',
  borderSub: 'rgba(0,0,0,0.05)',
  text: '#0C0C0E',
  textSub: 'rgba(0,0,0,0.55)',
  textMuted: 'rgba(0,0,0,0.4)',
  textFaint: 'rgba(0,0,0,0.25)',
  inputBg: 'rgba(0,0,0,0.03)',
  inputBgFocus: 'rgba(0,0,0,0.05)',
  inputBorder: 'rgba(0,0,0,0.1)',
  inputBorderFocus: 'rgba(212,168,67,0.5)',
  inputText: '#0C0C0E',
  sidebarBg: '#FFFFFF',
  sidebarBorder: 'rgba(0,0,0,0.07)',
  tableStripe: 'rgba(0,0,0,0.02)',
  selectOptionBg: '#FFFFFF',
  chartGrid: 'rgba(0,0,0,0.06)',
  chartTick: 'rgba(0,0,0,0.35)',
  tooltipBg: '#FFFFFF',
  tooltipBorder: 'rgba(0,0,0,0.1)',
  tooltipText: '#0C0C0E',
  tooltipSub: 'rgba(0,0,0,0.45)',
  navActive: 'rgba(212,168,67,0.1)',
  navHover: 'rgba(0,0,0,0.04)',
  navActiveText: '#B8882A',
  navInactiveText: 'rgba(0,0,0,0.45)',
};

interface ThemeContextValue {
  theme: Theme;
  t: ThemeTokens;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  t: darkTokens,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const t = theme === 'dark' ? darkTokens : lightTokens;
  return (
    <ThemeContext.Provider value={{ theme, t, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
