import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { personalTaskApi, PersonalTask, CreateTaskData } from '../../services/personalTaskApi';

const NotebookContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  box-shadow: ${({ theme }) => theme.components.card.boxShadow};
  overflow: hidden;
  margin-bottom: 24px;
  @media (max-width: 600px) {
    margin-bottom: 12px;
  }
`;

const NotebookHeader = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  background-image:
    repeating-linear-gradient(
      to bottom,
      ${({ theme }) => theme.colors.surfaceAlt || '#f0f0f0'},
      ${({ theme }) => theme.colors.surfaceAlt || '#f0f0f0'} 2px,
      transparent 2px, transparent 32px
    );
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  border-top-left-radius: ${({ theme }) => theme.components.card.borderRadius};
  border-top-right-radius: ${({ theme }) => theme.components.card.borderRadius};
  border-bottom: none;
  position: relative;
  overflow: visible;
`;

const SpiralBarContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2;
  display: flex;
  justify-content: center;
  pointer-events: none;
`;

const SpiralBindingBar = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  height: 22px;
  margin: 8px 0 0 0;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 22px;
  padding: 34px 28px 0 36px;
  width: 100%;
  position: relative;
  z-index: 1;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 24px 10px 0 14px;
  }
`;

const IconSticker = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 18px 18px 22px 18px / 18px 18px 22px 18px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  top: 0;
  left: 0;
  margin-left: 4px;
  box-shadow: 0 4px 16px 0 ${({ theme }) => theme.colors.primary}33, 0 1.5px 0 0 #fff inset;
  border: 2.5px solid #fff;
  transform: rotate(-7deg);
`;

const NotebookIcon = styled.span`
  font-size: 2.3em;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 2px ${({ theme }) => theme.colors.primaryDark}33);
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: clamp(1.3rem, 4vw, 2.6rem);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.headline1.fontFamily};
  letter-spacing: 1.2px;
  line-height: 1.1;
  @media (max-width: 600px) {
    font-size: clamp(1.1rem, 6vw, 2rem);
  }
`;

const HeaderSubtitle = styled.div`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
  margin-left: 0;
  font-style: italic;
  opacity: 0.85;
`;

const NotebookContent = styled.div`
  padding: 24px;
  @media (max-width: 600px) {
    padding: 10px 4px;
  }
`;

const TaskForm = styled.form`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
  }
