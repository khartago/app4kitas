import React from 'react';
import styled from 'styled-components';
import { useTheme } from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @media (max-width: 768px) {
    padding: 16px;
    align-items: flex-start;
  }
  @media (max-width: 480px) {
    padding: 12px;
    align-items: flex-start;
  }
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.components.dialog.backgroundColor};
  color: ${({ theme }) => theme.components.dialog.textColor};
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 24px 20px 20px 20px;
  width: 100%;
  max-width: min(480px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  position: relative;
  box-sizing: border-box;
  animation: popIn 0.22s cubic-bezier(0.4,0,0.2,1);
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    &:hover {
      background: ${({ theme }) => theme.colors.textSecondary};
    }
  }
  
  @keyframes popIn {
    from { 
      opacity: 0; 
      transform: scale(0.9) translateY(-20px); 
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }
  
  @media (max-width: 768px) {
    max-width: calc(100vw - 24px);
    max-height: calc(100vh - 24px);
    padding: 20px 16px 16px 16px;
  }
  
  @media (max-width: 480px) {
    max-width: calc(100vw - 16px);
    max-height: calc(100vh - 16px);
    padding: 16px 12px 12px 12px;
    border-radius: 16px;
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
  margin-bottom: 12px;
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
  padding: 10px 12px;
  border-radius: 8px;
  border: 1.5px solid ${({ theme }) => theme.components.input.borderColor};
  font-size: 15px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 6px;
  display: block;
  transition: border-color 0.18s, box-shadow 0.18s;
  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent}22;
    outline: none;
  }
  
  &[type="file"] {
    padding: 8px 10px;
    font-size: 14px;
    cursor: pointer;
    &::-webkit-file-upload-button {
      background: ${({ theme }) => theme.colors.primary};
      color: white;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      margin-right: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.18s;
      &:hover {
        background: ${({ theme }) => theme.colors.primaryDark};
      }
    }
  }
`;

export const Select = styled.select`
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1.5px solid ${({ theme }) => theme.components.input.borderColor};
  font-size: 15px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 6px;
  display: block;
  transition: border-color 0.18s, box-shadow 0.18s;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent}22;
    outline: none;
  }
  
  option {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};
    padding: 8px;
  }
`;

export const MultiSelect = styled.select`
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1.5px solid ${({ theme }) => theme.components.input.borderColor};
  font-size: 15px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 6px;
  display: block;
  transition: border-color 0.18s, box-shadow 0.18s;
  cursor: pointer;
  min-height: 120px;
  
  /* Custom scrollbar for multi-select */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    &:hover {
      background: ${({ theme }) => theme.colors.textSecondary};
    }
  }
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent}22;
    outline: none;
  }
  
  option {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};
    padding: 8px 12px;
    margin: 2px 0;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.18s;
    
    &:hover {
      background: ${({ theme }) => theme.colors.primary}22;
    }
    
    &:checked {
      background: ${({ theme }) => theme.colors.primary};
      color: white;
    }
  }
`;

// Searchable Dropdown Container
export const SearchableDropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

// Searchable Dropdown Button
export const SearchableDropdownButton = styled.button`
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1.5px solid ${({ theme }) => theme.components.input.borderColor};
  font-size: 15px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: border-color 0.18s, box-shadow 0.18s;
  text-align: left;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent}22;
    outline: none;
  }
  
  &::after {
    content: '';
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid ${({ theme }) => theme.colors.textSecondary};
    transition: transform 0.18s;
  }
  
  &.open::after {
    transform: rotate(180deg);
  }
`;

// Searchable Dropdown Options Container
export const SearchableDropdownOptions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    &:hover {
      background: ${({ theme }) => theme.colors.textSecondary};
    }
  }
`;

// Search Input for Dropdown
export const SearchableDropdownSearch = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 14px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  
  &:focus {
    outline: none;
    border-bottom-color: ${({ theme }) => theme.colors.accent};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

// Searchable Dropdown Option
export const SearchableDropdownOption = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.18s;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}22;
  }
  
  &.selected {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
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
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.tableRowHover + '08'};
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