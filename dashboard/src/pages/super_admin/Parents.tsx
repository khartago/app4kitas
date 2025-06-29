import React, { useEffect, useState } from 'react';
import { useUser } from '../../components/UserContext';
import {
  fetchParents,
  addParent,
  editParent,
  deleteParent,
  fetchAllUsers,
} from '../../services/superAdminApi';
import { AnimatedMascotsLoader, ErrorMsg, DataTableColumn, CrudPage, checkForDuplicates } from '../../components/ui/AdminDashboardUI';
import ModernModal from '../../components/ui/ModernModal';
import { FormField, Label, Input, ErrorText, ModalButton } from '../../components/ui/ModernModal';

const Parents: React.FC = () => {
  const { benutzer } = useUser();
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchParents();
      setParents(data);
    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden der Eltern.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (benutzer?.role !== 'SUPER_ADMIN') return;
    load();
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
      await addParent({
        name: form.name,
        email: form.email,
        password: form.password
      });
      setModalOpen(false);
      setForm({ name: '', email: '', password: '' });
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
      await editParent(row.id, {
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
      await deleteParent(row.id);
      await load();
    } catch (e: any) {
      setError(e.message || 'Fehler beim Löschen.');
    }
    setLoading(false);
  };

  if (benutzer?.role !== 'SUPER_ADMIN') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading && parents.length === 0) return <AnimatedMascotsLoader text="Lade Eltern..." />;

  const columns: DataTableColumn<any>[] = [
    { key: 'name', label: 'Name', editable: true, filterable: true, sortable: true },
    { key: 'email', label: 'E-Mail', editable: true, filterable: true, sortable: true },
    { key: 'password', label: 'Passwort (neu setzen)', editable: true },
  ];

  return (
    <CrudPage
      title="Eltern-Übersicht"
      entityName="Eltern"
      data={parents}
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
      totalCount={parents.length}
    >
      <ModernModal open={modalOpen} onClose={() => { setModalOpen(false); setFormError(null); }} title="Elternteil hinzufügen">
        {formError && <ErrorText>{formError}</ErrorText>}
        <form onSubmit={e => { e.preventDefault(); handleAdd(); }}>
          <FormField>
            <Label htmlFor="parent-name">Name</Label>
            <Input id="parent-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus required />
          </FormField>
          <FormField>
            <Label htmlFor="parent-email">E-Mail</Label>
            <Input id="parent-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </FormField>
          <FormField>
            <Label htmlFor="parent-password">Passwort</Label>
            <Input id="parent-password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </FormField>
          <ModalButton type="submit">Hinzufügen</ModalButton>
        </form>
      </ModernModal>
    </CrudPage>
  );
};

export default Parents; 