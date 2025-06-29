import React from 'react';

interface IconWrapperProps {
  icon: React.ComponentType<any>;
  size?: number;
  color?: string;
  className?: string;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ icon: IconComponent, size, color, className }) => {
  return React.createElement(IconComponent, { size, color, className });
};

export default IconWrapper; 