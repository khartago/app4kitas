import React from 'react';
import styled, { useTheme } from 'styled-components';

const Svg = styled.svg<{ size: number }>`
  display: block;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
`;
const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
const Wordmark = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 1.7em;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  user-select: none;
`;

interface AppLogoProps {
  size?: number;
  variant?: 'icon' | 'vertical' | 'horizontal';
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ size = 48, variant = 'icon', className }) => {
  const theme = useTheme();
  const green = theme.colors.primary;
  const yellow = theme.colors.accent;
  const white = theme.colors.surface;

  // SVG: House with perfectly centered heart
  const icon = (
    <Svg
      size={size}
      viewBox="0 0 48 48"
      aria-label="App4KITAs Logo: Haus mit Herz"
      role="img"
      tabIndex={-1}
      className={className}
    >
      <title>App4KITAs Logo: Haus mit Herz</title>
      {/* House base */}
      <rect x="8" y="20" width="32" height="20" rx="4" fill={white} stroke={green} strokeWidth="2.5" />
      {/* Roof */}
      <polygon points="24,8 6,22 10,22 24,12 38,22 42,22" fill={green} />
      {/* Heart (centered and bigger, moved down and right) */}
      <path d="M25 36c-2.7-2.3-6.2-3.7-6.2-7 0-1.9 1.3-3.1 2.9-3.1 1 0 2 .7 2.5 1.7 0.5-1 1.5-1.7 2.5-1.7 1.6 0 2.9 1.2 2.9 3.1 0 3.3-3.5 4.7-6.2 7z" fill={yellow} />
    </Svg>
  );

  const wordmark = <Wordmark>App4KITAs</Wordmark>;

  if (variant === 'icon') return icon;
  if (variant === 'horizontal') {
    return (
      <LogoRow className={className}>
        {icon}
        {wordmark}
      </LogoRow>
    );
  }
  // Default: vertical
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {icon}
      <div style={{ height: 8 }} />
      {wordmark}
    </div>
  );
};

export default AppLogo;
