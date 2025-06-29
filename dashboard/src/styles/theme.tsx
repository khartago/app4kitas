import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider, DefaultTheme } from 'styled-components';

// Design tokens from styles_app4kitas_MODERN.json
const colors = {
  light: {
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    accent: '#FFC107',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    error: '#F44336',
    textPrimary: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
    disabled: '#BDBDBD',
    tooltipBg: '#333',
    tooltipText: '#FFF',
    snackbarBg: '#323232',
    snackbarText: '#FFF',
  },
  dark: {
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    accent: '#FFD54F',
    background: '#181C1F',
    surface: '#23272F',
    error: '#F44336',
    textPrimary: '#F5F5F5',
    textSecondary: '#BDBDBD',
    border: '#2C2F36',
    disabled: '#BDBDBD',
    tooltipBg: '#23272F',
    tooltipText: '#FFD54F',
    snackbarBg: '#23272F',
    snackbarText: '#FFD54F',
  },
};

const typography = {
  fontFamily: 'Inter, sans-serif',
  headline1: {
    fontSize: '32px',
    fontWeight: 700,
  },
  headline2: {
    fontSize: '24px',
    fontWeight: 700,
  },
  subtitle1: {
    fontSize: '18px',
    fontWeight: 600,
  },
  body1: {
    fontSize: '16px',
    fontWeight: 400,
  },
  body2: {
    fontSize: '14px',
    fontWeight: 400,
  },
  caption: {
    fontSize: '12px',
    fontWeight: 400,
  },
};

// Add animations from design tokens
const animations = {
  defaultDuration: 300,
  transitionCurves: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  types: {
    fade: {
      duration: 300,
      curve: 'easeInOut',
    },
    slideLeft: {
      duration: 350,
      curve: 'easeOut',
    },
    slideUp: {
      duration: 350,
      curve: 'easeOut',
    },
    scale: {
      duration: 300,
      curve: 'easeIn',
    },
    bounce: {
      duration: 500,
      curve: 'easeOut',
    },
    zoom: {
      duration: 300,
      curve: 'easeOut',
    },
  },
};

// Add missing appBar component token
const components = {
  button: {
    padding: '12px 28px',
    borderRadius: '14px',
    elevation: 3,
    fontWeight: 600,
    fontSize: '16px',
    boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
    background: colors.light.primary,
    color: '#fff',
    hoverBackground: colors.light.primaryDark,
    activeBackground: '#388E3C',
    disabledBackground: colors.light.disabled,
    disabledColor: '#fff',
    transition: 'background 0.18s, box-shadow 0.18s',
  },
  card: {
    padding: '20px',
    borderRadius: '18px',
    elevation: 2,
    background: colors.light.surface,
    boxShadow: '0 2px 12px rgba(44,62,80,0.08)',
    border: `1.5px solid ${colors.light.border}`,
  },
  input: {
    padding: '14px',
    borderRadius: '12px',
    borderColor: colors.light.border,
    focusedBorderColor: colors.light.primary,
    errorBorderColor: colors.light.error,
    background: colors.light.surface,
    color: colors.light.textPrimary,
    fontSize: '16px',
    boxShadow: '0 1px 4px rgba(44,62,80,0.04)',
    transition: 'border-color 0.18s, box-shadow 0.18s',
  },
  table: {
    borderRadius: '14px',
    background: colors.light.surface,
    headerBackground: colors.light.primary,
    headerColor: '#fff',
    rowHover: '#F1F8E9',
    border: `1.5px solid ${colors.light.border}`,
    boxShadow: '0 2px 8px rgba(44,62,80,0.06)',
    fontSize: '15px',
    cellPadding: '14px 18px',
    stripedRow: '#FAFAFA',
  },
  avatar: {
    size: 56,
    borderRadius: '50%',
    border: `2px solid ${colors.light.primary}`,
    boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
  },
  snackbar: {
    backgroundColor: colors.light.snackbarBg,
    textColor: colors.light.snackbarText,
    borderRadius: '10px',
    fontSize: '15px',
    boxShadow: '0 4px 16px rgba(44,62,80,0.18)',
    duration: 3000,
  },
  dialog: {
    borderRadius: '18px',
    backgroundColor: colors.light.surface,
    textColor: colors.light.textPrimary,
    boxShadow: '0 8px 32px rgba(44,62,80,0.18)',
    padding: '32px',
  },
  tooltip: {
    backgroundColor: colors.light.tooltipBg,
    textColor: colors.light.tooltipText,
    fontSize: '13px',
    borderRadius: '8px',
    padding: '8px 14px',
    boxShadow: '0 2px 8px rgba(44,62,80,0.12)',
  },
  appBar: {
    height: 60,
    backgroundColor: colors.light.primary,
    textColor: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
  },
};

