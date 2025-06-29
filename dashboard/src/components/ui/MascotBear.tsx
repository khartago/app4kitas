import React, { useEffect, useRef, useState } from 'react';
import styled, { useTheme, keyframes, css } from 'styled-components';

// Animations
const blink = keyframes`
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
`;
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-18px); }
`;
const tilt = keyframes`
  0%, 100% { transform: rotate(0deg); }
  40% { transform: rotate(-8deg); }
  60% { transform: rotate(8deg); }
`;
const confettiPop = keyframes`
  0% { opacity: 0; transform: scale(0.5); }
  40% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
`;

const waveArm = keyframes`
  0%, 100% { transform: rotate(-18deg); }
  10% { transform: rotate(-5deg) skewY(-6deg); }
  20% { transform: rotate(-30deg) skewY(8deg); }
  30% { transform: rotate(-5deg) skewY(-6deg); }
  40% { transform: rotate(-18deg); }
`;

const waveHead = keyframes`
  0%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(-4deg); }
  20% { transform: rotate(7deg); }
  30% { transform: rotate(-4deg); }
  40% { transform: rotate(0deg); }
`;

interface SvgProps {
  size: number;
  $mood: string;
  $noWaving?: boolean;
}
const Svg = styled.svg<SvgProps>`
  display: block;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  ${({ $mood, $noWaving }) =>
    $mood === 'help' && !$noWaving &&
    css`
      animation: ${tilt} 2.2s infinite cubic-bezier(0.4,0,0.2,1);
    `}
`;
const Eye = styled.ellipse<{ $blinkable?: boolean }>`
  ${({ $blinkable }) =>
    $blinkable &&
    css`
      animation: ${blink} 3.5s infinite;
      transform-origin: center;
    `}
`;
const Cheek = styled.ellipse`
  opacity: 0.18;
`;
const Confetti = styled.circle<{ delay: number }>`
  animation: ${confettiPop} 0.7s cubic-bezier(0.4,0,0.2,1) both;
  animation-delay: ${({ delay }) => delay}s;
`;

const SpeechBubble = styled.div<{ size: number }>`
  position: absolute;
  left: ${({ size }) => size * 0.18}px;
  top: ${({ size }) => size * 0.01}px;
  min-width: ${({ size }) => size * 0.45}px;
  max-width: ${({ size }) => size * 1.1}px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 22px;
  box-shadow: 0 4px 18px rgba(44,62,80,0.15);
  padding: ${({ size }) => size * 0.13}px ${({ size }) => size * 0.22}px;
  font-size: ${({ size }) => Math.max(15, size * 0.13)}px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: 700;
  z-index: 2;
  display: flex;
  align-items: center;
  &:after {
    content: '';
    position: absolute;
    left: -18px;
    top: 38px;
    width: 0;
    height: 0;
    border-top: 16px solid transparent;
    border-bottom: 16px solid transparent;
    border-right: 18px solid ${({ theme }) => theme.colors.surface};
    filter: drop-shadow(0 2px 2px rgba(44,62,80,0.10));
  }
`;

const WAVE_DURATION = 1.5; // seconds per wave

const WavingArm = styled.g<{ origin: string; $waving: boolean }>`
  ${({ origin }) => `transform-origin: ${origin};`}
  ${({ $waving }) =>
    $waving &&
    css`
      animation: ${waveArm} ${WAVE_DURATION}s cubic-bezier(0.42,0,0.58,1) 0s 5;
      animation-fill-mode: forwards;
    `}
`;

const WavingHead = styled.g<{ $waving: boolean }>`
  ${({ $waving }) =>
    $waving &&
    css`
      animation: ${waveHead} ${WAVE_DURATION}s cubic-bezier(0.42,0,0.58,1) 0s 5;
      animation-fill-mode: forwards;
    `}
