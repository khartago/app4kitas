import React from 'react';
import styled from 'styled-components';

const Fab = styled.button`
  position: fixed;
  right: 32px;
  bottom: 32px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  box-shadow: 0 6px 24px rgba(44,62,80,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  z-index: 1200;
  transition: background 0.18s, box-shadow 0.18s;
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.primaryDark};
    box-shadow: 0 8px 32px rgba(44,62,80,0.22);
    outline: none;
  }
  @media (max-width: 600px) {
    right: 16px;
    bottom: 16px;
    width: 52px;
    height: 52px;
    font-size: 1.6rem;
  }
`;

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  "aria-label": string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, icon, "aria-label": ariaLabel }) => (
  <Fab onClick={onClick} aria-label={ariaLabel} title={ariaLabel}>
    {icon}
  </Fab>
);

export default FloatingActionButton; 