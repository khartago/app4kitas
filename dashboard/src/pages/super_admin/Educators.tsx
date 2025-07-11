import React, { useEffect, useState } from 'react';
import { useUser } from '../../components/UserContext';
import {
  fetchEducators,
  addEducator,
  editEducator,
  deleteEducator,
  fetchInstitutionen,
  fetchAllUsers,
} from '../../services/superAdminApi';
import { ErrorMsg, DataTableColumn, CrudPage, checkForDuplicates } from '../../components/ui/AdminDashboardUI';
import { AnimatedMascotsLoader } from '../../components/ui/LoadingSpinner';
import ModernModal from '../../components/ui/ModernModal';
import { FormField, Label, Input, ErrorText, ModalButton } from '../../components/ui/ModernModal';
import SearchableDropdown from '../../components/ui/SearchableDropdown';
import { fetchGroups } from '../../services/adminApi';
import { useTheme } from 'styled-components';
import { FaChalkboardTeacher } from 'react-icons/fa';

const Educators: React.FC = () => {
  const { benutzer } = useUser();
  const [educators, setEducators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', institutionId: '', groupId: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [groups, setGroups] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const theme = useTheme();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEducators();
      setEducators(data);
    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden der Erzieher.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (benutzer?.role !== 'SUPER_ADMIN') return;
    load();
    // Fetch all groups for group assignment
    fetchGroups().then(setGroups);
    // Fetch all institutions for institution assignment
    fetchInstitutionen().then(setInstitutions);
    fetchAllUsers().then(users => setAllUsers(users || []));
    // eslint-disable-next-line
  }, [benutzer]);

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) {
      setFormError('Name, E-Mail und Passwort sind erforderlich.');
      return;
    }
    if (!isEmailValid(form.email)) {
      setFormError('Bitte eine gültige E-Mail-Adresse eingeben.');
      return;
    }
    if (allUsers.some(u => u.email && u.email.toLowerCase() === form.email.toLowerCase())) {
      setFormError('Diese E-Mail-Adresse ist bereits vergeben.');
      return;
    }
    setLoading(true);
    setFormError(null);
    try {
      await addEducator({
        name: form.name,
        email: form.email,
        password: form.password,
        institutionId: form.institutionId,
        groupIds: form.groupId ? [form.groupId] : undefined
      });
      setModalOpen(false);
      setForm({ name: '', email: '', password: '', institutionId: '', groupId: '' });
      await load();
      fetchAllUsers().then(users => setAllUsers(users || []));
    } catch (e: any) {
      setFormError(e.message || 'Fehler beim Hinzufügen.');
    }
    setLoading(false);
  };

  const handleEdit = async (row: any) => {
    setLoading(true);
    try {
      await editEducator(row.id, {
        name: row.name,
        email: row.email,
        password: row.password || undefined, // only send if changed
      });
      await load();
    } catch (e: any) {
      setError(e.message || 'Fehler beim Bearbeiten.');
    }
    setLoading(false);
  };

  const handleDelete = async (row: any) => {
    setLoading(true);
    try {
      await deleteEducator(row.id);
      await load();
    } catch (e: any) {
      setError(e.message || 'Fehler beim Löschen.');
    }
    setLoading(false);
  };

  if (benutzer?.role !== 'SUPER_ADMIN') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading && educators.length === 0) return <AnimatedMascotsLoader text="Lade Erzieher..." />;

  const columns: DataTableColumn<any>[] = [
    { key: 'name', label: 'Name', editable: true, filterable: true, sortable: true },
    { key: 'email', label: 'E-Mail', editable: true, filterable: true, sortable: true },
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

  return (
    <CrudPage
      title="Erzieher-Übersicht"
      entityName="Erzieher"
      icon={FaChalkboardTeacher}
      data={educators}
      columns={columns}
      loading={loading}
      error={error}
      search={search}
      onSearchChange={setSearch}
      onAdd={() => setModalOpen(true)}
      onEdit={handleEdit}
      onDelete={handleDelete}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={setPage}
      onRowsPerPageChange={rows => { setRowsPerPage(rows); setPage(0); }}
      totalCount={educators.length}
    >
      <ModernModal open={modalOpen} onClose={() => { setModalOpen(false); setFormError(null); }} title="Erzieher/in hinzufügen">
        {formError && <ErrorText>{formError}</ErrorText>}
        <form onSubmit={e => { e.preventDefault(); handleAdd(); }}>
          <FormField>
            <Label htmlFor="educator-name">Name</Label>
            <Input id="educator-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus required />
          </FormField>
          <FormField>
            <Label htmlFor="educator-email">E-Mail</Label>
            <Input id="educator-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </FormField>
          <FormField>
            <Label htmlFor="educator-password">Passwort</Label>
            <Input id="educator-password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required autoComplete="new-password" />
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
              Das Passwort ist erforderlich für neue Erzieher. Wenn Sie das Passwort ändern möchten, geben Sie hier ein neues ein.
            </div>
          </FormField>
          <FormField>
            <Label htmlFor="educator-institution">Institution *</Label>
            <SearchableDropdown
              options={institutions}
              value={form.institutionId} 
              onChange={(value) => setForm(f => ({ ...f, institutionId: value }))}
              placeholder="Institution auswählen..."
              searchPlaceholder="Institution suchen..."
              required
            />
          </FormField>
          <FormField>
            <Label htmlFor="educator-groups">Gruppe</Label>
            <SearchableDropdown
              options={groups}
              value={form.groupId}
              onChange={(value) => setForm(f => ({ ...f, groupId: value }))}
              placeholder="Gruppe auswählen..."
              searchPlaceholder="Gruppe suchen..."
            />
          </FormField>
          <ModalButton type="submit">Hinzufügen</ModalButton>
        </form>
      </ModernModal>
    </CrudPage>
  );
};

export default Educators; 