import React, { useState, useEffect, useRef } from 'react';
import {
  SearchableDropdownContainer,
  SearchableDropdownButton,
  SearchableDropdownOptions,
  SearchableDropdownSearch,
  SearchableDropdownOption
} from './ModernModal';

interface Option {
  id: string;
  name: string;
}

interface SearchableDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Auswählen...",
  searchPlaceholder = "Suchen...",
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.id === value);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: Option) => {
    onChange(option.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleButtonClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleButtonClick();
    }
  };

  return (
    <SearchableDropdownContainer ref={containerRef}>
      <SearchableDropdownButton
        type="button"
        onClick={handleButtonClick}
        onKeyDown={handleKeyDown}
        className={isOpen ? 'open' : ''}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedOption ? selectedOption.name : placeholder}
      </SearchableDropdownButton>
      
      {isOpen && (
        <SearchableDropdownOptions>
          <SearchableDropdownSearch
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
                setSearchTerm('');
              }
            }}
            autoFocus
          />
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <SearchableDropdownOption
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className={option.id === value ? 'selected' : ''}
                role="option"
                aria-selected={option.id === value}
              >
                {option.name}
              </SearchableDropdownOption>
            ))
          ) : (
            <SearchableDropdownOption style={{ color: '#999', fontStyle: 'italic' }}>
              Keine Ergebnisse gefunden
            </SearchableDropdownOption>
          )}
        </SearchableDropdownOptions>
      )}
    </SearchableDropdownContainer>
  );
};

export default SearchableDropdown; 