`;

const TaskInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 8px 16px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.components.input.borderRadius};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: ${({ theme }) => theme.animations.defaultDuration}ms ${({ theme }) => theme.animations.transitionCurves.easeOut};
  @media (max-width: 600px) {
    min-width: 0;
    width: 100%;
    font-size: 1em;
    padding: 8px 10px;
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const PrioritySelect = styled.select`
  padding: 8px 16px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.components.input.borderRadius};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition: ${({ theme }) => theme.animations.defaultDuration}ms ${({ theme }) => theme.animations.transitionCurves.easeOut};
  @media (max-width: 600px) {
    width: 100%;
    font-size: 1em;
    padding: 8px 10px;
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const AddButton = styled.button`
  padding: 8px 24px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.components.button.borderRadius};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  font-weight: ${({ theme }) => theme.typography.subtitle1.fontWeight};
  cursor: pointer;
  transition: ${({ theme }) => theme.animations.defaultDuration}ms ${({ theme }) => theme.animations.transitionCurves.easeOut};
  @media (max-width: 600px) {
    width: 100%;
    font-size: 1em;
    padding: 8px 0;
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
    transform: none;
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const FilterTab = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.textPrimary};
  border: none;
  border-radius: ${({ theme }) => theme.components.input.borderRadius} ${({ theme }) => theme.components.input.borderRadius} 0 0;
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  font-weight: ${({ theme }) => theme.typography.subtitle1.fontWeight};
  cursor: pointer;
  transition: ${({ theme }) => theme.animations.defaultDuration}ms ${({ theme }) => theme.animations.transitionCurves.easeOut};
  
  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primaryDark : theme.colors.surfaceAlt};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CompletedTime = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.subtitle1.fontWeight};
`;

// Organic torn paper edge
const TornEdge = styled.div`
  width: 100%;
  height: 16px;
  background: none;
  position: relative;
  margin-top: -2px;
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

const SpiralRing = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
  border: 2.5px solid ${({ theme }) => theme.colors.surfaceAlt || theme.colors.border};
  box-shadow: 0 1px 2px 0 ${({ theme }) => theme.colors.primary}22;
  transition: transform 0.25s cubic-bezier(0.4,2,0.6,1.2);
  will-change: transform;
  &:hover {
    transform: rotate(-18deg) scale(1.15);
    box-shadow: 0 4px 12px 0 ${({ theme }) => theme.colors.accent}44;
  }
`;

const NotebookHandwriting = styled.div`
  font-family: 'Indie Flower', cursive, 'Comic Sans MS', 'Inter', sans-serif;
  font-size: 1.08em;
`;

// Notebook-style task list
const NotebookTaskList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const NOTEBOOK_LINE_HEIGHT = 49; // px, matches background line spacing
const NOTEBOOK_FONT_SIZE = 28; // px, matches line height for baseline alignment
const NOTEBOOK_TEXT_OFFSET = 10; // px, fine-tuned for baseline alignment

const NotebookTaskItem = styled.li<{ $completed: boolean }>`
  display: flex;
  align-items: flex-start;
  position: relative;
  padding: 0 0 0 36px;
  min-height: ${NOTEBOOK_LINE_HEIGHT}px;
  border-bottom: none;
  font-family: 'Indie Flower', cursive, 'Comic Sans MS', 'Inter', sans-serif;
  font-size: ${NOTEBOOK_FONT_SIZE}px;
  opacity: ${({ $completed }) => $completed ? 0.6 : 1};
  transition: background 0.2s, opacity 0.2s;
  line-height: ${NOTEBOOK_LINE_HEIGHT}px;
  padding-top: 0;
  padding-bottom: 0;
  background: none;
  ${({ $completed }) => $completed && `
    filter: blur(0.5px) grayscale(0.5);
    opacity: 0.7;
    border-bottom: 2.5px wavy #bdbdbd;
  `}
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    font-size: 1.1em;
    padding-left: 10px;
    min-height: 38px;
    line-height: 1.2;
  }
`;

const NotebookTaskContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: ${NOTEBOOK_LINE_HEIGHT}px;
  padding-top: ${NOTEBOOK_TEXT_OFFSET}px;
  padding-bottom: 0;
  @media (max-width: 600px) {
    line-height: 1.2;
    padding-top: 2px;
  }
`;

const NotebookTaskTitle = styled.div<{ $completed: boolean }>`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-decoration: ${({ $completed }) => $completed ? 'line-through wavy #bdbdbd' : 'none'};
  margin-bottom: 0;
  font-size: 1em;
  line-height: ${NOTEBOOK_LINE_HEIGHT}px;
  font-family: 'Indie Flower', cursive, 'Comic Sans MS', 'Inter', sans-serif;
  position: relative;
  z-index: 1;
  ${({ $completed }) => $completed && `
    filter: blur(0.5px) grayscale(0.5);
    opacity: 0.7;
  `}
`;

const NotebookTaskDescription = styled.div`
  font-size: 1em;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0;
  line-height: ${NOTEBOOK_LINE_HEIGHT}px;
  white-space: pre-line;
  font-family: 'Indie Flower', cursive, 'Comic Sans MS', 'Inter', sans-serif;
  position: relative;
  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 17px;
    height: 2px;
    background: ${({ theme }) => theme.colors.border};
    opacity: 0.3;
    border-radius: 1px;
    pointer-events: none;
  }
`;

const NotebookTaskMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1em;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: 'Indie Flower', cursive, 'Comic Sans MS', 'Inter', sans-serif;
  position: relative;
  width: 100%;
  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 17px;
    height: 2px;
    background: ${({ theme }) => theme.colors.border};
    opacity: 0.3;
    border-radius: 1px;
    pointer-events: none;
    z-index: 0;
  }
`;

