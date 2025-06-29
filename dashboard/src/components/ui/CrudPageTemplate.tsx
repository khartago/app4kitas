import React, { useEffect, useState } from 'react';
import { useUser } from '../UserContext';
import { AnimatedMascotsLoader, ErrorMsg, DataTableColumn, CrudPage } from './AdminDashboardUI';
import ModernModal from './ModernModal';
import { FormField, Label, Input, ErrorText, ModalButton } from './ModernModal';

// Template for creating new CRUD pages using the centralized CrudPage component
const CrudPageTemplate: React.FC = () => {
  const { benutzer } = useUser();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load data function
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your API call
      // const data = await fetchYourData();
      // setData(data);
    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden der Daten.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (benutzer?.role !== 'YOUR_ROLE') return;
    load();
    // eslint-disable-next-line
  }, [benutzer]);

  // Add function
  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) {
      setFormError('Name, E-Mail und Passwort sind erforderlich.');
      return;
    }
    setLoading(true);
    setFormError(null);
    try {
      // Replace with your API call
      // await addYourData({ name: form.name, email: form.email, password: form.password });
      setModalOpen(false);
      setForm({ name: '', email: '', password: '' });
      await load();
    } catch (e: any) {
      setFormError(e.message || 'Fehler beim Hinzufügen.');
    }
    setLoading(false);
  };

  // Edit function
  const handleEdit = async (row: any) => {
    setLoading(true);
    try {
      // Replace with your API call
      // await editYourData(row.id, { name: row.name, email: row.email, password: row.password || undefined });
      await load();
    } catch (e: any) {
      setError(e.message || 'Fehler beim Bearbeiten.');
    }
    setLoading(false);
  };

  // Delete function
  const handleDelete = async (row: any) => {
    setLoading(true);
    try {
      // Replace with your API call
      // await deleteYourData(row.id);
      await load();
    } catch (e: any) {
      setError(e.message || 'Fehler beim Löschen.');
    }
    setLoading(false);
  };

  if (benutzer?.role !== 'YOUR_ROLE') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading && data.length === 0) return <AnimatedMascotsLoader text="Lade Daten..." />;

  // Define your columns
  const columns: DataTableColumn<any>[] = [
    { key: 'name', label: 'Name', editable: true, filterable: true, sortable: true },
    { key: 'email', label: 'E-Mail', editable: true, filterable: true, sortable: true },
    { key: 'password', label: 'Passwort (neu setzen)', editable: true },
    { key: 'id', label: 'ID', editable: false, filterable: true, sortable: true },
  ];

  return (
    <CrudPage
      title="Your Page Title"
      entityName="Your Entity Name"
      data={data}
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
      totalCount={data.length}
    >
      {/* Your modal content */}
      <ModernModal open={modalOpen} onClose={() => { setModalOpen(false); setFormError(null); }} title="Add New Item">
        {formError && <ErrorText>{formError}</ErrorText>}
        <form onSubmit={e => { e.preventDefault(); handleAdd(); }}>
          <FormField>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus required />
          </FormField>
          <FormField>
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </FormField>
          <FormField>
            <Label htmlFor="password">Passwort</Label>
            <Input id="password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </FormField>
          <ModalButton type="submit">Hinzufügen</ModalButton>
        </form>
      </ModernModal>
    </CrudPage>
  );
};

export default CrudPageTemplate; 