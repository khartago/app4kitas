import React, { useEffect, useState } from 'react';
import { useUser } from '../../components/UserContext';
import { ErrorMsg, DataTableColumn, CrudPage } from '../../components/ui/AdminDashboardUI';
import { AnimatedMascotsLoader } from '../../components/ui/LoadingSpinner';
import ModernModal from '../../components/ui/ModernModal';
import { FormField, Label, Input, ErrorText, ModalButton } from '../../components/ui/ModernModal';
import { fetchChildren, addChild, editChild, deleteChild, uploadChildPhoto, fetchGroups, fetchParents, fetchChildQRCode, updateChildConsent, setManualConsent } from '../../services/adminApi';
import { FaChild } from 'react-icons/fa';

// Types
interface Child {
  id: string;
  name: string;
  birthdate: string;
  groupId?: string | null;
  group?: { id: string; name: string };
  parentIds?: string[];
  parents?: { id: string; name: string }[];
  photoUrl?: string;
  institutionId: string;
  consentGiven?: boolean;
  consentDate?: string;
}

interface Group {
  id: string;
  name: string;
  institutionId: string;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  institutionId: string;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';

const Children: React.FC = () => {
  const { benutzer } = useUser();
  const [data, setData] = useState<Child[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    birthdate: '', 
    groupId: '', 
    parentIds: [] as string[]
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrChild, setQrChild] = useState<Child | null>(null);
  const [editParentsOnly, setEditParentsOnly] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Consent management state
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [consentDetailsModalOpen, setConsentDetailsModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [manualConsentForm, setManualConsentForm] = useState({
    manualConsentGiven: false,
    paperConsentDate: new Date().toISOString().split('T')[0]
  });

  // Initial form state
  const initialForm = { name: '', birthdate: '', groupId: '', parentIds: [] };

  // Load data function
  const load = async () => {
      setLoading(true);
    setError(null);
      try {
      const childrenData = await fetchChildren();
      // Children loaded successfully
      setData(childrenData.children || childrenData || []);
      
      // Also load groups for the dropdown
      const groupsData = await fetchGroups();
      setGroups(groupsData.groups || groupsData || []);

      // Load parents for the search dropdown
      const parentsData = await fetchParents();
      setParents(parentsData.users || parentsData || []);
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
    if (!form.name || !form.birthdate) {
      setFormError('Name und Geburtsdatum sind erforderlich.');
      return;
    }
    // Check for duplicate child (same name and birthdate)
    if (data.some(child => child.name.trim().toLowerCase() === form.name.trim().toLowerCase() && child.birthdate.slice(0, 10) === form.birthdate)) {
      setFormError('Ein Kind mit diesem Namen und Geburtsdatum existiert bereits.');
      return;
    }
    setLoading(true);
    setFormError(null);
    try {
      await addChild({ 
        name: form.name, 
        birthdate: new Date(form.birthdate).toISOString(),
        groupId: form.groupId || undefined,
        parentIds: form.parentIds.length > 0 ? form.parentIds : undefined
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
  const handleEdit = async (row: Child) => {
    setLoading(true);
    try {
      const parentIds = row.parentIds ? row.parentIds : [];
      await editChild(row.id, { 
        name: row.name, 
        birthdate: row.birthdate ? new Date(row.birthdate).toISOString() : undefined,
        groupId: row.groupId,
        parentIds: parentIds
      });
      await load();
    } catch (e: any) {
      setError(e.message || 'Fehler beim Bearbeiten.');
      }
    setLoading(false);
  };

  // Delete function
  const handleDelete = async (row: Child) => {
    setLoading(true);
    try {
      await deleteChild(row.id);
      await load();
    } catch (e: any) {
      setError(e.message || 'Fehler beim Löschen.');
    }
    setLoading(false);
  };

  // Photo upload function
  const handlePhotoUpload = async (childId: string, file: File) => {
    setUploadingPhoto(childId);
    try {
      await uploadChildPhoto(childId, file);
      await load(); // Reload to get updated photo URL
    } catch (e: any) {
      setError(e.message || 'Fehler beim Hochladen des Fotos.');
    }
    setUploadingPhoto(null);
  };

  const handleShowQRCode = async (child: Child) => {
    setQrModalOpen(true);
    setQrChild(child);
    setQrLoading(true);
    setQrError(null);
    setQrImageUrl(null);
    try {
      const blob = await fetchChildQRCode(child.id);
      const url = URL.createObjectURL(blob);
      setQrImageUrl(url);
    } catch (e: any) {
      setQrError(e.message || 'Fehler beim Laden des QR-Codes.');
    }
    setQrLoading(false);
  };

  const handleCloseQrModal = () => {
    setQrModalOpen(false);
    setQrImageUrl(null);
    setQrChild(null);
  };

  const handlePrintQr = () => {
    if (!qrImageUrl) return;
    const win = window.open('');
    if (win) {
      win.document.write(`<img src='${qrImageUrl}' style='width:300px;height:300px;display:block;margin:40px auto;' />`);
      win.document.title = 'QR-Code drucken';
      win.print();
      win.close();
    }
  };

  // Consent management handlers
  const handleConsentDetails = (child: Child) => {
    setSelectedChild(child);
    setConsentDetailsModalOpen(true);
  };

  const handleManualConsent = (child: Child) => {
    setSelectedChild(child);
    setManualConsentForm({
      manualConsentGiven: child.consentGiven || false,
      paperConsentDate: new Date().toISOString().split('T')[0]
    });
    setConsentModalOpen(true);
  };

  const handleManualConsentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;

    try {
      await setManualConsent(selectedChild.id, manualConsentForm);
      setConsentModalOpen(false);
      setSelectedChild(null);
      await load(); // Reload data
    } catch (error) {
      console.error('Error setting manual consent:', error);
    }
  };

  // Remove institution filtering for parents: show all parents
  const filteredParents = parents;

  // Parent selection component (styled like EducatorSelector)
  const ParentSelector = ({ 
    selectedParentIds, 
    onChange, 
    placeholder = "Eltern auswählen..." 
  }: { 
    selectedParentIds: string[]; 
    onChange: (parentIds: string[]) => void; 
    placeholder?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    // Search by name or email
    const filteredList = filteredParents.filter(parent =>
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Always show already selected parents as pills
    const selectedParents = filteredParents.filter(parent => selectedParentIds.includes(parent.id));
    const toggleParent = (parentId: string) => {
      const newSelection = selectedParentIds.includes(parentId)
        ? selectedParentIds.filter(id => id !== parentId)
        : [...selectedParentIds, parentId];
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
          {selectedParents.length > 0 ? (
            selectedParents.map(parent => (
              <span
                key={parent.id}
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
                {parent.name} <span style={{ fontSize: '11px', color: '#e0e0e0', marginLeft: 4 }}>{parent.email}</span>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); toggleParent(parent.id); }}
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
              placeholder="Eltern suchen (Name oder E-Mail)..."
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
              filteredList.map(parent => (
                <div
                  key={parent.id}
                  onClick={() => toggleParent(parent.id)}
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    backgroundColor: selectedParentIds.includes(parent.id) ? '#e3f2fd' : 'white',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background-color 0.2s ease',
                    fontWeight: selectedParentIds.includes(parent.id) ? '600' : '500',
                    color: selectedParentIds.includes(parent.id) ? '#43a047' : '#333'
                  }}
                  onMouseEnter={e => { if (!selectedParentIds.includes(parent.id)) e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                  onMouseLeave={e => { if (!selectedParentIds.includes(parent.id)) e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  {parent.name} <span style={{ fontSize: '11px', color: '#888', marginLeft: 4 }}>{parent.email}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', color: '#6c757d', fontStyle: 'italic' }}>
                Keine Eltern gefunden
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Async handler for modal submit
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editParentsOnly && editId) {
      await editChild(editId, { parentIds: form.parentIds });
      await load();
      setModalOpen(false);
      setEditParentsOnly(false);
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
    return <AnimatedMascotsLoader text="Lade Kinder..." />;
  }

  // Remove frontend institution filtering, use backend-filtered data directly
  const filteredChildren = data;
  const filteredGroups = groups;

  // Define columns
  const columns: DataTableColumn<Child>[] = [
    { 
      key: 'photoUrl', 
      label: 'Foto', 
      editable: false, 
      filterable: false, 
      sortable: false,
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {value ? (
            <img 
              src={value.startsWith('/uploads') ? BACKEND_URL + value : value} 
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
              ?
            </div>
          )}
          <input
                      type="file"
                      accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoUpload(row.id, file);
            }}
            disabled={uploadingPhoto === row.id}
            style={{ fontSize: '12px' }}
          />
          {uploadingPhoto === row.id && <span>Wird hochgeladen...</span>}
        </div>
      )
    },
    { key: 'name', label: 'Name', editable: true, filterable: true, sortable: true },
    { key: 'birthdate', label: 'Geburtsdatum', editable: true, filterable: true, sortable: true },
    { 
      key: 'group', 
      label: 'Gruppe', 
      editable: true, 
      filterable: true, 
      sortable: true,
      render: (value, row) => (
        <select
          value={row.groupId || ''}
          onChange={(e) => {
            const updatedRow = { 
              ...row, 
              groupId: e.target.value === '' ? null : e.target.value 
            };
            handleEdit(updatedRow);
          }}
          style={{ 
            padding: '6px 8px', 
            borderRadius: '4px', 
            border: '1px solid #ddd',
            fontSize: '14px',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          <option value="">Keine Gruppe</option>
          {filteredGroups.map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      )
    },
    { 
      key: 'parents', 
      label: 'Eltern', 
      editable: false, 
      filterable: true, 
      sortable: false,
      render: (value, row) => {
        const parentNames = row.parents?.map(p => p.name) || [];
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', minWidth: 0, alignItems: 'center' }}>
            {parentNames.length > 0 ? parentNames.map(name => (
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
              <span style={{ color: '#6c757d', fontStyle: 'italic', fontSize: '11px' }}>Keine Eltern</span>
            )}
            <button
              type="button"
              aria-label="Eltern bearbeiten"
              onClick={() => {
                setForm({
                  name: row.name,
                  birthdate: row.birthdate,
                  groupId: row.groupId || '',
                  parentIds: row.parents ? row.parents.map((p) => p.id) : []
                });
                setEditParentsOnly(true);
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
    {
      key: 'consentGiven',
      label: 'DSGVO Zustimmung',
      editable: false,
      filterable: true,
      sortable: true,
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '500',
            backgroundColor: row.consentGiven ? '#4caf50' : '#f44336',
            color: 'white'
          }}>
            {row.consentGiven ? 'Gegeben' : 'Nicht gegeben'}
          </span>
            <button
              onClick={() => handleConsentDetails(row)}
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '10px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
              title="Einwilligungsdetails anzeigen"
            >
              Details
            </button>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
          <select
            value={row.consentGiven ? 'true' : 'false'}
            onChange={async (e) => {
              const consentGiven = e.target.value === 'true';
              try {
                await updateChildConsent(row.id, consentGiven);
                await load(); // Reload data to get updated consent status
              } catch (error) {
                console.error('Error updating consent:', error);
              }
            }}
            style={{
                padding: '2px 4px',
                borderRadius: '3px',
              border: '1px solid #ddd',
                fontSize: '10px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="false">Nicht gegeben</option>
            <option value="true">Gegeben</option>
          </select>
            <button
              onClick={() => handleManualConsent(row)}
              style={{
                padding: '2px 4px',
                borderRadius: '3px',
                border: '1px solid #2196F3',
                fontSize: '10px',
                backgroundColor: '#fff',
                color: '#2196F3',
                cursor: 'pointer'
              }}
              title="Manuelle Einwilligung setzen"
            >
              Papier
            </button>
          </div>
        </div>
      )
    },
    {
      key: 'qr',
      label: 'QR-Code',
      editable: false,
      filterable: false,
      sortable: false,
      render: (value, row) => (
        <button
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500
          }}
          onClick={() => handleShowQRCode(row)}
        >
          QR-Code anzeigen
        </button>
      )
    },
  ];

  return (
    <CrudPage
      title="Kinderverwaltung"
      entityName="Kind"
      icon={FaChild}
      data={filteredChildren}
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
      totalCount={filteredChildren.length}
    >
      {/* Modal content */}
      <ModernModal open={modalOpen} onClose={() => { setModalOpen(false); setFormError(null); setEditParentsOnly(false); setEditId(null); setForm(initialForm); }} title={editParentsOnly ? 'Eltern bearbeiten' : 'Neues Kind hinzufügen'}>
        {formError && <ErrorText>{formError}</ErrorText>}
        <form onSubmit={handleModalSubmit}>
          {editParentsOnly ? (
            <>
                          <FormField>
                <Label htmlFor="parentIds">Eltern</Label>
                <ParentSelector
                  selectedParentIds={form.parentIds}
                  onChange={(parentIds) => setForm(f => ({ ...f, parentIds }))}
                  placeholder="Eltern auswählen..."
                />
              </FormField>
              <FormField>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#856404'
                }}>
                  <strong>DSGVO-Hinweis:</strong> Neue Kinder werden ohne Einwilligung für sensitive Datenverarbeitung erstellt. 
                  Eltern müssen vor Check-ins, Notizen oder Foto-Uploads ihre Einwilligung geben. 
                  Die Einwilligung kann später in der Kinderliste verwaltet werden.
                </div>
              </FormField>
            </>
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
                <Label htmlFor="birthdate">Geburtsdatum *</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={form.birthdate}
                  onChange={e => setForm(f => ({ ...f, birthdate: e.target.value }))}
                  required
                />
              </FormField>
              <FormField>
                <Label htmlFor="groupId">Gruppe</Label>
                <select
                  id="groupId"
                  value={form.groupId}
                  onChange={e => setForm(f => ({ ...f, groupId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Keine Gruppe</option>
                  {filteredGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField>
                <Label htmlFor="parentIds">Eltern</Label>
                <ParentSelector
                  selectedParentIds={form.parentIds}
                  onChange={(parentIds) => setForm(f => ({ ...f, parentIds }))}
                  placeholder="Eltern auswählen..."
                />
              </FormField>
            </>
          )}
          <ModalButton type="submit">{editParentsOnly ? 'Speichern' : 'Hinzufügen'}</ModalButton>
        </form>
      </ModernModal>
      <ModernModal open={qrModalOpen} onClose={handleCloseQrModal} title={qrChild ? `QR-Code für ${qrChild.name}` : 'QR-Code'}>
        {qrLoading ? (
          <div>Lade QR-Code...</div>
        ) : qrError ? (
          <ErrorText>{qrError}</ErrorText>
        ) : qrImageUrl ? (
          <div style={{ textAlign: 'center' }}>
            <img src={qrImageUrl} alt="QR-Code" style={{ width: 240, height: 240, margin: '16px auto', display: 'block', border: '1px solid #eee', borderRadius: 12 }} />
            <div style={{ marginTop: 16 }}>
              <button
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: 16
                }}
                onClick={handlePrintQr}
              >
                Drucken
              </button>
            </div>
          </div>
        ) : null}
      </ModernModal>

      {/* Consent Details Modal */}
      <ModernModal 
        open={consentDetailsModalOpen} 
        onClose={() => { setConsentDetailsModalOpen(false); setSelectedChild(null); }} 
        title={selectedChild ? `Einwilligungsdetails für ${selectedChild.name}` : 'Einwilligungsdetails'}
      >
        {selectedChild && (
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Aktueller Status</h4>
              <div style={{ 
                padding: '8px 12px', 
                backgroundColor: selectedChild.consentGiven ? '#d4edda' : '#f8d7da',
                border: `1px solid ${selectedChild.consentGiven ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '4px',
                color: selectedChild.consentGiven ? '#155724' : '#721c24'
              }}>
                <strong>Gesamtstatus:</strong> {selectedChild.consentGiven ? 'Einwilligung gegeben' : 'Keine Einwilligung'}
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Details</h4>
              <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                <p><strong>Kind:</strong> {selectedChild.name}</p>
                <p><strong>Geburtsdatum:</strong> {new Date(selectedChild.birthdate).toLocaleDateString('de-DE')}</p>
                <p><strong>Gruppe:</strong> {selectedChild.group?.name || 'Keine Gruppe'}</p>
                <p><strong>Eltern:</strong> {selectedChild.parents?.map(p => p.name).join(', ') || 'Keine Eltern zugeordnet'}</p>
                {selectedChild.consentDate && (
                  <p><strong>Einwilligungsdatum:</strong> {new Date(selectedChild.consentDate).toLocaleDateString('de-DE')}</p>
                )}
              </div>
            </div>

            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '4px',
              fontSize: '13px'
            }}>
              <strong>DSGVO-Hinweis:</strong> Ohne gültige Einwilligung sind Check-ins, Notizen und Foto-Uploads für dieses Kind nicht möglich.
            </div>
          </div>
        )}
      </ModernModal>

      {/* Manual Consent Modal */}
      <ModernModal 
        open={consentModalOpen} 
        onClose={() => { setConsentModalOpen(false); setSelectedChild(null); }} 
        title={selectedChild ? `Manuelle Einwilligung für ${selectedChild.name}` : 'Manuelle Einwilligung'}
      >
        {selectedChild && (
          <form onSubmit={handleManualConsentSubmit}>
            <FormField>
              <Label>Einwilligung basierend auf Papier-Einwilligung</Label>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={manualConsentForm.manualConsentGiven}
                    onChange={(e) => setManualConsentForm(f => ({ ...f, manualConsentGiven: e.target.checked }))}
                  />
                  Einwilligung liegt vor (Papier-Einwilligung unterschrieben)
                </label>
              </div>
            </FormField>

            {manualConsentForm.manualConsentGiven && (
              <FormField>
                <Label htmlFor="paperConsentDate">Datum der Papier-Einwilligung *</Label>
                <Input
                  id="paperConsentDate"
                  type="date"
                  value={manualConsentForm.paperConsentDate}
                  onChange={(e) => setManualConsentForm(f => ({ ...f, paperConsentDate: e.target.value }))}
                  required
                />
              </FormField>
            )}

            <div style={{ 
              padding: '12px', 
              backgroundColor: '#d1ecf1', 
              border: '1px solid #bee5eb', 
              borderRadius: '4px',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              <strong>Hinweis:</strong> Diese Funktion ist für den Fall gedacht, dass Eltern eine Papier-Einwilligung unterschrieben haben, 
              aber noch keine digitale Einwilligung in der App gegeben haben.
            </div>

            <ModalButton type="submit">Einwilligung speichern</ModalButton>
          </form>
        )}
      </ModernModal>
    </CrudPage>
  );
};

export default Children; 