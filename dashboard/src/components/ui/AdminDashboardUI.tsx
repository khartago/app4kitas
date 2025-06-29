import React, { useState, useMemo, useEffect } from 'react';
import styled, { keyframes, css, createGlobalStyle } from 'styled-components';
import MascotBear from './MascotBear';
import Papa from 'papaparse';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaFileCsv, FaFilePdf, FaExclamationTriangle } from 'react-icons/fa';
import SearchIcon from './SearchIcon';
import Header from '../../components/Header';
import { exportEntityPDF, exportEntityCSV } from '../../services/reportApi';
import type { DefaultTheme } from 'styled-components';

// Animated mascots loader

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

const MascotsArea = styled.div`
  position: relative;
  width: 100%;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 48px 0 32px 0;
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
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  z-index: 2;
  pointer-events: none;
`;

export const AnimatedMascotsLoader: React.FC<{ text?: string }> = ({ text = 'Lädt...' }) => (
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
);

export const ErrorMsg = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  background: #fff6f6;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 16px 0;
  svg {
    margin-right: 10px;
    flex-shrink: 0;
  }
`;

export const BrandedErrorMsg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorMsg>
    <div style={{ marginRight: 10 }}>
      <MascotBear size={32} mood="sad" />
    </div>
    {children}
  </ErrorMsg>
);

export const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '32px 0' }}>
    <MascotBear size={48} mood="help" />
    <div style={{ marginTop: 12, color: '#757575', fontFamily: 'Inter, sans-serif', fontSize: 16 }}>{text}</div>
  </div>
);

export const Headline = styled.h2`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.headline2.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.headline2.fontWeight};
  margin-bottom: 16px;
`;

export const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin: 32px 0;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.components.card.background};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  box-shadow: ${({ theme }) => theme.components.card.boxShadow};
  border: ${({ theme }) => theme.components.card.border};
  padding: ${({ theme }) => theme.components.card.padding};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: box-shadow 0.2s, transform 0.2s, background 0.2s;
  &:hover, &:focus {
    box-shadow: 0 8px 24px rgba(76,175,80,0.16), 0 2px 12px rgba(0,0,0,0.18);
    background: ${({ theme }) => theme.mode === 'dark' ? '#23272F' : '#F7FFF7'};
    transform: translateY(-2px) scale(1.01);
    outline: none;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.components.input.padding};
  border-radius: ${({ theme }) => theme.components.input.borderRadius};
  border: 1px solid ${({ theme }) => theme.components.input.borderColor};
  font-size: ${({ theme }) => theme.typography.body1.fontSize}px;
  margin-bottom: 12px;
  &:focus {
    border-color: ${({ theme }) => theme.components.input.focusedBorderColor};
    outline: none;
  }
`;

export const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.components.button.borderRadius};
  padding: ${({ theme }) => theme.components.button.padding};
  font-size: ${({ theme }) => theme.typography.body1.fontSize}px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.components.button.elevation}px 2px 8px rgba(0,0,0,0.04);
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const DashboardContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 32px;
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.headline1.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.headline1.fontWeight};
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

export const Avatar = styled.img`
  width: ${({ theme }) => theme.components.avatar.size}px;
  height: ${({ theme }) => theme.components.avatar.size}px;
  border-radius: ${({ theme }) => theme.components.avatar.borderRadius};
  object-fit: cover;
  background: ${({ theme }) => theme.colors.disabled};
`;

interface AdminDashboardUIProps {
  title: string;
  children: React.ReactNode;
}

const AdminDashboardUI: React.FC<AdminDashboardUIProps> = ({ title, children }) => (
  <DashboardContainer>
    <Title>{title}</Title>
    <CardGrid>{children}</CardGrid>
  </DashboardContainer>
);

export default AdminDashboardUI;

// DataTable types
export interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  editable?: boolean;
  width?: string;
  render?: (value: any, row: T, idx: number) => React.ReactNode;
  filterable?: boolean;
  options?: string[];
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  onAdd?: (row: Partial<T>) => Promise<void>;
  onEdit?: (row: T) => Promise<void>;
  onDelete?: (row: T) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  entityName: string; // e.g. 'Erzieher', 'Kita', 'Eltern'
  search?: string;
  // Pagination
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  totalCount?: number;
}

