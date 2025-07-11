import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, User } from '../components/ui/ChatUI';

// Hook for drag and drop functionality
export const useDragAndDrop = (onFileDrop: (files: FileList) => void) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    dragCounterRef.current = 0;
    
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      onFileDrop(e.dataTransfer.files);
    }
  }, [onFileDrop]);

  useEffect(() => {
    const element = document.body;
    element.addEventListener('dragenter', handleDragEnter);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('drop', handleDrop);

    return () => {
      element.removeEventListener('dragenter', handleDragEnter);
      element.removeEventListener('dragleave', handleDragLeave);
      element.removeEventListener('dragover', handleDragOver);
      element.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  return { isDragOver };
};

// Hook for mention functionality
export const useMentions = (users: User[], onMentionSelect: (user: User) => void) => {
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [showMentions, setShowMentions] = useState(false);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5);

  const handleTextInput = useCallback((text: string, cursorPosition: number, textAreaElement: HTMLTextAreaElement) => {
    const beforeCursor = text.slice(0, cursorPosition);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setShowMentions(true);
      setSelectedMentionIndex(0);

      // Calculate position for dropdown with better positioning logic
      const rect = textAreaElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = Math.min(filteredUsers.length * 60 + 20, 220); // 60px per item + padding
      
      // Check if there's enough space above the input
      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;
      
      let top: number;
      if (spaceAbove >= dropdownHeight) {
        // Position above the input
        top = rect.top - dropdownHeight - 8;
      } else if (spaceBelow >= dropdownHeight) {
        // Position below the input
        top = rect.bottom + 8;
      } else {
        // Center in viewport if no space
        top = Math.max(10, (viewportHeight - dropdownHeight) / 2);
      }
      
      setMentionPosition({
        top,
        left: Math.max(10, Math.min(rect.left + 16, window.innerWidth - 250)) // Keep within viewport
      });
    } else {
      setShowMentions(false);
      setMentionPosition(null);
    }
  }, [users.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent, onSelect: () => void) => {
    if (!showMentions || filteredUsers.length === 0) return false;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
        return true;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
        return true;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (filteredUsers[selectedMentionIndex]) {
          onMentionSelect(filteredUsers[selectedMentionIndex]);
          setShowMentions(false);
          onSelect();
        }
        return true;
      case 'Escape':
        setShowMentions(false);
        return true;
      default:
        return false;
    }
  }, [showMentions, filteredUsers, selectedMentionIndex, onMentionSelect]);

  const selectMention = useCallback((user: User) => {
    onMentionSelect(user);
    setShowMentions(false);
  }, [onMentionSelect]);

  return {
    showMentions,
    mentionPosition,
    filteredUsers,
    selectedMentionIndex,
    handleTextInput,
    handleKeyDown,
    selectMention,
    closeMentions: () => setShowMentions(false)
  };
};

// Hook for typing indicators
export const useTypingIndicator = (channelId: string) => {
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const startTyping = useCallback(() => {
    // In a real app, this would send a typing event to the server
    console.log('User started typing in channel:', channelId);
  }, [channelId]);

  const stopTyping = useCallback(() => {
    // In a real app, this would send a stop typing event to the server
    console.log('User stopped typing in channel:', channelId);
  }, [channelId]);

  const handleTyping = useCallback(() => {
    startTyping();
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  }, [startTyping, stopTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    typingUsers,
    handleTyping
  };
};

// Hook for message caching
export const useMessageCache = () => {
  const cache = useRef<Map<string, Message[]>>(new Map());

  const getCachedMessages = useCallback((channelId: string) => {
    return cache.current.get(channelId) || [];
  }, []);

  const setCachedMessages = useCallback((channelId: string, messages: Message[]) => {
    cache.current.set(channelId, messages);
    
    // Limit cache size to prevent memory issues
    if (cache.current.size > 10) {
      const firstKey = cache.current.keys().next().value;
      cache.current.delete(firstKey);
    }
  }, []);

  const addMessageToCache = useCallback((channelId: string, message: Message) => {
    const existing = cache.current.get(channelId) || [];
    const updated = [...existing, message];
    cache.current.set(channelId, updated);
  }, []);

  return {
    getCachedMessages,
    setCachedMessages,
    addMessageToCache
  };
};

// Hook for infinite scroll
export const useInfiniteScroll = (
  loadMore: () => Promise<void>,
  hasMore: boolean,
  isLoading: boolean
) => {
  const [isFetching, setIsFetching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && hasMore && !isLoading && !isFetching) {
        setIsFetching(true);
        loadMore().finally(() => setIsFetching(false));
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadMore, hasMore, isLoading, isFetching]);

  return { containerRef, isFetching };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = () => {
  const [focusedElementIndex, setFocusedElementIndex] = useState(0);
  const elementsRef = useRef<HTMLElement[]>([]);

  const registerElement = useCallback((element: HTMLElement | null) => {
    if (element && !elementsRef.current.includes(element)) {
      elementsRef.current.push(element);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const elements = elementsRef.current.filter(el => el.offsetParent !== null);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedElementIndex(prev => 
          prev < elements.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedElementIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        elements[focusedElementIndex]?.click();
        break;
    }
  }, [focusedElementIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const elements = elementsRef.current.filter(el => el.offsetParent !== null);
    if (elements[focusedElementIndex]) {
      elements[focusedElementIndex].focus();
    }
  }, [focusedElementIndex]);

  return { registerElement };
};

// Hook for scroll to bottom functionality
export const useScrollToBottom = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto' 
    });
    setUnreadCount(0);
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollButton(!isNearBottom);
    if (isNearBottom) {
      setUnreadCount(0);
    }
  }, []);

  const addUnreadMessage = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (!isNearBottom) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  return {
    messagesEndRef,
    containerRef,
    showScrollButton,
    unreadCount,
    scrollToBottom,
    handleScroll,
    addUnreadMessage
  };
}; 