import React, { useEffect, useState } from 'react';
import { useUser } from '../../components/UserContext';
import {
  fetchInstitutionenAdmins,
  addKita,
  editKita,
  deleteKita,
  fetchInstitutionen,
  registerAdmin,
  editAdmin,
  deleteAdmin,
  assignAdmin,
  fetchAllUsers,
} from '../../services/superAdminApi';
import { ErrorMsg, DataTable, DataTableColumn, TableCard, ModernSearchBar, ModernSearchBarWrapper, MobileSearchStack, checkForDuplicates, CrudPage } from '../../components/ui/AdminDashboardUI';
import { AnimatedMascotsLoader } from '../../components/ui/LoadingSpinner';
import Header from '../../components/Header';
import SearchIcon from '../../components/ui/SearchIcon';
import ModernModal from '../../components/ui/ModernModal';
import { FormField, Label, Input, ErrorText, ModalButton } from '../../components/ui/ModernModal';
import styled from 'styled-components';
import { FaUserShield, FaBuilding } from 'react-icons/fa';
import { useTheme } from 'styled-components';

const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 17px;
  font-weight: 700;
  padding: 12px 28px;
  border-radius: 14px;
  box-shadow: 0 2px 10px ${({ theme }) => theme.colors.accent}1A;
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
    color: ${({ theme }) => theme.colors.surface};
    transform: scale(1.045);
    opacity: 1;
    box-shadow: 0 8px 32px ${({ theme }) => theme.colors.primary}29;
  }
  @media (max-width: 700px) {
    width: 100%;
    margin-top: 10px;
    justify-content: center;
    font-size: 16px;
    padding: 12px 0;
  }
`;

const SectionHeadline = styled.h2`
  font-size: 1.5em;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin: 32px 0 12px 0;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  margin-bottom: 18px;
  border-bottom: 1.5px solid ${({ theme }) => theme.colors.border};
`;

const SearchBarArea = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  width: 100%;
`;

const ExportButtonsArea = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
`;

// Upgrade SearchIcon
const SearchIconStyled = styled(SearchIcon)`
  margin-right: 10px;
`;

// Upgrade Modal
const ModalSubtitle = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1em;
  margin-bottom: 18px;
`;
const ModalFormArea = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 14px;
  padding: 18px 0 0 0;