// --- Modern Card Table Wrapper ---
export const TableCard = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 4px 32px rgba(44,62,80,0.10);
  border-radius: 22px;
  padding: 32px 24px 24px 24px;
  margin-top: 24px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  
  @media (max-width: 700px) {
    padding: 8px;
    border-radius: 8px;
    min-height: unset;
    font-size: 14px;
  }
  
  @media (min-width: 1200px) {
    padding: 32px 32px 24px 32px;
  }
`;

// --- Modern Table Styles ---
export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  background: none;
  border-radius: 16px;
  box-shadow: none;
  margin-bottom: 0;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
  
  @media (max-width: 700px) {
    border-radius: 8px;
    font-size: 13px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  table-layout: auto;
  max-width: 100%;
`;

const Th = styled.th`
  position: sticky;
  top: 0;
  z-index: 2;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 17px;
  font-weight: 800;
  padding: 12px 8px;
  border-bottom: 2.5px solid ${({ theme }) => theme.colors.border};
  text-align: left;
  letter-spacing: 0.5px;
  transition: background 0.18s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
  
  @media (max-width: 700px) {
    padding: 6px 4px;
    font-size: 13px;
  }
`;

const Td = styled.td`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  padding: 10px 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: middle;
  transition: background 0.18s;
  word-wrap: break-word;
  overflow-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
  
  @media (max-width: 700px) {
    padding: 6px 4px;
    font-size: 13px;
  }
`;

const Row = styled.tr`
  transition: background 0.18s;
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const AddRow = styled.tr`
  background: ${({ theme }) => theme.colors.background};
  td {
    background: ${({ theme }) => theme.colors.background};
    border-bottom: none;
  }
`;

// --- Modern Action Buttons ---
const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 2px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(44,62,80,0.04);
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  min-width: 32px;
  min-height: 32px;
  white-space: nowrap;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    color: #fff;
    box-shadow: 0 4px 16px rgba(76,175,80,0.10);
  }
  
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
  }
  
  @media (max-width: 700px) {
    width: 32px;
    height: 32px;
    font-size: 12px;
    margin: 0 1px;
    padding: 0;
    border-radius: 4px;
    min-width: 32px;
    min-height: 32px;
  }
  
  @media (max-width: 500px) {
    width: 36px;
    height: 36px;
    font-size: 14px;
    margin: 0 1px;
  }
`;

const DeleteButton = styled(ActionButton)`
  background: ${({ theme }) => theme.colors.error};
  &:hover {
    background: #b71c1c;
  }
`;

const SaveButton = styled(ActionButton)`
  background: ${({ theme }) => theme.colors.accent};
  color: #212121;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }
`;

const CancelButton = styled(ActionButton)`
  background: ${({ theme }) => theme.colors.disabled};
  color: #212121;
  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: #212121;
  }
`;

const ExportButton = styled(ActionButton)`
  background: ${({ theme }) => theme.colors.accent};
  color: #212121;
  text-align: center;
  justify-content: center;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }
  @media (max-width: 700px) {
    padding: 7px 12px;
    font-size: 14px;
    border-radius: 8px;
    min-width: 0;
    width: 100%;
    text-align: center;
  }
  @media (max-width: 500px) {
    width: 100%;
    margin-bottom: 10px;
    font-size: 13px;
    padding: 10px 0;
    text-align: center;
  }
`;

// Action buttons container for better mobile layout
const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  
  @media (max-width: 700px) {
    gap: 2px;
    justify-content: center;
  }
  
  @media (max-width: 500px) {
    gap: 1px;
  }
`;

// --- Modern Search Bar ---
export const ModernSearchBarWrapper = styled.div`
  position: relative;
  width: 340px;
  max-width: 100%;
  display: flex;
  align-items: center;
  
  @media (max-width: 700px) {
    width: 100%;
    min-width: 200px;
  }
  
  @media (max-width: 500px) {
    width: 100%;
    min-width: 150px;
  }
