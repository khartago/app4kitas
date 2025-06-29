import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(44,62,80,0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px 8px;
  animation: fadeIn 0.2s;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @media (max-width: 600px) {
    padding: 12px 2px;
  }
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.components.dialog.backgroundColor};
  color: ${({ theme }) => theme.components.dialog.textColor};
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(44,62,80,0.18), 0 1.5px 8px rgba(44,62,80,0.10);
  padding: 32px 28px 28px 28px;
  width: 100%;
  max-width: 420px;
  min-width: 0;
  margin: 32px auto;
  position: relative;
  box-sizing: border-box;
  animation: popIn 0.22s cubic-bezier(0.4,0,0.2,1);
  @media (max-width: 480px) {
    padding: 16px 4vw;
    max-width: 96vw;
    margin: 8vw auto;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.7em;
  cursor: pointer;
  z-index: 2;
  &:hover {
    color: ${({ theme }) => theme.colors.error};
  }
`;

const Title = styled.h2`
  margin: 0 0 14px 0;
  font-size: ${({ theme }) => theme.typography.headline2.fontSize};
  font-weight: ${({ theme }) => theme.typography.headline2.fontWeight};
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: 0.01em;
`;

export const FormField = styled.div`
  margin-bottom: 14px;
  padding: 0;
`;

export const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 5px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1.5px solid ${({ theme }) => theme.components.input.borderColor};
  font-size: 16px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
  display: block;
  transition: border-color 0.18s, box-shadow 0.18s;
  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent}22;
    outline: none;
  }
`;

export const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 14px;
  margin-bottom: 12px;
  background: #fff6f6;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 500;
`;

export const ModalButton = styled.button`
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 17px;
  font-weight: 600;
  width: 100%;
  margin-top: 18px;
  transition: background 0.18s, box-shadow 0.18s;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

export const Divider = styled.div`
  width: 100%;
  height: 1.5px;
  background: ${({ theme }) => theme.colors.border};
  margin: 12px 0 18px 0;
  border-radius: 2px;
`;

interface ModernModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const ModernModal: React.FC<ModernModalProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Schließen">×</CloseButton>
        {title && <Title>{title}</Title>}
        {children}
      </ModalBox>
    </Overlay>
  );
};

export default ModernModal; 