import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ModernModal from './ui/ModernModal';
import { FormField, Label, Input, ErrorText, Select } from './ui/ModernModal';
import { updateProfile, uploadAvatar } from '../services/profileApi';
import { useUser } from './UserContext';

const AvatarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textPrimary};
  border-radius: 8px;
  transition: all 0.2s ease;
  gap: 8px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent}15;
  }
  
  span {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
    
    @media (max-width: 1024px) {
      max-width: 100px;
    }
    
    @media (max-width: 768px) {
      max-width: 80px;
      font-size: ${({ theme }) => theme.typography.caption.fontSize};
    }
    
    @media (max-width: 480px) {
      max-width: 60px;
    }
    
    @media (max-width: 360px) {
      display: none;
    }
  }
`;

const AvatarImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
  
  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
  }
`;
const EditButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.components.button.borderRadius};
  padding: 10px 20px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 8px;
  width: 100%;
  transition: background 0.18s;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;
const LogoutButton = styled(EditButton)`
  background: ${({ theme }) => theme.colors.error};
  margin-top: 8px;
  &:hover {
    background: #b71c1c;
  }
`;
const UploadLabel = styled.label`
  display: block;
  margin-top: 8px;
  margin-bottom: 8px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const UploadInput = styled.input`
  display: block;
  margin-top: 4px;
  width: 100%;
`;

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';

const ProfileDropdown: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { benutzer, refreshProfile } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', password2: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize edit form when modal opens
  useEffect(() => {
    if (modalOpen && benutzer) {
      setEditForm({ name: benutzer.name, email: benutzer.email, password: '', password2: '' });
    }
  }, [modalOpen, benutzer]);

  // Edit profile
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!editForm.name || !editForm.email) {
      setError('Name und E-Mail sind erforderlich.');
      return;
    }
    if (editForm.password && editForm.password !== editForm.password2) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        name: editForm.name,
        email: editForm.email,
        password: editForm.password ? editForm.password : undefined,
      });
      setSuccess('Profil gespeichert!');
      setEditForm(f => ({ ...f, password: '', password2: '' }));
      // Refresh the profile data to update the header immediately
      await refreshProfile();
    } catch {
      setError('Fehler beim Speichern.');
    }
    setLoading(false);
  };

  // Upload avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setError('');
    setSuccess('');
    const file = e.target.files[0];
    setAvatarFile(file);
    try {
      const data = await uploadAvatar(file);
      setSuccess('Avatar aktualisiert!');
      // Refresh the profile data to update the header immediately
      await refreshProfile();
    } catch {
      setError('Fehler beim Hochladen des Avatars.');
    }
  };

  return (
    <>
      <AvatarButton onClick={() => setModalOpen(true)} aria-label="Profil öffnen">
        <AvatarImg src={benutzer?.avatarUrl ? (benutzer.avatarUrl.startsWith('/uploads') ? BACKEND_URL + benutzer.avatarUrl : benutzer.avatarUrl) : '/avatar-default.png'} alt="Avatar" />
        <span>{benutzer?.name || ''}</span>
      </AvatarButton>
      <ModernModal open={modalOpen} onClose={() => setModalOpen(false)} title="Profil bearbeiten">
        {!benutzer ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>Lädt…</div>
        ) : (
          <>
            {error && <ErrorText>{error}</ErrorText>}
            {success && <div style={{ color: '#4CAF50', marginBottom: 10 }}>{success}</div>}
            <form onSubmit={handleEdit}>
              <FormField>
                <UploadLabel>Avatar ändern
                  <UploadInput type="file" accept="image/*" onChange={handleAvatarUpload} disabled={loading} />
                </UploadLabel>
                {avatarFile && <span>{avatarFile.name}</span>}
                <div style={{ marginTop: 8 }}>
                  <AvatarImg src={benutzer?.avatarUrl ? (benutzer.avatarUrl.startsWith('/uploads') ? BACKEND_URL + benutzer.avatarUrl : benutzer.avatarUrl) : '/avatar-default.png'} alt="Avatar" style={{ width: 56, height: 56 }} />
                </div>
              </FormField>
              <FormField>
                <Label>Name</Label>
                <Input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  required
                  autoFocus
                  disabled={loading}
                />
              </FormField>
              <FormField>
                <Label>E-Mail</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </FormField>
              <FormField>
                <Label>Neues Passwort</Label>
                <Input
                  type="password"
                  value={editForm.password}
                  onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="(leer lassen für kein Update)"
                  minLength={6}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </FormField>
              <FormField>
                <Label>Passwort bestätigen</Label>
                <Input
                  type="password"
                  value={editForm.password2}
                  onChange={e => setEditForm(f => ({ ...f, password2: e.target.value }))}
                  placeholder="(leer lassen für kein Update)"
                  minLength={6}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </FormField>
              <EditButton type="submit" disabled={loading}>{loading ? 'Speichern...' : 'Speichern'}</EditButton>
            </form>
            <LogoutButton onClick={onLogout} disabled={loading}>Abmelden</LogoutButton>
          </>
        )}
      </ModernModal>
    </>
  );
};

export default ProfileDropdown; 