`;

const Institutionen: React.FC = () => {
  const { benutzer } = useUser();
  const theme = useTheme();
  // Admins
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminsError, setAdminsError] = useState<string | null>(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', institutionId: '' });
  const [adminFormError, setAdminFormError] = useState<string | null>(null);
  const [adminPage, setAdminPage] = useState(0);
  const [adminRowsPerPage, setAdminRowsPerPage] = useState(10);
  const [editRowId, setEditRowId] = useState<string | number | null>(null);
  const [editRow, setEditRow] = useState<any>({});

  // Institutionen
  const [institutionen, setInstitutionen] = useState<any[]>([]);
  const [instLoading, setInstLoading] = useState(true);
  const [instError, setInstError] = useState<string | null>(null);
  const [instSearch, setInstSearch] = useState('');
  const [instModalOpen, setInstModalOpen] = useState(false);
  const [instForm, setInstForm] = useState({ name: '', address: '' });
  const [instFormError, setInstFormError] = useState<string | null>(null);
  const [instPage, setInstPage] = useState(0);
  const [instRowsPerPage, setInstRowsPerPage] = useState(10);

  // All users
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Load Institutionen
  const loadInstitutionen = async () => {
    setInstLoading(true);
    setInstError(null);
    try {
      const data = await fetchInstitutionen();
      setInstitutionen(data);
      return data;
    } catch (e: any) {
      setInstError(e.message || 'Fehler beim Laden der Institutionen.');
      return [];
    } finally {
      setInstLoading(false);
    }
  };

  // Load Admins (now always expects up-to-date institutionen)
  const loadAdmins = async (instList?: any[]) => {
    setAdminsLoading(true);
    setAdminsError(null);
    try {
      const data = await fetchInstitutionenAdmins();
      const insts = instList || institutionen;
      const adminsWithInst = data.map((admin: any) => {
        const inst = insts.find((i: any) => i.id === admin.institutionId);
        return { ...admin, institutionName: inst ? inst.name : '' };
      });
      setAdmins(adminsWithInst);
    } catch (e: any) {
      setAdminsError(e.message || 'Fehler beim Laden der Admins.');
    }
    setAdminsLoading(false);
  };

  // On mount: load institutionen first, then admins
  useEffect(() => {
    if (benutzer?.role !== 'SUPER_ADMIN') return;
    (async () => {
      const insts = await loadInstitutionen();
      await loadAdmins(insts);
      fetchAllUsers().then(users => setAllUsers(users || []));
    })();
    // eslint-disable-next-line
  }, [benutzer]);

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Admins CRUD
  const handleAddAdmin = async () => {
    if (!adminForm.name || !adminForm.email || !adminForm.password || !adminForm.institutionId) {
      setAdminFormError('Name, E-Mail, Passwort und Institution sind erforderlich.');
      return;
    }
    if (!isEmailValid(adminForm.email)) {
      setAdminFormError('Bitte eine gültige E-Mail-Adresse eingeben.');
      return;
    }
    if (allUsers.some(u => u.email && u.email.toLowerCase() === adminForm.email.toLowerCase())) {
      setAdminFormError('Diese E-Mail-Adresse ist bereits vergeben.');
      return;
    }
    // Check for duplicates (name)
    const duplicateCheck = checkForDuplicates(adminForm, admins, ['name']);
    if (duplicateCheck.isDuplicate) {
      setAdminFormError(`Ein Admin mit diesem Namen (${duplicateCheck.duplicateValue}) existiert bereits.`);
      return;
    }
    setAdminsLoading(true);
    setAdminFormError(null);
    try {
      await registerAdmin({
        name: adminForm.name,
        email: adminForm.email,
        password: adminForm.password,
        role: 'ADMIN',
        institutionId: adminForm.institutionId,
      });
      setAdminModalOpen(false);
      setAdminForm({ name: '', email: '', password: '', institutionId: '' });
      const insts = await loadInstitutionen();
      await loadAdmins(insts);
      fetchAllUsers().then(users => setAllUsers(users || []));
    } catch (e: any) {
      setAdminFormError(e.message || 'Fehler beim Hinzufügen.');
    }
    setAdminsLoading(false);
  };

  const handleEditAdmin = async (row: any) => {
    setAdminsLoading(true);
    try {
      await editAdmin(row.id, {
        name: row.name,
        email: row.email,
        password: row.password || undefined
      });
      const insts = await loadInstitutionen();
      await loadAdmins(insts);
    } catch (e: any) {
      setAdminsError(e.message || 'Fehler beim Bearbeiten.');
    }
    setAdminsLoading(false);
  };

  const handleDeleteAdmin = async (row: any) => {
    setAdminsLoading(true);
    try {
      await deleteAdmin(row.id);
      const insts = await loadInstitutionen();
      await loadAdmins(insts);
    } catch (e: any) {
      setAdminsError(e.message || 'Fehler beim Löschen.');
    }
    setAdminsLoading(false);
  };

  // Institutionen CRUD
  const handleAddInst = async () => {
    if (!instForm.name || !instForm.address) {
      setInstFormError('Name und Adresse sind erforderlich.');
      return;
    }
    if (institutionen.some(i => i.name.trim().toLowerCase() === instForm.name.trim().toLowerCase())) {
      setInstFormError('Eine Institution mit diesem Namen existiert bereits.');
      return;
    }
    setInstLoading(true);
    setInstFormError(null);
    try {
      await addKita({
        name: instForm.name,
        address: instForm.address
      });
      setInstModalOpen(false);
      setInstForm({ name: '', address: '' });
      await loadInstitutionen();
    } catch (e: any) {
      setInstFormError(e.message || 'Fehler beim Hinzufügen.');
    }
    setInstLoading(false);
  };

  const handleEditInst = async (row: any) => {
    setInstLoading(true);
    setInstFormError(null);
    try {
      await editKita(row.id, { name: row.name, address: row.address });
      loadInstitutionen();
    } catch (e: any) {
      setInstFormError(e.message || 'Fehler beim Bearbeiten der Institution.');
    }
    setInstLoading(false);
  };

  const handleDeleteInst = async (row: any) => {
    setInstLoading(true);
    setInstFormError(null);
    try {
      await deleteKita(row.id);
      loadInstitutionen();
    } catch (e: any) {
      setInstFormError(e.message || 'Fehler beim Löschen der Institution.');
    }
    setInstLoading(false);
  };

  if (benutzer?.role !== 'SUPER_ADMIN') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (adminsLoading && admins.length === 0 && instLoading && institutionen.length === 0) return <AnimatedMascotsLoader text="Lade Daten..." />;

  // Admins columns (always include password column)
  const adminColumns: DataTableColumn<any>[] = [
    { key: 'name', label: 'Name', editable: true, filterable: true, sortable: true },
    { key: 'email', label: 'E-Mail', editable: true, filterable: true, sortable: true },
    { key: 'institutionName', label: 'Institution', editable: false, filterable: true, sortable: true },
    {
      key: 'password',
      label: 'Passwort (neu setzen)',
      editable: true,
      render: (value, row, idx) => {
        if (value) {
          return (
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
              Wenn Sie das Passwort ändern möchten, geben Sie hier ein neues ein.
            </div>
          );
        }
        return null;
      },
    },
  ];

  // Institutionen columns
  const instColumns: DataTableColumn<any>[] = [
    { key: 'name', label: 'Name', editable: true, filterable: true, sortable: true },
    { key: 'address', label: 'Adresse', editable: true, filterable: true, sortable: true },
  ];

  return (
    <>
      <CrudPage
        title="Admins Übersicht"
        entityName="Admin"
        icon={FaUserShield}
          data={admins}
          columns={adminColumns}
        loading={adminsLoading}
        error={adminsError}
        search={adminSearch}
        onSearchChange={setAdminSearch}
        onAdd={() => setAdminModalOpen(true)}
          onEdit={handleEditAdmin}
          onDelete={handleDeleteAdmin}
          page={adminPage}
          rowsPerPage={adminRowsPerPage}
          onPageChange={setAdminPage}
          onRowsPerPageChange={rows => { setAdminRowsPerPage(rows); setAdminPage(0); }}
          totalCount={admins.length}
        addButtonText="+ Hinzufügen"
        searchPlaceholder="Suchen..."
      >
      <ModernModal open={adminModalOpen} onClose={() => { setAdminModalOpen(false); setAdminFormError(null); }} title="Admin hinzufügen">
        {adminFormError && <ErrorText>{adminFormError}</ErrorText>}
        <form onSubmit={e => { e.preventDefault(); handleAddAdmin(); }}>
          <FormField>
            <Label htmlFor="admin-name">Name</Label>
            <Input id="admin-name" value={adminForm.name} onChange={e => setAdminForm(f => ({ ...f, name: e.target.value }))} autoFocus required />
          </FormField>
          <FormField>
            <Label htmlFor="admin-email">E-Mail</Label>
            <Input id="admin-email" type="email" value={adminForm.email} onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))} required />
          </FormField>
          <FormField>
            <Label htmlFor="admin-password">Passwort</Label>
            <Input id="admin-password" type="password" value={adminForm.password} onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))} required autoComplete="new-password" />
          </FormField>
          <FormField>
            <Label htmlFor="admin-institution">Institution</Label>
            <select id="admin-institution" value={adminForm.institutionId} onChange={e => setAdminForm(f => ({ ...f, institutionId: e.target.value }))} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
              <option value="">Bitte wählen...</option>
              {institutionen.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </FormField>
          <ModalButton type="submit">Hinzufügen</ModalButton>
        </form>
      </ModernModal>
      </CrudPage>
      <CrudPage
        title="Institutionen Übersicht"
        entityName="Institution"
        icon={FaBuilding}
          data={institutionen}
          columns={instColumns}
        loading={instLoading}
        error={instError}
        search={instSearch}
        onSearchChange={setInstSearch}
        onAdd={() => setInstModalOpen(true)}
          onEdit={handleEditInst}
          onDelete={handleDeleteInst}
          page={instPage}
          rowsPerPage={instRowsPerPage}
          onPageChange={setInstPage}
          onRowsPerPageChange={rows => { setInstRowsPerPage(rows); setInstPage(0); }}
          totalCount={institutionen.length}
        addButtonText="+ Hinzufügen"
        searchPlaceholder="Suchen..."
      >
      <ModernModal open={instModalOpen} onClose={() => { setInstModalOpen(false); setInstFormError(null); }} title="Institution hinzufügen">
        {instFormError && <ErrorText>{instFormError}</ErrorText>}
        <form onSubmit={e => { e.preventDefault(); handleAddInst(); }}>
          <FormField>
            <Label htmlFor="institution-name">Name</Label>
            <Input id="institution-name" value={instForm.name} onChange={e => setInstForm(f => ({ ...f, name: e.target.value }))} autoFocus required />
          </FormField>
          <FormField>
            <Label htmlFor="institution-address">Adresse</Label>
            <Input id="institution-address" value={instForm.address} onChange={e => setInstForm(f => ({ ...f, address: e.target.value }))} required />
          </FormField>
          <ModalButton type="submit">Hinzufügen</ModalButton>
        </form>
      </ModernModal>
      </CrudPage>
    </>
  );
};

export default Institutionen; 