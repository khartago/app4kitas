// Extend DefaultTheme to include our custom properties
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryDark: string;
      accent: string;
      background: string;
      surface: string;
      surfaceAlt: string;
      error: string;
      textPrimary: string;
      textSecondary: string;
      border: string;
      disabled: string;
      tooltipBg: string;
      tooltipText: string;
      snackbarBg: string;
      snackbarText: string;
      tableRowHover: string;
      tableStriped: string;
      cardSurface?: string;
      success: string;
      warning: string;
      info: string;
      secondary: string;
    };
    typography: {
      fontFamily: string;
      headline1: {
        fontFamily: string;
        fontSize: string;
        fontWeight: number;
        letterSpacing: string;
      };
      headline2: {
        fontFamily: string;
        fontSize: string;
        fontWeight: number;
        letterSpacing: string;
      };
      headline3: {
        fontFamily: string;
        fontSize: string;
        fontWeight: number;
        letterSpacing: string;
      };
      headline4: {
        fontFamily: string;
        fontSize: string;
        fontWeight: number;
        letterSpacing: string;
      };
      subtitle1: {
        fontFamily: string;
        fontSize: string;
        fontWeight: number;
      };
      body1: {
        fontFamily: string;
        fontSize: string;
        fontWeight: number;
      };
      body2: {
        fontFamily: string;
        fontSize: string;
        fontWeight: number;
      };
      caption: {
        fontFamily: string;
        fontSize: string;
        fontWeight: number;
      };
    };
    components: {
      button: {
        padding: string;
        borderRadius: string;
        elevation: number;
        fontWeight: number;
        fontSize: string;
        boxShadow: string;
        background: string;
        color: string;
        border: string;
        hoverBackground: string;
        activeBackground: string;
        disabledBackground: string;
        disabledColor: string;
        transition: string;
        hoverTransform: string;
        activeTransform: string;
        disabledOpacity: number;
        cursor: string;
        disabledCursor: string;
      };
      card: {
        padding: string;
        borderRadius: string;
        elevation: number;
        boxShadow: string;
        border: string;
        accentBorder: string;
        statsBorder: string;
        statsBackground: string;
      };
      input: {
        padding: string;
        borderRadius: string;
        borderColor: string;
        focusedBorderColor: string;
        errorBorderColor: string;
        background: string;
        color: string;
        fontSize: string;
        boxShadow: string;
        transition: string;
        focusBoxShadow: string;
      };
      table: {
        borderRadius: string;
        background: string;
        headerBackground: string;
        headerColor: string;
        rowHover: string;
        border: string;
        boxShadow: string;
        fontSize: string;
        cellPadding: string;
        stripedRow: string;
      };
      avatar: {
        size: number;
        borderRadius: string;
        border: string;
        boxShadow: string;
      };
      snackbar: {
        backgroundColor: string;
        textColor: string;
        borderRadius: string;
        fontSize: string;
        boxShadow: string;
        duration: number;
      };
      dialog: {
        borderRadius: string;
        backgroundColor: string;
        backdropFilter: string;
        textColor: string;
        boxShadow: string;
        padding: string;
        accentBorder: string;
      };
      tooltip: {
        backgroundColor: string;
        textColor: string;
        fontSize: string;
        borderRadius: string;
        padding: string;
        boxShadow: string;
      };
      appBar: {
        height: number;
        backgroundColor: string;
        textColor: string;
        boxShadow: string;
      };
      divider: {
        height: string;
        background: string;
        opacity: number;
        margin: string;
      };
      iconCircle: {
        background: string;
        border: string;
        boxShadow: string;
        color: string;
        size: number;
        fontSize: number;
      };
    };
    animations: {
      defaultDuration: number;
      transitionCurves: {
        easeIn: string;
        easeOut: string;
        easeInOut: string;
      };
      types: {
        fade: {
          duration: number;
          curve: string;
        };
        slideLeft: {
          duration: number;
          curve: string;
        };
        slideUp: {
          duration: number;
          curve: string;
        };
        scale: {
          duration: number;
          curve: string;
        };
        bounce: {
          duration: number;
          curve: string;
        };
        zoom: {
          duration: number;
          curve: string;
        };
      };
    };
    mode: 'light' | 'dark';
  }
}

import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider, DefaultTheme } from 'styled-components';

