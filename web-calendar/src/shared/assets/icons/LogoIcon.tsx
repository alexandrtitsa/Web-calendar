import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="25" y="15" width="55" height="55" rx="14" fill="#10B981" fillOpacity="0.4" transform="rotate(45 50 50)" />
    <rect x="15" y="15" width="55" height="55" rx="14" fill="#00C853" transform="rotate(45 42 50)" />
  </svg>
);