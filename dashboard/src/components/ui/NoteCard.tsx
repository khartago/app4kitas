import React from 'react';
import styled from 'styled-components';
import { FaUser, FaCalendar, FaEdit, FaTrash, FaImage, FaFileAlt, FaDownload, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFileCode, FaFileVideo, FaFileAudio } from 'react-icons/fa';
import { ActionButton, DeleteButton } from './AdminDashboardUI';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(44,62,80,0.10);
  padding: 20px 18px 16px 18px;
  margin-bottom: 18px;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 6px 32px rgba(44,62,80,0.15);
    transform: translateY(-1px);
  }
`;

const NoteHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-wrap: wrap;
`;

const Content = styled.div`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 12px;
  white-space: pre-wrap;
`;

const AttachmentSection = styled.div`
  margin-top: 8px;
`;

const AttachmentCard = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FileIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary}15;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 18px;
  flex-shrink: 0;
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FileType = styled.span`
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
`;

const DownloadButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 6px;
`;

const FilePreview = styled.div`
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;
  
  img {
    width: 100%;
    height: auto;
    max-height: 200px;
    object-fit: cover;
  }
`;

export interface NoteCardProps {
  educatorName: string;
  createdAt: string;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

// Helper function to get file icon based on type
const getFileIcon = (fileName?: string, fileType?: string) => {
  if (!fileName && !fileType) return FaFileAlt;
  
  const name = fileName?.toLowerCase() || '';
  const type = fileType?.toLowerCase() || '';
  
  // Image files
  if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(name)) {
    return FaImage;
  }
  
  // PDF files
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return FaFilePdf;
  }
  
  // Word documents
  if (type.includes('word') || /\.(doc|docx)$/i.test(name)) {
    return FaFileWord;
  }
  
  // Excel files
  if (type.includes('excel') || type.includes('spreadsheet') || /\.(xls|xlsx|csv)$/i.test(name)) {
    return FaFileExcel;
  }
  
  // PowerPoint files
  if (type.includes('powerpoint') || type.includes('presentation') || /\.(ppt|pptx)$/i.test(name)) {
    return FaFilePowerpoint;
  }
  
  // Archive files
  if (type.includes('zip') || type.includes('rar') || type.includes('tar') || /\.(zip|rar|tar|gz|7z)$/i.test(name)) {
    return FaFileArchive;
  }
  
  // Video files
  if (type.startsWith('video/') || /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(name)) {
    return FaFileVideo;
  }
  
  // Audio files
  if (type.startsWith('audio/') || /\.(mp3|wav|flac|aac|ogg)$/i.test(name)) {
    return FaFileAudio;
  }
  
  // Code files
  if (/\.(js|ts|jsx|tsx|html|css|json|xml|py|java|cpp|c|php|rb|go|rs)$/i.test(name)) {
    return FaFileCode;
  }
  
  return FaFileAlt;
};

// Helper function to get file type display name
const getFileTypeName = (fileName?: string, fileType?: string) => {
  const name = fileName?.toLowerCase() || '';
  const type = fileType?.toLowerCase() || '';
  
  if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(name)) {
    return 'Bild';
  }
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return 'PDF';
  }
  if (type.includes('word') || /\.(doc|docx)$/i.test(name)) {
    return 'Word';
  }
  if (type.includes('excel') || type.includes('spreadsheet') || /\.(xls|xlsx|csv)$/i.test(name)) {
    return 'Excel';
  }
  if (type.includes('powerpoint') || type.includes('presentation') || /\.(ppt|pptx)$/i.test(name)) {
    return 'PowerPoint';
  }
  if (type.includes('zip') || type.includes('rar') || type.includes('tar') || /\.(zip|rar|tar|gz|7z)$/i.test(name)) {
    return 'Archiv';
  }
  if (type.startsWith('video/') || /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(name)) {
    return 'Video';
  }
  if (type.startsWith('audio/') || /\.(mp3|wav|flac|aac|ogg)$/i.test(name)) {
    return 'Audio';
  }
  if (/\.(js|ts|jsx|tsx|html|css|json|xml|py|java|cpp|c|php|rb|go|rs)$/i.test(name)) {
    return 'Code';
  }
  
  return 'Dokument';
};

// Helper function to format file size
const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const NoteCard: React.FC<NoteCardProps> = ({
  educatorName, createdAt, content, attachmentUrl, attachmentName, attachmentType, onEdit, onDelete, loading
}) => {
  const FileIconComponent = getFileIcon(attachmentName, attachmentType);
  const fileTypeName = getFileTypeName(attachmentName, attachmentType);
  const isImage = attachmentType?.startsWith('image/') || attachmentName?.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i);
  
  return (
    <Card>
      <NoteHeader>
        <Meta>
          <FaUser /> <span>{educatorName}</span>
          <FaCalendar /> <span>{new Date(createdAt).toLocaleString('de-DE')}</span>
        </Meta>
        <Actions>
          {onEdit && <ActionButton onClick={onEdit} title="Bearbeiten" disabled={loading}><FaEdit /></ActionButton>}
          {onDelete && <DeleteButton onClick={onDelete} title="Löschen" disabled={loading}><FaTrash /></DeleteButton>}
        </Actions>
      </NoteHeader>
      
      <Content>{content}</Content>
      
      {attachmentUrl && (
        <AttachmentSection>
          <AttachmentCard>
            <FileIcon>
              <FileIconComponent />
            </FileIcon>
            
            <FileInfo>
              <FileName>{attachmentName}</FileName>
              <FileMeta>
                <FileType>{fileTypeName}</FileType>
                {attachmentType && <span>• {attachmentType}</span>}
              </FileMeta>
            </FileInfo>
            
            <DownloadButton 
              onClick={() => window.open(attachmentUrl, '_blank')}
              title={`${attachmentName} herunterladen`}
            >
              <FaDownload />
              Herunterladen
            </DownloadButton>
          </AttachmentCard>
          
          {isImage && (
            <FilePreview>
              <img 
                src={attachmentUrl} 
                alt={attachmentName} 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </FilePreview>
          )}
        </AttachmentSection>
      )}
    </Card>
  );
}; 