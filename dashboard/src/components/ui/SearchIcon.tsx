import React from 'react';
import { FaSearch } from 'react-icons/fa';
import styled from 'styled-components';

const SearchIconContainer = styled.div`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #757575;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchIcon: React.FC = () => (
  <SearchIconContainer>
    <FaSearch />
  </SearchIconContainer>
);

export default SearchIcon; 