`;

export const ModernSearchBar = styled.input`
  width: 100%;
  padding: 12px 16px 12px 48px;
  border-radius: ${({ theme }) => theme.components.input.borderRadius};
  border: 1.5px solid ${({ theme }) => theme.components.input.borderColor};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: border-color 0.18s, box-shadow 0.18s;
  outline: none;
  box-shadow: 0 2px 8px rgba(44,62,80,0.04);
  
  &:focus {
    border-color: ${({ theme }) => theme.components.input.focusedBorderColor};
    box-shadow: 0 4px 16px ${({ theme }) => theme.colors.accent}22;
  }
  
  @media (max-width: 700px) {
    padding: 10px 14px 10px 44px;
    font-size: 14px;
  }
  
  @media (max-width: 500px) {
    padding: 8px 12px 8px 40px;
    font-size: 13px;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
  padding: 8px 0;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 8px;
  }
  select {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    border: 1.5px solid ${({ theme }) => theme.colors.border};
    transition: background 0.18s, color 0.18s, border 0.18s;
    &:focus {
      border-color: ${({ theme }) => theme.colors.accent};
      outline: none;
    }
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 28px;
  margin-top: 28px;
  padding-bottom: 12px;
  flex-wrap: wrap;
  animation: fadeIn 0.4s cubic-bezier(0.4,0,0.2,1);
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: none; }
  }
