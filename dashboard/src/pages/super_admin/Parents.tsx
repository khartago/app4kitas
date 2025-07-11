import React, { useEffect, useState } from 'react';
import { useUser } from '../../components/UserContext';
import {
  fetchParents,
  deleteParent,
  fetchAllUsers,
  addParent,
  editParent,
} from '../../services/superAdminApi';
import { ErrorMsg, DataTableColumn, CrudPage, checkForDuplicates } from '../../components/ui/AdminDashboardUI';
import { AnimatedMascotsLoader } from '../../components/ui/LoadingSpinner';
import ModernModal from '../../components/ui/ModernModal';
import { FormField, Label, Input, ErrorText, ModalButton } from '../../components/ui/ModernModal';
import { FaUserFriends } from 'react-icons/fa';

const Parents: React.FC = () => {
  const { benutzer } = useUser();
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

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
        password: form.password,
        phone: form.phone || undefined
      });
      setModalOpen(false);
      setForm({ name: '', email: '', password: '', phone: '' });
      await load();
      fetchAllUsers().then(users => setAllUsers(users || []));
    } catch (e: any) {
      setFormError(e.message || 'Fehler beim Hinzufügen.');
    }
    setLoading(false);
  };

  const handleEdit = async (row: any) => {
    setEditId(row.id);
    setForm({
      name: row.name || '',
      email: row.email || '',
      password: '',
      phone: row.phone || ''
    });
    setModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!form.name || !form.email) {
      setFormError('Name und E-Mail sind erforderlich.');
      return;
    }
    if (!isEmailValid(form.email)) {
      setFormError('Bitte eine gültige E-Mail-Adresse eingeben.');
      return;
    }
    setLoading(true);
    setFormError(null);
    try {
      await editParent(editId!, {
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        phone: form.phone || undefined
      });
      setModalOpen(false);
      setForm({ name: '', email: '', password: '', phone: '' });
      setEditId(null);
      await load();
    } catch (e: any) {
      setFormError(e.message || 'Fehler beim Bearbeiten.');
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
    { key: 'phone', label: 'Telefon', editable: true, filterable: true, sortable: true },
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
      title="Eltern-Übersicht"
      entityName="Eltern"
      icon={FaUserFriends}
      data={parents}
      columns={columns}
      loading={loading}
      error={error}
      search={search}
      onSearchChange={setSearch}
      onAdd={() => { setEditId(null); setForm({ name: '', email: '', password: '', phone: '' }); setModalOpen(true); }}
      onEdit={handleEdit}
      onDelete={handleDelete}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={setPage}
      onRowsPerPageChange={rows => { setRowsPerPage(rows); setPage(0); }}
      totalCount={parents.length}
    >
      <ModernModal open={modalOpen} onClose={() => { setModalOpen(false); setFormError(null); setEditId(null); setForm({ name: '', email: '', password: '', phone: '' }); }} title={editId ? 'Elternteil bearbeiten' : 'Elternteil hinzufügen'}>
        {formError && <ErrorText>{formError}</ErrorText>}
        <form onSubmit={e => { e.preventDefault(); editId ? handleSaveEdit() : handleAdd(); }}>
          <FormField>
            <Label htmlFor="parent-name">Name</Label>
            <Input id="parent-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus required />
          </FormField>
          <FormField>
            <Label htmlFor="parent-email">E-Mail</Label>
            <Input id="parent-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </FormField>
          <FormField>
            <Label htmlFor="parent-phone">Telefon</Label>
            <Input id="parent-phone" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </FormField>
          <FormField>
            <Label htmlFor="parent-password">{editId ? 'Passwort (leer lassen für keine Änderung)' : 'Passwort'}</Label>
            <Input id="parent-password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={!editId} autoComplete="new-password" />
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
              {editId ? 'Lassen Sie das Feld leer, wenn Sie das Passwort nicht ändern möchten.' : 'Das Passwort ist erforderlich für neue Eltern.'}
            </div>
          </FormField>
          <ModalButton type="submit">{editId ? 'Speichern' : 'Hinzufügen'}</ModalButton>
        </form>
      </ModernModal>
    </CrudPage>
  );
};

export default Parents; 