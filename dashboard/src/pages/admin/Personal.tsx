import React, { useEffect, useState } from 'react';
import { useUser } from '../../components/UserContext';
import { AnimatedMascotsLoader, ErrorMsg, DataTableColumn, CrudPage } from '../../components/ui/AdminDashboardUI';
import ModernModal from '../../components/ui/ModernModal';
import { FormField, Label, Input, ErrorText, ModalButton } from '../../components/ui/ModernModal';
import { fetchEducators, addEducator, editEducator, deleteEducator } from '../../services/adminApi';
import { fetchAllUsers } from '../../services/superAdminApi';

// Types
interface Educator {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  institutionId?: string;
}

const Personal: React.FC = () => {
  const { benutzer } = useUser();
  const [data, setData] = useState<Educator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '' 
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Load data function
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const educatorsData = await fetchEducators();
      setData(educatorsData.educators || educatorsData || []);
    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden der Daten.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (benutzer?.role !== 'ADMIN' && benutzer?.role !== 'SUPER_ADMIN') return;
    load();
    fetchAllUsers().then(users => setAllUsers(users || []));
    // eslint-disable-next-line
  }, [benutzer]);

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Add function
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
    if (!benutzer?.institutionId) {
      setFormError('Keine Institution zugewiesen.');
      return;
    }
    setLoading(true);
    setFormError(null);
    try {
      await addEducator({
        name: form.name,
        email: form.email,
        password: form.password,
        institutionId: benutzer.institutionId
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

  // Edit function
  const handleEdit = async (row: Educator) => {
    setLoading(true);
    try {
      await editEducator(row.id, { 
        name: row.name, 
        email: row.email
        // Note: Password editing is handled separately for security
      });
      await load();
    } catch (e: any) {
      setError(e.message || 'Fehler beim Bearbeiten.');
    }
    setLoading(false);
  };

  // Delete function
  const handleDelete = async (row: Educator) => {
    setLoading(true);
    try {
      await deleteEducator(row.id);
      await load();
    } catch (e: any) {
      setError(e.message || 'Fehler beim Löschen.');
    }
    setLoading(false);
  };

  if (benutzer?.role !== 'ADMIN' && benutzer?.role !== 'SUPER_ADMIN') {
    return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  }
  
  if (loading && data.length === 0) {
    return <AnimatedMascotsLoader text="Lade Personal..." />;
  }

  // Define columns
  const columns: DataTableColumn<Educator>[] = [
    { 
      key: 'avatarUrl', 
      label: 'Avatar', 
      editable: false, 
      filterable: false, 
      sortable: false,
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {value ? (
            <img 
              src={value} 
              alt={row.name} 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>
              {row.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )
    },
    { key: 'name', label: 'Name', editable: true, filterable: true, sortable: true },
    { key: 'email', label: 'E-Mail', editable: true, filterable: true, sortable: true },
    { 
      key: 'role', 
      label: 'Rolle', 
      editable: false, 
      filterable: true, 
      sortable: true,
      render: (value) => (
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '12px', 
          fontSize: '12px',
          backgroundColor: value === 'EDUCATOR' ? '#e3f2fd' : '#f3e5f5',
          color: value === 'EDUCATOR' ? '#1976d2' : '#7b1fa2'
        }}>
          {value === 'EDUCATOR' ? 'Erzieher' : value}
        </span>
      )
    },
  ];

  return (
    <CrudPage
      title="Personalverwaltung"
      entityName="Erzieher"
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
      {/* Modal content */}
      <ModernModal open={modalOpen} onClose={() => { setModalOpen(false); setFormError(null); }} title="Neuen Erzieher hinzufügen">
        {formError && <ErrorText>{formError}</ErrorText>}
        <form onSubmit={e => { e.preventDefault(); handleAdd(); }}>
          <FormField>
            <Label htmlFor="name">Name *</Label>
            <Input 
              id="name" 
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
              autoFocus 
              required 
            />
          </FormField>
          <FormField>
            <Label htmlFor="email">E-Mail *</Label>
            <Input 
              id="email" 
              type="email" 
              value={form.email} 
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
              required 
            />
          </FormField>
          <FormField>
            <Label htmlFor="password">Passwort *</Label>
            <Input 
              id="password" 
              type="password" 
              value={form.password} 
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
              required 
              minLength={6}
            />
            <small style={{ fontSize: '12px', color: '#666' }}>
              Mindestens 6 Zeichen
            </small>
          </FormField>
          <ModalButton type="submit">Hinzufügen</ModalButton>
        </form>
      </ModernModal>
    </CrudPage>
  );
};

export default Personal; 