export const theme = {
  light: {
    colors: colors.light,
    typography,
    components,
    animations,
    mode: 'light',
  },
  dark: {
    colors: {
      ...colors.dark,
      cardSurface: '#262B33',
      tableSurface: '#262B33',
    },
    typography,
    components: {
      ...components,
      button: {
        ...components.button,
        background: colors.dark.primary,
        color: '#F5F5F5',
        hoverBackground: '#5AD77A',
        activeBackground: '#388E3C',
        disabledBackground: colors.dark.disabled,
        disabledColor: '#888',
        boxShadow: '0 2px 8px rgba(0,0,0,0.32)',
      },
      card: {
        ...components.card,
        background: '#262B33',
        boxShadow: '0 2px 12px rgba(0,0,0,0.32)',
        border: `1.5px solid ${colors.dark.border}`,
      },
      input: {
        ...components.input,
        background: colors.dark.surface,
        color: colors.dark.textPrimary,
        borderColor: colors.dark.border,
        focusedBorderColor: colors.dark.primary,
        errorBorderColor: colors.dark.error,
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
      },
      table: {
        ...components.table,
        background: '#262B33',
        headerBackground: colors.dark.primary,
        headerColor: '#F5F5F5',
        rowHover: '#23272F',
        border: `1.5px solid ${colors.dark.border}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        stripedRow: '#20232A',
      },
      avatar: {
        ...components.avatar,
        border: `2px solid ${colors.dark.primary}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.32)',
      },
      snackbar: {
        ...components.snackbar,
        backgroundColor: colors.dark.snackbarBg,
        textColor: colors.dark.snackbarText,
        boxShadow: '0 4px 16px rgba(0,0,0,0.32)',
      },
      dialog: {
        ...components.dialog,
        backgroundColor: colors.dark.surface,
        textColor: colors.dark.textPrimary,
        boxShadow: '0 8px 32px rgba(0,0,0,0.32)',
      },
      tooltip: {
        ...components.tooltip,
        backgroundColor: colors.dark.tooltipBg,
        textColor: colors.dark.tooltipText,
        boxShadow: '0 2px 8px rgba(0,0,0,0.32)',
      },
      appBar: {
        ...components.appBar,
        backgroundColor: colors.dark.surface,
        textColor: colors.dark.primary,
        boxShadow: '0 2px 8px rgba(0,0,0,0.32)',
      },
    },
    animations,
    mode: 'dark',
  },
} as const;

type ThemeMode = 'light' | 'dark';

interface ThemeContextProps {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  mode: 'light',
  setMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const useDarkMode = () => {
  const { mode, setMode } = useTheme();
  const toggle = () => setMode(mode === 'light' ? 'dark' : 'light');
  return { mode, setMode, toggle };
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Try to load mode from localStorage or system preference
  const getInitialMode = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('themeMode');
      if (stored === 'light' || stored === 'dark') return stored;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  };
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);
  React.useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);
  const value = useMemo(() => ({ mode, setMode }), [mode]);
  const currentTheme: DefaultTheme = theme[mode];
  return (
    <ThemeContext.Provider value={value}>
      <StyledThemeProvider theme={currentTheme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
}; 