// Design tokens from styles_app4kitas_MODERN.json
const colors = {
  light: {
    primary: '#43B97F',
    primaryDark: '#37996B',
    accent: '#FFE066',
    background: '#F4F6F8',
    surface: '#FAFBFC',
    surfaceAlt: '#F0F4F8',
    error: '#FF5A5F',
    textPrimary: '#212121',
    textSecondary: '#757575',
    border: '#E3EAF2',
    disabled: '#BDBDBD',
    tooltipBg: '#333',
    tooltipText: '#FFF',
    snackbarBg: '#323232',
    snackbarText: '#FFF',
    tableRowHover: '#E3FCEC',
    tableStriped: '#F6F8FA',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    secondary: '#9C27B0',
  },
  dark: {
    primary: '#43B97F',
    primaryDark: '#37996B',
    accent: '#FFE066',
    background: '#181C24',
    surface: '#232B36',
    surfaceAlt: '#222B36',
    error: '#FF5A5F',
    textPrimary: '#E0E0E0',
    textSecondary: '#BDBDBD',
    border: '#2C3440',
    disabled: '#BDBDBD',
    tooltipBg: '#23272F',
    tooltipText: '#FFD54F',
    snackbarBg: '#23272F',
    snackbarText: '#FFD54F',
    tableRowHover: '#22332B',
    tableStriped: '#1A202C',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    secondary: '#9C27B0',
  },
};