`;

interface MascotBearProps {
  size?: number;
  height?: number; // Only for vertical variant
  mood?: 'neutral' | 'happy' | 'sad' | 'celebrate' | 'help';
  className?: string;
  speechBubble?: string;
  waving?: boolean;
  variant?: 'vertical' | 'horizontal';
  noWaving?: boolean; // disables all animation except eyes
}

const MascotBear: React.FC<MascotBearProps> = ({ size = 160, height, mood = 'happy', className, speechBubble, waving, variant = 'vertical', noWaving }) => {
  const theme = useTheme();
  // More realistic, plush bear colors
  const brown = '#A67C52'; // warm, natural brown
  const outline = '#6B4F2A'; // darker outline
  const furLight = '#E9D3B0'; // light fur
  const furShadow = '#C2A178'; // shadow fur
  const white = theme.colors.surface;
  const green = theme.colors.primary;
  const red = theme.colors.error;
  const shadow = 'rgba(0,0,0,0.10)';

  // Waving state: wave 5 times on mount, then stop
  const [isWaving, setIsWaving] = useState(false);
  useEffect(() => {
    if (noWaving) {
      setIsWaving(false);
      return;
    }
    if (waving) {
      setIsWaving(true);
      const timeout = setTimeout(() => setIsWaving(false), 5 * WAVE_DURATION * 1000); // 5 waves, 1.5s each
      return () => clearTimeout(timeout);
    }
  }, [waving, noWaving]);

  // Proportional helpers
  const sx = (n: number) => (n / 88) * size;
  const sy = (n: number) => (n / 140) * size;

  // Mouths by mood (friendlier, more visible)
  const mouth = {
    neutral: <path d={`M${sx(40)} ${sy(124)}c-2 1-8 1-10 0`} stroke={outline} strokeWidth={sx(2.2)} strokeLinecap="round"/>,
    happy: <path d={`M${sx(36)} ${sy(124)}q8 10 16 0`} stroke={outline} strokeWidth={sx(2.2)} strokeLinecap="round" fill="none"/>,
    sad: <path d={`M${sx(36)} ${sy(128)}q8 -8 16 0`} stroke={outline} strokeWidth={sx(2.2)} strokeLinecap="round" fill="none"/>,
    celebrate: <path d={`M${sx(36)} ${sy(124)}q8 10 16 0`} stroke={green} strokeWidth={sx(2.5)} strokeLinecap="round" fill="none"/>,
    help: <path d={`M${sx(40)} ${sy(124)}c4 1 8-1 8-4`} stroke={outline} strokeWidth={sx(2.2)} strokeLinecap="round"/>,
  };

  // Eyes (bigger, rounder, more plush)
  const blinkable = true;

  // Confetti for celebrate (proportional)
  const confetti = mood === 'celebrate' && (
    <g>
      <Confetti cx={sx(20)} cy={sy(20)} r={sx(2)} fill={green} delay={0.1} />
      <Confetti cx={sx(68)} cy={sy(18)} r={sx(2)} fill={green} delay={0.2} />
      <Confetti cx={sx(44)} cy={sy(12)} r={sx(2)} fill={furLight} delay={0.3} />
      <Confetti cx={sx(30)} cy={sy(16)} r={sx(1.5)} fill={red} delay={0.4} />
      <Confetti cx={sx(58)} cy={sy(16)} r={sx(1.5)} fill={red} delay={0.5} />
    </g>
  );

  // Accessible title
  const title = {
    neutral: 'App4KITAs Bären-Maskottchen (neutral)',
    happy: 'App4KITAs Bären-Maskottchen (fröhlich)',
    sad: 'App4KITAs Bären-Maskottchen (traurig)',
    celebrate: 'App4KITAs Bären-Maskottchen (feiert)',
    help: 'App4KITAs Bären-Maskottchen (hilft)',
  }[mood];

  // Paw pad helper
  const pawPads = (cx: number, cy: number, scale = 1) => (
    <g>
      <ellipse cx={sx(cx)} cy={sy(cy)} rx={sx(1.5*scale)} ry={sy(1*scale)} fill="#fff" opacity="0.7" />
      <ellipse cx={sx(cx-2.5*scale)} cy={sy(cy+2*scale)} rx={sx(0.7*scale)} ry={sy(0.5*scale)} fill="#fff" opacity="0.7" />
      <ellipse cx={sx(cx+2.5*scale)} cy={sy(cy+2*scale)} rx={sx(0.7*scale)} ry={sy(0.5*scale)} fill="#fff" opacity="0.7" />
    </g>
  );

  if (variant === 'horizontal') {
    // Render a wide, short bear (e.g., width = size, height = size * 0.55)
    const width = size;
    const height = size * 0.55;
    // Proportional helpers for horizontal
    const sx = (n: number) => (n / 140) * width;
    const sy = (n: number) => (n / 70) * height;
    return (
      <div style={{ position: 'relative', width, height, overflow: 'visible' }}>
        {speechBubble && (
          <SpeechBubble size={size}>{speechBubble}</SpeechBubble>
        )}
        <svg
          width={width}
          height={height}
          viewBox={`0 0 140 70`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={title}
          role="img"
          tabIndex={0}
          className={className}
        >
          <title>{title}</title>
          {/* Head */}
          <ellipse cx={sx(70)} cy={sy(32)} rx={sx(28)} ry={sy(28)} fill="#E9D3B0" stroke="#A67C52" strokeWidth={sx(3)} />
          {/* Ears */}
          <ellipse cx={sx(28)} cy={sy(20)} rx={sx(14)} ry={sy(14)} fill="#E9D3B0" stroke="#A67C52" strokeWidth={sx(3)} />
          <ellipse cx={sx(112)} cy={sy(20)} rx={sx(14)} ry={sy(14)} fill="#E9D3B0" stroke="#A67C52" strokeWidth={sx(3)} />
          {/* Eyes */}
          <ellipse cx={sx(60)} cy={sy(38)} rx={sx(5)} ry={sy(7)} fill="#6B4F2A" />
          <ellipse cx={sx(80)} cy={sy(38)} rx={sx(5)} ry={sy(7)} fill="#6B4F2A" />
          {/* Nose */}
          <ellipse cx={sx(70)} cy={sy(48)} rx={sx(4)} ry={sy(3)} fill="#6B4F2A" />
          {/* Smile */}
          <path d={`M${sx(65)} ${sy(54)}q5 8 10 0`} stroke="#6B4F2A" strokeWidth={sx(2)} strokeLinecap="round" fill="none" />
          {/* Cheeks */}
          <ellipse cx={sx(56)} cy={sy(50)} rx={sx(4)} ry={sy(2)} fill="#F44336" opacity="0.18" />
          <ellipse cx={sx(84)} cy={sy(50)} rx={sx(4)} ry={sy(2)} fill="#F44336" opacity="0.18" />
        </svg>
      </div>
    );
  }
  // Default: vertical bear
  const bearHeight = height || size * 1.7;
  return (
    <div style={{ position: 'relative', width: size, height: bearHeight, overflow: 'visible' }}>
      {speechBubble && (
        <SpeechBubble size={size}>{speechBubble}</SpeechBubble>
      )}
      <Svg
        size={size}
        $mood={mood}
        $noWaving={noWaving}
        viewBox="0 0 88 140"
        width={size}
        height={bearHeight}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={title}
        role="img"
        tabIndex={0}
        className={className}
      >
        <title>{title}</title>
        <defs>
          {/* Head gradient (realistic fur) */}
          <radialGradient id="bearHeadGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={furLight} stopOpacity="0.9" />
            <stop offset="60%" stopColor={brown} stopOpacity="1" />
            <stop offset="100%" stopColor={furShadow} stopOpacity="0.7" />
          </radialGradient>
          {/* Ear gradient */}
          <radialGradient id="bearEarGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={furLight} stopOpacity="0.8" />
            <stop offset="80%" stopColor={brown} stopOpacity="1" />
          </radialGradient>
          {/* Shadow */}
          <radialGradient id="bearShadow" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor={shadow} stopOpacity="0.18" />
            <stop offset="100%" stopColor={shadow} stopOpacity="0" />
          </radialGradient>
          {/* Face highlight */}
          <radialGradient id="bearFaceHighlight" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.18" />
            <stop offset="100%" stopColor={furLight} stopOpacity="0.08" />
          </radialGradient>
          {/* Muzzle gradient */}
          <radialGradient id="bearMuzzleGrad" cx="50%" cy="60%" r="60%">
            <stop offset="0%" stopColor={white} stopOpacity="0.95" />
            <stop offset="100%" stopColor={furLight} stopOpacity="0.7" />
          </radialGradient>
          {/* Belly highlight */}
          <radialGradient id="bearBellyHighlight" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.18" />
            <stop offset="100%" stopColor={furLight} stopOpacity="0" />
          </radialGradient>
          {/* Paw gradient */}
          <radialGradient id="bearPawGrad" cx="50%" cy="60%" r="60%">
            <stop offset="0%" stopColor={furLight} stopOpacity="0.7" />
            <stop offset="100%" stopColor={brown} stopOpacity="1" />
          </radialGradient>
        </defs>
        {/* Shadow under body */}
        <ellipse cx={sx(44)} cy={sy(134)} rx={sx(24)} ry={sy(7)} fill="url(#bearShadow)" />
        {/* Body (realistic, plush, outline) */}
        <ellipse cx={sx(44)} cy={sy(104)} rx={sx(22)} ry={sy(28)} fill="url(#bearHeadGrad)" stroke={outline} strokeWidth={sx(2.2)} />
        {/* Belly highlight */}
        <ellipse cx={sx(44)} cy={sy(116)} rx={sx(10)} ry={sy(6)} fill="url(#bearBellyHighlight)" />
        {/* Left leg/paw (bear's left, viewer's right) */}
        <g>
          <ellipse cx={sx(28)} cy={sy(128)} rx={sx(8)} ry={sy(7)} fill="url(#bearPawGrad)" stroke={outline} strokeWidth={sx(1.2)} />
          {pawPads(28, 130, 1)}
        </g>
        {/* Right leg/paw */}
        <g>
          <ellipse cx={sx(60)} cy={sy(128)} rx={sx(8)} ry={sy(7)} fill="url(#bearPawGrad)" stroke={outline} strokeWidth={sx(1.2)} />
          {pawPads(60, 130, 1)}
        </g>
        {/* Left arm (waving if waving=true) */}
        <WavingArm origin={`${sx(16)}px ${sy(98)}px`} $waving={isWaving}>
          <g>
            <ellipse cx={sx(16)} cy={sy(98)} rx={sx(7)} ry={sy(13)} fill="url(#bearPawGrad)" stroke={outline} strokeWidth={sx(1.2)} transform={`rotate(-18 ${sx(16)} ${sy(98)})`} />
            {pawPads(16, 110, 0.8)}
          </g>
        </WavingArm>
        {/* Right arm (static) */}
        <g>
          <ellipse cx={sx(72)} cy={sy(98)} rx={sx(7)} ry={sy(13)} fill="url(#bearPawGrad)" stroke={outline} strokeWidth={sx(1.2)} transform={`rotate(18 ${sx(72)} ${sy(98)})`} />
          {pawPads(72, 110, 0.8)}
        </g>
        {/* Head (realistic, outline, with tilt if waving) */}
        <WavingHead $waving={isWaving}>
          <ellipse cx={sx(44)} cy={sy(48)} rx={sx(32)} ry={sy(32)} fill="url(#bearHeadGrad)" stroke={outline} strokeWidth={sx(3)} />
          {/* Ears (realistic, outline) */}
          <ellipse cx={sx(16)} cy={sy(28)} rx={sx(12)} ry={sy(12)} fill="url(#bearEarGrad)" stroke={outline} strokeWidth={sx(3)} />
          <ellipse cx={sx(72)} cy={sy(28)} rx={sx(12)} ry={sy(12)} fill="url(#bearEarGrad)" stroke={outline} strokeWidth={sx(3)} />
          {/* Muzzle (realistic, outline) */}
          <ellipse cx={sx(44)} cy={sy(60)} rx={sx(12)} ry={sy(8)} fill="url(#bearMuzzleGrad)" stroke={outline} strokeWidth={sx(1.2)} />
          {/* Nose (realistic, outline) */}
          <ellipse cx={sx(44)} cy={sy(60)} rx={sx(3.5)} ry={sy(2.5)} fill={outline} stroke={white} strokeWidth={sx(0.7)} />
          {/* Nose shine */}
          <ellipse cx={sx(45.2)} cy={sy(59.2)} rx={sx(0.7)} ry={sy(0.4)} fill={white} fillOpacity="0.7" />
          {/* Mouth (expression, moved down) */}
          <g>{mouth[mood]}</g>
          {/* Face highlight */}
          <ellipse cx={sx(44)} cy={sy(48)} rx={sx(18)} ry={sy(10)} fill="url(#bearFaceHighlight)" />
          {/* Eyes (more realistic, plush, dark outline) */}
          <Eye cx={sx(38)} cy={sy(54)} rx={sx(4)} ry={sy(5)} fill={outline} $blinkable={blinkable} />
          <Eye cx={sx(50)} cy={sy(54)} rx={sx(4)} ry={sy(5)} fill={outline} $blinkable={blinkable} />
          {/* Cheeks (lower, rounder, plush) */}
          <Cheek cx={sx(34)} cy={sy(62)} rx={sx(3.5)} ry={sy(1.7)} fill={red} />
          <Cheek cx={sx(54)} cy={sy(62)} rx={sx(3.5)} ry={sy(1.7)} fill={red} />
        </WavingHead>
        {/* Confetti for celebrate */}
        {confetti}
      </Svg>
    </div>
  );
};

export default MascotBear; 