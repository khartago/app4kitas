import React, { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useUser } from '../../components/UserContext';
import { fetchChildrenNotes, addNote, updateNote, deleteNote, getKinderByGruppe, fetchMyGroup } from '../../services/educatorApi';
import { Card, Headline, ErrorMsg, Button } from '../../components/ui/AdminDashboardUI';
import { AnimatedMascotsLoader, EmptyMascot, ErrorMascot } from '../../components/ui/LoadingSpinner';
import Header from '../../components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaStickyNote, 
  FaPlus, 
  FaChild, 
  FaCalendar, 
  FaUser, 
  FaFile, 
  FaDownload, 
  FaTrash, 
  FaEdit,
  FaImage,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaComments,
  FaArrowLeft
} from 'react-icons/fa';

// Import new components
import { NoteCard } from '../../components/ui/NoteCard';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import ModernModal, { FormField, Label, Input, Select } from '../../components/ui/ModernModal';
import SearchableDropdown from '../../components/ui/SearchableDropdown';

// Styled Components
const PageContainer = styled.div`
  margin-top: 64px;
  padding: 0 16px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const TimelineContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 0 64px 0;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const TopBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 24px;
`;

const NotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.border};
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const EmptyDescription = styled.p`
  margin: 0;
  font-size: 14px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 0;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

// File upload styled components
const FileUploadContainer = styled.div`
  position: relative;
`;

const FileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const FileUploadLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
  }
`;

const FileUploadIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary}15;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 18px;
`;

const FileUploadText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  span {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  
  small {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
  }
`;

const FilePreview = styled.div`
  margin-top: 12px;
`;

const FilePreviewCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;

const FilePreviewIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.primary}15;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
`;

const FilePreviewInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FilePreviewName = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FilePreviewSize = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`;

const FilePreviewRemove = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.error}15;
  color: ${({ theme }) => theme.colors.error};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.error}25;
  }