`;

const getInactiveBg = (theme: DefaultTheme) => theme.mode === 'dark' ? theme.colors.surface + 'cc' : theme.colors.surface + 'cc';
const getInactiveColor = (theme: DefaultTheme) => theme.colors.textPrimary;

const PageButton = styled.button`
  background: ${({ theme, className }) =>
    className?.includes('active')
      ? theme.colors.primary
      : getInactiveBg(theme)};
  color: ${({ theme, className }) =>
    className?.includes('active')
      ? '#fff'
      : getInactiveColor(theme)};
  border: ${({ theme, className }) =>
    className?.includes('active')
      ? `2px solid ${theme.colors.primaryDark}`
      : 'none'};
  border-radius: 999px;
  padding: 12px 22px;
  font-size: 18px;
  font-weight: 700;
  margin: 0 3px;
  box-shadow: 0 2px 12px rgba(44,62,80,0.10);
  cursor: pointer;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s, border 0.18s, transform 0.18s;
  outline: none;
  position: relative;
  z-index: 1;
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  &:hover:not([disabled]):not(.active), &:focus:not([disabled]):not(.active) {
    background: ${({ theme }) => theme.colors.primary + '22'};
    color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 16px rgba(76,175,80,0.14);
    transform: translateY(-2px) scale(1.04);
  }
  &.active {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    box-shadow: 0 6px 24px rgba(76,175,80,0.18);
    pointer-events: none;
    filter: drop-shadow(0 0 8px ${({ theme }) => theme.colors.primary + '55'});
  }
  &[disabled] {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const RowsSelectWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const RowsSelect = styled.select`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding: 12px 38px 12px 22px;
  border-radius: 999px;
  border: none;
  font-size: 18px;
  background: ${({ theme }) => theme.mode === 'dark' ? theme.colors.surface + 'ee' : theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: 700;
  outline: none;
  box-shadow: 0 2px 12px rgba(44,62,80,0.10);
  min-width: 80px;
  transition: box-shadow 0.18s, border 0.18s;
  &:focus {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary + '44'};
    border: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;

const ChevronDown = styled.span`
  pointer-events: none;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  svg {
    width: 18px;
    height: 18px;
    fill: ${({ theme }) => theme.colors.textPrimary};
    opacity: 0.85;
  }
`;

// --- Export Buttons Area ---
const ExportButtonsArea = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
  @media (max-width: 500px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }
`;

export function DataTable<T extends { id?: string | number }>(props: DataTableProps<T>) {
  const { data, columns, onAdd, onEdit, onDelete, loading, error, entityName, page, rowsPerPage, onPageChange, onRowsPerPageChange, totalCount } = props;
  const [editRowId, setEditRowId] = useState<string | number | null>(null);
  const [editRow, setEditRow] = useState<Partial<T>>({});
  const [addRow, setAddRow] = useState<Partial<T>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filtering and search
  const filteredData = useMemo(() => {
    let filtered = data;
    // Search (from prop)
    if (props.search) {
      filtered = filtered.filter(row =>
        columns.some(col => {
          const value = row[col.key as keyof T];
          return value && value.toString().toLowerCase().includes(props.search!.toLowerCase());
        })
      );
    }
    // Sorting
    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortKey as keyof T];
        const bVal = b[sortKey as keyof T];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return sortDirection === 'asc'
          ? String(aVal).localeCompare(String(bVal), 'de', { numeric: true })
          : String(bVal).localeCompare(String(aVal), 'de', { numeric: true });
      });
    }
    return filtered;
  }, [data, props.search, columns, sortKey, sortDirection]);

  // Pagination logic
  const currentPage = page ?? 0;
  const perPage = rowsPerPage ?? 10;
  const totalRows = totalCount ?? filteredData.length;
  const pageCount = Math.ceil(totalRows / perPage);
  const paginatedData = filteredData.slice(currentPage * perPage, currentPage * perPage + perPage);

  // Export handlers
  const handleExport = async (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      // Use CSV export from reportApi
      exportEntityCSV(entityName);
    } else if (format === 'pdf') {
      // Use PDF export from reportApi
      try {
        await exportEntityPDF(entityName);
      } catch (error) {
        console.error('PDF Export failed:', error);
      }
    }
  };

  // Inline edit handlers
  const startEdit = (row: T) => {
    setEditRowId(row.id!);
    setEditRow({ ...row });
  };
  const cancelEdit = () => {
    setEditRowId(null);
    setEditRow({});
  };
  const saveEdit = async () => {
    if (onEdit && editRowId != null) {
      await onEdit(editRow as T);
      setEditRowId(null);
      setEditRow({});
    }
  };
  
  // Add validation to prevent duplicates
  const isDuplicate = (newRow: Partial<T>): boolean => {
    // Check for duplicates based on key fields (name, email, etc.)
    const keyFields = ['name', 'email'];
    return data.some(existingRow => {
      return keyFields.some(field => {
        const newValue = newRow[field as keyof T];
        const existingValue = existingRow[field as keyof T];
        return newValue && existingValue && String(newValue).toLowerCase() === String(existingValue).toLowerCase();
      });
    });
  };
  
  const handleAdd = async () => {
    if (onAdd) {
      // Check for duplicates before adding
      if (isDuplicate(addRow)) {
        alert('Ein Eintrag mit diesen Daten existiert bereits.');
        return;
      }
      await onAdd(addRow);
      setAddRow({});
    }
  };
  
  // Delete handlers with confirmation
  const handleDeleteClick = (row: T) => {
    setItemToDelete(row);
    setDeleteModalOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (onDelete && itemToDelete) {
      setDeleteLoading(true);
      try {
        await onDelete(itemToDelete);
        setDeleteModalOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('Delete failed:', error);
      } finally {
        setDeleteLoading(false);
      }
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <>
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              {columns.map(col => (
                <Th
                  key={col.key as string}
                  style={{ cursor: col.sortable ? 'pointer' : undefined }}
                  onClick={col.sortable ? () => {
                    if (sortKey === col.key) {
                      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortKey(col.key as string);
                      setSortDirection('asc');
                    }
                  } : undefined}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span style={{ marginLeft: 4 }}>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  )}
                </Th>
              ))}
              <Th>Aktionen</Th>
            </tr>
          </thead>
          <tbody>
            {/* Add row */}
            {onAdd && (
              <AddRow>
                {columns.map(col => (
                  <Td key={col.key as string}>
                    {col.editable ? (
                      <input
                        value={String(addRow[col.key as keyof T] ?? '')}
                        onChange={e => setAddRow(r => ({ ...r, [col.key as keyof T]: e.target.value }))}
                        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #E0E0E0', width: '100%' }}
                        aria-label={`Neues ${col.label}`}
                      />
                    ) : null}
                  </Td>
                ))}
                <Td>
                  <ActionButton onClick={handleAdd} title="Hinzufügen">
                    <FaPlus />
                  </ActionButton>
                </Td>
              </AddRow>
            )}
            {/* Data rows */}
            {paginatedData.map((row, idx) => (
              <Row key={row.id ?? idx}>
                {columns.map(col => (
                  <Td key={col.key as string}>
                    {editRowId === row.id && col.editable ? (
                      <input
                        value={String(editRow[col.key as keyof T] ?? '')}
                        onChange={e => setEditRow(r => ({ ...r, [col.key as keyof T]: e.target.value }))}
                        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #E0E0E0', width: '100%' }}
                        aria-label={`${col.label} bearbeiten`}
                      />
                    ) : col.render ? (
                      col.render(row[col.key as keyof T], row, idx)
                    ) : (
                      String(row[col.key as keyof T] ?? '')
                    )}
                  </Td>
                ))}
                <Td>
                  {editRowId === row.id ? (
                    <ActionButtonsContainer>
                      <ActionButton onClick={saveEdit} title="Speichern">
                        <FaSave />
                      </ActionButton>
                      <ActionButton onClick={cancelEdit} title="Abbrechen">
                        <FaTimes />
                      </ActionButton>
                    </ActionButtonsContainer>
                  ) : (
                    <ActionButtonsContainer>
                      {onEdit && <ActionButton onClick={() => startEdit(row)} title="Bearbeiten">
                        <FaEdit />
                      </ActionButton>}
                      {onDelete && <DeleteButton onClick={() => handleDeleteClick(row)} title="Löschen">
                        <FaTrash />
                      </DeleteButton>}
                    </ActionButtonsContainer>
                  )}
                </Td>
              </Row>
            ))}
          </tbody>
        </Table>
        {loading && <div style={{ padding: 18, textAlign: 'center' }}>Lädt...</div>}
        {error && <div style={{ color: 'red', padding: 18 }}>{error}</div>}
        {/* Pagination Controls */}
        {pageCount > 1 && (
          <PaginationWrapper>
            <PaginationSummary>Zeilen pro Seite:</PaginationSummary>
            <RowsSelectWrapper>
              <RowsSelect value={perPage} onChange={e => onRowsPerPageChange?.(parseInt(e.target.value))}>
                {[5, 10, 20, 50].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </RowsSelect>
              <ChevronDown>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                </svg>
              </ChevronDown>
            </RowsSelectWrapper>
            <PageButton onClick={() => onPageChange?.(currentPage - 1)} disabled={currentPage === 0} aria-label="Vorherige Seite">&lt;</PageButton>
            {Array.from({ length: pageCount }, (_, i) => (
              <PageButton key={i} onClick={() => onPageChange?.(i)} disabled={i === currentPage} className={i === currentPage ? 'active' : ''} aria-label={`Seite ${i+1}${i===currentPage?' (aktuell)':''}`}>
                {i + 1}
              </PageButton>
            ))}
            <PageButton onClick={() => onPageChange?.(currentPage + 1)} disabled={currentPage >= pageCount - 1} aria-label="Nächste Seite">&gt;</PageButton>
            <PaginationSummary>
              {currentPage * perPage + 1}-{Math.min((currentPage + 1) * perPage, totalRows)} von {totalRows}
            </PaginationSummary>
          </PaginationWrapper>
        )}
        {/* Export Buttons at the bottom */}
        <ExportButtonsArea>
          <ExportButton onClick={() => handleExport('csv')}>CSV Export</ExportButton>
          <ExportButton onClick={() => handleExport('pdf')}>PDF Export</ExportButton>
        </ExportButtonsArea>
      </TableWrapper>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        entityName={entityName}
        itemName={itemToDelete ? String((itemToDelete as any).name || (itemToDelete as any).email || itemToDelete.id || 'dieses Element') : ''}
        loading={deleteLoading}
      />
    </>
  );
}

