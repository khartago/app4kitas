import React, { useEffect, useState } from 'react';
import { useUser } from '../../components/UserContext';
import { AnimatedMascotsLoader, ErrorMsg, DataTableColumn, CrudPage } from '../../components/ui/AdminDashboardUI';
import ModernModal from '../../components/ui/ModernModal';
import { FormField, Label, Input, ErrorText, ModalButton } from '../../components/ui/ModernModal';
import { fetchGroups, addGroup, editGroup, deleteGroup, fetchEducators } from '../../services/adminApi';

// Types
interface Group {
  id: string;
  name: string;
  educatorIds?: string[];
  educators?: { id: string; name: string }[];
  institutionId: string;
}

interface Educator {
  id: string;
  name: string;
  email: string;
  institutionId?: string;
}

const Groups: React.FC = () => {
  const { benutzer } = useUser();
  const [data, setData] = useState<Group[]>([]);
  const [educators, setEducators] = useState<Educator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    educatorIds: [] as string[] 
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editId, setEditId] = useState<string | null>(null);
  const [editEducatorsOnly, setEditEducatorsOnly] = useState(false);

  // Initial form state
  const initialForm = { name: '', educatorIds: [] };

  // Load data function
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const groupsData = await fetchGroups();
      setData(groupsData.groups || groupsData || []);
      
      // Also load educators for the multi-select
      const educatorsData = await fetchEducators();
      // Ensure institutionId is present (fallback to empty string if missing)
      const loadedEducators = (educatorsData.educators || educatorsData || []).map((e: any) => ({
        ...e,
        institutionId: e.institutionId || ''
      }));
      setEducators(loadedEducators);
    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden der Daten.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (benutzer?.role !== 'ADMIN' && benutzer?.role !== 'SUPER_ADMIN') return;
    load();
    // eslint-disable-next-line
  }, [benutzer]);

  // Add function
  const handleAdd = async () => {
    if (!form.name) {
      setFormError('Name ist erforderlich.');
      return;
    }
    // Check for duplicate group name
    if (data.some(group => group.name.trim().toLowerCase() === form.name.trim().toLowerCase())) {
      setFormError('Eine Gruppe mit diesem Namen existiert bereits.');
      return;
    }
    setLoading(true);
    setFormError(null);
    try {
      await addGroup({ 
        name: form.name, 
        educatorIds: form.educatorIds.length > 0 ? form.educatorIds : undefined
      });
      setModalOpen(false);
      setForm(initialForm);
      await load();
    } catch (e: any) {
      setFormError(e.message || 'Fehler beim Hinzufügen.');
    }
    setLoading(false);
  };

  // Edit function
  const handleEdit = async (row: { id: string; name: string; educatorIds: string[] }) => {
    setLoading(true);
    try {
      await editGroup(row.id, { 
        name: row.name, 
        educatorIds: row.educatorIds || []
      });
      await load();
    } catch (e: any) {
      setError(e.message || 'Fehler beim Bearbeiten.');
    }
    setLoading(false);
  };

  // Delete function
  const handleDelete = async (row: Group) => {
    setLoading(true);
    try {
      await deleteGroup(row.id);
      await load();
    } catch (e: any) {
      setError(e.message || 'Fehler beim Löschen.');
    }
    setLoading(false);
  };

  // Async handler for modal submit
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editEducatorsOnly && editId) {
      await editGroup(editId, { educatorIds: form.educatorIds });
      await load();
      setModalOpen(false);
      setEditEducatorsOnly(false);
      setEditId(null);
      setForm(initialForm);
    } else {
      handleAdd();
    }
  };

  if (benutzer?.role !== 'ADMIN' && benutzer?.role !== 'SUPER_ADMIN') {
    return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  }
  
  if (loading && data.length === 0) {
    return <AnimatedMascotsLoader text="Lade Gruppen..." />;
  }

  // Define columns
  const columns: DataTableColumn<Group>[] = [
    { key: 'name', label: 'Name', editable: true, filterable: true, sortable: true },
    { 
      key: 'educators', 
      label: 'Erzieher', 
      editable: false, 
      filterable: true, 
      sortable: false,
      render: (value, row) => {
        const educatorNames = row.educators?.map(e => e.name) || [];
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', minWidth: 0, alignItems: 'center' }}>
            {educatorNames.length > 0 ? educatorNames.map(name => (
              <span
                key={name}
                style={{
                  background: 'linear-gradient(135deg, #43a047, #388e3c)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  maxWidth: 80,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.07)'
                }}
              >
                {name}
              </span>
            )) : (
              <span style={{ color: '#6c757d', fontStyle: 'italic', fontSize: '11px' }}>Keine Erzieher</span>
            )}
            <button
              type="button"
              aria-label="Erzieher bearbeiten"
              onClick={() => {
                setForm({
                  name: row.name,
                  educatorIds: row.educators ? row.educators.map((e) => e.id) : []
                });
                setEditEducatorsOnly(true);
                setEditId(row.id);
                setModalOpen(true);
                setFormError(null);
              }}
              style={{ 
                marginLeft: '6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: '#388e3c',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                opacity: 0.7
              }}
            >
              ✎
            </button>
          </div>
        );
      }
    },
  ];

  // Remove frontend institution filtering for educators: use all loaded educators
  const filteredEducators = educators;

  // Add EducatorSelector component for pill-based, searchable, removable educator selection
  interface EducatorSelectorProps {
    selectedEducatorIds: string[];
    onChange: (ids: string[]) => void;
    placeholder?: string;
  }
  const EducatorSelector: React.FC<EducatorSelectorProps> = ({ selectedEducatorIds, onChange, placeholder = "Erzieher auswählen..." }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const filteredList = filteredEducators.filter(e =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const selectedEducators = filteredEducators.filter(e => selectedEducatorIds.includes(e.id));
    const toggleEducator = (educatorId: string) => {
      const newSelection = selectedEducatorIds.includes(educatorId)
        ? selectedEducatorIds.filter((id: string) => id !== educatorId)
        : [...selectedEducatorIds, educatorId];
      onChange(newSelection);
    };
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
            minHeight: '40px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            alignItems: 'center',
            backgroundColor: '#fff',
            transition: 'border-color 0.2s ease',
            fontSize: '14px'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#43a047'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#ddd'; }}
        >
          {selectedEducators.length > 0 ? (
            selectedEducators.map(educator => (
              <span
                key={educator.id}
                style={{
                  background: 'linear-gradient(135deg, #43a047, #388e3c)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: '500',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                {educator.name}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); toggleEducator(educator.id); }}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    lineHeight: 1
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span style={{ color: '#6c757d', fontStyle: 'italic' }}>{placeholder}</span>
          )}
          <span style={{ marginLeft: 'auto', color: '#6c757d', fontSize: '12px' }}>▼</span>
        </div>
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              maxHeight: '250px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              marginTop: '2px'
            }}
          >
            <input
              type="text"
              placeholder="Erzieher suchen..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderBottom: '1px solid #eee',
                outline: 'none',
                fontSize: '14px',
                backgroundColor: '#f8f9fa'
              }}
              onClick={e => e.stopPropagation()}
            />
            {filteredList.length > 0 ? (
              filteredList.map(educator => (
                <div
                  key={educator.id}
                  onClick={() => toggleEducator(educator.id)}
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    backgroundColor: selectedEducatorIds.includes(educator.id) ? '#e3f2fd' : 'white',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background-color 0.2s ease',
                    fontWeight: selectedEducatorIds.includes(educator.id) ? '600' : '500',
                    color: selectedEducatorIds.includes(educator.id) ? '#43a047' : '#333'
                  }}
                  onMouseEnter={e => { if (!selectedEducatorIds.includes(educator.id)) e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                  onMouseLeave={e => { if (!selectedEducatorIds.includes(educator.id)) e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  {educator.name}
                </div>
              ))
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', color: '#6c757d', fontStyle: 'italic' }}>
                Keine Erzieher gefunden
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <CrudPage
      title="Gruppenverwaltung"
      entityName="Gruppe"
      // Backend filtering by institutionId is enforced for security; no frontend filtering needed here
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
      <ModernModal open={modalOpen} onClose={() => { setModalOpen(false); setFormError(null); setEditEducatorsOnly(false); setEditId(null); setForm(initialForm); }} title={editEducatorsOnly ? 'Erzieher bearbeiten' : 'Neue Gruppe hinzufügen'}>
        {formError && <ErrorText>{formError}</ErrorText>}
        <form onSubmit={handleModalSubmit}>
          {editEducatorsOnly ? (
            <FormField>
              <Label htmlFor="educatorIds">Erzieher</Label>
              <EducatorSelector
                selectedEducatorIds={form.educatorIds}
                onChange={(educatorIds) => setForm(f => ({ ...f, educatorIds }))}
                placeholder="Erzieher auswählen..."
              />
            </FormField>
          ) : (
            <>
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
            <Label htmlFor="educatorIds">Erzieher zuweisen</Label>
                <EducatorSelector
                  selectedEducatorIds={form.educatorIds}
                  onChange={(ids: string[]) => setForm(f => ({ ...f, educatorIds: ids }))}
                  placeholder="Erzieher auswählen..."
                />
          </FormField>
            </>
          )}
          <ModalButton type="submit">{editEducatorsOnly ? 'Speichern' : 'Hinzufügen'}</ModalButton>
        </form>
      </ModernModal>
    </CrudPage>
  );
};

export default Groups; 