`;

// Types
interface Child { 
  id: string; 
  name: string; 
  age?: number | string;
  birthdate?: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  educatorId: string;
  educatorName: string;
  childId: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
}

const Notizen: React.FC = () => {
  const { benutzer } = useUser();
  const [children, setChildren] = useState<Child[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  // Check for childId in URL parameters
  const urlParams = new URLSearchParams(location.search);
  const childIdFromUrl = urlParams.get('childId');

  useEffect(() => {
    if (benutzer?.role !== 'EDUCATOR') return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const groupData = await fetchMyGroup(benutzer.id);
        if (groupData && groupData.children) {
          setChildren(groupData.children);
          
          // If childId is in URL, pre-select it
          if (childIdFromUrl && groupData.children.some((child: Child) => child.id === childIdFromUrl)) {
            setSelectedChildId(childIdFromUrl);
            // Load notes for this child
            const childNotes = await fetchChildrenNotes(childIdFromUrl);
            setNotes(childNotes);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Fehler beim Laden der Daten.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [benutzer, childIdFromUrl]);

  const loadNotes = async () => {
    if (!selectedChildId) return;
    
    try {
      setError(null);
      const childNotes = await fetchChildrenNotes(selectedChildId);
      setNotes(childNotes);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Fehler beim Laden der Notizen. Bitte versuchen Sie es erneut.');
    }
  };

  useEffect(() => {
    loadNotes();
  }, [selectedChildId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setContent(note.content);
      setFile(null);
    } else {
      setEditingNote(null);
      setContent('');
      setFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setContent('');
    setFile(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId || !content.trim()) return;
    
    setSaving(true);
    try {
      if (editingNote) {
        await updateNote(editingNote.id, content, file);
      } else {
      await addNote(selectedChildId, content, file);
      }
      handleCloseModal();
      await loadNotes();
    } catch (err) {
      setError('Fehler beim Speichern der Notiz.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setDeletingNoteId(noteId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteNote = async () => {
    if (!deletingNoteId) return;
    setActionLoading(true);
    try {
      await deleteNote(deletingNoteId);
      setNotes(notes.filter(note => note.id !== deletingNoteId));
      setShowDeleteDialog(false);
      setDeletingNoteId(null);
    } catch (err) {
      setError('Fehler beim Löschen der Notiz.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBackToChildren = () => {
    navigate('/educator/kinder');
  };

  const getSelectedChild = () => {
    return children.find(child => child.id === selectedChildId);
  };

  // Helper function to calculate age from birthdate
  const calculateAge = (birthdate?: string) => {
    if (!birthdate) return 'Alter unbekannt';
    
    try {
      const birth = new Date(birthdate);
      const today = new Date();
      
      if (isNaN(birth.getTime())) {
        return 'Alter unbekannt';
      }
      
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      // Check if age is reasonable (between 0 and 18)
      if (age < 0 || age > 18) {
        return 'Alter unbekannt';
      }
      
      return age;
    } catch (error) {
      return 'Alter unbekannt';
    }
  };

  // Helper function to get display age for a child
  const getChildDisplayAge = (child: Child) => {
    if (child.age !== undefined) {
      return typeof child.age === 'number' ? `${child.age} Jahre` : child.age;
    }
    if (child.birthdate) {
      const calculatedAge = calculateAge(child.birthdate);
      return typeof calculatedAge === 'number' ? `${calculatedAge} Jahre` : calculatedAge;
    }
    return 'Alter unbekannt';
  };

  if (benutzer?.role !== 'EDUCATOR') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading) return <AnimatedMascotsLoader text="Lade Notizen..." />;
  if (error) return <ErrorMascot text={error} />;
  if (!children || children.length === 0) return <EmptyMascot text="Keine Kinder in Ihrer Gruppe gefunden." mood="help" />;

  const selectedChild = getSelectedChild();

  return (
    <>
      <Header title="Notizen" />
      <PageContainer>
        {/* Back button if coming from child-specific page */}
        {childIdFromUrl && (
          <BackButton onClick={handleBackToChildren}>
            <FaArrowLeft />
            Zurück zu Kindern
          </BackButton>
        )}
        
        <TimelineContainer>
          <TopBar>
            <SearchableDropdown
              options={children.map(child => ({ 
                id: child.id, 
                name: `${child.name} (${getChildDisplayAge(child)})` 
              }))}
              value={selectedChildId}
              onChange={setSelectedChildId}
              placeholder="Kind auswählen..."
              searchPlaceholder="Kind suchen..."
            />
            {selectedChild && (
              <Headline>
                Notizen für {selectedChild.name}
              </Headline>
            )}
          </TopBar>
          
          {selectedChildId ? (
            notes.length > 0 ? (
              <NotesList>
                {notes.map(note => (
                  <NoteCard
                    key={note.id}
                    educatorName={note.educatorName}
                    createdAt={note.createdAt}
                    content={note.content}
                    attachmentUrl={note.attachmentUrl}
                    attachmentName={note.attachmentName}
                    attachmentType={note.attachmentType}
                    onEdit={() => handleOpenModal(note)}
                    onDelete={() => handleDeleteNote(note.id)}
                    loading={actionLoading}
                  />
                ))}
              </NotesList>
            ) : (
              <EmptyMascot 
                text={selectedChild 
                  ? `Noch keine Notizen für ${selectedChild.name} vorhanden.`
                  : 'Wählen Sie ein Kind aus, um Notizen zu erstellen.'
                }
                mood="help"
              />
            )
          ) : (
            <EmptyMascot 
              text="Wählen Sie ein Kind aus, um dessen Notizen anzuzeigen."
              mood="help"
            />
          )}
        </TimelineContainer>
      </PageContainer>
      
      {selectedChildId && (
        <FloatingActionButton 
          onClick={() => handleOpenModal()}
          icon={<FaPlus />}
          aria-label="Neue Notiz hinzufügen"
        />
      )}
      
      <ModernModal
        open={showModal}
        onClose={handleCloseModal}
        title={editingNote ? 'Notiz bearbeiten' : 'Neue Notiz'}
      >
              <form onSubmit={handleSave}>
                <FormField>
                  <Label htmlFor="content">Notiz</Label>
            <Input
              as="textarea"
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Notiz eingeben..."
                    required
              rows={6}
                  />
                </FormField>
                
                <FormField>
                  <Label>Anhang (optional)</Label>
                  <FileUploadContainer>
                    <FileInput
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      id="file-upload"
                    />
                    <FileUploadLabel htmlFor="file-upload">
                      <FileUploadIcon>
                        <FaFileAlt />
                      </FileUploadIcon>
                      <FileUploadText>
                        <span>Datei auswählen</span>
                        <small>Bilder, PDFs, Dokumente (max. 10MB)</small>
                      </FileUploadText>
                    </FileUploadLabel>
                  </FileUploadContainer>
                  
                  {file && (
                    <FilePreview>
                      <FilePreviewCard>
                        <FilePreviewIcon>
                          {file.type.startsWith('image/') ? <FaImage /> : <FaFileAlt />}
                        </FilePreviewIcon>
                        <FilePreviewInfo>
                          <FilePreviewName>{file.name}</FilePreviewName>
                          <FilePreviewSize>{(file.size / 1024 / 1024).toFixed(2)} MB</FilePreviewSize>
                        </FilePreviewInfo>
                        <FilePreviewRemove onClick={handleRemoveFile}>
                          <FaTrash />
                        </FilePreviewRemove>
                      </FilePreviewCard>
                    </FilePreview>
                  )}
                </FormField>
                
          <Button type="submit" disabled={saving || !content.trim()}>
                  {saving ? (
                    <>
                      <FaClock />
                      Speichern...
                    </>
                  ) : (
                    <>
                <FaCheckCircle />
                {editingNote ? 'Aktualisieren' : 'Speichern'}
                    </>
                  )}
          </Button>
              </form>
      </ModernModal>
      
      {showDeleteDialog && (
        <ModernModal
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title="Notiz löschen"
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <FaExclamationTriangle style={{ fontSize: 48, color: theme.colors.error, marginBottom: 16 }} />
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Notiz wirklich löschen?
                </div>
            <div style={{ color: theme.colors.textSecondary }}>
              Diese Aktion kann nicht rückgängig gemacht werden.
                </div>
              </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={confirmDeleteNote} disabled={actionLoading} style={{ flex: 1 }}>
              {actionLoading ? <FaClock /> : <FaTrash />} Löschen
            </Button>
            <Button onClick={() => setShowDeleteDialog(false)} style={{ flex: 1 }}>
              Abbrechen
            </Button>
          </div>
        </ModernModal>
      )}
    </>
  );
};

export default Notizen; 