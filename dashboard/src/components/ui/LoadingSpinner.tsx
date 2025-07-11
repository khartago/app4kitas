import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import MascotBear from './MascotBear';

// Loading animations
const float1 = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  30% { transform: translate(-40px, -20px) scale(1.08); }
  60% { transform: translate(30px, 30px) scale(0.96); }
  100% { transform: translate(0, 0) scale(1); }
`;

const float2 = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.1); }
  55% { transform: translate(-30px, 20px) scale(0.93); }
  100% { transform: translate(0, 0) scale(1); }
`;

const float3 = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  20% { transform: translate(-25px, 25px) scale(1.07); }
  50% { transform: translate(25px, -25px) scale(0.95); }
  100% { transform: translate(0, 0) scale(1); }
`;

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 48px 24px;
  text-align: center;
`;

const MascotsArea = styled.div`
  position: relative;
  width: 100%;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 32px 0 24px 0;
`;

const MascotFloating = styled.div<{ $anim: number }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  ${({ $anim }) => $anim === 1 && css`animation: ${float1} 3.2s ease-in-out infinite;`}
  ${({ $anim }) => $anim === 2 && css`animation: ${float2} 3.7s ease-in-out infinite;`}
  ${({ $anim }) => $anim === 3 && css`animation: ${float3} 4.1s ease-in-out infinite;`}
`;

const LoaderText = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  z-index: 2;
  pointer-events: none;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const SimpleLoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 32px 16px;
  text-align: center;
`;

const SimpleMascot = styled.div`
  margin-bottom: 16px;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const SimpleText = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 16px;
  font-weight: 500;
`;

// Main loading component with multiple mascots
export const AnimatedMascotsLoader: React.FC<{ text?: string }> = ({ text = 'Lädt...' }) => (
  <LoadingContainer>
    <MascotsArea>
      <MascotFloating $anim={1} style={{ zIndex: 1, left: '30%', top: '45%' }}>
        <MascotBear size={70} mood="happy" />
      </MascotFloating>
      <MascotFloating $anim={2} style={{ zIndex: 1, left: '60%', top: '55%' }}>
        <MascotBear size={60} mood="help" />
      </MascotFloating>
      <MascotFloating $anim={3} style={{ zIndex: 1, left: '45%', top: '35%' }}>
        <MascotBear size={80} mood="neutral" />
      </MascotFloating>
      <LoaderText>{text}</LoaderText>
    </MascotsArea>
  </LoadingContainer>
);

// Simple loading component with single mascot
export const SimpleMascotLoader: React.FC<{ text?: string; mood?: 'happy' | 'neutral' | 'help' | 'sad' }> = ({ 
  text = 'Lädt...', 
  mood = 'neutral' 
}) => (
  <SimpleLoadingContainer>
    <SimpleMascot>
      <MascotBear size={80} mood={mood} />
    </SimpleMascot>
    <SimpleText>{text}</SimpleText>
  </SimpleLoadingContainer>
);

// Compact loading component for smaller spaces
export const CompactMascotLoader: React.FC<{ text?: string; mood?: 'happy' | 'neutral' | 'help' | 'sad' }> = ({ 
  text = 'Lädt...', 
  mood = 'neutral' 
}) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: '24px 16px',
    textAlign: 'center'
  }}>
    <div style={{ marginBottom: '12px', animation: `${pulse} 2s ease-in-out infinite` }}>
      <MascotBear size={60} mood={mood} />
    </div>
    <div style={{ 
      color: '#666', 
      fontSize: '14px', 
      fontWeight: 500,
      animation: `${pulse} 2s ease-in-out infinite`
    }}>
      {text}
    </div>
  </div>
);

// Error state with mascot
export const ErrorMascot: React.FC<{ text?: string; mood?: 'sad' | 'help' }> = ({ 
  text = 'Ein Fehler ist aufgetreten', 
  mood = 'sad' 
}) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    minHeight: '300px',
    padding: '32px 16px',
    textAlign: 'center'
  }}>
    <div style={{ marginBottom: '16px' }}>
      <MascotBear size={100} mood={mood} />
    </div>
    <div style={{ 
      color: '#666', 
      fontSize: '18px', 
      fontWeight: 600,
      maxWidth: '400px'
    }}>
      {text}
    </div>
  </div>
);

// Empty state with mascot
export const EmptyMascot: React.FC<{ text?: string; mood?: 'help' | 'neutral' }> = ({ 
  text = 'Keine Daten vorhanden', 
  mood = 'help' 
}) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    minHeight: '300px',
    padding: '32px 16px',
    textAlign: 'center'
  }}>
    <div style={{ marginBottom: '16px' }}>
      <MascotBear size={100} mood={mood} />
    </div>
    <div style={{ 
      color: '#666', 
      fontSize: '18px', 
      fontWeight: 600,
      maxWidth: '400px'
    }}>
      {text}
    </div>
  </div>
);

export default AnimatedMascotsLoader; 