// Add a new export for mobile search/button stack
export const MobileSearchStack = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  width: 100%;
  @media (max-width: 500px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    & > button {
      width: 100%;
      margin-left: 0 !important;
      margin-top: 10px;
    }
  }
`;

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
  html, body {
    font-family: 'Plus Jakarta Sans', 'Inter', 'Segoe UI', Arial, sans-serif;
    font-size: 16px;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  *, *::before, *::after {
    font-family: inherit;
    box-sizing: inherit;
  }
`;

// Styled SearchIcon for CRUD pages
const SearchIconStyled = styled(SearchIcon)`
  margin-right: 10px;
`;

// Styled AddButton for CRUD pages
const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.accent};
  color: #212121;
  font-size: 17px;
  font-weight: 700;
  padding: 12px 28px;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(255,193,7,0.10);
  border: none;
  margin-left: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s, transform 0.18s, opacity 0.18s;
  opacity: 0.97;
  will-change: transform, opacity;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    transform: scale(1.045);
    opacity: 1;
    box-shadow: 0 8px 32px rgba(76,175,80,0.16);
  }
  @media (max-width: 700px) {
    width: 100%;
    margin-top: 10px;
    justify-content: center;
    font-size: 16px;
    padding: 12px 0;
  }
`;

// Centralized CRUD Page Component
// Usage Example:
// <CrudPage
//   title="Page Title"
//   entityName="Entity Name"
//   data={data}
//   columns={columns}
//   loading={loading}
//   error={error}
//   search={search}
//   onSearchChange={setSearch}
//   onAdd={() => setModalOpen(true)}
//   onEdit={handleEdit}
//   onDelete={handleDelete}
//   page={page}
//   rowsPerPage={rowsPerPage}
//   onPageChange={setPage}
//   onRowsPerPageChange={setRowsPerPage}
//   totalCount={data.length}
// >
//   {/* Modals and additional content go here */}
// </CrudPage>

export interface CrudPageProps<T> {
  title: string;
  entityName: string;
  data: T[];
  columns: DataTableColumn<T>[];
  loading: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onAdd?: () => void;
  onEdit?: (row: T) => Promise<void>;
  onDelete?: (row: T) => Promise<void>;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  totalCount: number;
  addButtonText?: string;
  searchPlaceholder?: string;
  children?: React.ReactNode; // For additional content like modals
}

export const CrudPage: React.FC<CrudPageProps<any>> = ({
  title,
  entityName,
  data,
  columns,
  loading,
  error,
  search,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  totalCount,
  addButtonText = "+ Hinzufügen",
  searchPlaceholder = "Suchen...",
  children
}) => {
  return (
    <main style={{ 
      maxWidth: '100%', 
      width: '100%',
      padding: '0', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'stretch'
    }}>
      <Header title={title} />
      <TableCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 18 }}>
          <span style={{ fontSize: '1.25em', fontWeight: 700, color: '#4CAF50', marginBottom: 8 }}>{entityName}</span>
          <MobileSearchStack>
            <ModernSearchBarWrapper style={{ flex: 1, width: '100%' }}>
              <ModernSearchBar
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                aria-label="Suchen"
              />
              <SearchIconStyled />
            </ModernSearchBarWrapper>
            {onAdd && (
              <AddButton onClick={onAdd}>
                {addButtonText}
              </AddButton>
            )}
          </MobileSearchStack>
        </div>
        <DataTable
          data={data}
          columns={columns}
          onEdit={onEdit}
          onDelete={onDelete}
          entityName={entityName}
          search={search}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          totalCount={totalCount}
          loading={loading}
          error={error}
        />
      </TableCard>
      {children}
    </main>
  );
};

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  itemName: string;
  loading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  entityName,
  itemName,
  loading = false
}) => {
  if (!open) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <WarningIcon>
            <FaExclamationTriangle />
          </WarningIcon>
          <ModalTitle>Löschen bestätigen</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>
            Sind Sie sicher, dass Sie <strong>{itemName}</strong> löschen möchten?
          </p>
          <p>
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </ModalBody>
        <ModalFooter>
          <ModalCancelButton onClick={onClose} disabled={loading}>
            Abbrechen
          </ModalCancelButton>
          <ModalDeleteConfirmButton onClick={onConfirm} disabled={loading}>
            {loading ? 'Löschen...' : 'Löschen bestätigen'}
          </ModalDeleteConfirmButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
`;

const PaginationSummary = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: 500;
`;

const WarningIcon = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin-right: 10px;
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 18px;
  font-weight: 700;
`;

const ModalBody = styled.div`
  margin-bottom: 24px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const ModalCancelButton = styled.button`
  background: ${({ theme }) => theme.colors.disabled};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const ModalDeleteConfirmButton = styled.button`
  background: ${({ theme }) => theme.colors.error};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #b71c1c;
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

// Utility function for duplicate checking across all CRUD pages
const checkForDuplicates = <T extends Record<string, any>>(
  newItem: Partial<T>,
  existingItems: T[],
  keyFields: (keyof T)[] = ['name', 'email']
): { isDuplicate: boolean; duplicateField?: string; duplicateValue?: string } => {
  for (const field of keyFields) {
    const newValue = newItem[field];
    if (!newValue) continue;
    const duplicate = existingItems.find(item => {
      const existingValue = item[field];
      return existingValue && String(newValue).toLowerCase() === String(existingValue).toLowerCase();
    });
    if (duplicate) {
      return {
        isDuplicate: true,
        duplicateField: String(field),
        duplicateValue: String(newValue)
      };
    }
  }
  return { isDuplicate: false };
};

export { checkForDuplicates };