const typography = {
  fontFamily: 'Montserrat, Poppins, Inter, Arial, sans-serif',
  headline1: {
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontSize: '32px',
    fontWeight: 800,
    letterSpacing: '-0.5px',
  },
  headline2: {
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontSize: '24px',
    fontWeight: 700,
    letterSpacing: '-0.2px',
  },
  headline3: {
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontSize: '20px',
    fontWeight: 600,
    letterSpacing: '-0.1px',
  },
  headline4: {
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontSize: '18px',
    fontWeight: 600,
    letterSpacing: '-0.1px',
  },
  subtitle1: {
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontSize: '18px',
    fontWeight: 600,
  },
  body1: {
    fontFamily: 'Poppins, Inter, Arial, sans-serif',
    fontSize: '16px',
    fontWeight: 400,
  },
  body2: {
    fontFamily: 'Poppins, Inter, Arial, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
  },
  caption: {
    fontFamily: 'Poppins, Inter, Arial, sans-serif',
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
    padding: '14px 32px',
    borderRadius: '18px',
    elevation: 2,
    fontWeight: 700,
    fontSize: '17px',
    boxShadow: '0 4px 18px rgba(67,185,127,0.10), 0 1.5px 6px rgba(255,224,102,0.08)',
    background: 'linear-gradient(90deg, #43B97F 90%, #FFE066 100%)',
    color: '#fff',
    border: 'none',
    hoverBackground: 'linear-gradient(90deg, #388E3C 90%, #FFE066 100%)',
    activeBackground: 'linear-gradient(90deg, #43B97F 90%, #FFE066 100%)',
    disabledBackground: 'linear-gradient(90deg, #BDBDBD 60%, #E0E0E0 100%)',
    disabledColor: '#fff',
    transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
    hoverTransform: 'scale(1.045)',
    activeTransform: 'scale(0.98)',
    disabledOpacity: 0.6,
    cursor: 'pointer',
    disabledCursor: 'not-allowed',
  },
  card: {
    padding: '16px',
    borderRadius: '20px',
    elevation: 1,
    boxShadow: '0 4px 24px rgba(67,185,127,0.07), 0 1.5px 6px rgba(44,62,80,0.04)',
    border: `1.5px solid ${colors.light.border}`,
    accentBorder: `2px solid ${colors.light.accent}55`,
    statsBorder: `1.5px solid ${colors.light.border}`,
    statsBackground: colors.light.surfaceAlt,
  },
  input: {
    padding: '12px',
    borderRadius: '10px',
    borderColor: '#E3EAF2',
    focusedBorderColor: colors.light.accent,
    errorBorderColor: '#FF5A5F',
    background: colors.light.surface,
    color: colors.light.textPrimary,
    fontSize: '16px',
    boxShadow: '0 1.5px 6px rgba(67,185,127,0.06)',
    transition: 'border-color 0.18s, box-shadow 0.18s',
    focusBoxShadow: `0 0 0 2px ${colors.light.accent}33`,
  },
  table: {
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.92)',
    headerBackground: 'linear-gradient(90deg, #43B97F 80%, #FFD600 100%)',
    headerColor: '#fff',
    rowHover: colors.light.tableRowHover,
    border: `1.5px solid ${colors.light.border}`,
    boxShadow: '0 2px 8px rgba(44,62,80,0.06)',
    fontSize: '15px',
    cellPadding: '14px 18px',
    stripedRow: colors.light.tableStriped,
  },
  avatar: {
    size: 48,
    borderRadius: '50%',
    border: `2px solid ${colors.light.primary}`,
    boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
  },
  snackbar: {
    backgroundColor: colors.light.snackbarBg,
    textColor: colors.light.snackbarText,
    borderRadius: '12px',
    fontSize: '15px',
    boxShadow: '0 6px 24px rgba(67,185,127,0.12)',
    duration: 3000,
  },
  dialog: {
    borderRadius: '24px',
    backgroundColor: 'rgba(255,255,255,0.90)',
    backdropFilter: 'blur(10px)',
    textColor: colors.light.textPrimary,
    boxShadow: '0 12px 48px rgba(67,185,127,0.13)',
    padding: '40px',
    accentBorder: `2px solid ${colors.light.accent}55`,
  },
  tooltip: {
    backgroundColor: colors.light.tooltipBg,
    textColor: colors.light.tooltipText,
    fontSize: '12px',
    borderRadius: '8px',
    padding: '8px 14px',
    boxShadow: '0 2px 8px rgba(44,62,80,0.12)',
  },
  appBar: {
    height: 56,
    backgroundColor: 'linear-gradient(90deg, #43B97F 80%, #FFE066 100%)',
    textColor: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(67,185,127,0.08)',
  },
  divider: {
    height: '2px',
    background: 'linear-gradient(90deg, #43B97F 0%, #FFD600 100%)',
    opacity: 0.18,
    margin: '32px 0',
  },
  iconCircle: {
    background: '#F4F6F8',
    border: `2.5px solid ${colors.light.primary}33`,
    boxShadow: '0 2px 12px rgba(67,185,127,0.10)',
    color: colors.light.primary,
    size: 48,
    fontSize: 24,
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
      cardSurface: colors.dark.surfaceAlt,
    },
    typography: {
      ...typography,
      fontFamily: 'Montserrat, Poppins, Inter, Arial, sans-serif',
    },
    components: {
      ...components,
      card: {
        ...components.card,
        boxShadow: '0 4px 24px rgba(67,185,127,0.05), 0 1.5px 6px rgba(44,62,80,0.10)',
        statsBorder: `1.5px solid ${colors.dark.border}`,
        statsBackground: colors.dark.surfaceAlt,
      },
      iconCircle: {
        background: '#232B36',
        border: `2.5px solid ${colors.dark.primary}33`,
        boxShadow: '0 2px 12px rgba(67,185,127,0.13)',
        color: colors.dark.primary,
        size: 48,
        fontSize: 24,
      },
      dialog: {
        ...components.dialog,
        backgroundColor: 'rgba(34,43,54,0.90)',
        backdropFilter: 'blur(12px)',
        textColor: colors.dark.textPrimary,
        accentBorder: `2px solid ${colors.dark.accent}55`,
      },
      table: {
        ...components.table,
        background: 'rgba(35,43,54,0.92)',
        headerBackground: 'linear-gradient(90deg, #43B97F 80%, #FFD600 100%)',
        rowHover: colors.dark.tableRowHover,
        stripedRow: colors.dark.tableStriped,
        border: `1.5px solid ${colors.dark.border}`,
      },
      input: {
        ...components.input,
        background: colors.dark.surface,
        color: colors.dark.textPrimary,
        borderColor: colors.dark.border,
        focusedBorderColor: colors.dark.accent,
        errorBorderColor: '#FF5A5F',
        focusBoxShadow: `0 0 0 2px ${colors.dark.accent}33`,
      },
      snackbar: {
        ...components.snackbar,
        backgroundColor: colors.dark.snackbarBg,
        textColor: colors.dark.snackbarText,
        boxShadow: '0 6px 24px rgba(67,185,127,0.18)',
      },
      tooltip: {
        ...components.tooltip,
        backgroundColor: colors.dark.tooltipBg,
        textColor: colors.dark.tooltipText,
        borderRadius: '8px',
        padding: '8px 14px',
      },
      appBar: {
        ...components.appBar,
        backgroundColor: 'linear-gradient(90deg, #43B97F 80%, #FFE066 100%)',
        textColor: '#FFFFFF',
        boxShadow: '0 2px 8px rgba(67,185,127,0.08)',
      },
      divider: {
        height: '2px',
        background: 'linear-gradient(90deg, #43B97F 0%, #FFD600 100%)',
        opacity: 0.18,
        margin: '32px 0',
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