const NotebookPriorityText = styled.span<{ $priority: string }>`
  font-family: 'Indie Flower', cursive, 'Comic Sans MS', 'Inter', sans-serif;
  font-size: 1em;
  font-weight: 700;
  margin-right: 12px;
  color: ${({ $priority, theme }) => {
    switch ($priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.accent;
      case 'low': return theme.colors.primary;
      default: return theme.colors.textSecondary;
    }
  }};
`;

const NotebookTaskActions = styled.div<{ $completed?: boolean }>`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
  position: relative;
  z-index: 1;
  ${({ $completed }) => $completed ? `
    opacity: 0.3;
    filter: blur(0.5px) grayscale(0.7);
    pointer-events: none;
  ` : ''}
`;

const NotebookActionText = styled.button<{ $variant?: 'edit' | 'delete' }>`
  background: none;
  border: none;
  font-family: 'Indie Flower', cursive, 'Comic Sans MS', 'Inter', sans-serif;
  font-size: 1em;
  font-weight: 700;
  color: ${({ $variant, theme }) =>
    $variant === 'delete' ? theme.colors.error : theme.colors.primary};
  cursor: pointer;
  padding: 0 10px 0 0;
  margin: 0 2px;
  text-decoration: underline transparent;
  transition: text-decoration 0.15s, color 0.15s;
  &:hover {
    text-decoration: underline;
    color: ${({ $variant, theme }) =>
      $variant === 'delete' ? theme.colors.error : theme.colors.primaryDark};
  }
`;

const NotebookInfo = styled.div`
  font-size: 1.08em;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: 'Indie Flower', cursive, 'Comic Sans MS', 'Inter', sans-serif;
  margin: 0 0 18px 0;
  padding-left: 36px;
`;

const NotebookCheckCircle = styled.button<{ checked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: ${NOTEBOOK_LINE_HEIGHT}px;
  margin-right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  user-select: none;
  position: relative;
  z-index: 2;
  margin-top: 0;
  margin-bottom: 0;
  &:focus {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}55;
  }
  & > span {
    display: inline-block;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2.5px solid ${({ theme, checked }) => checked ? theme.colors.primary : theme.colors.primary};
    background: ${({ theme, checked }) => checked ? theme.colors.primary : 'transparent'};
    box-shadow: 0 1px 4px ${({ theme }) => theme.colors.primary}22;
    position: relative;
    transition: background 0.2s, border-color 0.2s;
    &::after {
      content: '';
      display: ${({ checked }) => checked ? 'block' : 'none'};
      position: absolute;
      left: 5px;
      top: 2px;
      width: 7px;
      height: 13px;
      border: solid #fff;
      border-width: 0 3px 3px 0;
      border-radius: 2px;
      transform: rotate(45deg);
    }
  }
`;

const NotebookTitleRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 17px;
    height: 2px;
    background: ${({ theme }) => theme.colors.border};
    opacity: 0.5;
    border-radius: 1px;
    pointer-events: none;
    z-index: 0;
  }
`;

// Add styled chevron buttons for pagination
const PaginationButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2.2em;
  font-family: 'Indie Flower', cursive, 'Comic Sans MS', 'Inter', sans-serif;
  cursor: pointer;
  padding: 0 12px;
  transition: color 0.15s;
  &:disabled {
    color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }
`;

interface PersonalNotebookProps {
  className?: string;
}

export const PersonalNotebook: React.FC<PersonalNotebookProps> = ({ className }) => {
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  let filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'active': return !task.completed;
      case 'completed': return task.completed;
      default: return true;
    }
  });
  if (filter === 'active') {
    filteredTasks = filteredTasks.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } else {
    filteredTasks = filteredTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  const TASKS_PER_PAGE = 5;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice((page - 1) * TASKS_PER_PAGE, page * TASKS_PER_PAGE);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await personalTaskApi.getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const taskData: CreateTaskData = {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        priority: newTaskPriority
      };

      const newTask = await personalTaskApi.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      
      // Reset form
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const updatedTask = await personalTaskApi.toggleTask(taskId);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await personalTaskApi.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      // If the current page is now empty and not the first page, go back one page
      setTimeout(() => {
        if ((paginatedTasks.length === 1 || paginatedTasks.length === 0) && page > 1) {
          setPage(page - 1);
        }
      }, 0);
      // Reload tasks from backend to ensure state is in sync
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updateData = {
        title: editTitle,
        description: editDescription,
        priority: editPriority
      };

      const updatedTask = await personalTaskApi.updateTask(taskId, updateData);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      setEditingTask(null);
      setEditTitle('');
      setEditDescription('');
      setEditPriority('medium');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const startEditing = (task: PersonalTask) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditTitle('');
    setEditDescription('');
    setEditPriority('medium');
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <NotebookContainer className={className}>
        <NotebookHeader>
          <SpiralBarContainer>
            <SpiralBindingBar>
              {[...Array(11)].map((_, i) => <SpiralRing key={i} />)}
            </SpiralBindingBar>
          </SpiralBarContainer>
          <HeaderRow>
            <IconSticker>
              <NotebookIcon>📓</NotebookIcon>
            </IconSticker>
            <HeaderText>
              <HeaderTitle>Persönliches Notizbuch</HeaderTitle>
              <HeaderSubtitle>Deine privaten Aufgaben und Notizen</HeaderSubtitle>
            </HeaderText>
          </HeaderRow>
          <TornEdge>
            <svg viewBox="0 0 100 16" preserveAspectRatio="none">
              <path d="M0,8 Q5,16 10,8 Q15,0 20,8 Q25,16 30,8 Q35,0 40,8 Q45,16 50,8 Q55,0 60,8 Q65,16 70,8 Q75,0 80,8 Q85,16 90,8 Q95,0 100,8" fill="none" stroke="#FFC107" strokeWidth="3" />
            </svg>
          </TornEdge>
        </NotebookHeader>
        <NotebookContent>
          <div>Lade Aufgaben...</div>
        </NotebookContent>
      </NotebookContainer>
    );
  }

  return (
    <NotebookContainer className={className}>
      <NotebookHeader>
        <SpiralBarContainer>
          <SpiralBindingBar>
            {[...Array(11)].map((_, i) => <SpiralRing key={i} />)}
          </SpiralBindingBar>
        </SpiralBarContainer>
        <HeaderRow>
          <IconSticker>
            <NotebookIcon>📓</NotebookIcon>
          </IconSticker>
          <HeaderText>
            <HeaderTitle>Persönliches Notizbuch</HeaderTitle>
            <HeaderSubtitle>Deine privaten Aufgaben und Notizen</HeaderSubtitle>
          </HeaderText>
        </HeaderRow>
        <TornEdge>
          <svg viewBox="0 0 100 16" preserveAspectRatio="none">
            <path d="M0,8 Q5,16 10,8 Q15,0 20,8 Q25,16 30,8 Q35,0 40,8 Q45,16 50,8 Q55,0 60,8 Q65,16 70,8 Q75,0 80,8 Q85,16 90,8 Q95,0 100,8" fill="none" stroke="#FFC107" strokeWidth="3" />
          </svg>
        </TornEdge>
      </NotebookHeader>
      
      <NotebookContent>
        <NotebookInfo>Kurzanleitung: Schreibe deine Aufgaben oder Notizen auf, markiere sie als erledigt oder bearbeite sie jederzeit. Klicke auf den Haken, um Aufgaben als erledigt oder wieder offen zu markieren.</NotebookInfo>
        <NotebookHandwriting>
          <TaskForm onSubmit={handleSubmit}>
            <TaskInput
              type="text"
              placeholder="Neue Aufgabe hinzufügen..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
            />
            <TaskInput
              type="text"
              placeholder="Beschreibung (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
            <PrioritySelect
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
            >
              <option value="low">Niedrig</option>
              <option value="medium">Mittel</option>
              <option value="high">Hoch</option>
            </PrioritySelect>
            <AddButton type="submit" disabled={!newTaskTitle.trim()}>
              Hinzufügen
            </AddButton>
          </TaskForm>

          <FilterTabs>
            <FilterTab 
              $active={filter === 'all'} 
              onClick={() => setFilter('all')}
            >
              Alle ({tasks.length})
            </FilterTab>
            <FilterTab 
              $active={filter === 'active'} 
              onClick={() => setFilter('active')}
            >
              Offen ({activeTasks.length})
            </FilterTab>
            <FilterTab 
              $active={filter === 'completed'} 
              onClick={() => setFilter('completed')}
            >
              Erledigt ({completedTasks.length})
            </FilterTab>
          </FilterTabs>

          <NotebookTaskList>
            {paginatedTasks.length === 0 ? (
              <EmptyState>
                {filter === 'all' && 'Du hast noch keine Aufgaben. Lege jetzt deine erste persönliche Notiz oder Aufgabe an!'}
                {filter === 'active' && 'Keine offenen Aufgaben. Genieße deinen Tag!'}
                {filter === 'completed' && 'Noch keine erledigten Aufgaben. Du schaffst das!'}
              </EmptyState>
            ) : (
              paginatedTasks.map(task => (
                <NotebookTaskItem key={task.id} $completed={task.completed}>
                  {task.completed ? (
                    <NotebookCheckCircle checked={true} onClick={() => handleToggleTask(task.id)}>
                      <span />
                    </NotebookCheckCircle>
                  ) : (
                    <NotebookCheckCircle checked={false} onClick={() => handleToggleTask(task.id)}>
                      <span />
                    </NotebookCheckCircle>
                  )}
                  <NotebookTaskContent>
                    <NotebookTitleRow>
                      {editingTask === task.id ? (
                        <>
                          <TaskInput
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            style={{ marginBottom: 8 }}
                          />
                          <TaskInput
                            type="text"
                            value={editDescription}
                            onChange={e => setEditDescription(e.target.value)}
                            placeholder="Beschreibung (optional)"
                            style={{ marginBottom: 8 }}
                          />
                          <PrioritySelect
                            value={editPriority}
                            onChange={e => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
                            style={{ marginBottom: 8 }}
                          >
                            <option value="low">Niedrig</option>
                            <option value="medium">Mittel</option>
                            <option value="high">Hoch</option>
                          </PrioritySelect>
                          <NotebookActionText onClick={() => handleEditTask(task.id)}>
                            Speichern
                          </NotebookActionText>
                          <NotebookActionText onClick={cancelEditing}>
                            Abbrechen
                          </NotebookActionText>
                        </>
                      ) : (
                        <>
                          <NotebookTaskTitle $completed={task.completed}>
                            {task.title}
                          </NotebookTaskTitle>
                          <NotebookTaskActions $completed={task.completed}>
                            <NotebookActionText onClick={() => startEditing(task)}>
                              Bearbeiten
                            </NotebookActionText>
                            <NotebookActionText
                              $variant="delete"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              Löschen
                            </NotebookActionText>
                          </NotebookTaskActions>
                        </>
                      )}
                    </NotebookTitleRow>
                    {task.description && (
                      <NotebookTaskDescription>{task.description}</NotebookTaskDescription>
                    )}
                    <NotebookTaskMeta>
                      <NotebookPriorityText $priority={task.priority}>
                        {task.priority === 'high' ? 'Hoch' : 
                         task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                      </NotebookPriorityText>
                      <span>Erstellt: {formatDate(task.createdAt)}</span>
                      {task.completed && task.completedAt && (
                        <CompletedTime>
                          Erledigt: {formatDate(task.completedAt)}
                        </CompletedTime>
                      )}
                    </NotebookTaskMeta>
                  </NotebookTaskContent>
                </NotebookTaskItem>
              ))
            )}
          </NotebookTaskList>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
              <PaginationButton onClick={() => setPage(page - 1)} disabled={page === 1} aria-label="Vorherige Seite">
                &#60;
              </PaginationButton>
              <span style={{ fontFamily: 'Indie Flower', fontSize: 20, margin: '0 8px' }}>
                Seite {page} / {totalPages}
              </span>
              <PaginationButton onClick={() => setPage(page + 1)} disabled={page === totalPages} aria-label="Nächste Seite">
                &#62;
              </PaginationButton>
            </div>
          )}
        </NotebookHandwriting>
      </NotebookContent>
    </NotebookContainer>
  );
}; 